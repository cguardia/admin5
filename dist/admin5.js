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

function BoxListController(Restangular, $modal, $http) {
    var _this = this;

    this.inactiveCommunities = null;
    this.isLoading = function () {
        return this.inactiveCommunities === null;
    };

    var baseInactives = Restangular.all('arc2box/communities');

    // Handle filters
    this.lastActivity = 900;
    this.limit = 20;
    this.filterText = null;
    this.reload = function () {
        _this.isSubmitting = true;
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
                _this.isSubmitting = false;
                _this.inactiveCommunities = success;
            },
            function (failure) {
                console.debug('failure', failure);
            }
        );
    };
    // Let's go ahead and load this the first time
    this.reload();

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

exports.HomeController = HomeController;
exports.BoxLoginController = BoxLoginController;
exports.ModalController = ModalController;
exports.BoxListController = BoxListController;
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
                                                    }
                                                })
                                       .error(function (error) {
                                                  console.debug('resolve validToken error');
                                              });
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
        Restangular.setBaseUrl('/');
    }


    MdConfig.site.name = 'KARL admin5';

    MdNav.init({
                   "root": [
                       {
                           "id": "site.home",
                           "label": "Home",
                           "state": "site.home",
                           "priority": 1
                       }
                   ],
                   admin: {
                       id: 'dashboard',
                       label: 'Admin',
                       items: [
                           {
                               id: 'admin.dashboard',
                               label: 'Admin Dashboard',
                               state: 'admin.dashboard'
                           },
                           {
                               id: 'admin.archive_box',
                               label: 'Archive to Box',
                               state: 'admin.archive_box'
                           },
                           {
                               id: 'admin.siteannounce',
                               label: 'Site Announcement',
                               state: 'admin.siteannounce'
                           },
                           {
                               id: 'admin.logs',
                               label: 'Logs',
                               items: [
                                   {
                                       id: 'admin.logs.system_logs',
                                       label: 'System Logs',
                                       state: 'admin.logs.system_logs'
                                   },
                                   {
                                       id: 'admin.logs.feed_dump',
                                       label: 'Feed Dump',
                                       state: 'admin.logs.feed_dump'
                                   },
                                   {
                                       id: 'admin.logs.metrics',
                                       label: 'Metrics',
                                       state: 'admin.logs.metrics'
                                   },
                                   {
                                       id: 'admin.logs.debug_converters',
                                       label: 'Debug Converters',
                                       state: 'admin.logs.debug_converters'
                                   }
                               ]
                           },
                           {
                               id: 'admin.content',
                               label: 'Content',
                               items: [
                                   {
                                       id: 'admin.content.move',
                                       label: 'Move',
                                       state: 'admin.content.move'
                                   },
                                   {
                                       id: 'admin.content.delete',
                                       label: 'Delete',
                                       state: 'admin.content.delete'
                                   }
                               ]
                           },
                           {
                               id: 'admin.people',
                               label: 'People',
                               items: [
                                   {
                                       id: 'admin.people.config',
                                       label: 'PDC',
                                       state: 'admin.people.config'
                                   },
                                   {
                                       id: 'admin.people.upload_csv',
                                       label: 'Upload CSV',
                                       state: 'admin.people.upload_csv'
                                   },


                                   {
                                       id: 'admin.people.rename_merge',
                                       label: 'Rename/Merge',
                                       state: 'admin.people.rename_merge'
                                   }
                               ]
                           },
                           {
                               id: 'admin.email',
                               label: 'Email',
                               items: [
                                   {
                                       id: 'admin.email.send',
                                       label: 'Send to Members',
                                       state: 'admin.email.send'
                                   },

                                   {
                                       id: 'admin.email.quarantine',
                                       label: 'View Quarantine',
                                       state: 'admin.email.quarantine'
                                   }
                               ]
                           },
                           {
                               id: 'admin.email',
                               label: 'Email',
                               state: 'admin.email'
                           },
                           {
                               id: 'admin.update_offices',
                               label: 'Update Offices',
                               state: 'admin.update_offices'
                           }
                       ]
                   }
               });
}

