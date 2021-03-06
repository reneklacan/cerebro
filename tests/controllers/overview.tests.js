describe('OverviewController', function() {

  beforeEach(angular.mock.module('cerebro'));

  beforeEach(angular.mock.inject(function($rootScope, $controller, $injector) {
    this.scope = $rootScope.$new();
    this.$http = $injector.get('$http');
    this.$window = $injector.get('$window');
    this.DataService = $injector.get('DataService');
    this.AlertService = $injector.get('AlertService');
    this.ModalService = $injector.get('ModalService');
    this.RefreshService = $injector.get('RefreshService');
    this.createController = function() {
      return $controller('OverviewController',
        {$scope: this.scope}, this.$http, this.$window, this.DataService, this.AlertService, this.ModalService, this.RefreshService);
    };
    this._controller = this.createController();
  }));

  it('should have intial state correctly set', function() {
    expect(this.scope.indices).toEqual(undefined);
    expect(this.scope.nodes).toEqual(undefined);
    expect(this.scope.unassigned_shards).toEqual(0);
    expect(this.scope.shardAllocation).toEqual(true);
    expect(this.scope.closed_indices).toEqual(0);
    expect(this.scope.special_indices).toEqual(0);
    expect(this.scope.shardAllocation).toEqual(true);
    expect(this.scope.expandedView).toEqual(false);
    // index filter
    expect(this.scope.indices_filter.name).toEqual('');
    expect(this.scope.indices_filter.closed).toEqual(true);
    expect(this.scope.indices_filter.special).toEqual(false);
    expect(this.scope.indices_filter.healthy).toEqual(true);
    expect(this.scope.indices_filter.sort).toEqual('name');
    expect(this.scope.indices_filter.asc).toEqual(true);
    // node filter
    expect(this.scope.nodes_filter.name).toEqual('');
  });

  describe('refresh data when refresh interval is reached', function() {
    it('triggers a refresh when refresh interval is reached',
      function() {
        var lastUpdate = 1;
        this.RefreshService.lastUpdate = function() {
          return lastUpdate;
        };
        spyOn(this.RefreshService, 'lastUpdate').andCallThrough();
        spyOn(this.scope, 'refresh').andReturn(true);
        spyOn(this.DataService, 'getOverview').andReturn();
        this.scope.$digest();
        expect(this.scope.refresh.callCount).toEqual(1);
        this.scope.$digest(); // lastUpdate didnt change
        expect(this.scope.refresh.callCount).toEqual(1);
        lastUpdate = 2;
        this.scope.$digest();
        expect(this.scope.refresh.callCount).toEqual(2);
      }
    );
  });

  describe('refresh', function() {
    it('loads overview data',
      function() {
        var indices = ['someIndex'];
        var nodes = ['someNode'];
        var data =   {
          indices: indices,
          nodes: nodes,
          unassigned_shards: 1,
          closed_indices: 2,
          special_indices: 3,
          shard_allocation: true
        };
        this.DataService.getOverview = function(success, error) {
          success(data);
        }
        spyOn(this.DataService, 'getOverview').andCallThrough();
        spyOn(this.scope, 'setIndices').andReturn(true);
        spyOn(this.scope, 'setNodes').andReturn(true);
        this.scope.refresh();
        expect(this.DataService.getOverview).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
        expect(this.scope.unassigned_shards).toEqual(1);
        expect(this.scope.closed_indices).toEqual(2);
        expect(this.scope.special_indices).toEqual(3);
        expect(this.scope.shardAllocation).toEqual(true);
        expect(this.scope.setIndices).toHaveBeenCalledWith(indices);
        expect(this.scope.setNodes).toHaveBeenCalledWith(nodes);
        expect(this.scope.data).toEqual(data);
      }
    );
    
    it('cleans state and alerts users if refreshing data fails',
      function() {
        this.DataService.getOverview = function(success, error) {
          error('kaput');
        }
        spyOn(this.DataService, 'getOverview').andCallThrough();
        spyOn(this.AlertService, 'error').andReturn();
        this.scope.refresh();
        expect(this.DataService.getOverview).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
        expect(this.scope.unassigned_shards).toEqual(0);
        expect(this.scope.closed_indices).toEqual(0);
        expect(this.scope.special_indices).toEqual(0);
        expect(this.scope.shardAllocation).toEqual(true);
        expect(this.AlertService.error).toHaveBeenCalledWith('Error while loading data', 'kaput');
      }
    );
  });

  describe('refresh data on user input', function() {
    it('updates data when index name filter changes',
      function() {
        this.scope.data = {indices: [], nodes: []};
        spyOn(this.DataService, 'getOverview').andReturn(true);
        this.scope.$digest(); // loads data for the first time
        spyOn(this.scope, 'setIndices').andReturn(true);
        this.scope.$digest(); // nothing has changed here
        expect(this.scope.setIndices).not.toHaveBeenCalled();
        this.scope.indices_filter.name = 'a';
        this.scope.$digest(); // name changed, should trigger refresh
        expect(this.scope.setIndices).toHaveBeenCalledWith([]);
      }
    );

    it('refreshes list of indices when closed filter changes',
      function() {
        this.scope.data = {indices: [], nodes: []};
        spyOn(this.DataService, 'getOverview').andReturn(true);
        this.scope.$digest(); // loads data for the first time
        spyOn(this.scope, 'setIndices').andReturn(true);
        this.scope.$digest(); // nothing has changed here
        expect(this.scope.setIndices).not.toHaveBeenCalled();
        this.scope.indices_filter.closed = false;
        this.scope.$digest(); // closed changed, should trigger refresh
        expect(this.scope.setIndices).toHaveBeenCalledWith([]);
      }
    );

    it('refreshes list of indices when special filter changes',
      function() {
        this.scope.data = {indices: [], nodes: []};
        spyOn(this.DataService, 'getOverview').andReturn(true);
        this.scope.$digest(); // loads data for the first time
        spyOn(this.scope, 'setIndices').andReturn(true);
        this.scope.$digest(); // nothing has changed here
        expect(this.scope.setIndices).not.toHaveBeenCalled();
        this.scope.indices_filter.special = true;
        this.scope.$digest(); // special changed, should trigger refresh
        expect(this.scope.setIndices).toHaveBeenCalledWith([]);
      }
    );

    it('refreshes list of indices when healthy filter changes',
      function() {
        this.scope.data = {indices: [], nodes: []};
        spyOn(this.DataService, 'getOverview').andReturn(true);
        this.scope.$digest(); // loads data for the first time
        spyOn(this.scope, 'setIndices').andReturn(true);
        this.scope.$digest(); // nothing has changed here
        expect(this.scope.setIndices).not.toHaveBeenCalled();
        this.scope.indices_filter.healthy = false;
        this.scope.$digest(); // healthy changed, should trigger refresh
        expect(this.scope.setIndices).toHaveBeenCalledWith([]);
      }
    );

    it('refreshes list of indices when sorting changes',
      function() {
        this.scope.data = {indices: [], nodes: []};
        spyOn(this.DataService, 'getOverview').andReturn(true);
        this.scope.$digest(); // loads data for the first time
        spyOn(this.scope, 'setIndices').andReturn(true);
        this.scope.$digest(); // nothing has changed here
        expect(this.scope.setIndices).not.toHaveBeenCalled();
        this.scope.indices_filter.sort = false;
        this.scope.$digest(); // sort changed, should trigger refresh
        expect(this.scope.setIndices).toHaveBeenCalledWith([]);
      }
    );

  });

});
