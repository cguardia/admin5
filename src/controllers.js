function HomeController() {
}

function BoxLoginController($stateParams) {
    this.loginUrl = $stateParams.url;
}

function BoxListController(lastActivity, limit, communities, Restangular, $modal, $http) {
    var _this = this;

    this.inactiveCommunities = communities;
    var baseInactives = Restangular.all('arc2box/communities');

    // Handle filters
    this.lastActivity = lastActivity;
    this.limit = limit;
    this.filterText = null;
    this.reload = function () {
        // User clicked the "Over 18 months" checkbox or the search box
        var params = {};
        // Only send query string parameters if they are not null
        if (this.lastActivity || this.lastActivity === 0) {
            params.last_activity = this.lastActivity;
        }
        if (this.limit) {
            params.limit = this.limit;
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
            function () {
                console.debug('success setting ' + target.name + ' to ' + action);
                _this.reload();
            })
            .error(
            function (error) {
                console.debug('error', error);
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

function ModalController($modalInstance, target, $http) {
    var _this = this;
    this.logEntries = [];
    this.updateLog = function () {
        var url = '/arc2box/communities/' + target.name;
        $http.get(url)
            .success(function (success) {
                         _this.logEntries = success.log;
                     })
            .error(function (error) {
                       console.log('failure on getting log entries');
                   });
    };
    this.updateLog();

    this.close = function () {
        $modalInstance.dismiss();
    };
}

module.exports = {
    HomeController: HomeController,
    BoxLoginController: BoxLoginController,
    ModalController: ModalController,
    BoxListController: BoxListController
};