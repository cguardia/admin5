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

function BoxListController(lastActivity, limit, communities, Restangular, $modal, $http) {
    var _this = this;

    this.inactiveCommunities = communities;
    var baseInactives = Restangular.all('arc2box/communities');

    // Handle filters
    this.lastActivity = lastActivity;
    this.limit = limit;
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
                               },
                               lastActivity: function () {
                                   return 600;
                               },
                               limit: function () {
                                   return 50;
                               },
                               communities: function (lastActivity, Restangular) {
                                   return Restangular.all('arc2box/communities')
                                       .getList({last_activity: lastActivity, limit: 50});
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
module.exports = '<div class="row">\n  <div class="col-md-10">\n    <h1>Archive to Box</h1>\n  </div>\n</div>\n\n<div class="row">\n\n  <div class="col-md-2">\n\n    <h5 class="text-muted">Filters</h5>\n\n    <form name="filters" ng-submit="ctrl.reload()"\n          class="form-horizonal" role="form">\n      <div class="form-group">\n        <input id="lastActivity"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.lastActivity"\n               placeholder="Activity..."> days\n      </div>\n      <div class="form-group">\n        <input id="filterText"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.filterText"\n               placeholder="Title contains...">\n      </div>\n      <div class="form-group">\n\n        <input id="limit"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.limit"\n               placeholder="Limit..."> items\n      </div>\n      <div>\n        <button id="filter" class="btn btn-primary"\n                ng-click="ctrl.reload()"\n                type="submit">\n            <span ng-hide="ctrl.isSubmitting">\n              Filter\n            </span>\n            <span ng-show="ctrl.isSubmitting">\n                <i class="fa fa-spinner fa-spin"></i>\n            </span>\n        </button>\n      </div>\n    </form>\n  </div>\n  <div class="col-md-10">\n    <div ng-if="ctrl.inactiveCommunities.length==0">\n      <em>No communities matching those criteria</em>\n    </div>\n    <table class="table table-striped"\n           ng-if="ctrl.inactiveCommunities.length>0">\n      <thead>\n      <th>Title</th>\n      <th>Activity Date</th>\n      <th>Items</th>\n      <th width="110">Status</th>\n      <th width="160">Action</th>\n      </thead>\n      <tbody>\n      <tr\n          ng-repeat="ia in ctrl.inactiveCommunities | orderBy:\'activityDate\'">\n        <td>\n          <a ng-href="/communities/{{ia.name}}"\n             ng-bind="ia.title">Title</a>\n        </td>\n        <td ng-bind="ia.last_activity.split(\'.\')[0]"></td>\n        <td ng-bind="ia.items"></td>\n        <td>\n          <span ng-if="ia.status == null">default</span>\n          <span ng-if="ia.status != null"\n                ng-bind="ia.status">default</span>\n        </td>\n        <td>\n        <span ng-if="ia.status == null">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'copy\')">Copy\n            </button>\n        </span>\n        <span ng-if="ia.status == \'copying\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'stop\')">Stop\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        <span ng-if="ia.status == \'reviewing\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'mothball\')">Mothball\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'stop\')">Stop\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        <span ng-if="ia.status == \'removing\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        </td>\n      </tr>\n      </tbody>\n    </table>\n  </div>\n\n</div>\n<script type="text/ng-template" id="myModalContent.html">\n  <div class="modal-header">\n    <button class="btn btn-default pull-right"\n            ng-click="ctrl.close()">\n      <i class="glyphicon glyphicon-remove-circle"></i>\n    </button>\n    <h3 class="modal-title">Log</h3>\n  </div>\n  <div class="modal-body" style="height: 400px; overflow: scroll">\n    <table class="table table-striped">\n      <tbody>\n      <tr ng-repeat="entry in ctrl.logEntries">\n        <td width="20%"\n            ng-bind="::entry.timestamp.split(\'.\')[0]">timestamp that is\n          long\n        </td>\n        <td ng-bind="::entry.level"></td>\n        <td ng-bind="::entry.message">this is where a message would\n          go with a lot of space\n        </td>\n      </tr>\n      </tbody>\n    </table>\n    <ul>\n      <li ng-repeat="item in ctrl.items">\n        {{ item }}\n      </li>\n    </ul>\n  </div>\n</script>\n';
},{}],6:[function(require,module,exports){
module.exports = '<div class="row">\n  <div class="col-md-10">\n    <h1>Box Login</h1>\n  </div>\n  <div class="col-md-8">\n    <p>Either you have never logged KARL into Box, or the token Box\n      last gave you is now expired or invalid. Please click the\n      button below to log KARL back into Box.</p>\n\n    <div ng-if="ctrl.loginUrl">\n      <a\n          class="btn btn-primary btn-lg"\n          href="{{ctrl.loginUrl}}">\n        Login\n      </a>\n    </div>\n    <div ng-if="!ctrl.loginUrl" class="alert alert-warning">\n      You don\'t have a Box URL for logging in. This likely happened\n      due to a reload of this page. Click on <code>Archive to\n      Box</code> to correct.\n    </div>\n  </div>\n</div>';
},{}],7:[function(require,module,exports){
module.exports = '<div>\n  <h1>admin5 Admin Screen</h1>\n\n  <p>Taking the work done in the People Directory Configurator\n  tool an applying in generally to admin for KARL.</p>\n\n</div>';
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwic3JjL2NvbnRyb2xsZXJzLmpzIiwic3JjL21vY2tzLmpzIiwic3JjL3N0YXRlcy5qcyIsInNyYy90ZW1wbGF0ZXMvYm94X2xpc3QuaHRtbCIsInNyYy90ZW1wbGF0ZXMvYm94X2xvZ2luLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hvbWUuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDL0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVdBOztBQ0FBOztBQ0FBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBhbmd1bGFyID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuYW5ndWxhciA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuYW5ndWxhciA6IG51bGwpO1xuXG5hbmd1bGFyLm1vZHVsZSgnYWRtaW41JywgWydtb29uZGFzaCddKVxuICAuY29uZmlnKHJlcXVpcmUoJy4vbW9ja3MnKS5Db25maWcpO1xuXG5yZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5yZXF1aXJlKCcuL3N0YXRlcycpO1xuIiwiZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoKSB7XG59XG5cbmZ1bmN0aW9uIEJveExvZ2luQ29udHJvbGxlcigkc3RhdGVQYXJhbXMpIHtcbiAgICB0aGlzLmxvZ2luVXJsID0gJHN0YXRlUGFyYW1zLnVybDtcbn1cblxuZnVuY3Rpb24gQm94TGlzdENvbnRyb2xsZXIobGFzdEFjdGl2aXR5LCBsaW1pdCwgY29tbXVuaXRpZXMsIFJlc3Rhbmd1bGFyLCAkbW9kYWwsICRodHRwKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuaW5hY3RpdmVDb21tdW5pdGllcyA9IGNvbW11bml0aWVzO1xuICAgIHZhciBiYXNlSW5hY3RpdmVzID0gUmVzdGFuZ3VsYXIuYWxsKCdhcmMyYm94L2NvbW11bml0aWVzJyk7XG5cbiAgICAvLyBIYW5kbGUgZmlsdGVyc1xuICAgIHRoaXMubGFzdEFjdGl2aXR5ID0gbGFzdEFjdGl2aXR5O1xuICAgIHRoaXMubGltaXQgPSBsaW1pdDtcbiAgICB0aGlzLmZpbHRlclRleHQgPSBudWxsO1xuICAgIHRoaXMucmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBfdGhpcy5pc1N1Ym1pdHRpbmcgPSB0cnVlO1xuICAgICAgICAvLyBVc2VyIGNsaWNrZWQgdGhlIFwiT3ZlciAxOCBtb250aHNcIiBjaGVja2JveCBvciB0aGUgc2VhcmNoIGJveFxuICAgICAgICB2YXIgcGFyYW1zID0ge307XG4gICAgICAgIC8vIE9ubHkgc2VuZCBxdWVyeSBzdHJpbmcgcGFyYW1ldGVycyBpZiB0aGV5IGFyZSBub3QgbnVsbFxuICAgICAgICBpZiAodGhpcy5sYXN0QWN0aXZpdHkgfHwgdGhpcy5sYXN0QWN0aXZpdHkgPT09IDApIHtcbiAgICAgICAgICAgIHBhcmFtcy5sYXN0X2FjdGl2aXR5ID0gdGhpcy5sYXN0QWN0aXZpdHk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGltaXQpIHtcbiAgICAgICAgICAgIHBhcmFtcy5saW1pdCA9IHRoaXMubGltaXQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZmlsdGVyVGV4dCkge1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlciA9IHRoaXMuZmlsdGVyVGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIGJhc2VJbmFjdGl2ZXMuZ2V0TGlzdChwYXJhbXMpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuaXNTdWJtaXR0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgX3RoaXMuaW5hY3RpdmVDb21tdW5pdGllcyA9IHN1Y2Nlc3M7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGZhaWx1cmUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdmYWlsdXJlJywgZmFpbHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0U3RhdHVzID0gZnVuY3Rpb24gKHRhcmdldCwgYWN0aW9uKSB7XG4gICAgICAgIHZhciB1cmwgPSAnL2FyYzJib3gvY29tbXVuaXRpZXMvJyArIHRhcmdldC5uYW1lO1xuICAgICAgICAkaHR0cC5wYXRjaCh1cmwsIHthY3Rpb246IGFjdGlvbn0pXG4gICAgICAgICAgICAuc3VjY2VzcyhcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdzdWNjZXNzIHNldHRpbmcgJyArIHRhcmdldC5uYW1lICsgJyB0byAnICsgYWN0aW9uKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5yZWxvYWQoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZXJyb3IoXG4gICAgICAgICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH07XG5cblxuICAgIHRoaXMuc2hvd0xvZyA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3BlbihcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ215TW9kYWxDb250ZW50Lmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IE1vZGFsQ29udHJvbGxlcixcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICdjdHJsJyxcbiAgICAgICAgICAgICAgICBzaXplOiAnbGcnLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBNb2RhbENvbnRyb2xsZXIoJG1vZGFsSW5zdGFuY2UsIHRhcmdldCwgJGh0dHApIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMubG9nRW50cmllcyA9IFtdO1xuICAgIHRoaXMudXBkYXRlTG9nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdXJsID0gJy9hcmMyYm94L2NvbW11bml0aWVzLycgKyB0YXJnZXQubmFtZTtcbiAgICAgICAgJGh0dHAuZ2V0KHVybClcbiAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubG9nRW50cmllcyA9IHN1Y2Nlc3MubG9nO1xuICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZhaWx1cmUgb24gZ2V0dGluZyBsb2cgZW50cmllcycpO1xuICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIH07XG4gICAgdGhpcy51cGRhdGVMb2coKTtcblxuICAgIHRoaXMuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9O1xufVxuXG5leHBvcnRzLkhvbWVDb250cm9sbGVyID0gSG9tZUNvbnRyb2xsZXI7XG5leHBvcnRzLkJveExvZ2luQ29udHJvbGxlciA9IEJveExvZ2luQ29udHJvbGxlcjtcbmV4cG9ydHMuTW9kYWxDb250cm9sbGVyID0gTW9kYWxDb250cm9sbGVyO1xuZXhwb3J0cy5Cb3hMaXN0Q29udHJvbGxlciA9IEJveExpc3RDb250cm9sbGVyOyIsInZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5mdW5jdGlvbiBNb2R1bGVDb25maWcoTWRNb2NrUmVzdFByb3ZpZGVyKSB7XG5cbiAgdmFyIHVzZU1vY2tzID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmhhc0NsYXNzKCdhNS11c2UtbW9ja3MnKTtcbiAgaWYgKCF1c2VNb2NrcykgcmV0dXJuO1xuXG4gIHZhciBjb21tdW5pdGllcyA9IFtcbiAgICB7XG4gICAgICBpZDogJzEnLCBuYW1lOiAnZGVmYXVsdCcsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvZGVmYXVsdCcsXG4gICAgICB0aXRsZTogJ0RlZmF1bHQgQ29tbXVuaXR5JywgbGFzdF9hY3Rpdml0eTogJzIwMTAvMTEvMTknLFxuICAgICAgaXRlbXM6IDQ3MjMsIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICcyJywgbmFtZTogJ2Fub3RoZXInLFxuICAgICAgdXJsOiAnL2NvbW11bml0aWVzL2Fub3RoZXInLFxuICAgICAgdGl0bGU6ICdBbm90aGVyIENvbW11bml0eScsIGxhc3RfYWN0aXZpdHk6ICcyMDExLzAxLzA5JyxcbiAgICAgIGl0ZW1zOiAyMywgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzMnLCBuYW1lOiAndGVzdGluZycsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvdGVzdGluZycsXG4gICAgICB0aXRsZTogJ1Rlc3RpbmcgMTIzIFdpdGggQSBMb25nIFRpdGxlIFRoYXQgR29lcyBPbicsXG4gICAgICBsYXN0X2FjdGl2aXR5OiAnMjAxMC8wMy8wNCcsXG4gICAgICBpdGVtczogNyxcbiAgICAgIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICc0JywgbmFtZTogJ2FmcmljYScsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvYWZyaWNhJyxcbiAgICAgIHRpdGxlOiAnQWZyaWNhLi4uaXQgaXMgYmlnJywgbGFzdF9hY3Rpdml0eTogJzIwMTQvMDQvMTYnLFxuICAgICAgaXRlbXM6IDk5OTksIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICc1JywgbmFtZTogJ21lcmljYScsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvbWVyaWNhJyxcbiAgICAgIHRpdGxlOiAnTWVyaWNhJywgbGFzdF9hY3Rpdml0eTogJzIwMTQvMTAvMDcnLFxuICAgICAgaXRlbXM6IDU0OCwgc3RhdHVzOiBudWxsXG4gICAgfVxuICBdO1xuXG4gIHZhciBpbml0aWFsTG9nRW50cmllcyA9IFtcbiAgICB7dGltZXN0YW1wOiAnMjAxNC8xMi8wMSAwOTozMDowMScsIG1zZzogJ1NvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnMlNvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnM1NvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnNFNvbWUgbWVzc2FnZSd9XG4gIF07XG5cbiAgTWRNb2NrUmVzdFByb3ZpZGVyLmFkZE1vY2tzKFxuICAgICdib3gnLFxuICAgIFtcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXNcXC8oXFxkKylcXC9zZXRTdGF0dXMvLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAgICAgLy8gR2l2ZW4gL2FwaS90b19hcmNoaXZlL3NvbWVEb2NJZC9zZXRTdGF0dXNcbiAgICAgICAgICAvLyAtIEdyYWIgdGhhdCBjb21tdW5pdHlcbiAgICAgICAgICAvLyAtIENoYW5nZSBpdHMgc3RhdHVzIHRvIHRoZSBwYXNzZWQgaW4gJ3N0YXR1cycgdmFsdWVcbiAgICAgICAgICAvLyAtIHJldHVybiBva1xuICAgICAgICAgIHZhclxuICAgICAgICAgICAgdXJsID0gcmVxdWVzdC51cmwsXG4gICAgICAgICAgICBkYXRhID0gcmVxdWVzdC5qc29uX2JvZHk7XG4gICAgICAgICAgdmFyIGlkID0gdXJsLnNwbGl0KFwiL1wiKVszXSxcbiAgICAgICAgICAgIHRhcmdldCA9IF8oY29tbXVuaXRpZXMpLmZpcnN0KHtpZDogaWR9KSxcbiAgICAgICAgICAgIG5ld1N0YXR1cyA9ICdzdG9wcGVkJztcbiAgICAgICAgICBkYXRhID0gcmVxdWVzdC5qc29uX2JvZHk7XG4gICAgICAgICAgaWYgKGRhdGEuc3RhdHVzID09ICdzdGFydCcpIHtcbiAgICAgICAgICAgIG5ld1N0YXR1cyA9ICdzdGFydGVkJztcbiAgICAgICAgICB9XG4gICAgICAgICAgdGFyZ2V0LnN0YXR1cyA9IG5ld1N0YXR1cztcbiAgICAgICAgICByZXR1cm4gWzIwMCwge3N0YXR1czogbmV3U3RhdHVzfV07XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXNcXC8oXFxkKylcXC9sb2dFbnRyaWVzLyxcbiAgICAgICAgcmVzcG9uZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gRWFjaCB0aW1lIGNhbGxlZCwgbWFrZSB1cCA1IGVudHJpZXMgYW5kIHB1dCB0aGVtXG4gICAgICAgICAgLy8gaW4gdGhlIGZyb250IG9mIHRoZSBhcnJheSwgdG8gc2ltdWxhdGUgdGhlIHNlcnZlclxuICAgICAgICAgIC8vIGdlbmVyYXRpbmcgbW9yZSBsb2cgZW50cmllcy5cbiAgICAgICAgICB2YXIgbm93LCB0aW1lc3RhbXAsIHJhbmQ7XG4gICAgICAgICAgXyhfLnJhbmdlKDE1KSkuZm9yRWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgdGltZXN0YW1wID0gbm93LnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICAgICAgICByYW5kID0gXy5yYW5kb20oMTAwMCwgOTk5OSk7XG4gICAgICAgICAgICBpbml0aWFsTG9nRW50cmllcy51bnNoaWZ0KFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgbXNnOiByYW5kICsgJyBTb21lIG1lc3NhZ2UgJyArIHRpbWVzdGFtcFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBbMjAwLCBpbml0aWFsTG9nRW50cmllc107XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXMuKiQvLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAgICAgLypcbiAgICAgICAgICAgUHJvY2VzcyB0d28gZmlsdGVyczpcbiAgICAgICAgICAgLSBpbmFjdGl2ZSA9PSAndHJ1ZScgb3Igb3RoZXJ3aXNlXG4gICAgICAgICAgIC0gZmlsdGVyVGV4dCwgbG93ZXJjYXNlIGNvbXBhcmlzb25cbiAgICAgICAgICAgKi9cbiAgICAgICAgICB2YXJcbiAgICAgICAgICAgIGxhc3RfYWN0aXZpdHkgPSBwYXJzZUludChyZXF1ZXN0LnF1ZXJ5Lmxhc3RfYWN0aXZpdHkpLFxuICAgICAgICAgICAgZmlsdGVyID0gcmVxdWVzdC5xdWVyeS5maWx0ZXI7XG5cbiAgICAgICAgICB2YXIgZmlsdGVyZWQgPSBfKGNvbW11bml0aWVzKS5jbG9uZSgpO1xuXG4gICAgICAgICAgaWYgKGxhc3RfYWN0aXZpdHkgPCAzNjApIHtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gXyhjb21tdW5pdGllcykuZmlsdGVyKFxuICAgICAgICAgICAgICBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmxhc3RfYWN0aXZpdHkuaW5kZXhPZignMjAxNCcpICE9IDA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkudmFsdWUoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZmlsdGVyKSB7XG4gICAgICAgICAgICB2YXIgZnQgPSBmaWx0ZXIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gXyhmaWx0ZXJlZCkuZmlsdGVyKFxuICAgICAgICAgICAgICBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBvcmlnID0gaXRlbS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWcuaW5kZXhPZihmdCkgPiAtMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS52YWx1ZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBbMjAwLCBmaWx0ZXJlZF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdKTtcblxuXG4gIHZhciB1c2VyID0ge1xuICAgIGlkOiAnYWRtaW4nLFxuICAgIGVtYWlsOiAnYWRtaW5AeC5jb20nLFxuICAgIGZpcnN0X25hbWU6ICdBZG1pbicsXG4gICAgbGFzdF9uYW1lOiAnTGFzdGllJyxcbiAgICB0d2l0dGVyOiAnYWRtaW4nXG4gIH07XG5cblxuICBNZE1vY2tSZXN0UHJvdmlkZXIuYWRkTW9ja3MoXG4gICAgJ2F1dGgnLFxuICAgIFtcbiAgICAgIHtcbiAgICAgICAgcGF0dGVybjogL2FwaVxcL2F1dGhcXC9tZS8sXG4gICAgICAgIHJlc3BvbnNlRGF0YTogdXNlcixcbiAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcGF0dGVybjogL2FwaVxcL2F1dGhcXC9sb2dpbi8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICB2YXIgZGF0YSA9IHJlcXVlc3QuanNvbl9ib2R5O1xuICAgICAgICAgIHZhciB1biA9IGRhdGEudXNlcm5hbWU7XG4gICAgICAgICAgdmFyIHJlc3BvbnNlO1xuXG4gICAgICAgICAgaWYgKHVuID09PSAnYWRtaW4nKSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IFsyMDQsIHt0b2tlbjogXCJtb2NrdG9rZW5cIn1dO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IFs0MDEsIHtcIm1lc3NhZ2VcIjogXCJJbnZhbGlkIGxvZ2luIG9yIHBhc3N3b3JkXCJ9XTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ29uZmlnOiBNb2R1bGVDb25maWdcbn07IiwidmFyIGNvbnRyb2xsZXJzID0gcmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xuXG5mdW5jdGlvbiBNb2R1bGVDb25maWcoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9ob21lJyk7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdzaXRlJywge1xuICAgICAgICAgICAgICAgICAgIHBhcmVudDogJ3Jvb3QnXG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3NpdGUuaG9tZScsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvaG9tZScsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdIb21lJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2hvbWUuaHRtbCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuSG9tZUNvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICdjdHJsJ1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbicsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvYWRtaW4nLFxuICAgICAgICAgICAgICAgICAgIHBhcmVudDogJ3NpdGUnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnQWRtaW4nXG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmRhc2hib2FyZCcsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvZGFzaGJvYXJkJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0FkbWluIERhc2hib2FyZCcsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPkFkbWluIERhc2hib2FyZDwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5hcmNoaXZlX2JveCcsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvYXJjaGl2ZV9ib3gnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnQXJjaGl2ZSB0byBCb3gnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvYm94X2xpc3QuaHRtbCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuQm94TGlzdENvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICdjdHJsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjogZnVuY3Rpb24gKCRodHRwLCAkc3RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVybCA9ICcvYXJjMmJveC90b2tlbj9pbnZhbGlkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCh1cmwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWxpZCA9IHN1Y2Nlc3MudmFsaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWxpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdXJsID0gc3VjY2Vzcy51cmw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnYWRtaW4uYm94X2xvZ2luJywge3VybDogdXJsfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygncmVzb2x2ZSB2YWxpZFRva2VuIGVycm9yJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0QWN0aXZpdHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDYwMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA1MDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW11bml0aWVzOiBmdW5jdGlvbiAobGFzdEFjdGl2aXR5LCBSZXN0YW5ndWxhcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmVzdGFuZ3VsYXIuYWxsKCdhcmMyYm94L2NvbW11bml0aWVzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5nZXRMaXN0KHtsYXN0X2FjdGl2aXR5OiBsYXN0QWN0aXZpdHksIGxpbWl0OiA1MH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uYm94X2xvZ2luJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9ib3hfbG9naW4nLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnQm94IExvZ2luJyxcbiAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAnJ1xuICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9ib3hfbG9naW4uaHRtbCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuQm94TG9naW5Db250cm9sbGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnY3RybCdcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uc2l0ZWFubm91bmNlJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9zaXRlYW5ub3VuY2VtZW50JyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1NpdGUgQW5ub3VuY2VtZW50JyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+U2l0ZSBBbm5vdW5jZW1lbnQ8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ubG9ncycsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvbG9ncycsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdMb2dzJyxcbiAgICAgICAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ubG9ncy5zeXN0ZW1fbG9ncycsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvc3lzdGVtX2xvZ3MnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnU3lzdGVtIExvZ3MnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5TeXN0ZW0gTG9nczwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5sb2dzLmZlZWRfZHVtcCcsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvZmVlZF9kdW1wJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0ZlZWQgRHVtcCcsXG4gICAgICAgICAgICAgICAgICAgc3Vic2VjdGlvbjoge3NlY3Rpb246ICdhZG1pbi5sb2dzJ30sXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPkZlZWQgRHVtcDwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5sb2dzLm1ldHJpY3MnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL21ldHJpY3MnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnTWV0cmljcycsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPk1ldHJpY3M8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ubG9ncy5kZWJ1Z19jb252ZXJ0ZXJzJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9kZWJ1Z19jb252ZXJ0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0RlYnVnIENvbnZlcnRlcnMnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5EZWJ1ZyBDb252ZXJ0ZXJzPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uY29udGVudCcsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvY29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdDb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uY29udGVudC5tb3ZlJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9tb3ZlJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ01vdmUnLFxuICAgICAgICAgICAgICAgICAgIHN1YnNlY3Rpb246IHtzZWN0aW9uOiAnYWRtaW4uY29udGVudCd9LFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5Nb3ZlIENvbnRlbnQ8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uY29udGVudC5kZWxldGUnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2RlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5EZWxldGUgQ29udGVudDwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAuc3RhdGUoJ2FkbWluLnBlb3BsZScsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvcGVvcGxlJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1Blb3BsZScsXG4gICAgICAgICAgICAgICAgICAgcGFyZW50OiAnYWRtaW4nXG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLnBlb3BsZS5jb25maWcnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2NvbmZpZycsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdQREMnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5QZW9wbGUgRGlyZWN0b3J5IENvbmZpZ3VyYXRpb248L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ucGVvcGxlLnVwbG9hZF9jc3YnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL3VwbG9hZF9jc3YnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnVXBsb2FkIENTVicsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlVwbG9hZCBDU1Y8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ucGVvcGxlLnJlbmFtZV9tZXJnZScsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvcmVuYW1lX21lcmdlJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1JlbmFtZS9NZXJnZScsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlJlbmFtZS9NZXJnZTwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5lbWFpbCcsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvZW1haWwnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnRW1haWwnLFxuICAgICAgICAgICAgICAgICAgIHBhcmVudDogJ2FkbWluJ1xuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5lbWFpbC5zZW5kJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9zZW5kJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1NlbmQgdG8gTWVtYmVycycsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlNlbmQgdG8gTWVtYmVyczwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5lbWFpbC5xdWFyYW50aW5lJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9xdWFyYW50aW5lJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1ZpZXcgUXVhcmFudGluZScsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlZpZXcgUXVhcmFudGluZTwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi51cGRhdGVfb2ZmaWNlcycsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvdXBkYXRlX29mZmljZXMnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnVXBkYXRlIE9mZmljZXMnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5VcGRhdGUgT2ZmaWNlczwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbn1cblxuZnVuY3Rpb24gTW9kdWxlUnVuKFJlc3Rhbmd1bGFyLCBNZENvbmZpZywgTWROYXYpIHtcbiAgICAvLyBJZiB3ZSBhcmUgdXNpbmcgbW9ja3MsIGRvbid0IHNldCBhIHByZWZpeC4gT3RoZXJ3aXNlLCBzZXQgb25lLlxuICAgIHZhciB1c2VNb2NrcyA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5oYXNDbGFzcygnYTUtdXNlLW1vY2tzJyk7XG4gICAgaWYgKCF1c2VNb2Nrcykge1xuICAgICAgICBSZXN0YW5ndWxhci5zZXRCYXNlVXJsKCcvJyk7XG4gICAgfVxuXG5cbiAgICBNZENvbmZpZy5zaXRlLm5hbWUgPSAnS0FSTCBhZG1pbjUnO1xuXG4gICAgTWROYXYuaW5pdCh7XG4gICAgICAgICAgICAgICAgICAgXCJyb290XCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInNpdGUuaG9tZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkhvbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RhdGVcIjogXCJzaXRlLmhvbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicHJpb3JpdHlcIjogMVxuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICBhZG1pbjoge1xuICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2Rhc2hib2FyZCcsXG4gICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQWRtaW4nLFxuICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uZGFzaGJvYXJkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0FkbWluIERhc2hib2FyZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5kYXNoYm9hcmQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uYXJjaGl2ZV9ib3gnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQXJjaGl2ZSB0byBCb3gnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uYXJjaGl2ZV9ib3gnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uc2l0ZWFubm91bmNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1NpdGUgQW5ub3VuY2VtZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnNpdGVhbm5vdW5jZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0xvZ3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5zeXN0ZW1fbG9ncycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1N5c3RlbSBMb2dzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ubG9ncy5zeXN0ZW1fbG9ncydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzLmZlZWRfZHVtcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0ZlZWQgRHVtcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmxvZ3MuZmVlZF9kdW1wJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmxvZ3MubWV0cmljcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ01ldHJpY3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5sb2dzLm1ldHJpY3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5kZWJ1Z19jb252ZXJ0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVidWcgQ29udmVydGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmxvZ3MuZGVidWdfY29udmVydGVycydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5jb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0NvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uY29udGVudC5tb3ZlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTW92ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmNvbnRlbnQubW92ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5jb250ZW50LmRlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0RlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmNvbnRlbnQuZGVsZXRlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdQZW9wbGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ucGVvcGxlLmNvbmZpZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1BEQycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnBlb3BsZS5jb25maWcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ucGVvcGxlLnVwbG9hZF9jc3YnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdVcGxvYWQgQ1NWJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ucGVvcGxlLnVwbG9hZF9jc3YnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZS5yZW5hbWVfbWVyZ2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdSZW5hbWUvTWVyZ2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5wZW9wbGUucmVuYW1lX21lcmdlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmVtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmVtYWlsLnNlbmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTZW5kIHRvIE1lbWJlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5lbWFpbC5zZW5kJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uZW1haWwucXVhcmFudGluZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1ZpZXcgUXVhcmFudGluZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmVtYWlsLnF1YXJhbnRpbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uZW1haWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRW1haWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uZW1haWwnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4udXBkYXRlX29mZmljZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVXBkYXRlIE9mZmljZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4udXBkYXRlX29mZmljZXMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KTtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ2FkbWluNScpXG4gICAgLmNvbmZpZyhNb2R1bGVDb25maWcpXG4gICAgLnJ1bihNb2R1bGVSdW4pOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgY2xhc3M9XCJyb3dcIj5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMTBcIj5cXG4gICAgPGgxPkFyY2hpdmUgdG8gQm94PC9oMT5cXG4gIDwvZGl2PlxcbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9XCJyb3dcIj5cXG5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMlwiPlxcblxcbiAgICA8aDUgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+RmlsdGVyczwvaDU+XFxuXFxuICAgIDxmb3JtIG5hbWU9XCJmaWx0ZXJzXCIgbmctc3VibWl0PVwiY3RybC5yZWxvYWQoKVwiXFxuICAgICAgICAgIGNsYXNzPVwiZm9ybS1ob3Jpem9uYWxcIiByb2xlPVwiZm9ybVwiPlxcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XFxuICAgICAgICA8aW5wdXQgaWQ9XCJsYXN0QWN0aXZpdHlcIlxcbiAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQteHNcIlxcbiAgICAgICAgICAgICAgIG5nLW1vZGVsPVwiY3RybC5sYXN0QWN0aXZpdHlcIlxcbiAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQWN0aXZpdHkuLi5cIj4gZGF5c1xcbiAgICAgIDwvZGl2PlxcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XFxuICAgICAgICA8aW5wdXQgaWQ9XCJmaWx0ZXJUZXh0XCJcXG4gICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sIGlucHV0LXhzXCJcXG4gICAgICAgICAgICAgICBuZy1tb2RlbD1cImN0cmwuZmlsdGVyVGV4dFwiXFxuICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJUaXRsZSBjb250YWlucy4uLlwiPlxcbiAgICAgIDwvZGl2PlxcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XFxuXFxuICAgICAgICA8aW5wdXQgaWQ9XCJsaW1pdFwiXFxuICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbCBpbnB1dC14c1wiXFxuICAgICAgICAgICAgICAgbmctbW9kZWw9XCJjdHJsLmxpbWl0XCJcXG4gICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkxpbWl0Li4uXCI+IGl0ZW1zXFxuICAgICAgPC9kaXY+XFxuICAgICAgPGRpdj5cXG4gICAgICAgIDxidXR0b24gaWQ9XCJmaWx0ZXJcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5yZWxvYWQoKVwiXFxuICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIj5cXG4gICAgICAgICAgICA8c3BhbiBuZy1oaWRlPVwiY3RybC5pc1N1Ym1pdHRpbmdcIj5cXG4gICAgICAgICAgICAgIEZpbHRlclxcbiAgICAgICAgICAgIDwvc3Bhbj5cXG4gICAgICAgICAgICA8c3BhbiBuZy1zaG93PVwiY3RybC5pc1N1Ym1pdHRpbmdcIj5cXG4gICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1zcGlubmVyIGZhLXNwaW5cIj48L2k+XFxuICAgICAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgPC9idXR0b24+XFxuICAgICAgPC9kaXY+XFxuICAgIDwvZm9ybT5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC0xMFwiPlxcbiAgICA8ZGl2IG5nLWlmPVwiY3RybC5pbmFjdGl2ZUNvbW11bml0aWVzLmxlbmd0aD09MFwiPlxcbiAgICAgIDxlbT5ObyBjb21tdW5pdGllcyBtYXRjaGluZyB0aG9zZSBjcml0ZXJpYTwvZW0+XFxuICAgIDwvZGl2PlxcbiAgICA8dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1zdHJpcGVkXCJcXG4gICAgICAgICAgIG5nLWlmPVwiY3RybC5pbmFjdGl2ZUNvbW11bml0aWVzLmxlbmd0aD4wXCI+XFxuICAgICAgPHRoZWFkPlxcbiAgICAgIDx0aD5UaXRsZTwvdGg+XFxuICAgICAgPHRoPkFjdGl2aXR5IERhdGU8L3RoPlxcbiAgICAgIDx0aD5JdGVtczwvdGg+XFxuICAgICAgPHRoIHdpZHRoPVwiMTEwXCI+U3RhdHVzPC90aD5cXG4gICAgICA8dGggd2lkdGg9XCIxNjBcIj5BY3Rpb248L3RoPlxcbiAgICAgIDwvdGhlYWQ+XFxuICAgICAgPHRib2R5PlxcbiAgICAgIDx0clxcbiAgICAgICAgICBuZy1yZXBlYXQ9XCJpYSBpbiBjdHJsLmluYWN0aXZlQ29tbXVuaXRpZXMgfCBvcmRlckJ5OlxcJ2FjdGl2aXR5RGF0ZVxcJ1wiPlxcbiAgICAgICAgPHRkPlxcbiAgICAgICAgICA8YSBuZy1ocmVmPVwiL2NvbW11bml0aWVzL3t7aWEubmFtZX19XCJcXG4gICAgICAgICAgICAgbmctYmluZD1cImlhLnRpdGxlXCI+VGl0bGU8L2E+XFxuICAgICAgICA8L3RkPlxcbiAgICAgICAgPHRkIG5nLWJpbmQ9XCJpYS5sYXN0X2FjdGl2aXR5LnNwbGl0KFxcJy5cXCcpWzBdXCI+PC90ZD5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiaWEuaXRlbXNcIj48L3RkPlxcbiAgICAgICAgPHRkPlxcbiAgICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBudWxsXCI+ZGVmYXVsdDwvc3Bhbj5cXG4gICAgICAgICAgPHNwYW4gbmctaWY9XCJpYS5zdGF0dXMgIT0gbnVsbFwiXFxuICAgICAgICAgICAgICAgIG5nLWJpbmQ9XCJpYS5zdGF0dXNcIj5kZWZhdWx0PC9zcGFuPlxcbiAgICAgICAgPC90ZD5cXG4gICAgICAgIDx0ZD5cXG4gICAgICAgIDxzcGFuIG5nLWlmPVwiaWEuc3RhdHVzID09IG51bGxcIj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2V0U3RhdHVzKGlhLCBcXCdjb3B5XFwnKVwiPkNvcHlcXG4gICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgIDwvc3Bhbj5cXG4gICAgICAgIDxzcGFuIG5nLWlmPVwiaWEuc3RhdHVzID09IFxcJ2NvcHlpbmdcXCdcIj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2V0U3RhdHVzKGlhLCBcXCdzdG9wXFwnKVwiPlN0b3BcXG4gICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2hvd0xvZyhpYSlcIj5Mb2dcXG4gICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgIDwvc3Bhbj5cXG4gICAgICAgIDxzcGFuIG5nLWlmPVwiaWEuc3RhdHVzID09IFxcJ3Jldmlld2luZ1xcJ1wiPlxcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5zZXRTdGF0dXMoaWEsIFxcJ21vdGhiYWxsXFwnKVwiPk1vdGhiYWxsXFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNldFN0YXR1cyhpYSwgXFwnc3RvcFxcJylcIj5TdG9wXFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNob3dMb2coaWEpXCI+TG9nXFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICA8L3NwYW4+XFxuICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBcXCdyZW1vdmluZ1xcJ1wiPlxcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5zaG93TG9nKGlhKVwiPkxvZ1xcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgPC90ZD5cXG4gICAgICA8L3RyPlxcbiAgICAgIDwvdGJvZHk+XFxuICAgIDwvdGFibGU+XFxuICA8L2Rpdj5cXG5cXG48L2Rpdj5cXG48c2NyaXB0IHR5cGU9XCJ0ZXh0L25nLXRlbXBsYXRlXCIgaWQ9XCJteU1vZGFsQ29udGVudC5odG1sXCI+XFxuICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XFxuICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgcHVsbC1yaWdodFwiXFxuICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLmNsb3NlKClcIj5cXG4gICAgICA8aSBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlLWNpcmNsZVwiPjwvaT5cXG4gICAgPC9idXR0b24+XFxuICAgIDxoMyBjbGFzcz1cIm1vZGFsLXRpdGxlXCI+TG9nPC9oMz5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cIm1vZGFsLWJvZHlcIiBzdHlsZT1cImhlaWdodDogNDAwcHg7IG92ZXJmbG93OiBzY3JvbGxcIj5cXG4gICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtc3RyaXBlZFwiPlxcbiAgICAgIDx0Ym9keT5cXG4gICAgICA8dHIgbmctcmVwZWF0PVwiZW50cnkgaW4gY3RybC5sb2dFbnRyaWVzXCI+XFxuICAgICAgICA8dGQgd2lkdGg9XCIyMCVcIlxcbiAgICAgICAgICAgIG5nLWJpbmQ9XCI6OmVudHJ5LnRpbWVzdGFtcC5zcGxpdChcXCcuXFwnKVswXVwiPnRpbWVzdGFtcCB0aGF0IGlzXFxuICAgICAgICAgIGxvbmdcXG4gICAgICAgIDwvdGQ+XFxuICAgICAgICA8dGQgbmctYmluZD1cIjo6ZW50cnkubGV2ZWxcIj48L3RkPlxcbiAgICAgICAgPHRkIG5nLWJpbmQ9XCI6OmVudHJ5Lm1lc3NhZ2VcIj50aGlzIGlzIHdoZXJlIGEgbWVzc2FnZSB3b3VsZFxcbiAgICAgICAgICBnbyB3aXRoIGEgbG90IG9mIHNwYWNlXFxuICAgICAgICA8L3RkPlxcbiAgICAgIDwvdHI+XFxuICAgICAgPC90Ym9keT5cXG4gICAgPC90YWJsZT5cXG4gICAgPHVsPlxcbiAgICAgIDxsaSBuZy1yZXBlYXQ9XCJpdGVtIGluIGN0cmwuaXRlbXNcIj5cXG4gICAgICAgIHt7IGl0ZW0gfX1cXG4gICAgICA8L2xpPlxcbiAgICA8L3VsPlxcbiAgPC9kaXY+XFxuPC9zY3JpcHQ+XFxuJzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwicm93XCI+XFxuICA8ZGl2IGNsYXNzPVwiY29sLW1kLTEwXCI+XFxuICAgIDxoMT5Cb3ggTG9naW48L2gxPlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVwiY29sLW1kLThcIj5cXG4gICAgPHA+RWl0aGVyIHlvdSBoYXZlIG5ldmVyIGxvZ2dlZCBLQVJMIGludG8gQm94LCBvciB0aGUgdG9rZW4gQm94XFxuICAgICAgbGFzdCBnYXZlIHlvdSBpcyBub3cgZXhwaXJlZCBvciBpbnZhbGlkLiBQbGVhc2UgY2xpY2sgdGhlXFxuICAgICAgYnV0dG9uIGJlbG93IHRvIGxvZyBLQVJMIGJhY2sgaW50byBCb3guPC9wPlxcblxcbiAgICA8ZGl2IG5nLWlmPVwiY3RybC5sb2dpblVybFwiPlxcbiAgICAgIDxhXFxuICAgICAgICAgIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1sZ1wiXFxuICAgICAgICAgIGhyZWY9XCJ7e2N0cmwubG9naW5Vcmx9fVwiPlxcbiAgICAgICAgTG9naW5cXG4gICAgICA8L2E+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IG5nLWlmPVwiIWN0cmwubG9naW5VcmxcIiBjbGFzcz1cImFsZXJ0IGFsZXJ0LXdhcm5pbmdcIj5cXG4gICAgICBZb3UgZG9uXFwndCBoYXZlIGEgQm94IFVSTCBmb3IgbG9nZ2luZyBpbi4gVGhpcyBsaWtlbHkgaGFwcGVuZWRcXG4gICAgICBkdWUgdG8gYSByZWxvYWQgb2YgdGhpcyBwYWdlLiBDbGljayBvbiA8Y29kZT5BcmNoaXZlIHRvXFxuICAgICAgQm94PC9jb2RlPiB0byBjb3JyZWN0LlxcbiAgICA8L2Rpdj5cXG4gIDwvZGl2PlxcbjwvZGl2Pic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdj5cXG4gIDxoMT5hZG1pbjUgQWRtaW4gU2NyZWVuPC9oMT5cXG5cXG4gIDxwPlRha2luZyB0aGUgd29yayBkb25lIGluIHRoZSBQZW9wbGUgRGlyZWN0b3J5IENvbmZpZ3VyYXRvclxcbiAgdG9vbCBhbiBhcHBseWluZyBpbiBnZW5lcmFsbHkgdG8gYWRtaW4gZm9yIEtBUkwuPC9wPlxcblxcbjwvZGl2Pic7Il19
