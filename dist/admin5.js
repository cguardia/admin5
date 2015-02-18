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
module.exports = '<div class="row">\n  <div class="col-md-10">\n    <h1>Archive to Box</h1>\n  </div>\n</div>\n\n<div class="row">\n\n  <div class="col-md-2">\n\n    <h5 class="text-muted">Filters</h5>\n\n    <form name="filters" ng-submit="ctrl.reload()"\n          class="form-horizonal" role="form">\n      <div class="form-group">\n        <input id="lastActivity"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.lastActivity"\n               placeholder="Activity..."> days\n      </div>\n      <div class="form-group">\n        <input id="filterText"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.filterText"\n               placeholder="Title contains...">\n      </div>\n      <div class="form-group">\n\n        <input id="limit"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.limit"\n               placeholder="Limit..."> items\n      </div>\n      <div>\n        <button id="filter" class="btn btn-primary"\n                ng-click="ctrl.reload()"\n                type="submit">\n            <span ng-hide="ctrl.isSubmitting">\n              Filter\n            </span>\n            <span ng-show="ctrl.isSubmitting">\n                <i class="fa fa-spinner fa-spin"></i>\n            </span>\n        </button>\n      </div>\n    </form>\n  </div>\n  <div class="col-md-10">\n    <div ng-if="ctrl.inactiveCommunities.length==0">\n      <em>No communities matching those criteria</em>\n    </div>\n    <table class="table table-striped"\n           ng-if="ctrl.inactiveCommunities.length>0">\n      <thead>\n      <th>Title</th>\n      <th>Activity Date</th>\n      <th>Items</th>\n      <th width="110">Status</th>\n      <th width="160">Action</th>\n      </thead>\n      <tbody>\n      <tr\n          ng-repeat="ia in ctrl.inactiveCommunities | orderBy:\'activityDate\'">\n        <td ng-bind="ia.title">Name</td>\n        <td ng-bind="ia.last_activity.split(\'.\')[0]"></td>\n        <td ng-bind="ia.items"></td>\n        <td>\n          <span ng-if="ia.status == null">default</span>\n          <span ng-if="ia.status != null"\n                ng-bind="ia.status">default</span>\n        </td>\n        <td>\n        <span ng-if="ia.status == null">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'copy\')">Copy\n            </button>\n        </span>\n        <span ng-if="ia.status == \'copying\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'stop\')">Stop\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        <span ng-if="ia.status == \'reviewing\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'mothball\')">Mothball\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'stop\')">Stop\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        <span ng-if="ia.status == \'removing\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        </td>\n      </tr>\n      </tbody>\n    </table>\n  </div>\n\n</div>\n<script type="text/ng-template" id="myModalContent.html">\n  <div class="modal-header">\n    <button class="btn btn-default pull-right"\n            ng-click="ctrl.close()">\n      <i class="glyphicon glyphicon-remove-circle"></i>\n    </button>\n    <h3 class="modal-title">Log</h3>\n  </div>\n  <div class="modal-body" style="height: 400px; overflow: scroll">\n    <table class="table table-striped">\n      <tbody>\n      <tr ng-repeat="entry in ctrl.logEntries">\n        <td width="20%"\n            ng-bind="::entry.timestamp.split(\'.\')[0]">timestamp that is\n          long\n        </td>\n        <td ng-bind="::entry.level"></td>\n        <td ng-bind="::entry.message">this is where a message would\n          go with a lot of space\n        </td>\n      </tr>\n      </tbody>\n    </table>\n    <ul>\n      <li ng-repeat="item in ctrl.items">\n        {{ item }}\n      </li>\n    </ul>\n  </div>\n</script>\n';
},{}],6:[function(require,module,exports){
module.exports = '<div class="row">\n  <div class="col-md-10">\n    <h1>Box Login</h1>\n  </div>\n  <div class="col-md-8">\n    <p>Either you have never logged KARL into Box, or the token Box\n      last gave you is now expired or invalid. Please click the\n      button below to log KARL back into Box.</p>\n\n    <div ng-if="ctrl.loginUrl">\n      <a\n          class="btn btn-primary btn-lg"\n          href="{{ctrl.loginUrl}}">\n        Login\n      </a>\n    </div>\n    <div ng-if="!ctrl.loginUrl" class="alert alert-warning">\n      You don\'t have a Box URL for logging in. This likely happened\n      due to a reload of this page. Click on <code>Archive to\n      Box</code> to correct.\n    </div>\n  </div>\n</div>';
},{}],7:[function(require,module,exports){
module.exports = '<div>\n  <h1>admin5 Admin Screen</h1>\n\n  <p>Taking the work done in the People Directory Configurator\n  tool an applying in generally to admin for KARL.</p>\n\n</div>';
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwic3JjL2NvbnRyb2xsZXJzLmpzIiwic3JjL21vY2tzLmpzIiwic3JjL3N0YXRlcy5qcyIsInNyYy90ZW1wbGF0ZXMvYm94X2xpc3QuaHRtbCIsInNyYy90ZW1wbGF0ZXMvYm94X2xvZ2luLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hvbWUuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVXQTs7QUNBQTs7QUNBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgYW5ndWxhciA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmFuZ3VsYXIgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLmFuZ3VsYXIgOiBudWxsKTtcblxuYW5ndWxhci5tb2R1bGUoJ2FkbWluNScsIFsnbW9vbmRhc2gnXSlcbiAgLmNvbmZpZyhyZXF1aXJlKCcuL21vY2tzJykuQ29uZmlnKTtcblxucmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xucmVxdWlyZSgnLi9zdGF0ZXMnKTtcbiIsImZ1bmN0aW9uIEhvbWVDb250cm9sbGVyKCkge1xufVxuXG5mdW5jdGlvbiBCb3hMb2dpbkNvbnRyb2xsZXIoJHN0YXRlUGFyYW1zKSB7XG4gICAgdGhpcy5sb2dpblVybCA9ICRzdGF0ZVBhcmFtcy51cmw7XG59XG5cbmZ1bmN0aW9uIEJveExpc3RDb250cm9sbGVyKGxhc3RBY3Rpdml0eSwgbGltaXQsIGNvbW11bml0aWVzLCBSZXN0YW5ndWxhciwgJG1vZGFsLCAkaHR0cCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLmluYWN0aXZlQ29tbXVuaXRpZXMgPSBjb21tdW5pdGllcztcbiAgICB2YXIgYmFzZUluYWN0aXZlcyA9IFJlc3Rhbmd1bGFyLmFsbCgnYXJjMmJveC9jb21tdW5pdGllcycpO1xuXG4gICAgLy8gSGFuZGxlIGZpbHRlcnNcbiAgICB0aGlzLmxhc3RBY3Rpdml0eSA9IGxhc3RBY3Rpdml0eTtcbiAgICB0aGlzLmxpbWl0ID0gbGltaXQ7XG4gICAgdGhpcy5maWx0ZXJUZXh0ID0gbnVsbDtcbiAgICB0aGlzLnJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX3RoaXMuaXNTdWJtaXR0aW5nID0gdHJ1ZTtcbiAgICAgICAgLy8gVXNlciBjbGlja2VkIHRoZSBcIk92ZXIgMTggbW9udGhzXCIgY2hlY2tib3ggb3IgdGhlIHNlYXJjaCBib3hcbiAgICAgICAgdmFyIHBhcmFtcyA9IHt9O1xuICAgICAgICAvLyBPbmx5IHNlbmQgcXVlcnkgc3RyaW5nIHBhcmFtZXRlcnMgaWYgdGhleSBhcmUgbm90IG51bGxcbiAgICAgICAgaWYgKHRoaXMubGFzdEFjdGl2aXR5IHx8IHRoaXMubGFzdEFjdGl2aXR5ID09PSAwKSB7XG4gICAgICAgICAgICBwYXJhbXMubGFzdF9hY3Rpdml0eSA9IHRoaXMubGFzdEFjdGl2aXR5O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxpbWl0KSB7XG4gICAgICAgICAgICBwYXJhbXMubGltaXQgPSB0aGlzLmxpbWl0O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmZpbHRlclRleHQpIHtcbiAgICAgICAgICAgIHBhcmFtcy5maWx0ZXIgPSB0aGlzLmZpbHRlclRleHQ7XG4gICAgICAgIH1cblxuICAgICAgICBiYXNlSW5hY3RpdmVzLmdldExpc3QocGFyYW1zKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIF90aGlzLmlzU3VibWl0dGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIF90aGlzLmluYWN0aXZlQ29tbXVuaXRpZXMgPSBzdWNjZXNzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChmYWlsdXJlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnZmFpbHVyZScsIGZhaWx1cmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH07XG5cbiAgICB0aGlzLnNldFN0YXR1cyA9IGZ1bmN0aW9uICh0YXJnZXQsIGFjdGlvbikge1xuICAgICAgICB2YXIgdXJsID0gJy9hcmMyYm94L2NvbW11bml0aWVzLycgKyB0YXJnZXQubmFtZTtcbiAgICAgICAgJGh0dHAucGF0Y2godXJsLCB7YWN0aW9uOiBhY3Rpb259KVxuICAgICAgICAgICAgLnN1Y2Nlc3MoXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1Zygnc3VjY2VzcyBzZXR0aW5nICcgKyB0YXJnZXQubmFtZSArICcgdG8gJyArIGFjdGlvbik7XG4gICAgICAgICAgICAgICAgX3RoaXMucmVsb2FkKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmVycm9yKFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnZXJyb3InLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICB9O1xuXG5cbiAgICB0aGlzLnNob3dMb2cgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdteU1vZGFsQ29udGVudC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBNb2RhbENvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnY3RybCcsXG4gICAgICAgICAgICAgICAgc2l6ZTogJ2xnJyxcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gTW9kYWxDb250cm9sbGVyKCRtb2RhbEluc3RhbmNlLCB0YXJnZXQsICRodHRwKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLmxvZ0VudHJpZXMgPSBbXTtcbiAgICB0aGlzLnVwZGF0ZUxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHVybCA9ICcvYXJjMmJveC9jb21tdW5pdGllcy8nICsgdGFyZ2V0Lm5hbWU7XG4gICAgICAgICRodHRwLmdldCh1cmwpXG4gICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmxvZ0VudHJpZXMgPSBzdWNjZXNzLmxvZztcbiAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYWlsdXJlIG9uIGdldHRpbmcgbG9nIGVudHJpZXMnKTtcbiAgICAgICAgICAgICAgICAgICB9KTtcbiAgICB9O1xuICAgIHRoaXMudXBkYXRlTG9nKCk7XG5cbiAgICB0aGlzLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgSG9tZUNvbnRyb2xsZXI6IEhvbWVDb250cm9sbGVyLFxuICAgIEJveExvZ2luQ29udHJvbGxlcjogQm94TG9naW5Db250cm9sbGVyLFxuICAgIE1vZGFsQ29udHJvbGxlcjogTW9kYWxDb250cm9sbGVyLFxuICAgIEJveExpc3RDb250cm9sbGVyOiBCb3hMaXN0Q29udHJvbGxlclxufTsiLCJ2YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxuZnVuY3Rpb24gTW9kdWxlQ29uZmlnKE1kTW9ja1Jlc3RQcm92aWRlcikge1xuXG4gIHZhciB1c2VNb2NrcyA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5oYXNDbGFzcygnYTUtdXNlLW1vY2tzJyk7XG4gIGlmICghdXNlTW9ja3MpIHJldHVybjtcblxuICB2YXIgY29tbXVuaXRpZXMgPSBbXG4gICAge1xuICAgICAgaWQ6ICcxJywgbmFtZTogJ2RlZmF1bHQnLFxuICAgICAgdXJsOiAnL2NvbW11bml0aWVzL2RlZmF1bHQnLFxuICAgICAgdGl0bGU6ICdEZWZhdWx0IENvbW11bml0eScsIGxhc3RfYWN0aXZpdHk6ICcyMDEwLzExLzE5JyxcbiAgICAgIGl0ZW1zOiA0NzIzLCBzdGF0dXM6IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnMicsIG5hbWU6ICdhbm90aGVyJyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy9hbm90aGVyJyxcbiAgICAgIHRpdGxlOiAnQW5vdGhlciBDb21tdW5pdHknLCBsYXN0X2FjdGl2aXR5OiAnMjAxMS8wMS8wOScsXG4gICAgICBpdGVtczogMjMsIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICczJywgbmFtZTogJ3Rlc3RpbmcnLFxuICAgICAgdXJsOiAnL2NvbW11bml0aWVzL3Rlc3RpbmcnLFxuICAgICAgdGl0bGU6ICdUZXN0aW5nIDEyMyBXaXRoIEEgTG9uZyBUaXRsZSBUaGF0IEdvZXMgT24nLFxuICAgICAgbGFzdF9hY3Rpdml0eTogJzIwMTAvMDMvMDQnLFxuICAgICAgaXRlbXM6IDcsXG4gICAgICBzdGF0dXM6IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnNCcsIG5hbWU6ICdhZnJpY2EnLFxuICAgICAgdXJsOiAnL2NvbW11bml0aWVzL2FmcmljYScsXG4gICAgICB0aXRsZTogJ0FmcmljYS4uLml0IGlzIGJpZycsIGxhc3RfYWN0aXZpdHk6ICcyMDE0LzA0LzE2JyxcbiAgICAgIGl0ZW1zOiA5OTk5LCBzdGF0dXM6IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnNScsIG5hbWU6ICdtZXJpY2EnLFxuICAgICAgdXJsOiAnL2NvbW11bml0aWVzL21lcmljYScsXG4gICAgICB0aXRsZTogJ01lcmljYScsIGxhc3RfYWN0aXZpdHk6ICcyMDE0LzEwLzA3JyxcbiAgICAgIGl0ZW1zOiA1NDgsIHN0YXR1czogbnVsbFxuICAgIH1cbiAgXTtcblxuICB2YXIgaW5pdGlhbExvZ0VudHJpZXMgPSBbXG4gICAge3RpbWVzdGFtcDogJzIwMTQvMTIvMDEgMDk6MzA6MDEnLCBtc2c6ICdTb21lIG1lc3NhZ2UnfSxcbiAgICB7dGltZXN0YW1wOiAnMjAxNC8xMi8wMSAwOTozMDowMScsIG1zZzogJzJTb21lIG1lc3NhZ2UnfSxcbiAgICB7dGltZXN0YW1wOiAnMjAxNC8xMi8wMSAwOTozMDowMScsIG1zZzogJzNTb21lIG1lc3NhZ2UnfSxcbiAgICB7dGltZXN0YW1wOiAnMjAxNC8xMi8wMSAwOTozMDowMScsIG1zZzogJzRTb21lIG1lc3NhZ2UnfVxuICBdO1xuXG4gIE1kTW9ja1Jlc3RQcm92aWRlci5hZGRNb2NrcyhcbiAgICAnYm94JyxcbiAgICBbXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBwYXR0ZXJuOiAvYXJjMmJveFxcL2NvbW11bml0aWVzXFwvKFxcZCspXFwvc2V0U3RhdHVzLyxcbiAgICAgICAgcmVzcG9uZGVyOiBmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgICAgICAgIC8vIEdpdmVuIC9hcGkvdG9fYXJjaGl2ZS9zb21lRG9jSWQvc2V0U3RhdHVzXG4gICAgICAgICAgLy8gLSBHcmFiIHRoYXQgY29tbXVuaXR5XG4gICAgICAgICAgLy8gLSBDaGFuZ2UgaXRzIHN0YXR1cyB0byB0aGUgcGFzc2VkIGluICdzdGF0dXMnIHZhbHVlXG4gICAgICAgICAgLy8gLSByZXR1cm4gb2tcbiAgICAgICAgICB2YXJcbiAgICAgICAgICAgIHVybCA9IHJlcXVlc3QudXJsLFxuICAgICAgICAgICAgZGF0YSA9IHJlcXVlc3QuanNvbl9ib2R5O1xuICAgICAgICAgIHZhciBpZCA9IHVybC5zcGxpdChcIi9cIilbM10sXG4gICAgICAgICAgICB0YXJnZXQgPSBfKGNvbW11bml0aWVzKS5maXJzdCh7aWQ6IGlkfSksXG4gICAgICAgICAgICBuZXdTdGF0dXMgPSAnc3RvcHBlZCc7XG4gICAgICAgICAgZGF0YSA9IHJlcXVlc3QuanNvbl9ib2R5O1xuICAgICAgICAgIGlmIChkYXRhLnN0YXR1cyA9PSAnc3RhcnQnKSB7XG4gICAgICAgICAgICBuZXdTdGF0dXMgPSAnc3RhcnRlZCc7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRhcmdldC5zdGF0dXMgPSBuZXdTdGF0dXM7XG4gICAgICAgICAgcmV0dXJuIFsyMDAsIHtzdGF0dXM6IG5ld1N0YXR1c31dO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBwYXR0ZXJuOiAvYXJjMmJveFxcL2NvbW11bml0aWVzXFwvKFxcZCspXFwvbG9nRW50cmllcy8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIEVhY2ggdGltZSBjYWxsZWQsIG1ha2UgdXAgNSBlbnRyaWVzIGFuZCBwdXQgdGhlbVxuICAgICAgICAgIC8vIGluIHRoZSBmcm9udCBvZiB0aGUgYXJyYXksIHRvIHNpbXVsYXRlIHRoZSBzZXJ2ZXJcbiAgICAgICAgICAvLyBnZW5lcmF0aW5nIG1vcmUgbG9nIGVudHJpZXMuXG4gICAgICAgICAgdmFyIG5vdywgdGltZXN0YW1wLCByYW5kO1xuICAgICAgICAgIF8oXy5yYW5nZSgxNSkpLmZvckVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHRpbWVzdGFtcCA9IG5vdy50b0xvY2FsZVN0cmluZygpO1xuICAgICAgICAgICAgcmFuZCA9IF8ucmFuZG9tKDEwMDAsIDk5OTkpO1xuICAgICAgICAgICAgaW5pdGlhbExvZ0VudHJpZXMudW5zaGlmdChcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogdGltZXN0YW1wLFxuICAgICAgICAgICAgICAgIG1zZzogcmFuZCArICcgU29tZSBtZXNzYWdlICcgKyB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gWzIwMCwgaW5pdGlhbExvZ0VudHJpZXNdO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBwYXR0ZXJuOiAvYXJjMmJveFxcL2NvbW11bml0aWVzLiokLyxcbiAgICAgICAgcmVzcG9uZGVyOiBmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgICAgICAgIC8qXG4gICAgICAgICAgIFByb2Nlc3MgdHdvIGZpbHRlcnM6XG4gICAgICAgICAgIC0gaW5hY3RpdmUgPT0gJ3RydWUnIG9yIG90aGVyd2lzZVxuICAgICAgICAgICAtIGZpbHRlclRleHQsIGxvd2VyY2FzZSBjb21wYXJpc29uXG4gICAgICAgICAgICovXG4gICAgICAgICAgdmFyXG4gICAgICAgICAgICBsYXN0X2FjdGl2aXR5ID0gcGFyc2VJbnQocmVxdWVzdC5xdWVyeS5sYXN0X2FjdGl2aXR5KSxcbiAgICAgICAgICAgIGZpbHRlciA9IHJlcXVlc3QucXVlcnkuZmlsdGVyO1xuXG4gICAgICAgICAgdmFyIGZpbHRlcmVkID0gXyhjb21tdW5pdGllcykuY2xvbmUoKTtcblxuICAgICAgICAgIGlmIChsYXN0X2FjdGl2aXR5IDwgMzYwKSB7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IF8oY29tbXVuaXRpZXMpLmZpbHRlcihcbiAgICAgICAgICAgICAgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5sYXN0X2FjdGl2aXR5LmluZGV4T2YoJzIwMTQnKSAhPSAwO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLnZhbHVlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGZpbHRlcikge1xuICAgICAgICAgICAgdmFyIGZ0ID0gZmlsdGVyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IF8oZmlsdGVyZWQpLmZpbHRlcihcbiAgICAgICAgICAgICAgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgb3JpZyA9IGl0ZW0ubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnLmluZGV4T2YoZnQpID4gLTE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkudmFsdWUoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gWzIwMCwgZmlsdGVyZWRdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgXSk7XG5cblxuICB2YXIgdXNlciA9IHtcbiAgICBpZDogJ2FkbWluJyxcbiAgICBlbWFpbDogJ2FkbWluQHguY29tJyxcbiAgICBmaXJzdF9uYW1lOiAnQWRtaW4nLFxuICAgIGxhc3RfbmFtZTogJ0xhc3RpZScsXG4gICAgdHdpdHRlcjogJ2FkbWluJ1xuICB9O1xuXG5cbiAgTWRNb2NrUmVzdFByb3ZpZGVyLmFkZE1vY2tzKFxuICAgICdhdXRoJyxcbiAgICBbXG4gICAgICB7XG4gICAgICAgIHBhdHRlcm46IC9hcGlcXC9hdXRoXFwvbWUvLFxuICAgICAgICByZXNwb25zZURhdGE6IHVzZXIsXG4gICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcGlcXC9hdXRoXFwvbG9naW4vLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAgICAgdmFyIGRhdGEgPSByZXF1ZXN0Lmpzb25fYm9keTtcbiAgICAgICAgICB2YXIgdW4gPSBkYXRhLnVzZXJuYW1lO1xuICAgICAgICAgIHZhciByZXNwb25zZTtcblxuICAgICAgICAgIGlmICh1biA9PT0gJ2FkbWluJykge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSBbMjA0LCB7dG9rZW46IFwibW9ja3Rva2VuXCJ9XTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSBbNDAxLCB7XCJtZXNzYWdlXCI6IFwiSW52YWxpZCBsb2dpbiBvciBwYXNzd29yZFwifV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgXSk7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIENvbmZpZzogTW9kdWxlQ29uZmlnXG59OyIsInZhciBjb250cm9sbGVycyA9IHJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcblxuZnVuY3Rpb24gTW9kdWxlQ29uZmlnKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvaG9tZScpO1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnc2l0ZScsIHtcbiAgICAgICAgICAgICAgICAgICBwYXJlbnQ6ICdyb290J1xuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdzaXRlLmhvbWUnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2hvbWUnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnSG9tZScsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9ob21lLmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLkhvbWVDb250cm9sbGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnY3RybCdcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4nLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2FkbWluJyxcbiAgICAgICAgICAgICAgICAgICBwYXJlbnQ6ICdzaXRlJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0FkbWluJ1xuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5kYXNoYm9hcmQnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2Rhc2hib2FyZCcsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdBZG1pbiBEYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5BZG1pbiBEYXNoYm9hcmQ8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uYXJjaGl2ZV9ib3gnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2FyY2hpdmVfYm94JyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0FyY2hpdmUgdG8gQm94JyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2JveF9saXN0Lmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLkJveExpc3RDb250cm9sbGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnY3RybCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IGZ1bmN0aW9uICgkaHR0cCwgJHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1cmwgPSAnL2FyYzJib3gvdG9rZW4/aW52YWxpZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQodXJsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsaWQgPSBzdWNjZXNzLnZhbGlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVybCA9IHN1Y2Nlc3MudXJsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FkbWluLmJveF9sb2dpbicsIHt1cmw6IHVybH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ3Jlc29sdmUgdmFsaWRUb2tlbiBlcnJvcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEFjdGl2aXR5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA2MDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW1pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gNTA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21tdW5pdGllczogZnVuY3Rpb24gKGxhc3RBY3Rpdml0eSwgUmVzdGFuZ3VsYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFJlc3Rhbmd1bGFyLmFsbCgnYXJjMmJveC9jb21tdW5pdGllcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZ2V0TGlzdCh7bGFzdF9hY3Rpdml0eTogbGFzdEFjdGl2aXR5LCBsaW1pdDogNTB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmJveF9sb2dpbicsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvYm94X2xvZ2luJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0JveCBMb2dpbicsXG4gICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgIHVybDogJydcbiAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvYm94X2xvZ2luLmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLkJveExvZ2luQ29udHJvbGxlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLnNpdGVhbm5vdW5jZScsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2l0ZWFubm91bmNlbWVudCcsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdTaXRlIEFubm91bmNlbWVudCcsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlNpdGUgQW5ub3VuY2VtZW50PC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmxvZ3MnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2xvZ3MnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnTG9ncycsXG4gICAgICAgICAgICAgICAgICAgcGFyZW50OiAnYWRtaW4nXG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmxvZ3Muc3lzdGVtX2xvZ3MnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL3N5c3RlbV9sb2dzJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1N5c3RlbSBMb2dzJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+U3lzdGVtIExvZ3M8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ubG9ncy5mZWVkX2R1bXAnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2ZlZWRfZHVtcCcsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdGZWVkIER1bXAnLFxuICAgICAgICAgICAgICAgICAgIHN1YnNlY3Rpb246IHtzZWN0aW9uOiAnYWRtaW4ubG9ncyd9LFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5GZWVkIER1bXA8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ubG9ncy5tZXRyaWNzJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9tZXRyaWNzJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ01ldHJpY3MnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5NZXRyaWNzPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmxvZ3MuZGVidWdfY29udmVydGVycycsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvZGVidWdfY29udmVydGVycycsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdEZWJ1ZyBDb252ZXJ0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+RGVidWcgQ29udmVydGVyczwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAuc3RhdGUoJ2FkbWluLmNvbnRlbnQnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2NvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnQ29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgcGFyZW50OiAnYWRtaW4nXG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmNvbnRlbnQubW92ZScsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvbW92ZScsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdNb3ZlJyxcbiAgICAgICAgICAgICAgICAgICBzdWJzZWN0aW9uOiB7c2VjdGlvbjogJ2FkbWluLmNvbnRlbnQnfSxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+TW92ZSBDb250ZW50PC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmNvbnRlbnQuZGVsZXRlJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9kZWxldGUnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnRGVsZXRlJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+RGVsZXRlIENvbnRlbnQ8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgLnN0YXRlKCdhZG1pbi5wZW9wbGUnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL3Blb3BsZScsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdQZW9wbGUnLFxuICAgICAgICAgICAgICAgICAgIHBhcmVudDogJ2FkbWluJ1xuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5wZW9wbGUuY29uZmlnJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9jb25maWcnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnUERDJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+UGVvcGxlIERpcmVjdG9yeSBDb25maWd1cmF0aW9uPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLnBlb3BsZS51cGxvYWRfY3N2Jywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy91cGxvYWRfY3N2JyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1VwbG9hZCBDU1YnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5VcGxvYWQgQ1NWPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLnBlb3BsZS5yZW5hbWVfbWVyZ2UnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL3JlbmFtZV9tZXJnZScsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdSZW5hbWUvTWVyZ2UnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5SZW5hbWUvTWVyZ2U8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uZW1haWwnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2VtYWlsJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0VtYWlsJyxcbiAgICAgICAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uZW1haWwuc2VuZCcsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2VuZCcsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdTZW5kIHRvIE1lbWJlcnMnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5TZW5kIHRvIE1lbWJlcnM8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uZW1haWwucXVhcmFudGluZScsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvcXVhcmFudGluZScsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdWaWV3IFF1YXJhbnRpbmUnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5WaWV3IFF1YXJhbnRpbmU8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4udXBkYXRlX29mZmljZXMnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL3VwZGF0ZV9vZmZpY2VzJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1VwZGF0ZSBPZmZpY2VzJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+VXBkYXRlIE9mZmljZXM8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG59XG5cbmZ1bmN0aW9uIE1vZHVsZVJ1bihSZXN0YW5ndWxhciwgTWRDb25maWcsIE1kTmF2KSB7XG4gICAgLy8gSWYgd2UgYXJlIHVzaW5nIG1vY2tzLCBkb24ndCBzZXQgYSBwcmVmaXguIE90aGVyd2lzZSwgc2V0IG9uZS5cbiAgICB2YXIgdXNlTW9ja3MgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuaGFzQ2xhc3MoJ2E1LXVzZS1tb2NrcycpO1xuICAgIGlmICghdXNlTW9ja3MpIHtcbiAgICAgICAgUmVzdGFuZ3VsYXIuc2V0QmFzZVVybCgnLycpO1xuICAgIH1cblxuXG4gICAgTWRDb25maWcuc2l0ZS5uYW1lID0gJ0tBUkwgYWRtaW41JztcblxuICAgIE1kTmF2LmluaXQoe1xuICAgICAgICAgICAgICAgICAgIFwicm9vdFwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJzaXRlLmhvbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJIb21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YXRlXCI6IFwic2l0ZS5ob21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcInByaW9yaXR5XCI6IDFcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgYWRtaW46IHtcbiAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0FkbWluJyxcbiAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmRhc2hib2FyZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdBZG1pbiBEYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uZGFzaGJvYXJkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmFyY2hpdmVfYm94JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0FyY2hpdmUgdG8gQm94JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmFyY2hpdmVfYm94J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnNpdGVhbm5vdW5jZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTaXRlIEFubm91bmNlbWVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5zaXRlYW5ub3VuY2UnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdMb2dzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmxvZ3Muc3lzdGVtX2xvZ3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTeXN0ZW0gTG9ncycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmxvZ3Muc3lzdGVtX2xvZ3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5mZWVkX2R1bXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdGZWVkIER1bXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5sb2dzLmZlZWRfZHVtcCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzLm1ldHJpY3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdNZXRyaWNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ubG9ncy5tZXRyaWNzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmxvZ3MuZGVidWdfY29udmVydGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0RlYnVnIENvbnZlcnRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5sb2dzLmRlYnVnX2NvbnZlcnRlcnMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uY29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdDb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmNvbnRlbnQubW92ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ01vdmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5jb250ZW50Lm1vdmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uY29udGVudC5kZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5jb250ZW50LmRlbGV0ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5wZW9wbGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUGVvcGxlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZS5jb25maWcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdQREMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5wZW9wbGUuY29uZmlnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZS51cGxvYWRfY3N2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVXBsb2FkIENTVicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnBlb3BsZS51cGxvYWRfY3N2J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5wZW9wbGUucmVuYW1lX21lcmdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUmVuYW1lL01lcmdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ucGVvcGxlLnJlbmFtZV9tZXJnZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5lbWFpbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFbWFpbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5lbWFpbC5zZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU2VuZCB0byBNZW1iZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uZW1haWwuc2VuZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmVtYWlsLnF1YXJhbnRpbmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWaWV3IFF1YXJhbnRpbmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5lbWFpbC5xdWFyYW50aW5lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmVtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmVtYWlsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnVwZGF0ZV9vZmZpY2VzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1VwZGF0ZSBPZmZpY2VzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnVwZGF0ZV9vZmZpY2VzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSk7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdhZG1pbjUnKVxuICAgIC5jb25maWcoTW9kdWxlQ29uZmlnKVxuICAgIC5ydW4oTW9kdWxlUnVuKTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwicm93XCI+XFxuICA8ZGl2IGNsYXNzPVwiY29sLW1kLTEwXCI+XFxuICAgIDxoMT5BcmNoaXZlIHRvIEJveDwvaDE+XFxuICA8L2Rpdj5cXG48L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPVwicm93XCI+XFxuXFxuICA8ZGl2IGNsYXNzPVwiY29sLW1kLTJcIj5cXG5cXG4gICAgPGg1IGNsYXNzPVwidGV4dC1tdXRlZFwiPkZpbHRlcnM8L2g1PlxcblxcbiAgICA8Zm9ybSBuYW1lPVwiZmlsdGVyc1wiIG5nLXN1Ym1pdD1cImN0cmwucmVsb2FkKClcIlxcbiAgICAgICAgICBjbGFzcz1cImZvcm0taG9yaXpvbmFsXCIgcm9sZT1cImZvcm1cIj5cXG4gICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxcbiAgICAgICAgPGlucHV0IGlkPVwibGFzdEFjdGl2aXR5XCJcXG4gICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sIGlucHV0LXhzXCJcXG4gICAgICAgICAgICAgICBuZy1tb2RlbD1cImN0cmwubGFzdEFjdGl2aXR5XCJcXG4gICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkFjdGl2aXR5Li4uXCI+IGRheXNcXG4gICAgICA8L2Rpdj5cXG4gICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxcbiAgICAgICAgPGlucHV0IGlkPVwiZmlsdGVyVGV4dFwiXFxuICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbCBpbnB1dC14c1wiXFxuICAgICAgICAgICAgICAgbmctbW9kZWw9XCJjdHJsLmZpbHRlclRleHRcIlxcbiAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiVGl0bGUgY29udGFpbnMuLi5cIj5cXG4gICAgICA8L2Rpdj5cXG4gICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxcblxcbiAgICAgICAgPGlucHV0IGlkPVwibGltaXRcIlxcbiAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQteHNcIlxcbiAgICAgICAgICAgICAgIG5nLW1vZGVsPVwiY3RybC5saW1pdFwiXFxuICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJMaW1pdC4uLlwiPiBpdGVtc1xcbiAgICAgIDwvZGl2PlxcbiAgICAgIDxkaXY+XFxuICAgICAgICA8YnV0dG9uIGlkPVwiZmlsdGVyXCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwucmVsb2FkKClcIlxcbiAgICAgICAgICAgICAgICB0eXBlPVwic3VibWl0XCI+XFxuICAgICAgICAgICAgPHNwYW4gbmctaGlkZT1cImN0cmwuaXNTdWJtaXR0aW5nXCI+XFxuICAgICAgICAgICAgICBGaWx0ZXJcXG4gICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgPHNwYW4gbmctc2hvdz1cImN0cmwuaXNTdWJtaXR0aW5nXCI+XFxuICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtc3Bpbm5lciBmYS1zcGluXCI+PC9pPlxcbiAgICAgICAgICAgIDwvc3Bhbj5cXG4gICAgICAgIDwvYnV0dG9uPlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Zvcm0+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMTBcIj5cXG4gICAgPGRpdiBuZy1pZj1cImN0cmwuaW5hY3RpdmVDb21tdW5pdGllcy5sZW5ndGg9PTBcIj5cXG4gICAgICA8ZW0+Tm8gY29tbXVuaXRpZXMgbWF0Y2hpbmcgdGhvc2UgY3JpdGVyaWE8L2VtPlxcbiAgICA8L2Rpdj5cXG4gICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtc3RyaXBlZFwiXFxuICAgICAgICAgICBuZy1pZj1cImN0cmwuaW5hY3RpdmVDb21tdW5pdGllcy5sZW5ndGg+MFwiPlxcbiAgICAgIDx0aGVhZD5cXG4gICAgICA8dGg+VGl0bGU8L3RoPlxcbiAgICAgIDx0aD5BY3Rpdml0eSBEYXRlPC90aD5cXG4gICAgICA8dGg+SXRlbXM8L3RoPlxcbiAgICAgIDx0aCB3aWR0aD1cIjExMFwiPlN0YXR1czwvdGg+XFxuICAgICAgPHRoIHdpZHRoPVwiMTYwXCI+QWN0aW9uPC90aD5cXG4gICAgICA8L3RoZWFkPlxcbiAgICAgIDx0Ym9keT5cXG4gICAgICA8dHJcXG4gICAgICAgICAgbmctcmVwZWF0PVwiaWEgaW4gY3RybC5pbmFjdGl2ZUNvbW11bml0aWVzIHwgb3JkZXJCeTpcXCdhY3Rpdml0eURhdGVcXCdcIj5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiaWEudGl0bGVcIj5OYW1lPC90ZD5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiaWEubGFzdF9hY3Rpdml0eS5zcGxpdChcXCcuXFwnKVswXVwiPjwvdGQ+XFxuICAgICAgICA8dGQgbmctYmluZD1cImlhLml0ZW1zXCI+PC90ZD5cXG4gICAgICAgIDx0ZD5cXG4gICAgICAgICAgPHNwYW4gbmctaWY9XCJpYS5zdGF0dXMgPT0gbnVsbFwiPmRlZmF1bHQ8L3NwYW4+XFxuICAgICAgICAgIDxzcGFuIG5nLWlmPVwiaWEuc3RhdHVzICE9IG51bGxcIlxcbiAgICAgICAgICAgICAgICBuZy1iaW5kPVwiaWEuc3RhdHVzXCI+ZGVmYXVsdDwvc3Bhbj5cXG4gICAgICAgIDwvdGQ+XFxuICAgICAgICA8dGQ+XFxuICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBudWxsXCI+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNldFN0YXR1cyhpYSwgXFwnY29weVxcJylcIj5Db3B5XFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICA8L3NwYW4+XFxuICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBcXCdjb3B5aW5nXFwnXCI+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNldFN0YXR1cyhpYSwgXFwnc3RvcFxcJylcIj5TdG9wXFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNob3dMb2coaWEpXCI+TG9nXFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICA8L3NwYW4+XFxuICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBcXCdyZXZpZXdpbmdcXCdcIj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2V0U3RhdHVzKGlhLCBcXCdtb3RoYmFsbFxcJylcIj5Nb3RoYmFsbFxcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5zZXRTdGF0dXMoaWEsIFxcJ3N0b3BcXCcpXCI+U3RvcFxcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5zaG93TG9nKGlhKVwiPkxvZ1xcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgPHNwYW4gbmctaWY9XCJpYS5zdGF0dXMgPT0gXFwncmVtb3ZpbmdcXCdcIj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2hvd0xvZyhpYSlcIj5Mb2dcXG4gICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgIDwvc3Bhbj5cXG4gICAgICAgIDwvdGQ+XFxuICAgICAgPC90cj5cXG4gICAgICA8L3Rib2R5PlxcbiAgICA8L3RhYmxlPlxcbiAgPC9kaXY+XFxuXFxuPC9kaXY+XFxuPHNjcmlwdCB0eXBlPVwidGV4dC9uZy10ZW1wbGF0ZVwiIGlkPVwibXlNb2RhbENvbnRlbnQuaHRtbFwiPlxcbiAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxcbiAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IHB1bGwtcmlnaHRcIlxcbiAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5jbG9zZSgpXCI+XFxuICAgICAgPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZS1jaXJjbGVcIj48L2k+XFxuICAgIDwvYnV0dG9uPlxcbiAgICA8aDMgY2xhc3M9XCJtb2RhbC10aXRsZVwiPkxvZzwvaDM+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCIgc3R5bGU9XCJoZWlnaHQ6IDQwMHB4OyBvdmVyZmxvdzogc2Nyb2xsXCI+XFxuICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLXN0cmlwZWRcIj5cXG4gICAgICA8dGJvZHk+XFxuICAgICAgPHRyIG5nLXJlcGVhdD1cImVudHJ5IGluIGN0cmwubG9nRW50cmllc1wiPlxcbiAgICAgICAgPHRkIHdpZHRoPVwiMjAlXCJcXG4gICAgICAgICAgICBuZy1iaW5kPVwiOjplbnRyeS50aW1lc3RhbXAuc3BsaXQoXFwnLlxcJylbMF1cIj50aW1lc3RhbXAgdGhhdCBpc1xcbiAgICAgICAgICBsb25nXFxuICAgICAgICA8L3RkPlxcbiAgICAgICAgPHRkIG5nLWJpbmQ9XCI6OmVudHJ5LmxldmVsXCI+PC90ZD5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiOjplbnRyeS5tZXNzYWdlXCI+dGhpcyBpcyB3aGVyZSBhIG1lc3NhZ2Ugd291bGRcXG4gICAgICAgICAgZ28gd2l0aCBhIGxvdCBvZiBzcGFjZVxcbiAgICAgICAgPC90ZD5cXG4gICAgICA8L3RyPlxcbiAgICAgIDwvdGJvZHk+XFxuICAgIDwvdGFibGU+XFxuICAgIDx1bD5cXG4gICAgICA8bGkgbmctcmVwZWF0PVwiaXRlbSBpbiBjdHJsLml0ZW1zXCI+XFxuICAgICAgICB7eyBpdGVtIH19XFxuICAgICAgPC9saT5cXG4gICAgPC91bD5cXG4gIDwvZGl2Plxcbjwvc2NyaXB0Plxcbic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBjbGFzcz1cInJvd1wiPlxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC0xMFwiPlxcbiAgICA8aDE+Qm94IExvZ2luPC9oMT5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC04XCI+XFxuICAgIDxwPkVpdGhlciB5b3UgaGF2ZSBuZXZlciBsb2dnZWQgS0FSTCBpbnRvIEJveCwgb3IgdGhlIHRva2VuIEJveFxcbiAgICAgIGxhc3QgZ2F2ZSB5b3UgaXMgbm93IGV4cGlyZWQgb3IgaW52YWxpZC4gUGxlYXNlIGNsaWNrIHRoZVxcbiAgICAgIGJ1dHRvbiBiZWxvdyB0byBsb2cgS0FSTCBiYWNrIGludG8gQm94LjwvcD5cXG5cXG4gICAgPGRpdiBuZy1pZj1cImN0cmwubG9naW5VcmxcIj5cXG4gICAgICA8YVxcbiAgICAgICAgICBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBidG4tbGdcIlxcbiAgICAgICAgICBocmVmPVwie3tjdHJsLmxvZ2luVXJsfX1cIj5cXG4gICAgICAgIExvZ2luXFxuICAgICAgPC9hPlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBuZy1pZj1cIiFjdHJsLmxvZ2luVXJsXCIgY2xhc3M9XCJhbGVydCBhbGVydC13YXJuaW5nXCI+XFxuICAgICAgWW91IGRvblxcJ3QgaGF2ZSBhIEJveCBVUkwgZm9yIGxvZ2dpbmcgaW4uIFRoaXMgbGlrZWx5IGhhcHBlbmVkXFxuICAgICAgZHVlIHRvIGEgcmVsb2FkIG9mIHRoaXMgcGFnZS4gQ2xpY2sgb24gPGNvZGU+QXJjaGl2ZSB0b1xcbiAgICAgIEJveDwvY29kZT4gdG8gY29ycmVjdC5cXG4gICAgPC9kaXY+XFxuICA8L2Rpdj5cXG48L2Rpdj4nOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXY+XFxuICA8aDE+YWRtaW41IEFkbWluIFNjcmVlbjwvaDE+XFxuXFxuICA8cD5UYWtpbmcgdGhlIHdvcmsgZG9uZSBpbiB0aGUgUGVvcGxlIERpcmVjdG9yeSBDb25maWd1cmF0b3JcXG4gIHRvb2wgYW4gYXBwbHlpbmcgaW4gZ2VuZXJhbGx5IHRvIGFkbWluIGZvciBLQVJMLjwvcD5cXG5cXG48L2Rpdj4nOyJdfQ==
