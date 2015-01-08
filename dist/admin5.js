(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);

angular.module('admin5', ['moondash'])
  .config(require('./mocks').Config);

require('./controllers');
require('./states');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./controllers":2,"./mocks":3,"./states":4}],2:[function(require,module,exports){
function HomeController() {
}

function BoxLoginController($stateParams) {
  this.loginUrl = $stateParams.url;
}

function BoxListController(lastActivity, communities, Restangular, $modal, $http) {
  var _this = this;

  this.inactiveCommunities = communities;
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
  BoxLoginController: BoxLoginController,
  ModalController: ModalController,
  BoxListController: BoxListController
};
},{}],3:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

function ModuleConfig(MdMockRestProvider) {

  var useMocks = angular.element(document.body).hasClass('a5-use-mocks');
  if (!useMocks) return;

  var communities = [
    {
      id: '1', name: 'default',
      url: '/communities/default',
      title: 'Default Community', last_activity: '2010/11/19',
      items: 4723, status: null
    },
    {
      id: '2', name: 'another',
      url: '/communities/another',
      title: 'Another Community', last_activity: '2011/01/09',
      items: 23, status: null
    },
    {
      id: '3', name: 'testing',
      url: '/communities/testing',
      title: 'Testing 123 With A Long Title That Goes On',
      last_activity: '2010/03/04',
      items: 7,
      status: null
    },
    {
      id: '4', name: 'africa',
      url: '/communities/africa',
      title: 'Africa...it is big', last_activity: '2014/04/16',
      items: 9999, status: null
    },
    {
      id: '5', name: 'merica',
      url: '/communities/merica',
      title: 'Merica', last_activity: '2014/10/07',
      items: 548, status: null
    }
  ];

  var initialLogEntries = [
    {timestamp: '2014/12/01 09:30:01', msg: 'Some message'},
    {timestamp: '2014/12/01 09:30:01', msg: '2Some message'},
    {timestamp: '2014/12/01 09:30:01', msg: '3Some message'},
    {timestamp: '2014/12/01 09:30:01', msg: '4Some message'}
  ];

  MdMockRestProvider.addMocks(
    'box',
    [
      {
        method: 'POST',
        pattern: /arc2box\/communities\/(\d+)\/setStatus/,
        responder: function (request) {
          // Given /api/to_archive/someDocId/setStatus
          // - Grab that community
          // - Change its status to the passed in 'status' value
          // - return ok
          var
            url = request.url,
            data = request.json_body;
          var id = url.split("/")[3],
            target = _(communities).first({id: id}),
            newStatus = 'stopped';
          data = request.json_body;
          if (data.status == 'start') {
            newStatus = 'started';
          }
          target.status = newStatus;
          return [200, {status: newStatus}];
        }
      },
      {
        method: 'GET',
        pattern: /arc2box\/communities\/(\d+)\/logEntries/,
        responder: function () {
          // Each time called, make up 5 entries and put them
          // in the front of the array, to simulate the server
          // generating more log entries.
          var now, timestamp, rand;
          _(_.range(15)).forEach(function () {
            now = new Date();
            timestamp = now.toLocaleString();
            rand = _.random(1000, 9999);
            initialLogEntries.unshift(
              {
                timestamp: timestamp,
                msg: rand + ' Some message ' + timestamp
              }
            );
          });
          return [200, initialLogEntries];
        }
      },
      {
        method: 'GET',
        pattern: /arc2box\/communities.*$/,
        responder: function (request) {
          /*
           Process two filters:
           - inactive == 'true' or otherwise
           - filterText, lowercase comparison
           */
          var
            last_activity = parseInt(request.query.last_activity),
            filter = request.query.filter;

          var filtered = _(communities).clone();

          if (last_activity < 360) {
            filtered = _(communities).filter(
              function (item) {
                return item.last_activity.indexOf('2014') != 0;
              }
            ).value();
          }

          if (filter) {
            var ft = filter.toLowerCase();
            filtered = _(filtered).filter(
              function (item) {
                var orig = item.name.toLowerCase();
                return orig.indexOf(ft) > -1;
              }
            ).value();
          }

          return [200, filtered];
        }
      }
    ]);


  var user = {
    id: 'admin',
    email: 'admin@x.com',
    first_name: 'Admin',
    last_name: 'Lastie',
    twitter: 'admin'
  };


  MdMockRestProvider.addMocks(
    'auth',
    [
      {
        pattern: /api\/auth\/me/,
        responseData: user,
        authenticate: true
      },
      {
        method: 'POST',
        pattern: /api\/auth\/login/,
        responder: function (request) {
          var data = request.json_body;
          var un = data.username;
          var response;

          if (un === 'admin') {
            response = [204, {token: "mocktoken"}];
          } else {
            response = [401, {"message": "Invalid login or password"}];
          }

          return response;
        }
      }
    ]);

}

