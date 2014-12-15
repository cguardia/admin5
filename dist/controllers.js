(function () {

  function BoxListCtrl(resource, Restangular, $modal) {
    var _this = this;
    this.inactiveCommunities = resource;
    var baseInactives = Restangular.all('communities');

    // Handle filters
    this.lastActivity = 540;
    this.filterText = null;
    this.reload = function () {
      // User clicked the "Over 18 months" checkbox or the search box
      baseInactives.getList(
        {
          last_activity: this.lastActivity,
          filter: this.filterText
        }
      )
        .then(function (response) {
                _this.inactiveCommunities = response;
              });
    };

    this.setStatus = function (target, status) {
      target.customPOST({status: status}, 'setStatus')
        .then(
        function (success) {
          // Update with the returned status
          target.status = success.status;
        },
        function (failure) {
          console.debug('failed', failure);
        }
      )
    };


    this.showLog = function (target) {
      var modalInstance = $modal.open(
        {
          templateUrl: 'myModalContent.html',
          controller: 'ModalCtrl as ctrl',
          size: 'lg',
          resolve: {
            target: function () {
              return target;
            }
          }
        });
    }

  }

  function ModalCtrl($modalInstance, target, $timeout, $scope) {
    var _this = this;
    this.logEntries = [];
    this.updateLog = function () {
      target.customGET('logEntries', {})
        .then(
        function (success) {
          _this.logEntries = success;
        },
        function (failure) {
          console.debug('failure', failure);
        }
      )
    };
    this.updateLog();

    // Now poll
    var seconds = 5;
    var timer = $timeout(
      function () {
        _this.updateLog();
      }, seconds * 1000
    );
    $scope.$on(
      'destroy',
      function () {
        $timeout.cancel(timer);
      });

    this.close = function () {
      $modalInstance.dismiss();
    };
  }

  angular.module('k5')
    .controller('ModalCtrl', ModalCtrl)
    .controller('BoxListCtrl', BoxListCtrl);
})();
