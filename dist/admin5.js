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
module.exports = '<div class="row">\n  <div class="col-md-10">\n    <h1>Archive to Box</h1>\n  </div>\n  <div class="col-md-1">\n    <button id="reload" class="btn btn-default btn-sm"\n            ng-click="ctrl.reload()"\n        >\n      Reload\n    </button>\n  </div>\n</div>\n\n<div class="row">\n\n  <div class="col-md-2">\n\n    <h5 class="text-muted">Filters</h5>\n\n    <form name="filters" ng-submit="ctrl.reload()"\n          class="form-horizonal" role="form">\n      <div class="form-group">\n        <input id="lastActivity"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.lastActivity"\n               placeholder="Activity..."> days\n      </div>\n      <div class="form-group">\n        <input id="filterText"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.filterText"\n               placeholder="Title contains...">\n      </div>\n      <input class="btn btn-primary" ng-click="ctrl.reload()"\n             type="submit" value="Filter"/>\n    </form>\n  </div>\n  <div class="col-md-10">\n    <table class="table table-striped">\n      <thead>\n      <th>Title</th>\n      <th>Activity Date</th>\n      <th>Items</th>\n      <th width="110">Status</th>\n      <th width="160">Action</th>\n      </thead>\n      <tbody>\n      <tr\n          ng-repeat="ia in ctrl.inactiveCommunities | orderBy:\'activityDate\'">\n        <td ng-bind="ia.title">Name</td>\n        <td ng-bind="ia.last_activity.split(\'.\')[0]"></td>\n        <td ng-bind="ia.items"></td>\n        <td>\n          <span ng-if="ia.status == null">default</span>\n          <span ng-if="ia.status != null"\n                ng-bind="ia.status">default</span>\n        </td>\n        <td>\n        <span ng-if="ia.status == null">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'copy\')">Copy\n            </button>\n        </span>\n        <span ng-if="ia.status == \'copying\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'stop\')">Stop\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        <span ng-if="ia.status == \'reviewing\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'mothball\')">Mothball\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'stop\')">Stop\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        <span ng-if="ia.status == \'removing\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        </td>\n      </tr>\n      </tbody>\n    </table>\n  </div>\n\n</div>\n<script type="text/ng-template" id="myModalContent.html">\n  <div class="modal-header">\n    <button class="btn btn-default pull-right"\n            ng-click="ctrl.close()">\n      <i class="glyphicon glyphicon-remove-circle"></i>\n    </button>\n    <h3 class="modal-title">Log</h3>\n  </div>\n  <div class="modal-body" style="height: 400px; overflow: scroll">\n    <table class="table table-striped">\n      <tbody>\n      <tr ng-repeat="entry in ctrl.logEntries">\n        <td width="20%"\n            ng-bind="::entry.timestamp.split(\'.\')[0]">timestamp that is\n          long\n        </td>\n        <td ng-bind="::entry.level"></td>\n        <td ng-bind="::entry.message">this is where a message would\n          go with a lot of space\n        </td>\n      </tr>\n      </tbody>\n    </table>\n    <ul>\n      <li ng-repeat="item in ctrl.items">\n        {{ item }}\n      </li>\n    </ul>\n  </div>\n</script>\n';
},{}],6:[function(require,module,exports){
module.exports = '<div class="row">\n  <div class="col-md-10">\n    <h1>Box Login</h1>\n  </div>\n  <div class="col-md-8">\n    <p>Either you have never logged KARL into Box, or the token Box\n      last gave you is now expired or invalid. Please click the\n      button below to log KARL back into Box.</p>\n\n    <div ng-if="ctrl.loginUrl">\n      <a\n          class="btn btn-primary btn-lg"\n          href="{{ctrl.loginUrl}}">\n        Login\n      </a>\n    </div>\n    <div ng-if="!ctrl.loginUrl" class="alert alert-warning">\n      You don\'t have a Box URL for logging in. This likely happened\n      due to a reload of this page. Click on <code>Archive to\n      Box</code> to correct.\n    </div>\n  </div>\n</div>';
},{}],7:[function(require,module,exports){
module.exports = '<div>\n  <h1>admin5 Admin Screen</h1>\n\n  <p>Taking the work done in the People Directory Configurator\n  tool an applying in generally to admin for KARL.</p>\n\n</div>';
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwic3JjL2NvbnRyb2xsZXJzLmpzIiwic3JjL21vY2tzLmpzIiwic3JjL3N0YXRlcy5qcyIsInNyYy90ZW1wbGF0ZXMvYm94X2xpc3QuaHRtbCIsInNyYy90ZW1wbGF0ZXMvYm94X2xvZ2luLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hvbWUuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pXQTs7QUNBQTs7QUNBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgYW5ndWxhciA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmFuZ3VsYXIgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLmFuZ3VsYXIgOiBudWxsKTtcblxuYW5ndWxhci5tb2R1bGUoJ2FkbWluNScsIFsnbW9vbmRhc2gnXSlcbiAgLmNvbmZpZyhyZXF1aXJlKCcuL21vY2tzJykuQ29uZmlnKTtcblxucmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xucmVxdWlyZSgnLi9zdGF0ZXMnKTtcbiIsImZ1bmN0aW9uIEhvbWVDb250cm9sbGVyKCkge1xufVxuXG5mdW5jdGlvbiBCb3hMb2dpbkNvbnRyb2xsZXIoJHN0YXRlUGFyYW1zKSB7XG4gICAgdGhpcy5sb2dpblVybCA9ICRzdGF0ZVBhcmFtcy51cmw7XG59XG5cbmZ1bmN0aW9uIEJveExpc3RDb250cm9sbGVyKGxhc3RBY3Rpdml0eSwgY29tbXVuaXRpZXMsIFJlc3Rhbmd1bGFyLCAkbW9kYWwsICRodHRwKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuaW5hY3RpdmVDb21tdW5pdGllcyA9IGNvbW11bml0aWVzO1xuICAgIHZhciBiYXNlSW5hY3RpdmVzID0gUmVzdGFuZ3VsYXIuYWxsKCdhcmMyYm94L2NvbW11bml0aWVzJyk7XG5cbiAgICAvLyBIYW5kbGUgZmlsdGVyc1xuICAgIHRoaXMubGFzdEFjdGl2aXR5ID0gbGFzdEFjdGl2aXR5O1xuICAgIHRoaXMuZmlsdGVyVGV4dCA9IG51bGw7XG4gICAgdGhpcy5yZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIFVzZXIgY2xpY2tlZCB0aGUgXCJPdmVyIDE4IG1vbnRoc1wiIGNoZWNrYm94IG9yIHRoZSBzZWFyY2ggYm94XG4gICAgICAgIHZhciBwYXJhbXMgPSB7fTtcbiAgICAgICAgLy8gT25seSBzZW5kIHF1ZXJ5IHN0cmluZyBwYXJhbWV0ZXJzIGlmIHRoZXkgYXJlIG5vdCBudWxsXG4gICAgICAgIGlmICh0aGlzLmxhc3RBY3Rpdml0eSB8fCB0aGlzLmxhc3RBY3Rpdml0eSA9PT0gMCkge1xuICAgICAgICAgICAgcGFyYW1zLmxhc3RfYWN0aXZpdHkgPSB0aGlzLmxhc3RBY3Rpdml0eTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5maWx0ZXJUZXh0KSB7XG4gICAgICAgICAgICBwYXJhbXMuZmlsdGVyID0gdGhpcy5maWx0ZXJUZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgYmFzZUluYWN0aXZlcy5nZXRMaXN0KHBhcmFtcylcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5pbmFjdGl2ZUNvbW11bml0aWVzID0gc3VjY2VzcztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoZmFpbHVyZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ2ZhaWx1cmUnLCBmYWlsdXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRTdGF0dXMgPSBmdW5jdGlvbiAodGFyZ2V0LCBhY3Rpb24pIHtcbiAgICAgICAgdmFyIHVybCA9ICcvYXJjMmJveC9jb21tdW5pdGllcy8nICsgdGFyZ2V0Lm5hbWU7XG4gICAgICAgICRodHRwLnBhdGNoKHVybCwge2FjdGlvbjogYWN0aW9ufSlcbiAgICAgICAgICAgIC5zdWNjZXNzKFxuICAgICAgICAgICAgZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgd2l0aCB0aGUgcmV0dXJuZWQgc3RhdHVzXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnN0YXR1cyA9IHN1Y2Nlc3Muc3RhdHVzO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5lcnJvcihcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICApXG4gICAgfTtcblxuXG4gICAgdGhpcy5zaG93TG9nID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbXlNb2RhbENvbnRlbnQuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogTW9kYWxDb250cm9sbGVyLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnLFxuICAgICAgICAgICAgICAgIHNpemU6ICdsZycsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIE1vZGFsQ29udHJvbGxlcigkbW9kYWxJbnN0YW5jZSwgdGFyZ2V0LCAkaHR0cCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5sb2dFbnRyaWVzID0gW107XG4gICAgdGhpcy51cGRhdGVMb2cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB1cmwgPSAnL2FyYzJib3gvY29tbXVuaXRpZXMvJyArIHRhcmdldC5uYW1lO1xuICAgICAgICAkaHR0cC5nZXQodXJsKVxuICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5sb2dFbnRyaWVzID0gc3VjY2Vzcy5sb2c7XG4gICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmFpbHVyZSBvbiBnZXR0aW5nIGxvZyBlbnRyaWVzJyk7XG4gICAgICAgICAgICAgICAgICAgfSk7XG4gICAgfTtcbiAgICB0aGlzLnVwZGF0ZUxvZygpO1xuXG4gICAgdGhpcy5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIEhvbWVDb250cm9sbGVyOiBIb21lQ29udHJvbGxlcixcbiAgICBCb3hMb2dpbkNvbnRyb2xsZXI6IEJveExvZ2luQ29udHJvbGxlcixcbiAgICBNb2RhbENvbnRyb2xsZXI6IE1vZGFsQ29udHJvbGxlcixcbiAgICBCb3hMaXN0Q29udHJvbGxlcjogQm94TGlzdENvbnRyb2xsZXJcbn07IiwidmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbmZ1bmN0aW9uIE1vZHVsZUNvbmZpZyhNZE1vY2tSZXN0UHJvdmlkZXIpIHtcblxuICB2YXIgdXNlTW9ja3MgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuaGFzQ2xhc3MoJ2E1LXVzZS1tb2NrcycpO1xuICBpZiAoIXVzZU1vY2tzKSByZXR1cm47XG5cbiAgdmFyIGNvbW11bml0aWVzID0gW1xuICAgIHtcbiAgICAgIGlkOiAnMScsIG5hbWU6ICdkZWZhdWx0JyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy9kZWZhdWx0JyxcbiAgICAgIHRpdGxlOiAnRGVmYXVsdCBDb21tdW5pdHknLCBsYXN0X2FjdGl2aXR5OiAnMjAxMC8xMS8xOScsXG4gICAgICBpdGVtczogNDcyMywgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzInLCBuYW1lOiAnYW5vdGhlcicsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvYW5vdGhlcicsXG4gICAgICB0aXRsZTogJ0Fub3RoZXIgQ29tbXVuaXR5JywgbGFzdF9hY3Rpdml0eTogJzIwMTEvMDEvMDknLFxuICAgICAgaXRlbXM6IDIzLCBzdGF0dXM6IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnMycsIG5hbWU6ICd0ZXN0aW5nJyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy90ZXN0aW5nJyxcbiAgICAgIHRpdGxlOiAnVGVzdGluZyAxMjMgV2l0aCBBIExvbmcgVGl0bGUgVGhhdCBHb2VzIE9uJyxcbiAgICAgIGxhc3RfYWN0aXZpdHk6ICcyMDEwLzAzLzA0JyxcbiAgICAgIGl0ZW1zOiA3LFxuICAgICAgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzQnLCBuYW1lOiAnYWZyaWNhJyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy9hZnJpY2EnLFxuICAgICAgdGl0bGU6ICdBZnJpY2EuLi5pdCBpcyBiaWcnLCBsYXN0X2FjdGl2aXR5OiAnMjAxNC8wNC8xNicsXG4gICAgICBpdGVtczogOTk5OSwgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzUnLCBuYW1lOiAnbWVyaWNhJyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy9tZXJpY2EnLFxuICAgICAgdGl0bGU6ICdNZXJpY2EnLCBsYXN0X2FjdGl2aXR5OiAnMjAxNC8xMC8wNycsXG4gICAgICBpdGVtczogNTQ4LCBzdGF0dXM6IG51bGxcbiAgICB9XG4gIF07XG5cbiAgdmFyIGluaXRpYWxMb2dFbnRyaWVzID0gW1xuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnU29tZSBtZXNzYWdlJ30sXG4gICAge3RpbWVzdGFtcDogJzIwMTQvMTIvMDEgMDk6MzA6MDEnLCBtc2c6ICcyU29tZSBtZXNzYWdlJ30sXG4gICAge3RpbWVzdGFtcDogJzIwMTQvMTIvMDEgMDk6MzA6MDEnLCBtc2c6ICczU29tZSBtZXNzYWdlJ30sXG4gICAge3RpbWVzdGFtcDogJzIwMTQvMTIvMDEgMDk6MzA6MDEnLCBtc2c6ICc0U29tZSBtZXNzYWdlJ31cbiAgXTtcblxuICBNZE1vY2tSZXN0UHJvdmlkZXIuYWRkTW9ja3MoXG4gICAgJ2JveCcsXG4gICAgW1xuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcGF0dGVybjogL2FyYzJib3hcXC9jb21tdW5pdGllc1xcLyhcXGQrKVxcL3NldFN0YXR1cy8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICAvLyBHaXZlbiAvYXBpL3RvX2FyY2hpdmUvc29tZURvY0lkL3NldFN0YXR1c1xuICAgICAgICAgIC8vIC0gR3JhYiB0aGF0IGNvbW11bml0eVxuICAgICAgICAgIC8vIC0gQ2hhbmdlIGl0cyBzdGF0dXMgdG8gdGhlIHBhc3NlZCBpbiAnc3RhdHVzJyB2YWx1ZVxuICAgICAgICAgIC8vIC0gcmV0dXJuIG9rXG4gICAgICAgICAgdmFyXG4gICAgICAgICAgICB1cmwgPSByZXF1ZXN0LnVybCxcbiAgICAgICAgICAgIGRhdGEgPSByZXF1ZXN0Lmpzb25fYm9keTtcbiAgICAgICAgICB2YXIgaWQgPSB1cmwuc3BsaXQoXCIvXCIpWzNdLFxuICAgICAgICAgICAgdGFyZ2V0ID0gXyhjb21tdW5pdGllcykuZmlyc3Qoe2lkOiBpZH0pLFxuICAgICAgICAgICAgbmV3U3RhdHVzID0gJ3N0b3BwZWQnO1xuICAgICAgICAgIGRhdGEgPSByZXF1ZXN0Lmpzb25fYm9keTtcbiAgICAgICAgICBpZiAoZGF0YS5zdGF0dXMgPT0gJ3N0YXJ0Jykge1xuICAgICAgICAgICAgbmV3U3RhdHVzID0gJ3N0YXJ0ZWQnO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0YXJnZXQuc3RhdHVzID0gbmV3U3RhdHVzO1xuICAgICAgICAgIHJldHVybiBbMjAwLCB7c3RhdHVzOiBuZXdTdGF0dXN9XTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgcGF0dGVybjogL2FyYzJib3hcXC9jb21tdW5pdGllc1xcLyhcXGQrKVxcL2xvZ0VudHJpZXMvLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBFYWNoIHRpbWUgY2FsbGVkLCBtYWtlIHVwIDUgZW50cmllcyBhbmQgcHV0IHRoZW1cbiAgICAgICAgICAvLyBpbiB0aGUgZnJvbnQgb2YgdGhlIGFycmF5LCB0byBzaW11bGF0ZSB0aGUgc2VydmVyXG4gICAgICAgICAgLy8gZ2VuZXJhdGluZyBtb3JlIGxvZyBlbnRyaWVzLlxuICAgICAgICAgIHZhciBub3csIHRpbWVzdGFtcCwgcmFuZDtcbiAgICAgICAgICBfKF8ucmFuZ2UoMTUpKS5mb3JFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICB0aW1lc3RhbXAgPSBub3cudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICAgICAgICAgIHJhbmQgPSBfLnJhbmRvbSgxMDAwLCA5OTk5KTtcbiAgICAgICAgICAgIGluaXRpYWxMb2dFbnRyaWVzLnVuc2hpZnQoXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgICBtc2c6IHJhbmQgKyAnIFNvbWUgbWVzc2FnZSAnICsgdGltZXN0YW1wXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIFsyMDAsIGluaXRpYWxMb2dFbnRyaWVzXTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgcGF0dGVybjogL2FyYzJib3hcXC9jb21tdW5pdGllcy4qJC8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICAvKlxuICAgICAgICAgICBQcm9jZXNzIHR3byBmaWx0ZXJzOlxuICAgICAgICAgICAtIGluYWN0aXZlID09ICd0cnVlJyBvciBvdGhlcndpc2VcbiAgICAgICAgICAgLSBmaWx0ZXJUZXh0LCBsb3dlcmNhc2UgY29tcGFyaXNvblxuICAgICAgICAgICAqL1xuICAgICAgICAgIHZhclxuICAgICAgICAgICAgbGFzdF9hY3Rpdml0eSA9IHBhcnNlSW50KHJlcXVlc3QucXVlcnkubGFzdF9hY3Rpdml0eSksXG4gICAgICAgICAgICBmaWx0ZXIgPSByZXF1ZXN0LnF1ZXJ5LmZpbHRlcjtcblxuICAgICAgICAgIHZhciBmaWx0ZXJlZCA9IF8oY29tbXVuaXRpZXMpLmNsb25lKCk7XG5cbiAgICAgICAgICBpZiAobGFzdF9hY3Rpdml0eSA8IDM2MCkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBfKGNvbW11bml0aWVzKS5maWx0ZXIoXG4gICAgICAgICAgICAgIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0ubGFzdF9hY3Rpdml0eS5pbmRleE9mKCcyMDE0JykgIT0gMDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS52YWx1ZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChmaWx0ZXIpIHtcbiAgICAgICAgICAgIHZhciBmdCA9IGZpbHRlci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBfKGZpbHRlcmVkKS5maWx0ZXIoXG4gICAgICAgICAgICAgIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9yaWcgPSBpdGVtLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZy5pbmRleE9mKGZ0KSA+IC0xO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLnZhbHVlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIFsyMDAsIGZpbHRlcmVkXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0pO1xuXG5cbiAgdmFyIHVzZXIgPSB7XG4gICAgaWQ6ICdhZG1pbicsXG4gICAgZW1haWw6ICdhZG1pbkB4LmNvbScsXG4gICAgZmlyc3RfbmFtZTogJ0FkbWluJyxcbiAgICBsYXN0X25hbWU6ICdMYXN0aWUnLFxuICAgIHR3aXR0ZXI6ICdhZG1pbidcbiAgfTtcblxuXG4gIE1kTW9ja1Jlc3RQcm92aWRlci5hZGRNb2NrcyhcbiAgICAnYXV0aCcsXG4gICAgW1xuICAgICAge1xuICAgICAgICBwYXR0ZXJuOiAvYXBpXFwvYXV0aFxcL21lLyxcbiAgICAgICAgcmVzcG9uc2VEYXRhOiB1c2VyLFxuICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBwYXR0ZXJuOiAvYXBpXFwvYXV0aFxcL2xvZ2luLyxcbiAgICAgICAgcmVzcG9uZGVyOiBmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgICAgICAgIHZhciBkYXRhID0gcmVxdWVzdC5qc29uX2JvZHk7XG4gICAgICAgICAgdmFyIHVuID0gZGF0YS51c2VybmFtZTtcbiAgICAgICAgICB2YXIgcmVzcG9uc2U7XG5cbiAgICAgICAgICBpZiAodW4gPT09ICdhZG1pbicpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0gWzIwNCwge3Rva2VuOiBcIm1vY2t0b2tlblwifV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0gWzQwMSwge1wibWVzc2FnZVwiOiBcIkludmFsaWQgbG9naW4gb3IgcGFzc3dvcmRcIn1dO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0pO1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDb25maWc6IE1vZHVsZUNvbmZpZ1xufTsiLCJ2YXIgY29udHJvbGxlcnMgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5cbmZ1bmN0aW9uIE1vZHVsZUNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL2hvbWUnKTtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ3NpdGUnLCB7XG4gICAgICAgICAgICAgICAgICAgcGFyZW50OiAncm9vdCdcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnc2l0ZS5ob21lJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9ob21lJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0hvbWUnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvaG9tZS5odG1sJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVycy5Ib21lQ29udHJvbGxlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICAgICAgICAgICAgICAgcGFyZW50OiAnc2l0ZScsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdBZG1pbidcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uZGFzaGJvYXJkJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9kYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnQWRtaW4gRGFzaGJvYXJkJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+QWRtaW4gRGFzaGJvYXJkPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmFyY2hpdmVfYm94Jywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9hcmNoaXZlX2JveCcsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdBcmNoaXZlIHRvIEJveCcsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9ib3hfbGlzdC5odG1sJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVycy5Cb3hMaXN0Q29udHJvbGxlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiBmdW5jdGlvbiAoJGh0dHAsICRzdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdXJsID0gJy9hcmMyYm94L3Rva2VuP2ludmFsaWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KHVybClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbGlkID0gc3VjY2Vzcy52YWxpZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1cmwgPSBzdWNjZXNzLnVybDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhZG1pbi5ib3hfbG9naW4nLCB7dXJsOiB1cmx9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdyZXNvbHZlIHZhbGlkVG9rZW4gZXJyb3InKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RBY3Rpdml0eTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tbXVuaXRpZXM6IGZ1bmN0aW9uIChsYXN0QWN0aXZpdHksIFJlc3Rhbmd1bGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBSZXN0YW5ndWxhci5hbGwoJ2FyYzJib3gvY29tbXVuaXRpZXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmdldExpc3Qoe2xhc3RfYWN0aXZpdHk6IGxhc3RBY3Rpdml0eX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uYm94X2xvZ2luJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9ib3hfbG9naW4nLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnQm94IExvZ2luJyxcbiAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAnJ1xuICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9ib3hfbG9naW4uaHRtbCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuQm94TG9naW5Db250cm9sbGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnY3RybCdcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uc2l0ZWFubm91bmNlJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9zaXRlYW5ub3VuY2VtZW50JyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1NpdGUgQW5ub3VuY2VtZW50JyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+U2l0ZSBBbm5vdW5jZW1lbnQ8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ubG9ncycsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvbG9ncycsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdMb2dzJyxcbiAgICAgICAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ubG9ncy5zeXN0ZW1fbG9ncycsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvc3lzdGVtX2xvZ3MnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnU3lzdGVtIExvZ3MnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5TeXN0ZW0gTG9nczwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5sb2dzLmZlZWRfZHVtcCcsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvZmVlZF9kdW1wJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0ZlZWQgRHVtcCcsXG4gICAgICAgICAgICAgICAgICAgc3Vic2VjdGlvbjoge3NlY3Rpb246ICdhZG1pbi5sb2dzJ30sXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPkZlZWQgRHVtcDwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5sb2dzLm1ldHJpY3MnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL21ldHJpY3MnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnTWV0cmljcycsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPk1ldHJpY3M8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ubG9ncy5kZWJ1Z19jb252ZXJ0ZXJzJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9kZWJ1Z19jb252ZXJ0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0RlYnVnIENvbnZlcnRlcnMnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5EZWJ1ZyBDb252ZXJ0ZXJzPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uY29udGVudCcsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvY29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdDb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uY29udGVudC5tb3ZlJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9tb3ZlJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ01vdmUnLFxuICAgICAgICAgICAgICAgICAgIHN1YnNlY3Rpb246IHtzZWN0aW9uOiAnYWRtaW4uY29udGVudCd9LFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5Nb3ZlIENvbnRlbnQ8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uY29udGVudC5kZWxldGUnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2RlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5EZWxldGUgQ29udGVudDwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAuc3RhdGUoJ2FkbWluLnBlb3BsZScsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvcGVvcGxlJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1Blb3BsZScsXG4gICAgICAgICAgICAgICAgICAgcGFyZW50OiAnYWRtaW4nXG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLnBlb3BsZS5jb25maWcnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2NvbmZpZycsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdQREMnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5QZW9wbGUgRGlyZWN0b3J5IENvbmZpZ3VyYXRpb248L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ucGVvcGxlLnVwbG9hZF9jc3YnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL3VwbG9hZF9jc3YnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnVXBsb2FkIENTVicsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlVwbG9hZCBDU1Y8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ucGVvcGxlLnJlbmFtZV9tZXJnZScsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvcmVuYW1lX21lcmdlJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1JlbmFtZS9NZXJnZScsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlJlbmFtZS9NZXJnZTwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5lbWFpbCcsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvZW1haWwnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnRW1haWwnLFxuICAgICAgICAgICAgICAgICAgIHBhcmVudDogJ2FkbWluJ1xuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5lbWFpbC5zZW5kJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9zZW5kJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1NlbmQgdG8gTWVtYmVycycsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlNlbmQgdG8gTWVtYmVyczwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5lbWFpbC5xdWFyYW50aW5lJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9xdWFyYW50aW5lJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1ZpZXcgUXVhcmFudGluZScsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlZpZXcgUXVhcmFudGluZTwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi51cGRhdGVfb2ZmaWNlcycsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvdXBkYXRlX29mZmljZXMnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnVXBkYXRlIE9mZmljZXMnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5VcGRhdGUgT2ZmaWNlczwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcbn1cblxuZnVuY3Rpb24gTW9kdWxlUnVuKFJlc3Rhbmd1bGFyLCBNZENvbmZpZywgTWROYXYpIHtcbiAgICAvLyBJZiB3ZSBhcmUgdXNpbmcgbW9ja3MsIGRvbid0IHNldCBhIHByZWZpeC4gT3RoZXJ3aXNlLCBzZXQgb25lLlxuICAgIHZhciB1c2VNb2NrcyA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5oYXNDbGFzcygnYTUtdXNlLW1vY2tzJyk7XG4gICAgaWYgKCF1c2VNb2Nrcykge1xuICAgICAgICBSZXN0YW5ndWxhci5zZXRCYXNlVXJsKCcvJyk7XG4gICAgfVxuXG5cbiAgICBNZENvbmZpZy5zaXRlLm5hbWUgPSAnS0FSTCBhZG1pbjUnO1xuXG4gICAgTWROYXYuaW5pdCh7XG4gICAgICAgICAgICAgICAgICAgXCJyb290XCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInNpdGUuaG9tZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkhvbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RhdGVcIjogXCJzaXRlLmhvbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicHJpb3JpdHlcIjogMVxuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICBhZG1pbjoge1xuICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2Rhc2hib2FyZCcsXG4gICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQWRtaW4nLFxuICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uZGFzaGJvYXJkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0FkbWluIERhc2hib2FyZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5kYXNoYm9hcmQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uYXJjaGl2ZV9ib3gnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQXJjaGl2ZSB0byBCb3gnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uYXJjaGl2ZV9ib3gnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uc2l0ZWFubm91bmNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1NpdGUgQW5ub3VuY2VtZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnNpdGVhbm5vdW5jZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0xvZ3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5zeXN0ZW1fbG9ncycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1N5c3RlbSBMb2dzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ubG9ncy5zeXN0ZW1fbG9ncydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzLmZlZWRfZHVtcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0ZlZWQgRHVtcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmxvZ3MuZmVlZF9kdW1wJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmxvZ3MubWV0cmljcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ01ldHJpY3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5sb2dzLm1ldHJpY3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5kZWJ1Z19jb252ZXJ0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVidWcgQ29udmVydGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmxvZ3MuZGVidWdfY29udmVydGVycydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5jb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0NvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uY29udGVudC5tb3ZlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTW92ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmNvbnRlbnQubW92ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5jb250ZW50LmRlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0RlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmNvbnRlbnQuZGVsZXRlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdQZW9wbGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ucGVvcGxlLmNvbmZpZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1BEQycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnBlb3BsZS5jb25maWcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ucGVvcGxlLnVwbG9hZF9jc3YnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdVcGxvYWQgQ1NWJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ucGVvcGxlLnVwbG9hZF9jc3YnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZS5yZW5hbWVfbWVyZ2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdSZW5hbWUvTWVyZ2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5wZW9wbGUucmVuYW1lX21lcmdlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmVtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmVtYWlsLnNlbmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTZW5kIHRvIE1lbWJlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5lbWFpbC5zZW5kJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uZW1haWwucXVhcmFudGluZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1ZpZXcgUXVhcmFudGluZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmVtYWlsLnF1YXJhbnRpbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uZW1haWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRW1haWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uZW1haWwnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4udXBkYXRlX29mZmljZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVXBkYXRlIE9mZmljZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4udXBkYXRlX29mZmljZXMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KTtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ2FkbWluNScpXG4gICAgLmNvbmZpZyhNb2R1bGVDb25maWcpXG4gICAgLnJ1bihNb2R1bGVSdW4pOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgY2xhc3M9XCJyb3dcIj5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMTBcIj5cXG4gICAgPGgxPkFyY2hpdmUgdG8gQm94PC9oMT5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC0xXCI+XFxuICAgIDxidXR0b24gaWQ9XCJyZWxvYWRcIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBidG4tc21cIlxcbiAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5yZWxvYWQoKVwiXFxuICAgICAgICA+XFxuICAgICAgUmVsb2FkXFxuICAgIDwvYnV0dG9uPlxcbiAgPC9kaXY+XFxuPC9kaXY+XFxuXFxuPGRpdiBjbGFzcz1cInJvd1wiPlxcblxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC0yXCI+XFxuXFxuICAgIDxoNSBjbGFzcz1cInRleHQtbXV0ZWRcIj5GaWx0ZXJzPC9oNT5cXG5cXG4gICAgPGZvcm0gbmFtZT1cImZpbHRlcnNcIiBuZy1zdWJtaXQ9XCJjdHJsLnJlbG9hZCgpXCJcXG4gICAgICAgICAgY2xhc3M9XCJmb3JtLWhvcml6b25hbFwiIHJvbGU9XCJmb3JtXCI+XFxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cXG4gICAgICAgIDxpbnB1dCBpZD1cImxhc3RBY3Rpdml0eVwiXFxuICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbCBpbnB1dC14c1wiXFxuICAgICAgICAgICAgICAgbmctbW9kZWw9XCJjdHJsLmxhc3RBY3Rpdml0eVwiXFxuICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJBY3Rpdml0eS4uLlwiPiBkYXlzXFxuICAgICAgPC9kaXY+XFxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cXG4gICAgICAgIDxpbnB1dCBpZD1cImZpbHRlclRleHRcIlxcbiAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQteHNcIlxcbiAgICAgICAgICAgICAgIG5nLW1vZGVsPVwiY3RybC5maWx0ZXJUZXh0XCJcXG4gICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlRpdGxlIGNvbnRhaW5zLi4uXCI+XFxuICAgICAgPC9kaXY+XFxuICAgICAgPGlucHV0IGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgbmctY2xpY2s9XCJjdHJsLnJlbG9hZCgpXCJcXG4gICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPVwiRmlsdGVyXCIvPlxcbiAgICA8L2Zvcm0+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMTBcIj5cXG4gICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtc3RyaXBlZFwiPlxcbiAgICAgIDx0aGVhZD5cXG4gICAgICA8dGg+VGl0bGU8L3RoPlxcbiAgICAgIDx0aD5BY3Rpdml0eSBEYXRlPC90aD5cXG4gICAgICA8dGg+SXRlbXM8L3RoPlxcbiAgICAgIDx0aCB3aWR0aD1cIjExMFwiPlN0YXR1czwvdGg+XFxuICAgICAgPHRoIHdpZHRoPVwiMTYwXCI+QWN0aW9uPC90aD5cXG4gICAgICA8L3RoZWFkPlxcbiAgICAgIDx0Ym9keT5cXG4gICAgICA8dHJcXG4gICAgICAgICAgbmctcmVwZWF0PVwiaWEgaW4gY3RybC5pbmFjdGl2ZUNvbW11bml0aWVzIHwgb3JkZXJCeTpcXCdhY3Rpdml0eURhdGVcXCdcIj5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiaWEudGl0bGVcIj5OYW1lPC90ZD5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiaWEubGFzdF9hY3Rpdml0eS5zcGxpdChcXCcuXFwnKVswXVwiPjwvdGQ+XFxuICAgICAgICA8dGQgbmctYmluZD1cImlhLml0ZW1zXCI+PC90ZD5cXG4gICAgICAgIDx0ZD5cXG4gICAgICAgICAgPHNwYW4gbmctaWY9XCJpYS5zdGF0dXMgPT0gbnVsbFwiPmRlZmF1bHQ8L3NwYW4+XFxuICAgICAgICAgIDxzcGFuIG5nLWlmPVwiaWEuc3RhdHVzICE9IG51bGxcIlxcbiAgICAgICAgICAgICAgICBuZy1iaW5kPVwiaWEuc3RhdHVzXCI+ZGVmYXVsdDwvc3Bhbj5cXG4gICAgICAgIDwvdGQ+XFxuICAgICAgICA8dGQ+XFxuICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBudWxsXCI+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNldFN0YXR1cyhpYSwgXFwnY29weVxcJylcIj5Db3B5XFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICA8L3NwYW4+XFxuICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBcXCdjb3B5aW5nXFwnXCI+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNldFN0YXR1cyhpYSwgXFwnc3RvcFxcJylcIj5TdG9wXFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNob3dMb2coaWEpXCI+TG9nXFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICA8L3NwYW4+XFxuICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBcXCdyZXZpZXdpbmdcXCdcIj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2V0U3RhdHVzKGlhLCBcXCdtb3RoYmFsbFxcJylcIj5Nb3RoYmFsbFxcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5zZXRTdGF0dXMoaWEsIFxcJ3N0b3BcXCcpXCI+U3RvcFxcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5zaG93TG9nKGlhKVwiPkxvZ1xcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgPHNwYW4gbmctaWY9XCJpYS5zdGF0dXMgPT0gXFwncmVtb3ZpbmdcXCdcIj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2hvd0xvZyhpYSlcIj5Mb2dcXG4gICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgIDwvc3Bhbj5cXG4gICAgICAgIDwvdGQ+XFxuICAgICAgPC90cj5cXG4gICAgICA8L3Rib2R5PlxcbiAgICA8L3RhYmxlPlxcbiAgPC9kaXY+XFxuXFxuPC9kaXY+XFxuPHNjcmlwdCB0eXBlPVwidGV4dC9uZy10ZW1wbGF0ZVwiIGlkPVwibXlNb2RhbENvbnRlbnQuaHRtbFwiPlxcbiAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxcbiAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IHB1bGwtcmlnaHRcIlxcbiAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5jbG9zZSgpXCI+XFxuICAgICAgPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZS1jaXJjbGVcIj48L2k+XFxuICAgIDwvYnV0dG9uPlxcbiAgICA8aDMgY2xhc3M9XCJtb2RhbC10aXRsZVwiPkxvZzwvaDM+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCIgc3R5bGU9XCJoZWlnaHQ6IDQwMHB4OyBvdmVyZmxvdzogc2Nyb2xsXCI+XFxuICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLXN0cmlwZWRcIj5cXG4gICAgICA8dGJvZHk+XFxuICAgICAgPHRyIG5nLXJlcGVhdD1cImVudHJ5IGluIGN0cmwubG9nRW50cmllc1wiPlxcbiAgICAgICAgPHRkIHdpZHRoPVwiMjAlXCJcXG4gICAgICAgICAgICBuZy1iaW5kPVwiOjplbnRyeS50aW1lc3RhbXAuc3BsaXQoXFwnLlxcJylbMF1cIj50aW1lc3RhbXAgdGhhdCBpc1xcbiAgICAgICAgICBsb25nXFxuICAgICAgICA8L3RkPlxcbiAgICAgICAgPHRkIG5nLWJpbmQ9XCI6OmVudHJ5LmxldmVsXCI+PC90ZD5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiOjplbnRyeS5tZXNzYWdlXCI+dGhpcyBpcyB3aGVyZSBhIG1lc3NhZ2Ugd291bGRcXG4gICAgICAgICAgZ28gd2l0aCBhIGxvdCBvZiBzcGFjZVxcbiAgICAgICAgPC90ZD5cXG4gICAgICA8L3RyPlxcbiAgICAgIDwvdGJvZHk+XFxuICAgIDwvdGFibGU+XFxuICAgIDx1bD5cXG4gICAgICA8bGkgbmctcmVwZWF0PVwiaXRlbSBpbiBjdHJsLml0ZW1zXCI+XFxuICAgICAgICB7eyBpdGVtIH19XFxuICAgICAgPC9saT5cXG4gICAgPC91bD5cXG4gIDwvZGl2Plxcbjwvc2NyaXB0Plxcbic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBjbGFzcz1cInJvd1wiPlxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC0xMFwiPlxcbiAgICA8aDE+Qm94IExvZ2luPC9oMT5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC04XCI+XFxuICAgIDxwPkVpdGhlciB5b3UgaGF2ZSBuZXZlciBsb2dnZWQgS0FSTCBpbnRvIEJveCwgb3IgdGhlIHRva2VuIEJveFxcbiAgICAgIGxhc3QgZ2F2ZSB5b3UgaXMgbm93IGV4cGlyZWQgb3IgaW52YWxpZC4gUGxlYXNlIGNsaWNrIHRoZVxcbiAgICAgIGJ1dHRvbiBiZWxvdyB0byBsb2cgS0FSTCBiYWNrIGludG8gQm94LjwvcD5cXG5cXG4gICAgPGRpdiBuZy1pZj1cImN0cmwubG9naW5VcmxcIj5cXG4gICAgICA8YVxcbiAgICAgICAgICBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBidG4tbGdcIlxcbiAgICAgICAgICBocmVmPVwie3tjdHJsLmxvZ2luVXJsfX1cIj5cXG4gICAgICAgIExvZ2luXFxuICAgICAgPC9hPlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBuZy1pZj1cIiFjdHJsLmxvZ2luVXJsXCIgY2xhc3M9XCJhbGVydCBhbGVydC13YXJuaW5nXCI+XFxuICAgICAgWW91IGRvblxcJ3QgaGF2ZSBhIEJveCBVUkwgZm9yIGxvZ2dpbmcgaW4uIFRoaXMgbGlrZWx5IGhhcHBlbmVkXFxuICAgICAgZHVlIHRvIGEgcmVsb2FkIG9mIHRoaXMgcGFnZS4gQ2xpY2sgb24gPGNvZGU+QXJjaGl2ZSB0b1xcbiAgICAgIEJveDwvY29kZT4gdG8gY29ycmVjdC5cXG4gICAgPC9kaXY+XFxuICA8L2Rpdj5cXG48L2Rpdj4nOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXY+XFxuICA8aDE+YWRtaW41IEFkbWluIFNjcmVlbjwvaDE+XFxuXFxuICA8cD5UYWtpbmcgdGhlIHdvcmsgZG9uZSBpbiB0aGUgUGVvcGxlIERpcmVjdG9yeSBDb25maWd1cmF0b3JcXG4gIHRvb2wgYW4gYXBwbHlpbmcgaW4gZ2VuZXJhbGx5IHRvIGFkbWluIGZvciBLQVJMLjwvcD5cXG5cXG48L2Rpdj4nOyJdfQ==