module.exports = {
  Config: ModuleConfig
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
var controllers = require('./controllers');

function ModuleConfig($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/home');
  $stateProvider
    .state('site', {
             parent: 'root'
           })
    .state('site.home', {
             url: '/home',
             title: 'Home',
             views: {
               'md-content@root': {
                 template: require('./templates/home.html'),
                 controller: controllers.HomeController,
                 controllerAs: 'ctrl'
               }
             }
           })
    .state('admin', {
             url: '/admin',
             parent: 'site',
             title: 'Admin'
           })
    .state('admin.dashboard', {
             url: '/dashboard',
             title: 'Admin Dashboard',
             views: {
               'md-content@root': {
                 template: '<h1>Admin Dashboard</h1>'
               }
             }
           })
    .state('admin.archive_box', {
             url: '/archive_box',
             title: 'Archive to Box',
             views: {
               'md-content@root': {
                 template: require('./templates/box_list.html'),
                 controller: controllers.BoxListController,
                 controllerAs: 'ctrl',
                 resolve: {
                   token: function ($http, $state) {
                     var url = '/arc2box/token?invalid';
                     return $http.get(url)
                       .success(function (success) {
                                  var valid = success.valid;
                                  if (!valid) {
                                    var url = success.url;
                                    $state.go('admin.box_login', {url: url});
                                    console.debug('need to redirect');
                                  }
                                })
                       .error(function (error) {
                                console.debug('resolve validToken error');
                              });
                   },
                   lastActivity: function () {
                     return 0
                   },
                   communities: function (lastActivity, Restangular) {
                     return Restangular.all('arc2box/communities')
                       .getList({last_activity: lastActivity});
                   }
                 }
               }
             }
           })
    .state('admin.box_login', {
             url: '/box_login',
             title: 'Box Login',
             params: {
               url: ''
             },
             views: {
               'md-content@root': {
                 template: require('./templates/box_login.html'),
                 controller: controllers.BoxLoginController,
                 controllerAs: 'ctrl'
               }
             }
           })
    .state('admin.siteannounce', {
             url: '/siteannouncement',
             title: 'Site Announcement',
             views: {
               'md-content@root': {
                 template: '<h1>Site Announcement</h1>'
               }
             }
           })
    .state('admin.logs', {
             url: '/logs',
             title: 'Logs',
             parent: 'admin'
           })
    .state('admin.logs.system_logs', {
             url: '/system_logs',
             title: 'System Logs',
             views: {
               'md-content@root': {
                 template: '<h1>System Logs</h1>'
               }
             }
           })
    .state('admin.logs.feed_dump', {
             url: '/feed_dump',
             title: 'Feed Dump',
             subsection: {section: 'admin.logs'},
             views: {
               'md-content@root': {
                 template: '<h1>Feed Dump</h1>'
               }
             }
           })
    .state('admin.logs.metrics', {
             url: '/metrics',
             title: 'Metrics',
             views: {
               'md-content@root': {
                 template: '<h1>Metrics</h1>'
               }
             }
           })
    .state('admin.logs.debug_converters', {
             url: '/debug_converters',
             title: 'Debug Converters',
             views: {
               'md-content@root': {
                 template: '<h1>Debug Converters</h1>'
               }
             }
           })

    .state('admin.content', {
             url: '/content',
             title: 'Content',
             parent: 'admin'
           })
    .state('admin.content.move', {
             url: '/move',
             title: 'Move',
             subsection: {section: 'admin.content'},
             views: {
               'md-content@root': {
                 template: '<h1>Move Content</h1>'
               }
             }
           })
    .state('admin.content.delete', {
             url: '/delete',
             title: 'Delete',
             views: {
               'md-content@root': {
                 template: '<h1>Delete Content</h1>'
               }
             }
           })

    .state('admin.people', {
             url: '/people',
             title: 'People',
             parent: 'admin'
           })
    .state('admin.people.config', {
             url: '/config',
             title: 'PDC',
             views: {
               'md-content@root': {
                 template: '<h1>People Directory Configuration</h1>'
               }
             }
           })
    .state('admin.people.upload_csv', {
             url: '/upload_csv',
             title: 'Upload CSV',
             views: {
               'md-content@root': {
                 template: '<h1>Upload CSV</h1>'
               }
             }
           })
    .state('admin.people.rename_merge', {
             url: '/rename_merge',
             title: 'Rename/Merge',
             views: {
               'md-content@root': {
                 template: '<h1>Rename/Merge</h1>'
               }
             }
           })
    .state('admin.email', {
             url: '/email',
             title: 'Email',
             parent: 'admin'
           })
    .state('admin.email.send', {
             url: '/send',
             title: 'Send to Members',
             views: {
               'md-content@root': {
                 template: '<h1>Send to Members</h1>'
               }
             }
           })
    .state('admin.email.quarantine', {
             url: '/quarantine',
             title: 'View Quarantine',
             views: {
               'md-content@root': {
                 template: '<h1>View Quarantine</h1>'
               }
             }
           })
    .state('admin.update_offices', {
             url: '/update_offices',
             title: 'Update Offices',
             views: {
               'md-content@root': {
                 template: '<h1>Update Offices</h1>'
               }
             }
           })
}

function ModuleRun(Restangular, MdConfig, MdNav) {
  // If we are using mocks, don't set a prefix. Otherwise, set one.
  var useMocks = angular.element(document.body).hasClass('a5-use-mocks');
  if (!useMocks) {
    Restangular.setBaseUrl('http://localhost:6543');
  }


  MdConfig.site.name = 'KARL admin5';
  var siteConfig = {
    'items': {
      'root': [
        {
          'id': 'site.home',
          'label': 'Home',
          'state': 'site.home',
          'priority': 1
        }
      ],
      'admin': {
        'id': 'dashboard',
        'label': 'Admin',
        'items': {
          'admin.dashboard': {
            id: 'admin.dashboard',
            label: 'Admin Dashboard',
            state: 'admin.dashboard'
          },
          'admin.archive_box': {
            id: 'admin.archive_box',
            label: 'Archive to Box',
            state: 'admin.archive_box'
          },
          'admin.siteannounce': {
            id: 'admin.siteannounce',
            label: 'Site Announcement',
            state: 'admin.siteannounce'
          },
          'admin.logs': {
            id: 'admin.logs',
            label: 'Logs',
            items: {
              'admin.logs.system_logs': {
                id: 'admin.logs.system_logs',
                label: 'System Logs',
                state: 'admin.logs.system_logs'
              },
              'admin.logs.feed_dump': {
                id: 'admin.logs.feed_dump',
                label: 'Feed Dump',
                state: 'admin.logs.feed_dump'
              },
              'admin.logs.metrics': {
                id: 'admin.logs.metrics',
                label: 'Metrics',
                state: 'admin.logs.metrics'
              },
              'admin.logs.debug_converters': {
                id: 'admin.logs.debug_converters',
                label: 'Debug Converters',
                state: 'admin.logs.debug_converters'
              }
            }
          },
          'admin.content': {
            id: 'admin.content',
            label: 'Content',
            items: {
              'admin.content.move': {
                id: 'admin.content.move',
                label: 'Move',
                state: 'admin.content.move'
              },
              'admin.content.delete': {
                id: 'admin.content.delete',
                label: 'Delete',
                state: 'admin.content.delete'
              }
            }
          },
          'admin.people': {
            id: 'admin.people',
            label: 'People',
            items: {
              'admin.people.config': {
                id: 'admin.people.config',
                label: 'PDC',
                state: 'admin.people.config'
              },
              'admin.people.upload_csv': {
                id: 'admin.people.upload_csv',
                label: 'Upload CSV',
                state: 'admin.people.upload_csv'
              },
              'admin.people.rename_merge': {
                id: 'admin.people.rename_merge',
                label: 'Rename/Merge',
                state: 'admin.people.rename_merge'
              }
            }
          },
          'admin.email': {
            id: 'admin.email',
            label: 'Email',
            items: {
              'admin.email.send': {
                id: 'admin.email.send',
                label: 'Send to Members',
                state: 'admin.email.send'
              },
              'admin.email.quarantine': {
                id: 'admin.email.quarantine',
                label: 'View Quarantine',
                state: 'admin.email.quarantine'
              }
            }
          },
          'admin.update_offices': {
            id: 'admin.update_offices',
            label: 'Update Offices',
            state: 'admin.update_offices'
          }
        }
      }
    }
  };
  MdNav.init(siteConfig);
}

angular.module('admin5')
  .config(ModuleConfig)
  .run(ModuleRun);
},{"./controllers":2,"./templates/box_list.html":5,"./templates/box_login.html":6,"./templates/home.html":7}],5:[function(require,module,exports){
module.exports = '<div class="row">\n  <div class="col-md-10">\n    <h1>Archive to Box</h1>\n  </div>\n  <div class="col-md-1">\n    <button id="reload" class="btn btn-default btn-sm"\n            ng-click="ctrl.reload()"\n        >\n      Reload\n    </button>\n  </div>\n</div>\n\n<div class="row">\n\n  <div class="col-md-2">\n\n    <h5 class="text-muted">Filters</h5>\n\n    <form name="filters" ng-submit="ctrl.reload()"\n          class="form-horizonal" role="form">\n      <div class="form-group">\n        <input id="lastActivity"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.lastActivity"\n               placeholder="Activity..."> days\n      </div>\n      <div class="form-group">\n        <input id="filterText"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.filterText"\n               placeholder="Title contains...">\n      </div>\n      <input class="btn btn-primary" ng-click="ctrl.reload()"\n             type="submit" value="Filter"/>\n    </form>\n  </div>\n  <div class="col-md-10">\n    <table class="table table-striped">\n      <thead>\n      <th>Title</th>\n      <th>Activity Date</th>\n      <th>Items</th>\n      <th width="110">Status</th>\n      <th width="160">Action</th>\n      </thead>\n      <tbody>\n      <tr\n          ng-repeat="ia in ctrl.inactiveCommunities | orderBy:\'activityDate\'">\n        <td ng-bind="ia.title">Name</td>\n        <td ng-bind="ia.last_activity.split(\'.\')[0]"></td>\n        <td ng-bind="ia.items"></td>\n        <td>\n          <span ng-if="ia.status == null">default</span>\n          <span ng-if="ia.status != null"\n                ng-bind="ia.status">default</span>\n        </td>\n        <td>\n        <span ng-if="ia.status == null">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'copy\')">Copy\n            </button>\n        </span>\n        <span ng-if="ia.status == \'copying\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'stop\')">Stop\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        <span ng-if="ia.status == \'reviewing\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'mothball\')">Mothball\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'stop\')">Stop\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        <span ng-if="ia.status == \'removing\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        </td>\n      </tr>\n      </tbody>\n    </table>\n  </div>\n\n</div>\n<script type="text/ng-template" id="myModalContent.html">\n  <div class="modal-header">\n    <button class="btn btn-default pull-right"\n            ng-click="ctrl.close()">\n      <i class="glyphicon glyphicon-remove-circle"></i>\n    </button>\n    <h3 class="modal-title">Log</h3>\n  </div>\n  <div class="modal-body" style="height: 400px; overflow: scroll">\n    <table class="table table-striped">\n      <tbody>\n      <tr ng-repeat="entry in ctrl.logEntries">\n        <td width="20%"\n            ng-bind="::entry.timestamp.split(\'.\')[0]">timestamp that is\n          long\n        </td>\n        <td ng-bind="::entry.level"></td>\n        <td ng-bind="::entry.message">this is where a message would\n          go with a lot of space\n        </td>\n      </tr>\n      </tbody>\n    </table>\n    <ul>\n      <li ng-repeat="item in ctrl.items">\n        {{ item }}\n      </li>\n    </ul>\n  </div>\n</script>\n';
},{}],6:[function(require,module,exports){
module.exports = '<div class="row">\n  <div class="col-md-10">\n    <h1>Box Login</h1>\n  </div>\n  <div class="col-md-8">\n    <p>Either you have never logged KARL into Box, or the token Box\n      Box last gave you is now expired or invalid. Please click the\n      button below to log KARL back into Box.</p>\n\n    <div ng-if="ctrl.loginUrl">\n      <a\n          class="btn btn-primary btn-lg"\n          href="{{ctrl.loginUrl}}">\n        Login\n      </a>\n    </div>\n    <div ng-if="!ctrl.loginUrl" class="alert alert-warning">\n      You don\'t have a Box URL for logging in. This likely happened\n      due to a reload of this page. Click on <code>Archive to\n      Box</code> to correct.\n    </div>\n  </div>\n</div>';
},{}],7:[function(require,module,exports){
module.exports = '<div>\n  <h1>admin5 Admin Screen</h1>\n\n  <p>Taking the work done in the People Directory Configurator\n  tool an applying in generally to admin for KARL.</p>\n\n</div>';
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwic3JjL2NvbnRyb2xsZXJzLmpzIiwic3JjL21vY2tzLmpzIiwic3JjL3N0YXRlcy5qcyIsInNyYy90ZW1wbGF0ZXMvYm94X2xpc3QuaHRtbCIsInNyYy90ZW1wbGF0ZXMvYm94X2xvZ2luLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hvbWUuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDL0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwV0E7O0FDQUE7O0FDQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFuZ3VsYXIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5hbmd1bGFyIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5hbmd1bGFyIDogbnVsbCk7XG5cbmFuZ3VsYXIubW9kdWxlKCdhZG1pbjUnLCBbJ21vb25kYXNoJ10pXG4gIC5jb25maWcocmVxdWlyZSgnLi9tb2NrcycpLkNvbmZpZyk7XG5cbnJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcbnJlcXVpcmUoJy4vc3RhdGVzJyk7XG4iLCJmdW5jdGlvbiBIb21lQ29udHJvbGxlcigpIHtcbn1cblxuZnVuY3Rpb24gQm94TG9naW5Db250cm9sbGVyKCRzdGF0ZVBhcmFtcykge1xuICB0aGlzLmxvZ2luVXJsID0gJHN0YXRlUGFyYW1zLnVybDtcbn1cblxuZnVuY3Rpb24gQm94TGlzdENvbnRyb2xsZXIobGFzdEFjdGl2aXR5LCBjb21tdW5pdGllcywgUmVzdGFuZ3VsYXIsICRtb2RhbCwgJGh0dHApIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICB0aGlzLmluYWN0aXZlQ29tbXVuaXRpZXMgPSBjb21tdW5pdGllcztcbiAgdmFyIGJhc2VJbmFjdGl2ZXMgPSBSZXN0YW5ndWxhci5hbGwoJ2FyYzJib3gvY29tbXVuaXRpZXMnKTtcblxuICAvLyBIYW5kbGUgZmlsdGVyc1xuICB0aGlzLmxhc3RBY3Rpdml0eSA9IGxhc3RBY3Rpdml0eTtcbiAgdGhpcy5maWx0ZXJUZXh0ID0gbnVsbDtcbiAgdGhpcy5yZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gVXNlciBjbGlja2VkIHRoZSBcIk92ZXIgMTggbW9udGhzXCIgY2hlY2tib3ggb3IgdGhlIHNlYXJjaCBib3hcbiAgICB2YXIgcGFyYW1zID0ge307XG4gICAgLy8gT25seSBzZW5kIHF1ZXJ5IHN0cmluZyBwYXJhbWV0ZXJzIGlmIHRoZXkgYXJlIG5vdCBudWxsXG4gICAgaWYgKHRoaXMubGFzdEFjdGl2aXR5IHx8IHRoaXMubGFzdEFjdGl2aXR5ID09PSAwKSB7XG4gICAgICBwYXJhbXMubGFzdF9hY3Rpdml0eSA9IHRoaXMubGFzdEFjdGl2aXR5O1xuICAgIH1cbiAgICBpZiAodGhpcy5maWx0ZXJUZXh0KSB7XG4gICAgICBwYXJhbXMuZmlsdGVyID0gdGhpcy5maWx0ZXJUZXh0O1xuICAgIH1cblxuICAgIGJhc2VJbmFjdGl2ZXMuZ2V0TGlzdChwYXJhbXMpXG4gICAgICAudGhlbihcbiAgICAgIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgIF90aGlzLmluYWN0aXZlQ29tbXVuaXRpZXMgPSBzdWNjZXNzO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIChmYWlsdXJlKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ2ZhaWx1cmUnLCBmYWlsdXJlKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIHRoaXMuc2V0U3RhdHVzID0gZnVuY3Rpb24gKHRhcmdldCwgYWN0aW9uKSB7XG4gICAgdmFyIHVybCA9ICcvYXJjMmJveC9jb21tdW5pdGllcy8nICsgdGFyZ2V0Lm5hbWU7XG4gICAgJGh0dHAucGF0Y2godXJsLCB7YWN0aW9uOiBhY3Rpb259KVxuICAgICAgLnN1Y2Nlc3MoXG4gICAgICBmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAvLyBVcGRhdGUgd2l0aCB0aGUgcmV0dXJuZWQgc3RhdHVzXG4gICAgICAgIHRhcmdldC5zdGF0dXMgPSBzdWNjZXNzLnN0YXR1cztcbiAgICAgIH0pXG4gICAgICAuZXJyb3IoXG4gICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnZXJyb3InLCBlcnJvcik7XG4gICAgICB9XG4gICAgKVxuICB9O1xuXG5cbiAgdGhpcy5zaG93TG9nID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgIHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oXG4gICAgICB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbXlNb2RhbENvbnRlbnQuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6IE1vZGFsQ29udHJvbGxlcixcbiAgICAgICAgY29udHJvbGxlckFzOiAnY3RybCcsXG4gICAgICAgIHNpemU6ICdsZycsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNb2RhbENvbnRyb2xsZXIoJG1vZGFsSW5zdGFuY2UsIHRhcmdldCwgJHRpbWVvdXQsICRzY29wZSwgJGh0dHApIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdGhpcy5sb2dFbnRyaWVzID0gW107XG4gIHRoaXMudXBkYXRlTG9nID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB1cmwgPSAnL2FyYzJib3gvY29tbXVuaXRpZXMvJyArIHRhcmdldC5uYW1lO1xuICAgICRodHRwLmdldCh1cmwpXG4gICAgICAuc3VjY2VzcyhmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc3VjY2VzcyAyJywgc3VjY2VzcylcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAuZXJyb3IoZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmFpbHVyZSBvbiBnZXR0aW5nIGxvZyBlbnRyaWVzJyk7XG4gICAgICAgICAgICAgfSk7XG4gIH07XG4gIHRoaXMudXBkYXRlTG9nKCk7XG5cbiAgLy8gTm93IHBvbGxcbiAgLy92YXIgc2Vjb25kcyA9IDU7XG4gIC8vdmFyIHRpbWVyID0gJHRpbWVvdXQoXG4gIC8vICBmdW5jdGlvbiAoKSB7XG4gIC8vICAgIF90aGlzLnVwZGF0ZUxvZygpO1xuICAvLyAgfSwgc2Vjb25kcyAqIDEwMDBcbiAgLy8pO1xuICAvLyRzY29wZS4kb24oXG4gIC8vICAnZGVzdHJveScsXG4gIC8vICBmdW5jdGlvbiAoKSB7XG4gIC8vICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lcik7XG4gIC8vICB9KTtcblxuICB0aGlzLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEhvbWVDb250cm9sbGVyOiBIb21lQ29udHJvbGxlcixcbiAgQm94TG9naW5Db250cm9sbGVyOiBCb3hMb2dpbkNvbnRyb2xsZXIsXG4gIE1vZGFsQ29udHJvbGxlcjogTW9kYWxDb250cm9sbGVyLFxuICBCb3hMaXN0Q29udHJvbGxlcjogQm94TGlzdENvbnRyb2xsZXJcbn07IiwidmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbmZ1bmN0aW9uIE1vZHVsZUNvbmZpZyhNZE1vY2tSZXN0UHJvdmlkZXIpIHtcblxuICB2YXIgdXNlTW9ja3MgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuaGFzQ2xhc3MoJ2E1LXVzZS1tb2NrcycpO1xuICBpZiAoIXVzZU1vY2tzKSByZXR1cm47XG5cbiAgdmFyIGNvbW11bml0aWVzID0gW1xuICAgIHtcbiAgICAgIGlkOiAnMScsIG5hbWU6ICdkZWZhdWx0JyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy9kZWZhdWx0JyxcbiAgICAgIHRpdGxlOiAnRGVmYXVsdCBDb21tdW5pdHknLCBsYXN0X2FjdGl2aXR5OiAnMjAxMC8xMS8xOScsXG4gICAgICBpdGVtczogNDcyMywgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzInLCBuYW1lOiAnYW5vdGhlcicsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvYW5vdGhlcicsXG4gICAgICB0aXRsZTogJ0Fub3RoZXIgQ29tbXVuaXR5JywgbGFzdF9hY3Rpdml0eTogJzIwMTEvMDEvMDknLFxuICAgICAgaXRlbXM6IDIzLCBzdGF0dXM6IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnMycsIG5hbWU6ICd0ZXN0aW5nJyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy90ZXN0aW5nJyxcbiAgICAgIHRpdGxlOiAnVGVzdGluZyAxMjMgV2l0aCBBIExvbmcgVGl0bGUgVGhhdCBHb2VzIE9uJyxcbiAgICAgIGxhc3RfYWN0aXZpdHk6ICcyMDEwLzAzLzA0JyxcbiAgICAgIGl0ZW1zOiA3LFxuICAgICAgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzQnLCBuYW1lOiAnYWZyaWNhJyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy9hZnJpY2EnLFxuICAgICAgdGl0bGU6ICdBZnJpY2EuLi5pdCBpcyBiaWcnLCBsYXN0X2FjdGl2aXR5OiAnMjAxNC8wNC8xNicsXG4gICAgICBpdGVtczogOTk5OSwgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzUnLCBuYW1lOiAnbWVyaWNhJyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy9tZXJpY2EnLFxuICAgICAgdGl0bGU6ICdNZXJpY2EnLCBsYXN0X2FjdGl2aXR5OiAnMjAxNC8xMC8wNycsXG4gICAgICBpdGVtczogNTQ4LCBzdGF0dXM6IG51bGxcbiAgICB9XG4gIF07XG5cbiAgdmFyIGluaXRpYWxMb2dFbnRyaWVzID0gW1xuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnU29tZSBtZXNzYWdlJ30sXG4gICAge3RpbWVzdGFtcDogJzIwMTQvMTIvMDEgMDk6MzA6MDEnLCBtc2c6ICcyU29tZSBtZXNzYWdlJ30sXG4gICAge3RpbWVzdGFtcDogJzIwMTQvMTIvMDEgMDk6MzA6MDEnLCBtc2c6ICczU29tZSBtZXNzYWdlJ30sXG4gICAge3RpbWVzdGFtcDogJzIwMTQvMTIvMDEgMDk6MzA6MDEnLCBtc2c6ICc0U29tZSBtZXNzYWdlJ31cbiAgXTtcblxuICBNZE1vY2tSZXN0UHJvdmlkZXIuYWRkTW9ja3MoXG4gICAgJ2JveCcsXG4gICAgW1xuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcGF0dGVybjogL2FyYzJib3hcXC9jb21tdW5pdGllc1xcLyhcXGQrKVxcL3NldFN0YXR1cy8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICAvLyBHaXZlbiAvYXBpL3RvX2FyY2hpdmUvc29tZURvY0lkL3NldFN0YXR1c1xuICAgICAgICAgIC8vIC0gR3JhYiB0aGF0IGNvbW11bml0eVxuICAgICAgICAgIC8vIC0gQ2hhbmdlIGl0cyBzdGF0dXMgdG8gdGhlIHBhc3NlZCBpbiAnc3RhdHVzJyB2YWx1ZVxuICAgICAgICAgIC8vIC0gcmV0dXJuIG9rXG4gICAgICAgICAgdmFyXG4gICAgICAgICAgICB1cmwgPSByZXF1ZXN0LnVybCxcbiAgICAgICAgICAgIGRhdGEgPSByZXF1ZXN0Lmpzb25fYm9keTtcbiAgICAgICAgICB2YXIgaWQgPSB1cmwuc3BsaXQoXCIvXCIpWzNdLFxuICAgICAgICAgICAgdGFyZ2V0ID0gXyhjb21tdW5pdGllcykuZmlyc3Qoe2lkOiBpZH0pLFxuICAgICAgICAgICAgbmV3U3RhdHVzID0gJ3N0b3BwZWQnO1xuICAgICAgICAgIGRhdGEgPSByZXF1ZXN0Lmpzb25fYm9keTtcbiAgICAgICAgICBpZiAoZGF0YS5zdGF0dXMgPT0gJ3N0YXJ0Jykge1xuICAgICAgICAgICAgbmV3U3RhdHVzID0gJ3N0YXJ0ZWQnO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0YXJnZXQuc3RhdHVzID0gbmV3U3RhdHVzO1xuICAgICAgICAgIHJldHVybiBbMjAwLCB7c3RhdHVzOiBuZXdTdGF0dXN9XTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgcGF0dGVybjogL2FyYzJib3hcXC9jb21tdW5pdGllc1xcLyhcXGQrKVxcL2xvZ0VudHJpZXMvLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBFYWNoIHRpbWUgY2FsbGVkLCBtYWtlIHVwIDUgZW50cmllcyBhbmQgcHV0IHRoZW1cbiAgICAgICAgICAvLyBpbiB0aGUgZnJvbnQgb2YgdGhlIGFycmF5LCB0byBzaW11bGF0ZSB0aGUgc2VydmVyXG4gICAgICAgICAgLy8gZ2VuZXJhdGluZyBtb3JlIGxvZyBlbnRyaWVzLlxuICAgICAgICAgIHZhciBub3csIHRpbWVzdGFtcCwgcmFuZDtcbiAgICAgICAgICBfKF8ucmFuZ2UoMTUpKS5mb3JFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICB0aW1lc3RhbXAgPSBub3cudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICAgICAgICAgIHJhbmQgPSBfLnJhbmRvbSgxMDAwLCA5OTk5KTtcbiAgICAgICAgICAgIGluaXRpYWxMb2dFbnRyaWVzLnVuc2hpZnQoXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgICBtc2c6IHJhbmQgKyAnIFNvbWUgbWVzc2FnZSAnICsgdGltZXN0YW1wXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIFsyMDAsIGluaXRpYWxMb2dFbnRyaWVzXTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgcGF0dGVybjogL2FyYzJib3hcXC9jb21tdW5pdGllcy4qJC8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICAvKlxuICAgICAgICAgICBQcm9jZXNzIHR3byBmaWx0ZXJzOlxuICAgICAgICAgICAtIGluYWN0aXZlID09ICd0cnVlJyBvciBvdGhlcndpc2VcbiAgICAgICAgICAgLSBmaWx0ZXJUZXh0LCBsb3dlcmNhc2UgY29tcGFyaXNvblxuICAgICAgICAgICAqL1xuICAgICAgICAgIHZhclxuICAgICAgICAgICAgbGFzdF9hY3Rpdml0eSA9IHBhcnNlSW50KHJlcXVlc3QucXVlcnkubGFzdF9hY3Rpdml0eSksXG4gICAgICAgICAgICBmaWx0ZXIgPSByZXF1ZXN0LnF1ZXJ5LmZpbHRlcjtcblxuICAgICAgICAgIHZhciBmaWx0ZXJlZCA9IF8oY29tbXVuaXRpZXMpLmNsb25lKCk7XG5cbiAgICAgICAgICBpZiAobGFzdF9hY3Rpdml0eSA8IDM2MCkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBfKGNvbW11bml0aWVzKS5maWx0ZXIoXG4gICAgICAgICAgICAgIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0ubGFzdF9hY3Rpdml0eS5pbmRleE9mKCcyMDE0JykgIT0gMDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS52YWx1ZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChmaWx0ZXIpIHtcbiAgICAgICAgICAgIHZhciBmdCA9IGZpbHRlci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBfKGZpbHRlcmVkKS5maWx0ZXIoXG4gICAgICAgICAgICAgIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9yaWcgPSBpdGVtLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZy5pbmRleE9mKGZ0KSA+IC0xO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLnZhbHVlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIFsyMDAsIGZpbHRlcmVkXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0pO1xuXG5cbiAgdmFyIHVzZXIgPSB7XG4gICAgaWQ6ICdhZG1pbicsXG4gICAgZW1haWw6ICdhZG1pbkB4LmNvbScsXG4gICAgZmlyc3RfbmFtZTogJ0FkbWluJyxcbiAgICBsYXN0X25hbWU6ICdMYXN0aWUnLFxuICAgIHR3aXR0ZXI6ICdhZG1pbidcbiAgfTtcblxuXG4gIE1kTW9ja1Jlc3RQcm92aWRlci5hZGRNb2NrcyhcbiAgICAnYXV0aCcsXG4gICAgW1xuICAgICAge1xuICAgICAgICBwYXR0ZXJuOiAvYXBpXFwvYXV0aFxcL21lLyxcbiAgICAgICAgcmVzcG9uc2VEYXRhOiB1c2VyLFxuICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBwYXR0ZXJuOiAvYXBpXFwvYXV0aFxcL2xvZ2luLyxcbiAgICAgICAgcmVzcG9uZGVyOiBmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgICAgICAgIHZhciBkYXRhID0gcmVxdWVzdC5qc29uX2JvZHk7XG4gICAgICAgICAgdmFyIHVuID0gZGF0YS51c2VybmFtZTtcbiAgICAgICAgICB2YXIgcmVzcG9uc2U7XG5cbiAgICAgICAgICBpZiAodW4gPT09ICdhZG1pbicpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0gWzIwNCwge3Rva2VuOiBcIm1vY2t0b2tlblwifV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0gWzQwMSwge1wibWVzc2FnZVwiOiBcIkludmFsaWQgbG9naW4gb3IgcGFzc3dvcmRcIn1dO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0pO1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDb25maWc6IE1vZHVsZUNvbmZpZ1xufTsiLCJ2YXIgY29udHJvbGxlcnMgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5cbmZ1bmN0aW9uIE1vZHVsZUNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9ob21lJyk7XG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdzaXRlJywge1xuICAgICAgICAgICAgIHBhcmVudDogJ3Jvb3QnXG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdzaXRlLmhvbWUnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2hvbWUnLFxuICAgICAgICAgICAgIHRpdGxlOiAnSG9tZScsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9ob21lLmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuSG9tZUNvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4nLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2FkbWluJyxcbiAgICAgICAgICAgICBwYXJlbnQ6ICdzaXRlJyxcbiAgICAgICAgICAgICB0aXRsZTogJ0FkbWluJ1xuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4uZGFzaGJvYXJkJywge1xuICAgICAgICAgICAgIHVybDogJy9kYXNoYm9hcmQnLFxuICAgICAgICAgICAgIHRpdGxlOiAnQWRtaW4gRGFzaGJvYXJkJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+QWRtaW4gRGFzaGJvYXJkPC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4uYXJjaGl2ZV9ib3gnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2FyY2hpdmVfYm94JyxcbiAgICAgICAgICAgICB0aXRsZTogJ0FyY2hpdmUgdG8gQm94JyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2JveF9saXN0Lmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuQm94TGlzdENvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnLFxuICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgdG9rZW46IGZ1bmN0aW9uICgkaHR0cCwgJHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICB2YXIgdXJsID0gJy9hcmMyYm94L3Rva2VuP2ludmFsaWQnO1xuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCh1cmwpXG4gICAgICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbGlkID0gc3VjY2Vzcy52YWxpZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdXJsID0gc3VjY2Vzcy51cmw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FkbWluLmJveF9sb2dpbicsIHt1cmw6IHVybH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnbmVlZCB0byByZWRpcmVjdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdyZXNvbHZlIHZhbGlkVG9rZW4gZXJyb3InKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgbGFzdEFjdGl2aXR5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgY29tbXVuaXRpZXM6IGZ1bmN0aW9uIChsYXN0QWN0aXZpdHksIFJlc3Rhbmd1bGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmVzdGFuZ3VsYXIuYWxsKCdhcmMyYm94L2NvbW11bml0aWVzJylcbiAgICAgICAgICAgICAgICAgICAgICAgLmdldExpc3Qoe2xhc3RfYWN0aXZpdHk6IGxhc3RBY3Rpdml0eX0pO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmJveF9sb2dpbicsIHtcbiAgICAgICAgICAgICB1cmw6ICcvYm94X2xvZ2luJyxcbiAgICAgICAgICAgICB0aXRsZTogJ0JveCBMb2dpbicsXG4gICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICB1cmw6ICcnXG4gICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2JveF9sb2dpbi5odG1sJyksXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLkJveExvZ2luQ29udHJvbGxlcixcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnY3RybCdcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5zaXRlYW5ub3VuY2UnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3NpdGVhbm5vdW5jZW1lbnQnLFxuICAgICAgICAgICAgIHRpdGxlOiAnU2l0ZSBBbm5vdW5jZW1lbnQnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5TaXRlIEFubm91bmNlbWVudDwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmxvZ3MnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2xvZ3MnLFxuICAgICAgICAgICAgIHRpdGxlOiAnTG9ncycsXG4gICAgICAgICAgICAgcGFyZW50OiAnYWRtaW4nXG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5sb2dzLnN5c3RlbV9sb2dzJywge1xuICAgICAgICAgICAgIHVybDogJy9zeXN0ZW1fbG9ncycsXG4gICAgICAgICAgICAgdGl0bGU6ICdTeXN0ZW0gTG9ncycsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlN5c3RlbSBMb2dzPC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4ubG9ncy5mZWVkX2R1bXAnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2ZlZWRfZHVtcCcsXG4gICAgICAgICAgICAgdGl0bGU6ICdGZWVkIER1bXAnLFxuICAgICAgICAgICAgIHN1YnNlY3Rpb246IHtzZWN0aW9uOiAnYWRtaW4ubG9ncyd9LFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5GZWVkIER1bXA8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5sb2dzLm1ldHJpY3MnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL21ldHJpY3MnLFxuICAgICAgICAgICAgIHRpdGxlOiAnTWV0cmljcycsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPk1ldHJpY3M8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5sb2dzLmRlYnVnX2NvbnZlcnRlcnMnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2RlYnVnX2NvbnZlcnRlcnMnLFxuICAgICAgICAgICAgIHRpdGxlOiAnRGVidWcgQ29udmVydGVycycsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPkRlYnVnIENvbnZlcnRlcnM8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG5cbiAgICAuc3RhdGUoJ2FkbWluLmNvbnRlbnQnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2NvbnRlbnQnLFxuICAgICAgICAgICAgIHRpdGxlOiAnQ29udGVudCcsXG4gICAgICAgICAgICAgcGFyZW50OiAnYWRtaW4nXG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5jb250ZW50Lm1vdmUnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL21vdmUnLFxuICAgICAgICAgICAgIHRpdGxlOiAnTW92ZScsXG4gICAgICAgICAgICAgc3Vic2VjdGlvbjoge3NlY3Rpb246ICdhZG1pbi5jb250ZW50J30sXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPk1vdmUgQ29udGVudDwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmNvbnRlbnQuZGVsZXRlJywge1xuICAgICAgICAgICAgIHVybDogJy9kZWxldGUnLFxuICAgICAgICAgICAgIHRpdGxlOiAnRGVsZXRlJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+RGVsZXRlIENvbnRlbnQ8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG5cbiAgICAuc3RhdGUoJ2FkbWluLnBlb3BsZScsIHtcbiAgICAgICAgICAgICB1cmw6ICcvcGVvcGxlJyxcbiAgICAgICAgICAgICB0aXRsZTogJ1Blb3BsZScsXG4gICAgICAgICAgICAgcGFyZW50OiAnYWRtaW4nXG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5wZW9wbGUuY29uZmlnJywge1xuICAgICAgICAgICAgIHVybDogJy9jb25maWcnLFxuICAgICAgICAgICAgIHRpdGxlOiAnUERDJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+UGVvcGxlIERpcmVjdG9yeSBDb25maWd1cmF0aW9uPC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4ucGVvcGxlLnVwbG9hZF9jc3YnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3VwbG9hZF9jc3YnLFxuICAgICAgICAgICAgIHRpdGxlOiAnVXBsb2FkIENTVicsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlVwbG9hZCBDU1Y8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5wZW9wbGUucmVuYW1lX21lcmdlJywge1xuICAgICAgICAgICAgIHVybDogJy9yZW5hbWVfbWVyZ2UnLFxuICAgICAgICAgICAgIHRpdGxlOiAnUmVuYW1lL01lcmdlJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+UmVuYW1lL01lcmdlPC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4uZW1haWwnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2VtYWlsJyxcbiAgICAgICAgICAgICB0aXRsZTogJ0VtYWlsJyxcbiAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmVtYWlsLnNlbmQnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3NlbmQnLFxuICAgICAgICAgICAgIHRpdGxlOiAnU2VuZCB0byBNZW1iZXJzJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+U2VuZCB0byBNZW1iZXJzPC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4uZW1haWwucXVhcmFudGluZScsIHtcbiAgICAgICAgICAgICB1cmw6ICcvcXVhcmFudGluZScsXG4gICAgICAgICAgICAgdGl0bGU6ICdWaWV3IFF1YXJhbnRpbmUnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5WaWV3IFF1YXJhbnRpbmU8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi51cGRhdGVfb2ZmaWNlcycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvdXBkYXRlX29mZmljZXMnLFxuICAgICAgICAgICAgIHRpdGxlOiAnVXBkYXRlIE9mZmljZXMnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5VcGRhdGUgT2ZmaWNlczwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbn1cblxuZnVuY3Rpb24gTW9kdWxlUnVuKFJlc3Rhbmd1bGFyLCBNZENvbmZpZywgTWROYXYpIHtcbiAgLy8gSWYgd2UgYXJlIHVzaW5nIG1vY2tzLCBkb24ndCBzZXQgYSBwcmVmaXguIE90aGVyd2lzZSwgc2V0IG9uZS5cbiAgdmFyIHVzZU1vY2tzID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmhhc0NsYXNzKCdhNS11c2UtbW9ja3MnKTtcbiAgaWYgKCF1c2VNb2Nrcykge1xuICAgIFJlc3Rhbmd1bGFyLnNldEJhc2VVcmwoJ2h0dHA6Ly9sb2NhbGhvc3Q6NjU0MycpO1xuICB9XG5cblxuICBNZENvbmZpZy5zaXRlLm5hbWUgPSAnS0FSTCBhZG1pbjUnO1xuICB2YXIgc2l0ZUNvbmZpZyA9IHtcbiAgICAnaXRlbXMnOiB7XG4gICAgICAncm9vdCc6IFtcbiAgICAgICAge1xuICAgICAgICAgICdpZCc6ICdzaXRlLmhvbWUnLFxuICAgICAgICAgICdsYWJlbCc6ICdIb21lJyxcbiAgICAgICAgICAnc3RhdGUnOiAnc2l0ZS5ob21lJyxcbiAgICAgICAgICAncHJpb3JpdHknOiAxXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICAnYWRtaW4nOiB7XG4gICAgICAgICdpZCc6ICdkYXNoYm9hcmQnLFxuICAgICAgICAnbGFiZWwnOiAnQWRtaW4nLFxuICAgICAgICAnaXRlbXMnOiB7XG4gICAgICAgICAgJ2FkbWluLmRhc2hib2FyZCc6IHtcbiAgICAgICAgICAgIGlkOiAnYWRtaW4uZGFzaGJvYXJkJyxcbiAgICAgICAgICAgIGxhYmVsOiAnQWRtaW4gRGFzaGJvYXJkJyxcbiAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uZGFzaGJvYXJkJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2FkbWluLmFyY2hpdmVfYm94Jzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi5hcmNoaXZlX2JveCcsXG4gICAgICAgICAgICBsYWJlbDogJ0FyY2hpdmUgdG8gQm94JyxcbiAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uYXJjaGl2ZV9ib3gnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAnYWRtaW4uc2l0ZWFubm91bmNlJzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi5zaXRlYW5ub3VuY2UnLFxuICAgICAgICAgICAgbGFiZWw6ICdTaXRlIEFubm91bmNlbWVudCcsXG4gICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnNpdGVhbm5vdW5jZSdcbiAgICAgICAgICB9LFxuICAgICAgICAgICdhZG1pbi5sb2dzJzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzJyxcbiAgICAgICAgICAgIGxhYmVsOiAnTG9ncycsXG4gICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAnYWRtaW4ubG9ncy5zeXN0ZW1fbG9ncyc6IHtcbiAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmxvZ3Muc3lzdGVtX2xvZ3MnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnU3lzdGVtIExvZ3MnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ubG9ncy5zeXN0ZW1fbG9ncydcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2FkbWluLmxvZ3MuZmVlZF9kdW1wJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5mZWVkX2R1bXAnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnRmVlZCBEdW1wJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmxvZ3MuZmVlZF9kdW1wJ1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAnYWRtaW4ubG9ncy5tZXRyaWNzJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5tZXRyaWNzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ01ldHJpY3MnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ubG9ncy5tZXRyaWNzJ1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAnYWRtaW4ubG9ncy5kZWJ1Z19jb252ZXJ0ZXJzJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5kZWJ1Z19jb252ZXJ0ZXJzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0RlYnVnIENvbnZlcnRlcnMnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ubG9ncy5kZWJ1Z19jb252ZXJ0ZXJzJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnYWRtaW4uY29udGVudCc6IHtcbiAgICAgICAgICAgIGlkOiAnYWRtaW4uY29udGVudCcsXG4gICAgICAgICAgICBsYWJlbDogJ0NvbnRlbnQnLFxuICAgICAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICAgICAgJ2FkbWluLmNvbnRlbnQubW92ZSc6IHtcbiAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmNvbnRlbnQubW92ZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdNb3ZlJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmNvbnRlbnQubW92ZSdcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2FkbWluLmNvbnRlbnQuZGVsZXRlJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uY29udGVudC5kZWxldGUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmNvbnRlbnQuZGVsZXRlJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnYWRtaW4ucGVvcGxlJzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi5wZW9wbGUnLFxuICAgICAgICAgICAgbGFiZWw6ICdQZW9wbGUnLFxuICAgICAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICAgICAgJ2FkbWluLnBlb3BsZS5jb25maWcnOiB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5wZW9wbGUuY29uZmlnJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1BEQycsXG4gICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5wZW9wbGUuY29uZmlnJ1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAnYWRtaW4ucGVvcGxlLnVwbG9hZF9jc3YnOiB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5wZW9wbGUudXBsb2FkX2NzdicsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdVcGxvYWQgQ1NWJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnBlb3BsZS51cGxvYWRfY3N2J1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAnYWRtaW4ucGVvcGxlLnJlbmFtZV9tZXJnZSc6IHtcbiAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZS5yZW5hbWVfbWVyZ2UnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnUmVuYW1lL01lcmdlJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnBlb3BsZS5yZW5hbWVfbWVyZ2UnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICdhZG1pbi5lbWFpbCc6IHtcbiAgICAgICAgICAgIGlkOiAnYWRtaW4uZW1haWwnLFxuICAgICAgICAgICAgbGFiZWw6ICdFbWFpbCcsXG4gICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAnYWRtaW4uZW1haWwuc2VuZCc6IHtcbiAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmVtYWlsLnNlbmQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnU2VuZCB0byBNZW1iZXJzJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmVtYWlsLnNlbmQnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdhZG1pbi5lbWFpbC5xdWFyYW50aW5lJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uZW1haWwucXVhcmFudGluZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdWaWV3IFF1YXJhbnRpbmUnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uZW1haWwucXVhcmFudGluZSdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2FkbWluLnVwZGF0ZV9vZmZpY2VzJzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi51cGRhdGVfb2ZmaWNlcycsXG4gICAgICAgICAgICBsYWJlbDogJ1VwZGF0ZSBPZmZpY2VzJyxcbiAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4udXBkYXRlX29mZmljZXMnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBNZE5hdi5pbml0KHNpdGVDb25maWcpO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgnYWRtaW41JylcbiAgLmNvbmZpZyhNb2R1bGVDb25maWcpXG4gIC5ydW4oTW9kdWxlUnVuKTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwicm93XCI+XFxuICA8ZGl2IGNsYXNzPVwiY29sLW1kLTEwXCI+XFxuICAgIDxoMT5BcmNoaXZlIHRvIEJveDwvaDE+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMVwiPlxcbiAgICA8YnV0dG9uIGlkPVwicmVsb2FkXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtXCJcXG4gICAgICAgICAgICBuZy1jbGljaz1cImN0cmwucmVsb2FkKClcIlxcbiAgICAgICAgPlxcbiAgICAgIFJlbG9hZFxcbiAgICA8L2J1dHRvbj5cXG4gIDwvZGl2PlxcbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9XCJyb3dcIj5cXG5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMlwiPlxcblxcbiAgICA8aDUgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+RmlsdGVyczwvaDU+XFxuXFxuICAgIDxmb3JtIG5hbWU9XCJmaWx0ZXJzXCIgbmctc3VibWl0PVwiY3RybC5yZWxvYWQoKVwiXFxuICAgICAgICAgIGNsYXNzPVwiZm9ybS1ob3Jpem9uYWxcIiByb2xlPVwiZm9ybVwiPlxcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XFxuICAgICAgICA8aW5wdXQgaWQ9XCJsYXN0QWN0aXZpdHlcIlxcbiAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQteHNcIlxcbiAgICAgICAgICAgICAgIG5nLW1vZGVsPVwiY3RybC5sYXN0QWN0aXZpdHlcIlxcbiAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQWN0aXZpdHkuLi5cIj4gZGF5c1xcbiAgICAgIDwvZGl2PlxcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XFxuICAgICAgICA8aW5wdXQgaWQ9XCJmaWx0ZXJUZXh0XCJcXG4gICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sIGlucHV0LXhzXCJcXG4gICAgICAgICAgICAgICBuZy1tb2RlbD1cImN0cmwuZmlsdGVyVGV4dFwiXFxuICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJUaXRsZSBjb250YWlucy4uLlwiPlxcbiAgICAgIDwvZGl2PlxcbiAgICAgIDxpbnB1dCBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiIG5nLWNsaWNrPVwiY3RybC5yZWxvYWQoKVwiXFxuICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIiB2YWx1ZT1cIkZpbHRlclwiLz5cXG4gICAgPC9mb3JtPlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVwiY29sLW1kLTEwXCI+XFxuICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLXN0cmlwZWRcIj5cXG4gICAgICA8dGhlYWQ+XFxuICAgICAgPHRoPlRpdGxlPC90aD5cXG4gICAgICA8dGg+QWN0aXZpdHkgRGF0ZTwvdGg+XFxuICAgICAgPHRoPkl0ZW1zPC90aD5cXG4gICAgICA8dGggd2lkdGg9XCIxMTBcIj5TdGF0dXM8L3RoPlxcbiAgICAgIDx0aCB3aWR0aD1cIjE2MFwiPkFjdGlvbjwvdGg+XFxuICAgICAgPC90aGVhZD5cXG4gICAgICA8dGJvZHk+XFxuICAgICAgPHRyXFxuICAgICAgICAgIG5nLXJlcGVhdD1cImlhIGluIGN0cmwuaW5hY3RpdmVDb21tdW5pdGllcyB8IG9yZGVyQnk6XFwnYWN0aXZpdHlEYXRlXFwnXCI+XFxuICAgICAgICA8dGQgbmctYmluZD1cImlhLnRpdGxlXCI+TmFtZTwvdGQ+XFxuICAgICAgICA8dGQgbmctYmluZD1cImlhLmxhc3RfYWN0aXZpdHkuc3BsaXQoXFwnLlxcJylbMF1cIj48L3RkPlxcbiAgICAgICAgPHRkIG5nLWJpbmQ9XCJpYS5pdGVtc1wiPjwvdGQ+XFxuICAgICAgICA8dGQ+XFxuICAgICAgICAgIDxzcGFuIG5nLWlmPVwiaWEuc3RhdHVzID09IG51bGxcIj5kZWZhdWx0PC9zcGFuPlxcbiAgICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyAhPSBudWxsXCJcXG4gICAgICAgICAgICAgICAgbmctYmluZD1cImlhLnN0YXR1c1wiPmRlZmF1bHQ8L3NwYW4+XFxuICAgICAgICA8L3RkPlxcbiAgICAgICAgPHRkPlxcbiAgICAgICAgPHNwYW4gbmctaWY9XCJpYS5zdGF0dXMgPT0gbnVsbFwiPlxcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5zZXRTdGF0dXMoaWEsIFxcJ2NvcHlcXCcpXCI+Q29weVxcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgPHNwYW4gbmctaWY9XCJpYS5zdGF0dXMgPT0gXFwnY29weWluZ1xcJ1wiPlxcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5zZXRTdGF0dXMoaWEsIFxcJ3N0b3BcXCcpXCI+U3RvcFxcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5zaG93TG9nKGlhKVwiPkxvZ1xcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgPHNwYW4gbmctaWY9XCJpYS5zdGF0dXMgPT0gXFwncmV2aWV3aW5nXFwnXCI+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNldFN0YXR1cyhpYSwgXFwnbW90aGJhbGxcXCcpXCI+TW90aGJhbGxcXG4gICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2V0U3RhdHVzKGlhLCBcXCdzdG9wXFwnKVwiPlN0b3BcXG4gICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2hvd0xvZyhpYSlcIj5Mb2dcXG4gICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgIDwvc3Bhbj5cXG4gICAgICAgIDxzcGFuIG5nLWlmPVwiaWEuc3RhdHVzID09IFxcJ3JlbW92aW5nXFwnXCI+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNob3dMb2coaWEpXCI+TG9nXFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICA8L3NwYW4+XFxuICAgICAgICA8L3RkPlxcbiAgICAgIDwvdHI+XFxuICAgICAgPC90Ym9keT5cXG4gICAgPC90YWJsZT5cXG4gIDwvZGl2PlxcblxcbjwvZGl2PlxcbjxzY3JpcHQgdHlwZT1cInRleHQvbmctdGVtcGxhdGVcIiBpZD1cIm15TW9kYWxDb250ZW50Lmh0bWxcIj5cXG4gIDxkaXYgY2xhc3M9XCJtb2RhbC1oZWFkZXJcIj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBwdWxsLXJpZ2h0XCJcXG4gICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuY2xvc2UoKVwiPlxcbiAgICAgIDxpIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUtY2lyY2xlXCI+PC9pPlxcbiAgICA8L2J1dHRvbj5cXG4gICAgPGgzIGNsYXNzPVwibW9kYWwtdGl0bGVcIj5Mb2c8L2gzPlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVwibW9kYWwtYm9keVwiIHN0eWxlPVwiaGVpZ2h0OiA0MDBweDsgb3ZlcmZsb3c6IHNjcm9sbFwiPlxcbiAgICA8dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1zdHJpcGVkXCI+XFxuICAgICAgPHRib2R5PlxcbiAgICAgIDx0ciBuZy1yZXBlYXQ9XCJlbnRyeSBpbiBjdHJsLmxvZ0VudHJpZXNcIj5cXG4gICAgICAgIDx0ZCB3aWR0aD1cIjIwJVwiXFxuICAgICAgICAgICAgbmctYmluZD1cIjo6ZW50cnkudGltZXN0YW1wLnNwbGl0KFxcJy5cXCcpWzBdXCI+dGltZXN0YW1wIHRoYXQgaXNcXG4gICAgICAgICAgbG9uZ1xcbiAgICAgICAgPC90ZD5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiOjplbnRyeS5sZXZlbFwiPjwvdGQ+XFxuICAgICAgICA8dGQgbmctYmluZD1cIjo6ZW50cnkubWVzc2FnZVwiPnRoaXMgaXMgd2hlcmUgYSBtZXNzYWdlIHdvdWxkXFxuICAgICAgICAgIGdvIHdpdGggYSBsb3Qgb2Ygc3BhY2VcXG4gICAgICAgIDwvdGQ+XFxuICAgICAgPC90cj5cXG4gICAgICA8L3Rib2R5PlxcbiAgICA8L3RhYmxlPlxcbiAgICA8dWw+XFxuICAgICAgPGxpIG5nLXJlcGVhdD1cIml0ZW0gaW4gY3RybC5pdGVtc1wiPlxcbiAgICAgICAge3sgaXRlbSB9fVxcbiAgICAgIDwvbGk+XFxuICAgIDwvdWw+XFxuICA8L2Rpdj5cXG48L3NjcmlwdD5cXG4nOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgY2xhc3M9XCJyb3dcIj5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMTBcIj5cXG4gICAgPGgxPkJveCBMb2dpbjwvaDE+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtOFwiPlxcbiAgICA8cD5FaXRoZXIgeW91IGhhdmUgbmV2ZXIgbG9nZ2VkIEtBUkwgaW50byBCb3gsIG9yIHRoZSB0b2tlbiBCb3hcXG4gICAgICBCb3ggbGFzdCBnYXZlIHlvdSBpcyBub3cgZXhwaXJlZCBvciBpbnZhbGlkLiBQbGVhc2UgY2xpY2sgdGhlXFxuICAgICAgYnV0dG9uIGJlbG93IHRvIGxvZyBLQVJMIGJhY2sgaW50byBCb3guPC9wPlxcblxcbiAgICA8ZGl2IG5nLWlmPVwiY3RybC5sb2dpblVybFwiPlxcbiAgICAgIDxhXFxuICAgICAgICAgIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1sZ1wiXFxuICAgICAgICAgIGhyZWY9XCJ7e2N0cmwubG9naW5Vcmx9fVwiPlxcbiAgICAgICAgTG9naW5cXG4gICAgICA8L2E+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IG5nLWlmPVwiIWN0cmwubG9naW5VcmxcIiBjbGFzcz1cImFsZXJ0IGFsZXJ0LXdhcm5pbmdcIj5cXG4gICAgICBZb3UgZG9uXFwndCBoYXZlIGEgQm94IFVSTCBmb3IgbG9nZ2luZyBpbi4gVGhpcyBsaWtlbHkgaGFwcGVuZWRcXG4gICAgICBkdWUgdG8gYSByZWxvYWQgb2YgdGhpcyBwYWdlLiBDbGljayBvbiA8Y29kZT5BcmNoaXZlIHRvXFxuICAgICAgQm94PC9jb2RlPiB0byBjb3JyZWN0LlxcbiAgICA8L2Rpdj5cXG4gIDwvZGl2PlxcbjwvZGl2Pic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdj5cXG4gIDxoMT5hZG1pbjUgQWRtaW4gU2NyZWVuPC9oMT5cXG5cXG4gIDxwPlRha2luZyB0aGUgd29yayBkb25lIGluIHRoZSBQZW9wbGUgRGlyZWN0b3J5IENvbmZpZ3VyYXRvclxcbiAgdG9vbCBhbiBhcHBseWluZyBpbiBnZW5lcmFsbHkgdG8gYWRtaW4gZm9yIEtBUkwuPC9wPlxcblxcbjwvZGl2Pic7Il19
