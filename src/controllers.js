function HomeController() {
}

function BoxListController(lastActivity, resource, Restangular, $modal, $http) {
  var _this = this;
  this.inactiveCommunities = resource;
  var baseInactives = Restangular.all('arc2box/communities');

  // Handle filters
  this.lastActivity = lastActivity;
  this.filterText = null;
  this.reload = function () {
    // User clicked the "Over 18 months" checkbox or the search box
    var params = {};
    // Only send query string parameters if they are not null
    if (this.lastActivity || this.lastActivity === 0) {
      params.last_activity = this.lastActivity;
    }
    if (this.filterText) {
      params.filter = this.filterText;
    }

    baseInactives.getList(params)
      .then(
      function (success) {
        _this.inactiveCommunities = success;
      },
      function (failure) {
        console.debug('failure', failure);
      }
    );
  };

  this.setStatus = function (target, action) {
    var url = '/arc2box/communities/' + target.name;
    $http.patch(url, {action: action})
      .success(
      function (success) {
        // Update with the returned status
        target.status = success.status;
      })
      .error(
      function (failure) {
        console.debug('failed', failure);
      }
    )
  };


  this.showLog = function (target) {
    var modalInstance = $modal.open(
      {
        templateUrl: 'myModalContent.html',
        controller: ModalController,
        controllerAs: 'ctrl',
        size: 'lg',
        resolve: {
          target: function () {
            return target;
          }
        }
      });
  }
}

function ModalController($modalInstance, target, $timeout, $scope, $http) {
  var _this = this;
  this.logEntries = [];
  this.updateLog = function () {
    var url = '/arc2box/communities/' + target.name;
    $http.get(url)
      .success(function (success) {
                 console.log('success 2', success)
               })
      .error(function (error) {
               console.log('failure on getting log entries');
             });
  };
  this.updateLog();

  // Now poll
  //var seconds = 5;
  //var timer = $timeout(
  //  function () {
  //    _this.updateLog();
  //  }, seconds * 1000
  //);
  //$scope.$on(
  //  'destroy',
  //  function () {
  //    $timeout.cancel(timer);
  //  });

  this.close = function () {
    $modalInstance.dismiss();
  };
}

module.exports = {
  HomeController: HomeController,
  ModalController: ModalController,
  BoxListController: BoxListController
};