angular.module('admin5')
    .config(ModuleConfig)
    .run(ModuleRun);
},{"./controllers":2,"./templates/box_list.html":5,"./templates/box_login.html":6,"./templates/home.html":7}],5:[function(require,module,exports){
module.exports = '<div class="row">\n  <div class="col-md-10">\n    <h1>Archive to Box</h1>\n  </div>\n</div>\n\n<div class="row">\n\n  <div class="col-md-2">\n\n    <h5 class="text-muted">Filters</h5>\n\n    <form name="filters" ng-submit="ctrl.reload()"\n          class="form-horizonal" role="form">\n      <div class="form-group">\n        <input id="lastActivity"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.lastActivity"\n               placeholder="Activity..."> days\n      </div>\n      <div class="form-group">\n        <input id="filterText"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.filterText"\n               placeholder="Title contains...">\n      </div>\n      <div class="form-group">\n\n        <input id="limit"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.limit"\n               placeholder="Limit..."> items\n      </div>\n      <div>\n        <button id="filter" class="btn btn-primary"\n                type="submit">\n            <span ng-hide="ctrl.isSubmitting">\n              Filter\n            </span>\n            <span ng-show="ctrl.isSubmitting">\n                <i class="fa fa-spinner fa-spin"></i>\n            </span>\n        </button>\n      </div>\n    </form>\n  </div>\n  <div class="col-md-10">\n    <div ng-if="ctrl.isLoading()">\n      <em>Loading inactive communities...</em>\n    </div>\n    <div ng-if="ctrl.inactiveCommunities.length==0">\n      <em>No communities matching those criteria</em>\n    </div>\n    <table class="table table-striped"\n           ng-if="ctrl.inactiveCommunities.length>0">\n      <thead>\n      <th>Title</th>\n      <th>Activity Date</th>\n      <th>Items</th>\n      <th width="110">Status</th>\n      <th width="160">Action</th>\n      </thead>\n      <tbody>\n      <tr\n          ng-repeat="ia in ctrl.inactiveCommunities | orderBy:\'activityDate\'">\n        <td>\n          <a ng-href="/communities/{{ia.name}}"\n             ng-bind="ia.title">Title</a>\n        </td>\n        <td ng-bind="ia.last_activity.split(\'.\')[0]"></td>\n        <td ng-bind="ia.items"></td>\n        <td>\n          <span ng-if="ia.status == null">default</span>\n          <span ng-if="ia.status != null"\n                ng-bind="ia.status">default</span>\n        </td>\n        <td>\n        <span ng-if="ia.status == null">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'copy\')">Copy\n            </button>\n        </span>\n        <span ng-if="ia.status == \'copying\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'stop\')">Stop\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        <span ng-if="ia.status == \'reviewing\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'mothball\')">Mothball\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'stop\')">Stop\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        <span ng-if="ia.status == \'removing\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        </td>\n      </tr>\n      </tbody>\n    </table>\n  </div>\n\n</div>\n<script type="text/ng-template" id="myModalContent.html">\n  <div class="modal-header">\n    <button class="btn btn-default pull-right"\n            ng-click="ctrl.close()">\n      <i class="glyphicon glyphicon-remove-circle"></i>\n    </button>\n    <h3 class="modal-title">Log</h3>\n  </div>\n  <div class="modal-body" style="height: 400px; overflow: scroll">\n    <table class="table table-striped">\n      <tbody>\n      <tr ng-repeat="entry in ctrl.logEntries">\n        <td width="20%"\n            ng-bind="::entry.timestamp.split(\'.\')[0]">timestamp that is\n          long\n        </td>\n        <td ng-bind="::entry.level"></td>\n        <td ng-bind="::entry.message">this is where a message would\n          go with a lot of space\n        </td>\n      </tr>\n      </tbody>\n    </table>\n    <ul>\n      <li ng-repeat="item in ctrl.items">\n        {{ item }}\n      </li>\n    </ul>\n  </div>\n</script>\n';
},{}],6:[function(require,module,exports){
module.exports = '<div class="row">\n  <div class="col-md-10">\n    <h1>Box Login</h1>\n  </div>\n  <div class="col-md-8">\n    <p>Either you have never logged KARL into Box, or the token Box\n      last gave you is now expired or invalid. Please click the\n      button below to log KARL back into Box.</p>\n\n    <div ng-if="ctrl.loginUrl">\n      <a\n          class="btn btn-primary btn-lg"\n          href="{{ctrl.loginUrl}}">\n        Login\n      </a>\n    </div>\n    <div ng-if="!ctrl.loginUrl" class="alert alert-warning">\n      You don\'t have a Box URL for logging in. This likely happened\n      due to a reload of this page. Click on <code>Archive to\n      Box</code> to correct.\n    </div>\n  </div>\n</div>';
},{}],7:[function(require,module,exports){
module.exports = '<div>\n  <h1>admin5 Admin Screen</h1>\n\n  <p>Taking the work done in the People Directory Configurator\n  tool an applying in generally to admin for KARL.</p>\n\n</div>';
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwic3JjL2NvbnRyb2xsZXJzLmpzIiwic3JjL21vY2tzLmpzIiwic3JjL3N0YXRlcy5qcyIsInNyYy90ZW1wbGF0ZXMvYm94X2xpc3QuaHRtbCIsInNyYy90ZW1wbGF0ZXMvYm94X2xvZ2luLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hvbWUuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDL0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xXQTs7QUNBQTs7QUNBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgYW5ndWxhciA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmFuZ3VsYXIgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLmFuZ3VsYXIgOiBudWxsKTtcblxuYW5ndWxhci5tb2R1bGUoJ2FkbWluNScsIFsnbW9vbmRhc2gnXSlcbiAgLmNvbmZpZyhyZXF1aXJlKCcuL21vY2tzJykuQ29uZmlnKTtcblxucmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xucmVxdWlyZSgnLi9zdGF0ZXMnKTtcbiIsImZ1bmN0aW9uIEhvbWVDb250cm9sbGVyKCkge1xufVxuXG5mdW5jdGlvbiBCb3hMb2dpbkNvbnRyb2xsZXIoJHN0YXRlUGFyYW1zKSB7XG4gICAgdGhpcy5sb2dpblVybCA9ICRzdGF0ZVBhcmFtcy51cmw7XG59XG5cbmZ1bmN0aW9uIEJveExpc3RDb250cm9sbGVyKFJlc3Rhbmd1bGFyLCAkbW9kYWwsICRodHRwKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuaW5hY3RpdmVDb21tdW5pdGllcyA9IG51bGw7XG4gICAgdGhpcy5pc0xvYWRpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmluYWN0aXZlQ29tbXVuaXRpZXMgPT09IG51bGw7XG4gICAgfTtcblxuICAgIHZhciBiYXNlSW5hY3RpdmVzID0gUmVzdGFuZ3VsYXIuYWxsKCdhcmMyYm94L2NvbW11bml0aWVzJyk7XG5cbiAgICAvLyBIYW5kbGUgZmlsdGVyc1xuICAgIHRoaXMubGFzdEFjdGl2aXR5ID0gOTAwO1xuICAgIHRoaXMubGltaXQgPSAyMDtcbiAgICB0aGlzLmZpbHRlclRleHQgPSBudWxsO1xuICAgIHRoaXMucmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBfdGhpcy5pc1N1Ym1pdHRpbmcgPSB0cnVlO1xuICAgICAgICAvLyBVc2VyIGNsaWNrZWQgdGhlIFwiT3ZlciAxOCBtb250aHNcIiBjaGVja2JveCBvciB0aGUgc2VhcmNoIGJveFxuICAgICAgICB2YXIgcGFyYW1zID0ge307XG4gICAgICAgIC8vIE9ubHkgc2VuZCBxdWVyeSBzdHJpbmcgcGFyYW1ldGVycyBpZiB0aGV5IGFyZSBub3QgbnVsbFxuICAgICAgICBpZiAodGhpcy5sYXN0QWN0aXZpdHkgfHwgdGhpcy5sYXN0QWN0aXZpdHkgPT09IDApIHtcbiAgICAgICAgICAgIHBhcmFtcy5sYXN0X2FjdGl2aXR5ID0gdGhpcy5sYXN0QWN0aXZpdHk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGltaXQpIHtcbiAgICAgICAgICAgIHBhcmFtcy5saW1pdCA9IHRoaXMubGltaXQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZmlsdGVyVGV4dCkge1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlciA9IHRoaXMuZmlsdGVyVGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIGJhc2VJbmFjdGl2ZXMuZ2V0TGlzdChwYXJhbXMpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuaXNTdWJtaXR0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgX3RoaXMuaW5hY3RpdmVDb21tdW5pdGllcyA9IHN1Y2Nlc3M7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGZhaWx1cmUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdmYWlsdXJlJywgZmFpbHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfTtcbiAgICAvLyBMZXQncyBnbyBhaGVhZCBhbmQgbG9hZCB0aGlzIHRoZSBmaXJzdCB0aW1lXG4gICAgdGhpcy5yZWxvYWQoKTtcblxuICAgIHRoaXMuc2V0U3RhdHVzID0gZnVuY3Rpb24gKHRhcmdldCwgYWN0aW9uKSB7XG4gICAgICAgIHZhciB1cmwgPSAnL2FyYzJib3gvY29tbXVuaXRpZXMvJyArIHRhcmdldC5uYW1lO1xuICAgICAgICAkaHR0cC5wYXRjaCh1cmwsIHthY3Rpb246IGFjdGlvbn0pXG4gICAgICAgICAgICAuc3VjY2VzcyhcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdzdWNjZXNzIHNldHRpbmcgJyArIHRhcmdldC5uYW1lICsgJyB0byAnICsgYWN0aW9uKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5yZWxvYWQoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZXJyb3IoXG4gICAgICAgICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH07XG5cblxuICAgIHRoaXMuc2hvd0xvZyA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3BlbihcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ215TW9kYWxDb250ZW50Lmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IE1vZGFsQ29udHJvbGxlcixcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICdjdHJsJyxcbiAgICAgICAgICAgICAgICBzaXplOiAnbGcnLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBNb2RhbENvbnRyb2xsZXIoJG1vZGFsSW5zdGFuY2UsIHRhcmdldCwgJGh0dHApIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMubG9nRW50cmllcyA9IFtdO1xuICAgIHRoaXMudXBkYXRlTG9nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdXJsID0gJy9hcmMyYm94L2NvbW11bml0aWVzLycgKyB0YXJnZXQubmFtZTtcbiAgICAgICAgJGh0dHAuZ2V0KHVybClcbiAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubG9nRW50cmllcyA9IHN1Y2Nlc3MubG9nO1xuICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZhaWx1cmUgb24gZ2V0dGluZyBsb2cgZW50cmllcycpO1xuICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIH07XG4gICAgdGhpcy51cGRhdGVMb2coKTtcblxuICAgIHRoaXMuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9O1xufVxuXG5leHBvcnRzLkhvbWVDb250cm9sbGVyID0gSG9tZUNvbnRyb2xsZXI7XG5leHBvcnRzLkJveExvZ2luQ29udHJvbGxlciA9IEJveExvZ2luQ29udHJvbGxlcjtcbmV4cG9ydHMuTW9kYWxDb250cm9sbGVyID0gTW9kYWxDb250cm9sbGVyO1xuZXhwb3J0cy5Cb3hMaXN0Q29udHJvbGxlciA9IEJveExpc3RDb250cm9sbGVyOyIsInZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5mdW5jdGlvbiBNb2R1bGVDb25maWcoTWRNb2NrUmVzdFByb3ZpZGVyKSB7XG5cbiAgdmFyIHVzZU1vY2tzID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmhhc0NsYXNzKCdhNS11c2UtbW9ja3MnKTtcbiAgaWYgKCF1c2VNb2NrcykgcmV0dXJuO1xuXG4gIHZhciBjb21tdW5pdGllcyA9IFtcbiAgICB7XG4gICAgICBpZDogJzEnLCBuYW1lOiAnZGVmYXVsdCcsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvZGVmYXVsdCcsXG4gICAgICB0aXRsZTogJ0RlZmF1bHQgQ29tbXVuaXR5JywgbGFzdF9hY3Rpdml0eTogJzIwMTAvMTEvMTknLFxuICAgICAgaXRlbXM6IDQ3MjMsIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICcyJywgbmFtZTogJ2Fub3RoZXInLFxuICAgICAgdXJsOiAnL2NvbW11bml0aWVzL2Fub3RoZXInLFxuICAgICAgdGl0bGU6ICdBbm90aGVyIENvbW11bml0eScsIGxhc3RfYWN0aXZpdHk6ICcyMDExLzAxLzA5JyxcbiAgICAgIGl0ZW1zOiAyMywgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzMnLCBuYW1lOiAndGVzdGluZycsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvdGVzdGluZycsXG4gICAgICB0aXRsZTogJ1Rlc3RpbmcgMTIzIFdpdGggQSBMb25nIFRpdGxlIFRoYXQgR29lcyBPbicsXG4gICAgICBsYXN0X2FjdGl2aXR5OiAnMjAxMC8wMy8wNCcsXG4gICAgICBpdGVtczogNyxcbiAgICAgIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICc0JywgbmFtZTogJ2FmcmljYScsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvYWZyaWNhJyxcbiAgICAgIHRpdGxlOiAnQWZyaWNhLi4uaXQgaXMgYmlnJywgbGFzdF9hY3Rpdml0eTogJzIwMTQvMDQvMTYnLFxuICAgICAgaXRlbXM6IDk5OTksIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICc1JywgbmFtZTogJ21lcmljYScsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvbWVyaWNhJyxcbiAgICAgIHRpdGxlOiAnTWVyaWNhJywgbGFzdF9hY3Rpdml0eTogJzIwMTQvMTAvMDcnLFxuICAgICAgaXRlbXM6IDU0OCwgc3RhdHVzOiBudWxsXG4gICAgfVxuICBdO1xuXG4gIHZhciBpbml0aWFsTG9nRW50cmllcyA9IFtcbiAgICB7dGltZXN0YW1wOiAnMjAxNC8xMi8wMSAwOTozMDowMScsIG1zZzogJ1NvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnMlNvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnM1NvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnNFNvbWUgbWVzc2FnZSd9XG4gIF07XG5cbiAgTWRNb2NrUmVzdFByb3ZpZGVyLmFkZE1vY2tzKFxuICAgICdib3gnLFxuICAgIFtcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXNcXC8oXFxkKylcXC9zZXRTdGF0dXMvLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAgICAgLy8gR2l2ZW4gL2FwaS90b19hcmNoaXZlL3NvbWVEb2NJZC9zZXRTdGF0dXNcbiAgICAgICAgICAvLyAtIEdyYWIgdGhhdCBjb21tdW5pdHlcbiAgICAgICAgICAvLyAtIENoYW5nZSBpdHMgc3RhdHVzIHRvIHRoZSBwYXNzZWQgaW4gJ3N0YXR1cycgdmFsdWVcbiAgICAgICAgICAvLyAtIHJldHVybiBva1xuICAgICAgICAgIHZhclxuICAgICAgICAgICAgdXJsID0gcmVxdWVzdC51cmwsXG4gICAgICAgICAgICBkYXRhID0gcmVxdWVzdC5qc29uX2JvZHk7XG4gICAgICAgICAgdmFyIGlkID0gdXJsLnNwbGl0KFwiL1wiKVszXSxcbiAgICAgICAgICAgIHRhcmdldCA9IF8oY29tbXVuaXRpZXMpLmZpcnN0KHtpZDogaWR9KSxcbiAgICAgICAgICAgIG5ld1N0YXR1cyA9ICdzdG9wcGVkJztcbiAgICAgICAgICBkYXRhID0gcmVxdWVzdC5qc29uX2JvZHk7XG4gICAgICAgICAgaWYgKGRhdGEuc3RhdHVzID09ICdzdGFydCcpIHtcbiAgICAgICAgICAgIG5ld1N0YXR1cyA9ICdzdGFydGVkJztcbiAgICAgICAgICB9XG4gICAgICAgICAgdGFyZ2V0LnN0YXR1cyA9IG5ld1N0YXR1cztcbiAgICAgICAgICByZXR1cm4gWzIwMCwge3N0YXR1czogbmV3U3RhdHVzfV07XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXNcXC8oXFxkKylcXC9sb2dFbnRyaWVzLyxcbiAgICAgICAgcmVzcG9uZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gRWFjaCB0aW1lIGNhbGxlZCwgbWFrZSB1cCA1IGVudHJpZXMgYW5kIHB1dCB0aGVtXG4gICAgICAgICAgLy8gaW4gdGhlIGZyb250IG9mIHRoZSBhcnJheSwgdG8gc2ltdWxhdGUgdGhlIHNlcnZlclxuICAgICAgICAgIC8vIGdlbmVyYXRpbmcgbW9yZSBsb2cgZW50cmllcy5cbiAgICAgICAgICB2YXIgbm93LCB0aW1lc3RhbXAsIHJhbmQ7XG4gICAgICAgICAgXyhfLnJhbmdlKDE1KSkuZm9yRWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgdGltZXN0YW1wID0gbm93LnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICAgICAgICByYW5kID0gXy5yYW5kb20oMTAwMCwgOTk5OSk7XG4gICAgICAgICAgICBpbml0aWFsTG9nRW50cmllcy51bnNoaWZ0KFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgbXNnOiByYW5kICsgJyBTb21lIG1lc3NhZ2UgJyArIHRpbWVzdGFtcFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBbMjAwLCBpbml0aWFsTG9nRW50cmllc107XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXMuKiQvLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAgICAgLypcbiAgICAgICAgICAgUHJvY2VzcyB0d28gZmlsdGVyczpcbiAgICAgICAgICAgLSBpbmFjdGl2ZSA9PSAndHJ1ZScgb3Igb3RoZXJ3aXNlXG4gICAgICAgICAgIC0gZmlsdGVyVGV4dCwgbG93ZXJjYXNlIGNvbXBhcmlzb25cbiAgICAgICAgICAgKi9cbiAgICAgICAgICB2YXJcbiAgICAgICAgICAgIGxhc3RfYWN0aXZpdHkgPSBwYXJzZUludChyZXF1ZXN0LnF1ZXJ5Lmxhc3RfYWN0aXZpdHkpLFxuICAgICAgICAgICAgZmlsdGVyID0gcmVxdWVzdC5xdWVyeS5maWx0ZXI7XG5cbiAgICAgICAgICB2YXIgZmlsdGVyZWQgPSBfKGNvbW11bml0aWVzKS5jbG9uZSgpO1xuXG4gICAgICAgICAgaWYgKGxhc3RfYWN0aXZpdHkgPCAzNjApIHtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gXyhjb21tdW5pdGllcykuZmlsdGVyKFxuICAgICAgICAgICAgICBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmxhc3RfYWN0aXZpdHkuaW5kZXhPZignMjAxNCcpICE9IDA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkudmFsdWUoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZmlsdGVyKSB7XG4gICAgICAgICAgICB2YXIgZnQgPSBmaWx0ZXIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gXyhmaWx0ZXJlZCkuZmlsdGVyKFxuICAgICAgICAgICAgICBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBvcmlnID0gaXRlbS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWcuaW5kZXhPZihmdCkgPiAtMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS52YWx1ZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBbMjAwLCBmaWx0ZXJlZF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdKTtcblxuXG4gIHZhciB1c2VyID0ge1xuICAgIGlkOiAnYWRtaW4nLFxuICAgIGVtYWlsOiAnYWRtaW5AeC5jb20nLFxuICAgIGZpcnN0X25hbWU6ICdBZG1pbicsXG4gICAgbGFzdF9uYW1lOiAnTGFzdGllJyxcbiAgICB0d2l0dGVyOiAnYWRtaW4nXG4gIH07XG5cblxuICBNZE1vY2tSZXN0UHJvdmlkZXIuYWRkTW9ja3MoXG4gICAgJ2F1dGgnLFxuICAgIFtcbiAgICAgIHtcbiAgICAgICAgcGF0dGVybjogL2FwaVxcL2F1dGhcXC9tZS8sXG4gICAgICAgIHJlc3BvbnNlRGF0YTogdXNlcixcbiAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcGF0dGVybjogL2FwaVxcL2F1dGhcXC9sb2dpbi8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICB2YXIgZGF0YSA9IHJlcXVlc3QuanNvbl9ib2R5O1xuICAgICAgICAgIHZhciB1biA9IGRhdGEudXNlcm5hbWU7XG4gICAgICAgICAgdmFyIHJlc3BvbnNlO1xuXG4gICAgICAgICAgaWYgKHVuID09PSAnYWRtaW4nKSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IFsyMDQsIHt0b2tlbjogXCJtb2NrdG9rZW5cIn1dO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IFs0MDEsIHtcIm1lc3NhZ2VcIjogXCJJbnZhbGlkIGxvZ2luIG9yIHBhc3N3b3JkXCJ9XTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ29uZmlnOiBNb2R1bGVDb25maWdcbn07IiwidmFyIGNvbnRyb2xsZXJzID0gcmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xuXG5mdW5jdGlvbiBNb2R1bGVDb25maWcoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9ob21lJyk7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdzaXRlJywge1xuICAgICAgICAgICAgICAgICAgIHBhcmVudDogJ3Jvb3QnXG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3NpdGUuaG9tZScsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvaG9tZScsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdIb21lJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2hvbWUuaHRtbCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuSG9tZUNvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICdjdHJsJ1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbicsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvYWRtaW4nLFxuICAgICAgICAgICAgICAgICAgIHBhcmVudDogJ3NpdGUnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnQWRtaW4nXG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmRhc2hib2FyZCcsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvZGFzaGJvYXJkJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0FkbWluIERhc2hib2FyZCcsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPkFkbWluIERhc2hib2FyZDwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5hcmNoaXZlX2JveCcsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvYXJjaGl2ZV9ib3gnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnQXJjaGl2ZSB0byBCb3gnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvYm94X2xpc3QuaHRtbCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuQm94TGlzdENvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICdjdHJsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjogZnVuY3Rpb24gKCRodHRwLCAkc3RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVybCA9ICcvYXJjMmJveC90b2tlbj9pbnZhbGlkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCh1cmwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWxpZCA9IHN1Y2Nlc3MudmFsaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWxpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdXJsID0gc3VjY2Vzcy51cmw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnYWRtaW4uYm94X2xvZ2luJywge3VybDogdXJsfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygncmVzb2x2ZSB2YWxpZFRva2VuIGVycm9yJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5ib3hfbG9naW4nLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2JveF9sb2dpbicsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdCb3ggTG9naW4nLFxuICAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICAgICB1cmw6ICcnXG4gICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2JveF9sb2dpbi5odG1sJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVycy5Cb3hMb2dpbkNvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICdjdHJsJ1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5zaXRlYW5ub3VuY2UnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL3NpdGVhbm5vdW5jZW1lbnQnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnU2l0ZSBBbm5vdW5jZW1lbnQnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5TaXRlIEFubm91bmNlbWVudDwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5sb2dzJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9sb2dzJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0xvZ3MnLFxuICAgICAgICAgICAgICAgICAgIHBhcmVudDogJ2FkbWluJ1xuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5sb2dzLnN5c3RlbV9sb2dzJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9zeXN0ZW1fbG9ncycsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdTeXN0ZW0gTG9ncycsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlN5c3RlbSBMb2dzPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmxvZ3MuZmVlZF9kdW1wJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9mZWVkX2R1bXAnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnRmVlZCBEdW1wJyxcbiAgICAgICAgICAgICAgICAgICBzdWJzZWN0aW9uOiB7c2VjdGlvbjogJ2FkbWluLmxvZ3MnfSxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+RmVlZCBEdW1wPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmxvZ3MubWV0cmljcycsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvbWV0cmljcycsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdNZXRyaWNzJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+TWV0cmljczwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5sb2dzLmRlYnVnX2NvbnZlcnRlcnMnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2RlYnVnX2NvbnZlcnRlcnMnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnRGVidWcgQ29udmVydGVycycsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPkRlYnVnIENvbnZlcnRlcnM8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgLnN0YXRlKCdhZG1pbi5jb250ZW50Jywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9jb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0NvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgIHBhcmVudDogJ2FkbWluJ1xuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5jb250ZW50Lm1vdmUnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL21vdmUnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnTW92ZScsXG4gICAgICAgICAgICAgICAgICAgc3Vic2VjdGlvbjoge3NlY3Rpb246ICdhZG1pbi5jb250ZW50J30sXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPk1vdmUgQ29udGVudDwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5jb250ZW50LmRlbGV0ZScsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvZGVsZXRlJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0RlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPkRlbGV0ZSBDb250ZW50PC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ucGVvcGxlJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9wZW9wbGUnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnUGVvcGxlJyxcbiAgICAgICAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ucGVvcGxlLmNvbmZpZycsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvY29uZmlnJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1BEQycsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlBlb3BsZSBEaXJlY3RvcnkgQ29uZmlndXJhdGlvbjwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5wZW9wbGUudXBsb2FkX2NzdicsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvdXBsb2FkX2NzdicsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdVcGxvYWQgQ1NWJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+VXBsb2FkIENTVjwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5wZW9wbGUucmVuYW1lX21lcmdlJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9yZW5hbWVfbWVyZ2UnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnUmVuYW1lL01lcmdlJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+UmVuYW1lL01lcmdlPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmVtYWlsJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9lbWFpbCcsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdFbWFpbCcsXG4gICAgICAgICAgICAgICAgICAgcGFyZW50OiAnYWRtaW4nXG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmVtYWlsLnNlbmQnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL3NlbmQnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnU2VuZCB0byBNZW1iZXJzJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+U2VuZCB0byBNZW1iZXJzPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmVtYWlsLnF1YXJhbnRpbmUnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL3F1YXJhbnRpbmUnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnVmlldyBRdWFyYW50aW5lJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+VmlldyBRdWFyYW50aW5lPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLnVwZGF0ZV9vZmZpY2VzJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy91cGRhdGVfb2ZmaWNlcycsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdVcGRhdGUgT2ZmaWNlcycsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlVwZGF0ZSBPZmZpY2VzPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxufVxuXG5mdW5jdGlvbiBNb2R1bGVSdW4oUmVzdGFuZ3VsYXIsIE1kQ29uZmlnLCBNZE5hdikge1xuICAgIC8vIElmIHdlIGFyZSB1c2luZyBtb2NrcywgZG9uJ3Qgc2V0IGEgcHJlZml4LiBPdGhlcndpc2UsIHNldCBvbmUuXG4gICAgdmFyIHVzZU1vY2tzID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmhhc0NsYXNzKCdhNS11c2UtbW9ja3MnKTtcbiAgICBpZiAoIXVzZU1vY2tzKSB7XG4gICAgICAgIFJlc3Rhbmd1bGFyLnNldEJhc2VVcmwoJy8nKTtcbiAgICB9XG5cblxuICAgIE1kQ29uZmlnLnNpdGUubmFtZSA9ICdLQVJMIGFkbWluNSc7XG5cbiAgICBNZE5hdi5pbml0KHtcbiAgICAgICAgICAgICAgICAgICBcInJvb3RcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwic2l0ZS5ob21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiSG9tZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdGF0ZVwiOiBcInNpdGUuaG9tZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwcmlvcml0eVwiOiAxXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgIGFkbWluOiB7XG4gICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZGFzaGJvYXJkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdBZG1pbicsXG4gICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5kYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQWRtaW4gRGFzaGJvYXJkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmRhc2hib2FyZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5hcmNoaXZlX2JveCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdBcmNoaXZlIHRvIEJveCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5hcmNoaXZlX2JveCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5zaXRlYW5ub3VuY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU2l0ZSBBbm5vdW5jZW1lbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uc2l0ZWFubm91bmNlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmxvZ3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTG9ncycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzLnN5c3RlbV9sb2dzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU3lzdGVtIExvZ3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5sb2dzLnN5c3RlbV9sb2dzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmxvZ3MuZmVlZF9kdW1wJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRmVlZCBEdW1wJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ubG9ncy5mZWVkX2R1bXAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5tZXRyaWNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTWV0cmljcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmxvZ3MubWV0cmljcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzLmRlYnVnX2NvbnZlcnRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWJ1ZyBDb252ZXJ0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ubG9ncy5kZWJ1Z19jb252ZXJ0ZXJzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmNvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQ29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5jb250ZW50Lm1vdmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdNb3ZlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uY29udGVudC5tb3ZlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmNvbnRlbnQuZGVsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uY29udGVudC5kZWxldGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ucGVvcGxlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1Blb3BsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5wZW9wbGUuY29uZmlnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUERDJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ucGVvcGxlLmNvbmZpZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5wZW9wbGUudXBsb2FkX2NzdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1VwbG9hZCBDU1YnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5wZW9wbGUudXBsb2FkX2NzdidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ucGVvcGxlLnJlbmFtZV9tZXJnZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1JlbmFtZS9NZXJnZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnBlb3BsZS5yZW5hbWVfbWVyZ2UnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uZW1haWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRW1haWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uZW1haWwuc2VuZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1NlbmQgdG8gTWVtYmVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmVtYWlsLnNlbmQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5lbWFpbC5xdWFyYW50aW5lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVmlldyBRdWFyYW50aW5lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uZW1haWwucXVhcmFudGluZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5lbWFpbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFbWFpbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5lbWFpbCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi51cGRhdGVfb2ZmaWNlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdVcGRhdGUgT2ZmaWNlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi51cGRhdGVfb2ZmaWNlcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgnYWRtaW41JylcbiAgICAuY29uZmlnKE1vZHVsZUNvbmZpZylcbiAgICAucnVuKE1vZHVsZVJ1bik7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBjbGFzcz1cInJvd1wiPlxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC0xMFwiPlxcbiAgICA8aDE+QXJjaGl2ZSB0byBCb3g8L2gxPlxcbiAgPC9kaXY+XFxuPC9kaXY+XFxuXFxuPGRpdiBjbGFzcz1cInJvd1wiPlxcblxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC0yXCI+XFxuXFxuICAgIDxoNSBjbGFzcz1cInRleHQtbXV0ZWRcIj5GaWx0ZXJzPC9oNT5cXG5cXG4gICAgPGZvcm0gbmFtZT1cImZpbHRlcnNcIiBuZy1zdWJtaXQ9XCJjdHJsLnJlbG9hZCgpXCJcXG4gICAgICAgICAgY2xhc3M9XCJmb3JtLWhvcml6b25hbFwiIHJvbGU9XCJmb3JtXCI+XFxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cXG4gICAgICAgIDxpbnB1dCBpZD1cImxhc3RBY3Rpdml0eVwiXFxuICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbCBpbnB1dC14c1wiXFxuICAgICAgICAgICAgICAgbmctbW9kZWw9XCJjdHJsLmxhc3RBY3Rpdml0eVwiXFxuICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJBY3Rpdml0eS4uLlwiPiBkYXlzXFxuICAgICAgPC9kaXY+XFxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cXG4gICAgICAgIDxpbnB1dCBpZD1cImZpbHRlclRleHRcIlxcbiAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQteHNcIlxcbiAgICAgICAgICAgICAgIG5nLW1vZGVsPVwiY3RybC5maWx0ZXJUZXh0XCJcXG4gICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlRpdGxlIGNvbnRhaW5zLi4uXCI+XFxuICAgICAgPC9kaXY+XFxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cXG5cXG4gICAgICAgIDxpbnB1dCBpZD1cImxpbWl0XCJcXG4gICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sIGlucHV0LXhzXCJcXG4gICAgICAgICAgICAgICBuZy1tb2RlbD1cImN0cmwubGltaXRcIlxcbiAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTGltaXQuLi5cIj4gaXRlbXNcXG4gICAgICA8L2Rpdj5cXG4gICAgICA8ZGl2PlxcbiAgICAgICAgPGJ1dHRvbiBpZD1cImZpbHRlclwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiPlxcbiAgICAgICAgICAgIDxzcGFuIG5nLWhpZGU9XCJjdHJsLmlzU3VibWl0dGluZ1wiPlxcbiAgICAgICAgICAgICAgRmlsdGVyXFxuICAgICAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgICAgIDxzcGFuIG5nLXNob3c9XCJjdHJsLmlzU3VibWl0dGluZ1wiPlxcbiAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhIGZhLXNwaW5uZXIgZmEtc3BpblwiPjwvaT5cXG4gICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICA8L2J1dHRvbj5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9mb3JtPlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVwiY29sLW1kLTEwXCI+XFxuICAgIDxkaXYgbmctaWY9XCJjdHJsLmlzTG9hZGluZygpXCI+XFxuICAgICAgPGVtPkxvYWRpbmcgaW5hY3RpdmUgY29tbXVuaXRpZXMuLi48L2VtPlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBuZy1pZj1cImN0cmwuaW5hY3RpdmVDb21tdW5pdGllcy5sZW5ndGg9PTBcIj5cXG4gICAgICA8ZW0+Tm8gY29tbXVuaXRpZXMgbWF0Y2hpbmcgdGhvc2UgY3JpdGVyaWE8L2VtPlxcbiAgICA8L2Rpdj5cXG4gICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtc3RyaXBlZFwiXFxuICAgICAgICAgICBuZy1pZj1cImN0cmwuaW5hY3RpdmVDb21tdW5pdGllcy5sZW5ndGg+MFwiPlxcbiAgICAgIDx0aGVhZD5cXG4gICAgICA8dGg+VGl0bGU8L3RoPlxcbiAgICAgIDx0aD5BY3Rpdml0eSBEYXRlPC90aD5cXG4gICAgICA8dGg+SXRlbXM8L3RoPlxcbiAgICAgIDx0aCB3aWR0aD1cIjExMFwiPlN0YXR1czwvdGg+XFxuICAgICAgPHRoIHdpZHRoPVwiMTYwXCI+QWN0aW9uPC90aD5cXG4gICAgICA8L3RoZWFkPlxcbiAgICAgIDx0Ym9keT5cXG4gICAgICA8dHJcXG4gICAgICAgICAgbmctcmVwZWF0PVwiaWEgaW4gY3RybC5pbmFjdGl2ZUNvbW11bml0aWVzIHwgb3JkZXJCeTpcXCdhY3Rpdml0eURhdGVcXCdcIj5cXG4gICAgICAgIDx0ZD5cXG4gICAgICAgICAgPGEgbmctaHJlZj1cIi9jb21tdW5pdGllcy97e2lhLm5hbWV9fVwiXFxuICAgICAgICAgICAgIG5nLWJpbmQ9XCJpYS50aXRsZVwiPlRpdGxlPC9hPlxcbiAgICAgICAgPC90ZD5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiaWEubGFzdF9hY3Rpdml0eS5zcGxpdChcXCcuXFwnKVswXVwiPjwvdGQ+XFxuICAgICAgICA8dGQgbmctYmluZD1cImlhLml0ZW1zXCI+PC90ZD5cXG4gICAgICAgIDx0ZD5cXG4gICAgICAgICAgPHNwYW4gbmctaWY9XCJpYS5zdGF0dXMgPT0gbnVsbFwiPmRlZmF1bHQ8L3NwYW4+XFxuICAgICAgICAgIDxzcGFuIG5nLWlmPVwiaWEuc3RhdHVzICE9IG51bGxcIlxcbiAgICAgICAgICAgICAgICBuZy1iaW5kPVwiaWEuc3RhdHVzXCI+ZGVmYXVsdDwvc3Bhbj5cXG4gICAgICAgIDwvdGQ+XFxuICAgICAgICA8dGQ+XFxuICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBudWxsXCI+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNldFN0YXR1cyhpYSwgXFwnY29weVxcJylcIj5Db3B5XFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICA8L3NwYW4+XFxuICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBcXCdjb3B5aW5nXFwnXCI+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNldFN0YXR1cyhpYSwgXFwnc3RvcFxcJylcIj5TdG9wXFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNob3dMb2coaWEpXCI+TG9nXFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICA8L3NwYW4+XFxuICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBcXCdyZXZpZXdpbmdcXCdcIj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2V0U3RhdHVzKGlhLCBcXCdtb3RoYmFsbFxcJylcIj5Nb3RoYmFsbFxcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5zZXRTdGF0dXMoaWEsIFxcJ3N0b3BcXCcpXCI+U3RvcFxcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5zaG93TG9nKGlhKVwiPkxvZ1xcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgPHNwYW4gbmctaWY9XCJpYS5zdGF0dXMgPT0gXFwncmVtb3ZpbmdcXCdcIj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2hvd0xvZyhpYSlcIj5Mb2dcXG4gICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgIDwvc3Bhbj5cXG4gICAgICAgIDwvdGQ+XFxuICAgICAgPC90cj5cXG4gICAgICA8L3Rib2R5PlxcbiAgICA8L3RhYmxlPlxcbiAgPC9kaXY+XFxuXFxuPC9kaXY+XFxuPHNjcmlwdCB0eXBlPVwidGV4dC9uZy10ZW1wbGF0ZVwiIGlkPVwibXlNb2RhbENvbnRlbnQuaHRtbFwiPlxcbiAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxcbiAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IHB1bGwtcmlnaHRcIlxcbiAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5jbG9zZSgpXCI+XFxuICAgICAgPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZS1jaXJjbGVcIj48L2k+XFxuICAgIDwvYnV0dG9uPlxcbiAgICA8aDMgY2xhc3M9XCJtb2RhbC10aXRsZVwiPkxvZzwvaDM+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCIgc3R5bGU9XCJoZWlnaHQ6IDQwMHB4OyBvdmVyZmxvdzogc2Nyb2xsXCI+XFxuICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLXN0cmlwZWRcIj5cXG4gICAgICA8dGJvZHk+XFxuICAgICAgPHRyIG5nLXJlcGVhdD1cImVudHJ5IGluIGN0cmwubG9nRW50cmllc1wiPlxcbiAgICAgICAgPHRkIHdpZHRoPVwiMjAlXCJcXG4gICAgICAgICAgICBuZy1iaW5kPVwiOjplbnRyeS50aW1lc3RhbXAuc3BsaXQoXFwnLlxcJylbMF1cIj50aW1lc3RhbXAgdGhhdCBpc1xcbiAgICAgICAgICBsb25nXFxuICAgICAgICA8L3RkPlxcbiAgICAgICAgPHRkIG5nLWJpbmQ9XCI6OmVudHJ5LmxldmVsXCI+PC90ZD5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiOjplbnRyeS5tZXNzYWdlXCI+dGhpcyBpcyB3aGVyZSBhIG1lc3NhZ2Ugd291bGRcXG4gICAgICAgICAgZ28gd2l0aCBhIGxvdCBvZiBzcGFjZVxcbiAgICAgICAgPC90ZD5cXG4gICAgICA8L3RyPlxcbiAgICAgIDwvdGJvZHk+XFxuICAgIDwvdGFibGU+XFxuICAgIDx1bD5cXG4gICAgICA8bGkgbmctcmVwZWF0PVwiaXRlbSBpbiBjdHJsLml0ZW1zXCI+XFxuICAgICAgICB7eyBpdGVtIH19XFxuICAgICAgPC9saT5cXG4gICAgPC91bD5cXG4gIDwvZGl2Plxcbjwvc2NyaXB0Plxcbic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBjbGFzcz1cInJvd1wiPlxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC0xMFwiPlxcbiAgICA8aDE+Qm94IExvZ2luPC9oMT5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC04XCI+XFxuICAgIDxwPkVpdGhlciB5b3UgaGF2ZSBuZXZlciBsb2dnZWQgS0FSTCBpbnRvIEJveCwgb3IgdGhlIHRva2VuIEJveFxcbiAgICAgIGxhc3QgZ2F2ZSB5b3UgaXMgbm93IGV4cGlyZWQgb3IgaW52YWxpZC4gUGxlYXNlIGNsaWNrIHRoZVxcbiAgICAgIGJ1dHRvbiBiZWxvdyB0byBsb2cgS0FSTCBiYWNrIGludG8gQm94LjwvcD5cXG5cXG4gICAgPGRpdiBuZy1pZj1cImN0cmwubG9naW5VcmxcIj5cXG4gICAgICA8YVxcbiAgICAgICAgICBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBidG4tbGdcIlxcbiAgICAgICAgICBocmVmPVwie3tjdHJsLmxvZ2luVXJsfX1cIj5cXG4gICAgICAgIExvZ2luXFxuICAgICAgPC9hPlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBuZy1pZj1cIiFjdHJsLmxvZ2luVXJsXCIgY2xhc3M9XCJhbGVydCBhbGVydC13YXJuaW5nXCI+XFxuICAgICAgWW91IGRvblxcJ3QgaGF2ZSBhIEJveCBVUkwgZm9yIGxvZ2dpbmcgaW4uIFRoaXMgbGlrZWx5IGhhcHBlbmVkXFxuICAgICAgZHVlIHRvIGEgcmVsb2FkIG9mIHRoaXMgcGFnZS4gQ2xpY2sgb24gPGNvZGU+QXJjaGl2ZSB0b1xcbiAgICAgIEJveDwvY29kZT4gdG8gY29ycmVjdC5cXG4gICAgPC9kaXY+XFxuICA8L2Rpdj5cXG48L2Rpdj4nOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXY+XFxuICA8aDE+YWRtaW41IEFkbWluIFNjcmVlbjwvaDE+XFxuXFxuICA8cD5UYWtpbmcgdGhlIHdvcmsgZG9uZSBpbiB0aGUgUGVvcGxlIERpcmVjdG9yeSBDb25maWd1cmF0b3JcXG4gIHRvb2wgYW4gYXBwbHlpbmcgaW4gZ2VuZXJhbGx5IHRvIGFkbWluIGZvciBLQVJMLjwvcD5cXG5cXG48L2Rpdj4nOyJdfQ==
