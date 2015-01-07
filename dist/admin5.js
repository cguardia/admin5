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

function BoxListController(lastActivity, resource, Restangular, $modal) {
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
    if (this.lastActivity) {
      params.last_activity = this.lastActivity;
    }
    if (this.filterText) {
      params.filter = this.filterText;
    }
    baseInactives.getList(params)
      .then(
      function (success) {
        console.log('suc', success);
        _this.inactiveCommunities = success;
      },
      function (failure) {
        console.debug('failure', failure);
      }
    );
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

function ModalController($modalInstance, target, $timeout, $scope) {
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

module.exports = {
  HomeController: HomeController,
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
                   lastActivity: function () {
                     return 0
                   },
                   resource: function (lastActivity, Restangular) {
                     return Restangular.all('arc2box/communities')
                       .getList({last_activity: lastActivity});
                   }
                 }
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
},{"./controllers":2,"./templates/box_list.html":5,"./templates/home.html":6}],5:[function(require,module,exports){
module.exports = '<div class="row">\n  <div class="col-md-10">\n    <h1>Archive to Box</h1>\n  </div>\n  <div class="col-md-1">\n    <button id="reload" class="btn btn-default btn-sm"\n            ng-click="ctrl.reload()"\n        >\n      Reload\n    </button>\n  </div>\n</div>\n\n<div class="row">\n\n  <div class="col-md-2">\n\n    <h5 class="text-muted">Filters</h5>\n\n    <form name="filters" ng-submit="ctrl.reload()"\n          class="form-horizonal" role="form">\n      <div class="form-group">\n        <input id="lastActivity"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.lastActivity"\n               placeholder="Title contains..."> days\n      </div>\n      <div class="form-group">\n        <input id="filterText"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.filterText"\n               placeholder="Title contains...">\n      </div>\n      <input class="btn btn-primary" ng-click="ctrl.reload()"\n             type="submit" value="Filter"/>\n    </form>\n  </div>\n  <div class="col-md-10">\n    <table class="table table-striped">\n      <thead>\n      <th>Name</th>\n      <th>Activity Date</th>\n      <th>Items</th>\n      <th>Status</th>\n      <th width="90">Action</th>\n      </thead>\n      <tbody>\n      <tr\n          ng-repeat="ia in ctrl.inactiveCommunities | orderBy:\'activityDate\'">\n        <td ng-bind="ia.title">Name</td>\n        <td ng-bind="ia.last_activity.split(\'.\')[0]"></td>\n        <td ng-bind="ia.items"></td>\n        <td>\n          <span ng-if="it.status == null">default</span>\n        </td>\n        <td>\n        <span ng-if="ia.status == null">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'copy\')">Copy\n            </button>\n        </span>\n        <span ng-if="ia.status == \'copying\' || ia.status == \'reviewing\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'stop\')">Stop\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n        </td>\n      </tr>\n      </tbody>\n    </table>\n  </div>\n\n</div>\n<script type="text/ng-template" id="myModalContent.html">\n  <div class="modal-header">\n    <button class="btn btn-default pull-right"\n            ng-click="ctrl.close()">\n      <i class="glyphicon glyphicon-remove-circle"></i>\n    </button>\n    <h3 class="modal-title">Log</h3>\n  </div>\n  <div class="modal-body" style="height: 400px; overflow: scroll">\n    <table class="table table-striped">\n      <tbody>\n      <tr ng-repeat="entry in ctrl.logEntries">\n        <td width="20%"\n            ng-bind="::entry.timestamp">timestamp that is long\n        </td>\n        <td ng-bind="::entry.msg">this is where a message would\n          go with a lot of space\n        </td>\n      </tr>\n      </tbody>\n    </table>\n    <ul>\n      <li ng-repeat="item in ctrl.items">\n        {{ item }}\n      </li>\n    </ul>\n  </div>\n</script>\n';
},{}],6:[function(require,module,exports){
module.exports = '<div>\n  <h1>admin5 Admin Screen</h1>\n\n  <p>Taking the work done in the People Directory Configurator\n  tool an applying in generally to admin for KARL.</p>\n\n</div>';
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwic3JjL2NvbnRyb2xsZXJzLmpzIiwic3JjL21vY2tzLmpzIiwic3JjL3N0YXRlcy5qcyIsInNyYy90ZW1wbGF0ZXMvYm94X2xpc3QuaHRtbCIsInNyYy90ZW1wbGF0ZXMvaG9tZS5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDL0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFVBOztBQ0FBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBhbmd1bGFyID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuYW5ndWxhciA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuYW5ndWxhciA6IG51bGwpO1xuXG5hbmd1bGFyLm1vZHVsZSgnYWRtaW41JywgWydtb29uZGFzaCddKVxuICAuY29uZmlnKHJlcXVpcmUoJy4vbW9ja3MnKS5Db25maWcpO1xuXG5yZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5yZXF1aXJlKCcuL3N0YXRlcycpO1xuIiwiZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoKSB7XG59XG5cbmZ1bmN0aW9uIEJveExpc3RDb250cm9sbGVyKGxhc3RBY3Rpdml0eSwgcmVzb3VyY2UsIFJlc3Rhbmd1bGFyLCAkbW9kYWwpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdGhpcy5pbmFjdGl2ZUNvbW11bml0aWVzID0gcmVzb3VyY2U7XG4gIHZhciBiYXNlSW5hY3RpdmVzID0gUmVzdGFuZ3VsYXIuYWxsKCdhcmMyYm94L2NvbW11bml0aWVzJyk7XG5cbiAgLy8gSGFuZGxlIGZpbHRlcnNcbiAgdGhpcy5sYXN0QWN0aXZpdHkgPSBsYXN0QWN0aXZpdHk7XG4gIHRoaXMuZmlsdGVyVGV4dCA9IG51bGw7XG4gIHRoaXMucmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFVzZXIgY2xpY2tlZCB0aGUgXCJPdmVyIDE4IG1vbnRoc1wiIGNoZWNrYm94IG9yIHRoZSBzZWFyY2ggYm94XG4gICAgdmFyIHBhcmFtcyA9IHt9O1xuICAgIC8vIE9ubHkgc2VuZCBxdWVyeSBzdHJpbmcgcGFyYW1ldGVycyBpZiB0aGV5IGFyZSBub3QgbnVsbFxuICAgIGlmICh0aGlzLmxhc3RBY3Rpdml0eSkge1xuICAgICAgcGFyYW1zLmxhc3RfYWN0aXZpdHkgPSB0aGlzLmxhc3RBY3Rpdml0eTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZmlsdGVyVGV4dCkge1xuICAgICAgcGFyYW1zLmZpbHRlciA9IHRoaXMuZmlsdGVyVGV4dDtcbiAgICB9XG4gICAgYmFzZUluYWN0aXZlcy5nZXRMaXN0KHBhcmFtcylcbiAgICAgIC50aGVuKFxuICAgICAgZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3N1YycsIHN1Y2Nlc3MpO1xuICAgICAgICBfdGhpcy5pbmFjdGl2ZUNvbW11bml0aWVzID0gc3VjY2VzcztcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiAoZmFpbHVyZSkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdmYWlsdXJlJywgZmFpbHVyZSk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuICB0aGlzLnNldFN0YXR1cyA9IGZ1bmN0aW9uICh0YXJnZXQsIHN0YXR1cykge1xuICAgIHRhcmdldC5jdXN0b21QT1NUKHtzdGF0dXM6IHN0YXR1c30sICdzZXRTdGF0dXMnKVxuICAgICAgLnRoZW4oXG4gICAgICBmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAvLyBVcGRhdGUgd2l0aCB0aGUgcmV0dXJuZWQgc3RhdHVzXG4gICAgICAgIHRhcmdldC5zdGF0dXMgPSBzdWNjZXNzLnN0YXR1cztcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiAoZmFpbHVyZSkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdmYWlsZWQnLCBmYWlsdXJlKTtcbiAgICAgIH1cbiAgICApXG4gIH07XG5cblxuICB0aGlzLnNob3dMb2cgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3BlbihcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdteU1vZGFsQ29udGVudC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogTW9kYWxDb250cm9sbGVyLFxuICAgICAgICBjb250cm9sbGVyQXM6ICdjdHJsJyxcbiAgICAgICAgc2l6ZTogJ2xnJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIHRhcmdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIE1vZGFsQ29udHJvbGxlcigkbW9kYWxJbnN0YW5jZSwgdGFyZ2V0LCAkdGltZW91dCwgJHNjb3BlKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHRoaXMubG9nRW50cmllcyA9IFtdO1xuICB0aGlzLnVwZGF0ZUxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0YXJnZXQuY3VzdG9tR0VUKCdsb2dFbnRyaWVzJywge30pXG4gICAgICAudGhlbihcbiAgICAgIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgIF90aGlzLmxvZ0VudHJpZXMgPSBzdWNjZXNzO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIChmYWlsdXJlKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ2ZhaWx1cmUnLCBmYWlsdXJlKTtcbiAgICAgIH1cbiAgICApXG4gIH07XG4gIHRoaXMudXBkYXRlTG9nKCk7XG5cbiAgLy8gTm93IHBvbGxcbiAgdmFyIHNlY29uZHMgPSA1O1xuICB2YXIgdGltZXIgPSAkdGltZW91dChcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpcy51cGRhdGVMb2coKTtcbiAgICB9LCBzZWNvbmRzICogMTAwMFxuICApO1xuICAkc2NvcGUuJG9uKFxuICAgICdkZXN0cm95JyxcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAkdGltZW91dC5jYW5jZWwodGltZXIpO1xuICAgIH0pO1xuXG4gIHRoaXMuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgSG9tZUNvbnRyb2xsZXI6IEhvbWVDb250cm9sbGVyLFxuICBNb2RhbENvbnRyb2xsZXI6IE1vZGFsQ29udHJvbGxlcixcbiAgQm94TGlzdENvbnRyb2xsZXI6IEJveExpc3RDb250cm9sbGVyXG59OyIsInZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5mdW5jdGlvbiBNb2R1bGVDb25maWcoTWRNb2NrUmVzdFByb3ZpZGVyKSB7XG5cbiAgdmFyIHVzZU1vY2tzID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmhhc0NsYXNzKCdhNS11c2UtbW9ja3MnKTtcbiAgaWYgKCF1c2VNb2NrcykgcmV0dXJuO1xuXG4gIHZhciBjb21tdW5pdGllcyA9IFtcbiAgICB7XG4gICAgICBpZDogJzEnLCBuYW1lOiAnZGVmYXVsdCcsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvZGVmYXVsdCcsXG4gICAgICB0aXRsZTogJ0RlZmF1bHQgQ29tbXVuaXR5JywgbGFzdF9hY3Rpdml0eTogJzIwMTAvMTEvMTknLFxuICAgICAgaXRlbXM6IDQ3MjMsIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICcyJywgbmFtZTogJ2Fub3RoZXInLFxuICAgICAgdXJsOiAnL2NvbW11bml0aWVzL2Fub3RoZXInLFxuICAgICAgdGl0bGU6ICdBbm90aGVyIENvbW11bml0eScsIGxhc3RfYWN0aXZpdHk6ICcyMDExLzAxLzA5JyxcbiAgICAgIGl0ZW1zOiAyMywgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzMnLCBuYW1lOiAndGVzdGluZycsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvdGVzdGluZycsXG4gICAgICB0aXRsZTogJ1Rlc3RpbmcgMTIzIFdpdGggQSBMb25nIFRpdGxlIFRoYXQgR29lcyBPbicsXG4gICAgICBsYXN0X2FjdGl2aXR5OiAnMjAxMC8wMy8wNCcsXG4gICAgICBpdGVtczogNyxcbiAgICAgIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICc0JywgbmFtZTogJ2FmcmljYScsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvYWZyaWNhJyxcbiAgICAgIHRpdGxlOiAnQWZyaWNhLi4uaXQgaXMgYmlnJywgbGFzdF9hY3Rpdml0eTogJzIwMTQvMDQvMTYnLFxuICAgICAgaXRlbXM6IDk5OTksIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICc1JywgbmFtZTogJ21lcmljYScsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvbWVyaWNhJyxcbiAgICAgIHRpdGxlOiAnTWVyaWNhJywgbGFzdF9hY3Rpdml0eTogJzIwMTQvMTAvMDcnLFxuICAgICAgaXRlbXM6IDU0OCwgc3RhdHVzOiBudWxsXG4gICAgfVxuICBdO1xuXG4gIHZhciBpbml0aWFsTG9nRW50cmllcyA9IFtcbiAgICB7dGltZXN0YW1wOiAnMjAxNC8xMi8wMSAwOTozMDowMScsIG1zZzogJ1NvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnMlNvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnM1NvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnNFNvbWUgbWVzc2FnZSd9XG4gIF07XG5cbiAgTWRNb2NrUmVzdFByb3ZpZGVyLmFkZE1vY2tzKFxuICAgICdib3gnLFxuICAgIFtcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXNcXC8oXFxkKylcXC9zZXRTdGF0dXMvLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAgICAgLy8gR2l2ZW4gL2FwaS90b19hcmNoaXZlL3NvbWVEb2NJZC9zZXRTdGF0dXNcbiAgICAgICAgICAvLyAtIEdyYWIgdGhhdCBjb21tdW5pdHlcbiAgICAgICAgICAvLyAtIENoYW5nZSBpdHMgc3RhdHVzIHRvIHRoZSBwYXNzZWQgaW4gJ3N0YXR1cycgdmFsdWVcbiAgICAgICAgICAvLyAtIHJldHVybiBva1xuICAgICAgICAgIHZhclxuICAgICAgICAgICAgdXJsID0gcmVxdWVzdC51cmwsXG4gICAgICAgICAgICBkYXRhID0gcmVxdWVzdC5qc29uX2JvZHk7XG4gICAgICAgICAgdmFyIGlkID0gdXJsLnNwbGl0KFwiL1wiKVszXSxcbiAgICAgICAgICAgIHRhcmdldCA9IF8oY29tbXVuaXRpZXMpLmZpcnN0KHtpZDogaWR9KSxcbiAgICAgICAgICAgIG5ld1N0YXR1cyA9ICdzdG9wcGVkJztcbiAgICAgICAgICBkYXRhID0gcmVxdWVzdC5qc29uX2JvZHk7XG4gICAgICAgICAgaWYgKGRhdGEuc3RhdHVzID09ICdzdGFydCcpIHtcbiAgICAgICAgICAgIG5ld1N0YXR1cyA9ICdzdGFydGVkJztcbiAgICAgICAgICB9XG4gICAgICAgICAgdGFyZ2V0LnN0YXR1cyA9IG5ld1N0YXR1cztcbiAgICAgICAgICByZXR1cm4gWzIwMCwge3N0YXR1czogbmV3U3RhdHVzfV07XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXNcXC8oXFxkKylcXC9sb2dFbnRyaWVzLyxcbiAgICAgICAgcmVzcG9uZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gRWFjaCB0aW1lIGNhbGxlZCwgbWFrZSB1cCA1IGVudHJpZXMgYW5kIHB1dCB0aGVtXG4gICAgICAgICAgLy8gaW4gdGhlIGZyb250IG9mIHRoZSBhcnJheSwgdG8gc2ltdWxhdGUgdGhlIHNlcnZlclxuICAgICAgICAgIC8vIGdlbmVyYXRpbmcgbW9yZSBsb2cgZW50cmllcy5cbiAgICAgICAgICB2YXIgbm93LCB0aW1lc3RhbXAsIHJhbmQ7XG4gICAgICAgICAgXyhfLnJhbmdlKDE1KSkuZm9yRWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgdGltZXN0YW1wID0gbm93LnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICAgICAgICByYW5kID0gXy5yYW5kb20oMTAwMCwgOTk5OSk7XG4gICAgICAgICAgICBpbml0aWFsTG9nRW50cmllcy51bnNoaWZ0KFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgbXNnOiByYW5kICsgJyBTb21lIG1lc3NhZ2UgJyArIHRpbWVzdGFtcFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBbMjAwLCBpbml0aWFsTG9nRW50cmllc107XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXMuKiQvLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAgICAgLypcbiAgICAgICAgICAgUHJvY2VzcyB0d28gZmlsdGVyczpcbiAgICAgICAgICAgLSBpbmFjdGl2ZSA9PSAndHJ1ZScgb3Igb3RoZXJ3aXNlXG4gICAgICAgICAgIC0gZmlsdGVyVGV4dCwgbG93ZXJjYXNlIGNvbXBhcmlzb25cbiAgICAgICAgICAgKi9cbiAgICAgICAgICB2YXJcbiAgICAgICAgICAgIGxhc3RfYWN0aXZpdHkgPSBwYXJzZUludChyZXF1ZXN0LnF1ZXJ5Lmxhc3RfYWN0aXZpdHkpLFxuICAgICAgICAgICAgZmlsdGVyID0gcmVxdWVzdC5xdWVyeS5maWx0ZXI7XG5cbiAgICAgICAgICB2YXIgZmlsdGVyZWQgPSBfKGNvbW11bml0aWVzKS5jbG9uZSgpO1xuXG4gICAgICAgICAgaWYgKGxhc3RfYWN0aXZpdHkgPCAzNjApIHtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gXyhjb21tdW5pdGllcykuZmlsdGVyKFxuICAgICAgICAgICAgICBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmxhc3RfYWN0aXZpdHkuaW5kZXhPZignMjAxNCcpICE9IDA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkudmFsdWUoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZmlsdGVyKSB7XG4gICAgICAgICAgICB2YXIgZnQgPSBmaWx0ZXIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gXyhmaWx0ZXJlZCkuZmlsdGVyKFxuICAgICAgICAgICAgICBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBvcmlnID0gaXRlbS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWcuaW5kZXhPZihmdCkgPiAtMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS52YWx1ZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBbMjAwLCBmaWx0ZXJlZF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdKTtcblxuXG4gIHZhciB1c2VyID0ge1xuICAgIGlkOiAnYWRtaW4nLFxuICAgIGVtYWlsOiAnYWRtaW5AeC5jb20nLFxuICAgIGZpcnN0X25hbWU6ICdBZG1pbicsXG4gICAgbGFzdF9uYW1lOiAnTGFzdGllJyxcbiAgICB0d2l0dGVyOiAnYWRtaW4nXG4gIH07XG5cblxuICBNZE1vY2tSZXN0UHJvdmlkZXIuYWRkTW9ja3MoXG4gICAgJ2F1dGgnLFxuICAgIFtcbiAgICAgIHtcbiAgICAgICAgcGF0dGVybjogL2FwaVxcL2F1dGhcXC9tZS8sXG4gICAgICAgIHJlc3BvbnNlRGF0YTogdXNlcixcbiAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcGF0dGVybjogL2FwaVxcL2F1dGhcXC9sb2dpbi8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICB2YXIgZGF0YSA9IHJlcXVlc3QuanNvbl9ib2R5O1xuICAgICAgICAgIHZhciB1biA9IGRhdGEudXNlcm5hbWU7XG4gICAgICAgICAgdmFyIHJlc3BvbnNlO1xuXG4gICAgICAgICAgaWYgKHVuID09PSAnYWRtaW4nKSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IFsyMDQsIHt0b2tlbjogXCJtb2NrdG9rZW5cIn1dO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IFs0MDEsIHtcIm1lc3NhZ2VcIjogXCJJbnZhbGlkIGxvZ2luIG9yIHBhc3N3b3JkXCJ9XTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ29uZmlnOiBNb2R1bGVDb25maWdcbn07IiwiXG52YXIgY29udHJvbGxlcnMgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5cbmZ1bmN0aW9uIE1vZHVsZUNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9ob21lJyk7XG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdzaXRlJywge1xuICAgICAgICAgICAgIHBhcmVudDogJ3Jvb3QnXG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdzaXRlLmhvbWUnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2hvbWUnLFxuICAgICAgICAgICAgIHRpdGxlOiAnSG9tZScsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9ob21lLmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuSG9tZUNvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4nLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2FkbWluJyxcbiAgICAgICAgICAgICBwYXJlbnQ6ICdzaXRlJyxcbiAgICAgICAgICAgICB0aXRsZTogJ0FkbWluJ1xuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4uZGFzaGJvYXJkJywge1xuICAgICAgICAgICAgIHVybDogJy9kYXNoYm9hcmQnLFxuICAgICAgICAgICAgIHRpdGxlOiAnQWRtaW4gRGFzaGJvYXJkJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+QWRtaW4gRGFzaGJvYXJkPC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4uYXJjaGl2ZV9ib3gnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2FyY2hpdmVfYm94JyxcbiAgICAgICAgICAgICB0aXRsZTogJ0FyY2hpdmUgdG8gQm94JyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2JveF9saXN0Lmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuQm94TGlzdENvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnLFxuICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgbGFzdEFjdGl2aXR5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IGZ1bmN0aW9uIChsYXN0QWN0aXZpdHksIFJlc3Rhbmd1bGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmVzdGFuZ3VsYXIuYWxsKCdhcmMyYm94L2NvbW11bml0aWVzJylcbiAgICAgICAgICAgICAgICAgICAgICAgLmdldExpc3Qoe2xhc3RfYWN0aXZpdHk6IGxhc3RBY3Rpdml0eX0pO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLnNpdGVhbm5vdW5jZScsIHtcbiAgICAgICAgICAgICB1cmw6ICcvc2l0ZWFubm91bmNlbWVudCcsXG4gICAgICAgICAgICAgdGl0bGU6ICdTaXRlIEFubm91bmNlbWVudCcsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlNpdGUgQW5ub3VuY2VtZW50PC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4ubG9ncycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvbG9ncycsXG4gICAgICAgICAgICAgdGl0bGU6ICdMb2dzJyxcbiAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmxvZ3Muc3lzdGVtX2xvZ3MnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3N5c3RlbV9sb2dzJyxcbiAgICAgICAgICAgICB0aXRsZTogJ1N5c3RlbSBMb2dzJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+U3lzdGVtIExvZ3M8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5sb2dzLmZlZWRfZHVtcCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvZmVlZF9kdW1wJyxcbiAgICAgICAgICAgICB0aXRsZTogJ0ZlZWQgRHVtcCcsXG4gICAgICAgICAgICAgc3Vic2VjdGlvbjoge3NlY3Rpb246ICdhZG1pbi5sb2dzJ30sXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPkZlZWQgRHVtcDwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmxvZ3MubWV0cmljcycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvbWV0cmljcycsXG4gICAgICAgICAgICAgdGl0bGU6ICdNZXRyaWNzJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+TWV0cmljczwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmxvZ3MuZGVidWdfY29udmVydGVycycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvZGVidWdfY29udmVydGVycycsXG4gICAgICAgICAgICAgdGl0bGU6ICdEZWJ1ZyBDb252ZXJ0ZXJzJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+RGVidWcgQ29udmVydGVyczwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcblxuICAgIC5zdGF0ZSgnYWRtaW4uY29udGVudCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvY29udGVudCcsXG4gICAgICAgICAgICAgdGl0bGU6ICdDb250ZW50JyxcbiAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmNvbnRlbnQubW92ZScsIHtcbiAgICAgICAgICAgICB1cmw6ICcvbW92ZScsXG4gICAgICAgICAgICAgdGl0bGU6ICdNb3ZlJyxcbiAgICAgICAgICAgICBzdWJzZWN0aW9uOiB7c2VjdGlvbjogJ2FkbWluLmNvbnRlbnQnfSxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+TW92ZSBDb250ZW50PC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4uY29udGVudC5kZWxldGUnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2RlbGV0ZScsXG4gICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5EZWxldGUgQ29udGVudDwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcblxuICAgIC5zdGF0ZSgnYWRtaW4ucGVvcGxlJywge1xuICAgICAgICAgICAgIHVybDogJy9wZW9wbGUnLFxuICAgICAgICAgICAgIHRpdGxlOiAnUGVvcGxlJyxcbiAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLnBlb3BsZS5jb25maWcnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2NvbmZpZycsXG4gICAgICAgICAgICAgdGl0bGU6ICdQREMnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5QZW9wbGUgRGlyZWN0b3J5IENvbmZpZ3VyYXRpb248L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5wZW9wbGUudXBsb2FkX2NzdicsIHtcbiAgICAgICAgICAgICB1cmw6ICcvdXBsb2FkX2NzdicsXG4gICAgICAgICAgICAgdGl0bGU6ICdVcGxvYWQgQ1NWJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+VXBsb2FkIENTVjwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLnBlb3BsZS5yZW5hbWVfbWVyZ2UnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3JlbmFtZV9tZXJnZScsXG4gICAgICAgICAgICAgdGl0bGU6ICdSZW5hbWUvTWVyZ2UnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5SZW5hbWUvTWVyZ2U8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5lbWFpbCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvZW1haWwnLFxuICAgICAgICAgICAgIHRpdGxlOiAnRW1haWwnLFxuICAgICAgICAgICAgIHBhcmVudDogJ2FkbWluJ1xuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4uZW1haWwuc2VuZCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvc2VuZCcsXG4gICAgICAgICAgICAgdGl0bGU6ICdTZW5kIHRvIE1lbWJlcnMnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5TZW5kIHRvIE1lbWJlcnM8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5lbWFpbC5xdWFyYW50aW5lJywge1xuICAgICAgICAgICAgIHVybDogJy9xdWFyYW50aW5lJyxcbiAgICAgICAgICAgICB0aXRsZTogJ1ZpZXcgUXVhcmFudGluZScsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlZpZXcgUXVhcmFudGluZTwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLnVwZGF0ZV9vZmZpY2VzJywge1xuICAgICAgICAgICAgIHVybDogJy91cGRhdGVfb2ZmaWNlcycsXG4gICAgICAgICAgICAgdGl0bGU6ICdVcGRhdGUgT2ZmaWNlcycsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlVwZGF0ZSBPZmZpY2VzPC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxufVxuXG5mdW5jdGlvbiBNb2R1bGVSdW4oUmVzdGFuZ3VsYXIsIE1kQ29uZmlnLCBNZE5hdikge1xuICAvLyBJZiB3ZSBhcmUgdXNpbmcgbW9ja3MsIGRvbid0IHNldCBhIHByZWZpeC4gT3RoZXJ3aXNlLCBzZXQgb25lLlxuICB2YXIgdXNlTW9ja3MgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuaGFzQ2xhc3MoJ2E1LXVzZS1tb2NrcycpO1xuICBpZiAoIXVzZU1vY2tzKSB7XG4gICAgUmVzdGFuZ3VsYXIuc2V0QmFzZVVybCgnaHR0cDovL2xvY2FsaG9zdDo2NTQzJyk7XG4gIH1cblxuXG4gIE1kQ29uZmlnLnNpdGUubmFtZSA9ICdLQVJMIGFkbWluNSc7XG4gIHZhciBzaXRlQ29uZmlnID0ge1xuICAgICdpdGVtcyc6IHtcbiAgICAgICdyb290JzogW1xuICAgICAgICB7XG4gICAgICAgICAgJ2lkJzogJ3NpdGUuaG9tZScsXG4gICAgICAgICAgJ2xhYmVsJzogJ0hvbWUnLFxuICAgICAgICAgICdzdGF0ZSc6ICdzaXRlLmhvbWUnLFxuICAgICAgICAgICdwcmlvcml0eSc6IDFcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgICdhZG1pbic6IHtcbiAgICAgICAgJ2lkJzogJ2Rhc2hib2FyZCcsXG4gICAgICAgICdsYWJlbCc6ICdBZG1pbicsXG4gICAgICAgICdpdGVtcyc6IHtcbiAgICAgICAgICAnYWRtaW4uZGFzaGJvYXJkJzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi5kYXNoYm9hcmQnLFxuICAgICAgICAgICAgbGFiZWw6ICdBZG1pbiBEYXNoYm9hcmQnLFxuICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5kYXNoYm9hcmQnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAnYWRtaW4uYXJjaGl2ZV9ib3gnOiB7XG4gICAgICAgICAgICBpZDogJ2FkbWluLmFyY2hpdmVfYm94JyxcbiAgICAgICAgICAgIGxhYmVsOiAnQXJjaGl2ZSB0byBCb3gnLFxuICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5hcmNoaXZlX2JveCdcbiAgICAgICAgICB9LFxuICAgICAgICAgICdhZG1pbi5zaXRlYW5ub3VuY2UnOiB7XG4gICAgICAgICAgICBpZDogJ2FkbWluLnNpdGVhbm5vdW5jZScsXG4gICAgICAgICAgICBsYWJlbDogJ1NpdGUgQW5ub3VuY2VtZW50JyxcbiAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uc2l0ZWFubm91bmNlJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2FkbWluLmxvZ3MnOiB7XG4gICAgICAgICAgICBpZDogJ2FkbWluLmxvZ3MnLFxuICAgICAgICAgICAgbGFiZWw6ICdMb2dzJyxcbiAgICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICAgICdhZG1pbi5sb2dzLnN5c3RlbV9sb2dzJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5zeXN0ZW1fbG9ncycsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdTeXN0ZW0gTG9ncycsXG4gICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5sb2dzLnN5c3RlbV9sb2dzJ1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAnYWRtaW4ubG9ncy5mZWVkX2R1bXAnOiB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzLmZlZWRfZHVtcCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdGZWVkIER1bXAnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ubG9ncy5mZWVkX2R1bXAnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdhZG1pbi5sb2dzLm1ldHJpY3MnOiB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzLm1ldHJpY3MnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnTWV0cmljcycsXG4gICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5sb2dzLm1ldHJpY3MnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdhZG1pbi5sb2dzLmRlYnVnX2NvbnZlcnRlcnMnOiB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzLmRlYnVnX2NvbnZlcnRlcnMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVidWcgQ29udmVydGVycycsXG4gICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5sb2dzLmRlYnVnX2NvbnZlcnRlcnMnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICdhZG1pbi5jb250ZW50Jzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi5jb250ZW50JyxcbiAgICAgICAgICAgIGxhYmVsOiAnQ29udGVudCcsXG4gICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAnYWRtaW4uY29udGVudC5tb3ZlJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uY29udGVudC5tb3ZlJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ01vdmUnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uY29udGVudC5tb3ZlJ1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAnYWRtaW4uY29udGVudC5kZWxldGUnOiB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5jb250ZW50LmRlbGV0ZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uY29udGVudC5kZWxldGUnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICdhZG1pbi5wZW9wbGUnOiB7XG4gICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZScsXG4gICAgICAgICAgICBsYWJlbDogJ1Blb3BsZScsXG4gICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAnYWRtaW4ucGVvcGxlLmNvbmZpZyc6IHtcbiAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZS5jb25maWcnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnUERDJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnBlb3BsZS5jb25maWcnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdhZG1pbi5wZW9wbGUudXBsb2FkX2Nzdic6IHtcbiAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZS51cGxvYWRfY3N2JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1VwbG9hZCBDU1YnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ucGVvcGxlLnVwbG9hZF9jc3YnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdhZG1pbi5wZW9wbGUucmVuYW1lX21lcmdlJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ucGVvcGxlLnJlbmFtZV9tZXJnZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdSZW5hbWUvTWVyZ2UnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ucGVvcGxlLnJlbmFtZV9tZXJnZSdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2FkbWluLmVtYWlsJzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi5lbWFpbCcsXG4gICAgICAgICAgICBsYWJlbDogJ0VtYWlsJyxcbiAgICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICAgICdhZG1pbi5lbWFpbC5zZW5kJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uZW1haWwuc2VuZCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdTZW5kIHRvIE1lbWJlcnMnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uZW1haWwuc2VuZCdcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2FkbWluLmVtYWlsLnF1YXJhbnRpbmUnOiB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5lbWFpbC5xdWFyYW50aW5lJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1ZpZXcgUXVhcmFudGluZScsXG4gICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5lbWFpbC5xdWFyYW50aW5lJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnYWRtaW4udXBkYXRlX29mZmljZXMnOiB7XG4gICAgICAgICAgICBpZDogJ2FkbWluLnVwZGF0ZV9vZmZpY2VzJyxcbiAgICAgICAgICAgIGxhYmVsOiAnVXBkYXRlIE9mZmljZXMnLFxuICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi51cGRhdGVfb2ZmaWNlcydcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIE1kTmF2LmluaXQoc2l0ZUNvbmZpZyk7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdhZG1pbjUnKVxuICAuY29uZmlnKE1vZHVsZUNvbmZpZylcbiAgLnJ1bihNb2R1bGVSdW4pOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgY2xhc3M9XCJyb3dcIj5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMTBcIj5cXG4gICAgPGgxPkFyY2hpdmUgdG8gQm94PC9oMT5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC0xXCI+XFxuICAgIDxidXR0b24gaWQ9XCJyZWxvYWRcIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBidG4tc21cIlxcbiAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5yZWxvYWQoKVwiXFxuICAgICAgICA+XFxuICAgICAgUmVsb2FkXFxuICAgIDwvYnV0dG9uPlxcbiAgPC9kaXY+XFxuPC9kaXY+XFxuXFxuPGRpdiBjbGFzcz1cInJvd1wiPlxcblxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC0yXCI+XFxuXFxuICAgIDxoNSBjbGFzcz1cInRleHQtbXV0ZWRcIj5GaWx0ZXJzPC9oNT5cXG5cXG4gICAgPGZvcm0gbmFtZT1cImZpbHRlcnNcIiBuZy1zdWJtaXQ9XCJjdHJsLnJlbG9hZCgpXCJcXG4gICAgICAgICAgY2xhc3M9XCJmb3JtLWhvcml6b25hbFwiIHJvbGU9XCJmb3JtXCI+XFxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cXG4gICAgICAgIDxpbnB1dCBpZD1cImxhc3RBY3Rpdml0eVwiXFxuICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbCBpbnB1dC14c1wiXFxuICAgICAgICAgICAgICAgbmctbW9kZWw9XCJjdHJsLmxhc3RBY3Rpdml0eVwiXFxuICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJUaXRsZSBjb250YWlucy4uLlwiPiBkYXlzXFxuICAgICAgPC9kaXY+XFxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cXG4gICAgICAgIDxpbnB1dCBpZD1cImZpbHRlclRleHRcIlxcbiAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQteHNcIlxcbiAgICAgICAgICAgICAgIG5nLW1vZGVsPVwiY3RybC5maWx0ZXJUZXh0XCJcXG4gICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlRpdGxlIGNvbnRhaW5zLi4uXCI+XFxuICAgICAgPC9kaXY+XFxuICAgICAgPGlucHV0IGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgbmctY2xpY2s9XCJjdHJsLnJlbG9hZCgpXCJcXG4gICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPVwiRmlsdGVyXCIvPlxcbiAgICA8L2Zvcm0+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMTBcIj5cXG4gICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtc3RyaXBlZFwiPlxcbiAgICAgIDx0aGVhZD5cXG4gICAgICA8dGg+TmFtZTwvdGg+XFxuICAgICAgPHRoPkFjdGl2aXR5IERhdGU8L3RoPlxcbiAgICAgIDx0aD5JdGVtczwvdGg+XFxuICAgICAgPHRoPlN0YXR1czwvdGg+XFxuICAgICAgPHRoIHdpZHRoPVwiOTBcIj5BY3Rpb248L3RoPlxcbiAgICAgIDwvdGhlYWQ+XFxuICAgICAgPHRib2R5PlxcbiAgICAgIDx0clxcbiAgICAgICAgICBuZy1yZXBlYXQ9XCJpYSBpbiBjdHJsLmluYWN0aXZlQ29tbXVuaXRpZXMgfCBvcmRlckJ5OlxcJ2FjdGl2aXR5RGF0ZVxcJ1wiPlxcbiAgICAgICAgPHRkIG5nLWJpbmQ9XCJpYS50aXRsZVwiPk5hbWU8L3RkPlxcbiAgICAgICAgPHRkIG5nLWJpbmQ9XCJpYS5sYXN0X2FjdGl2aXR5LnNwbGl0KFxcJy5cXCcpWzBdXCI+PC90ZD5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiaWEuaXRlbXNcIj48L3RkPlxcbiAgICAgICAgPHRkPlxcbiAgICAgICAgICA8c3BhbiBuZy1pZj1cIml0LnN0YXR1cyA9PSBudWxsXCI+ZGVmYXVsdDwvc3Bhbj5cXG4gICAgICAgIDwvdGQ+XFxuICAgICAgICA8dGQ+XFxuICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBudWxsXCI+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNldFN0YXR1cyhpYSwgXFwnY29weVxcJylcIj5Db3B5XFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICA8L3NwYW4+XFxuICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBcXCdjb3B5aW5nXFwnIHx8IGlhLnN0YXR1cyA9PSBcXCdyZXZpZXdpbmdcXCdcIj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2V0U3RhdHVzKGlhLCBcXCdzdG9wXFwnKVwiPlN0b3BcXG4gICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2hvd0xvZyhpYSlcIj5Mb2dcXG4gICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgIDwvc3Bhbj5cXG4gICAgICAgIDwvdGQ+XFxuICAgICAgPC90cj5cXG4gICAgICA8L3Rib2R5PlxcbiAgICA8L3RhYmxlPlxcbiAgPC9kaXY+XFxuXFxuPC9kaXY+XFxuPHNjcmlwdCB0eXBlPVwidGV4dC9uZy10ZW1wbGF0ZVwiIGlkPVwibXlNb2RhbENvbnRlbnQuaHRtbFwiPlxcbiAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxcbiAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IHB1bGwtcmlnaHRcIlxcbiAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5jbG9zZSgpXCI+XFxuICAgICAgPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZS1jaXJjbGVcIj48L2k+XFxuICAgIDwvYnV0dG9uPlxcbiAgICA8aDMgY2xhc3M9XCJtb2RhbC10aXRsZVwiPkxvZzwvaDM+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCIgc3R5bGU9XCJoZWlnaHQ6IDQwMHB4OyBvdmVyZmxvdzogc2Nyb2xsXCI+XFxuICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLXN0cmlwZWRcIj5cXG4gICAgICA8dGJvZHk+XFxuICAgICAgPHRyIG5nLXJlcGVhdD1cImVudHJ5IGluIGN0cmwubG9nRW50cmllc1wiPlxcbiAgICAgICAgPHRkIHdpZHRoPVwiMjAlXCJcXG4gICAgICAgICAgICBuZy1iaW5kPVwiOjplbnRyeS50aW1lc3RhbXBcIj50aW1lc3RhbXAgdGhhdCBpcyBsb25nXFxuICAgICAgICA8L3RkPlxcbiAgICAgICAgPHRkIG5nLWJpbmQ9XCI6OmVudHJ5Lm1zZ1wiPnRoaXMgaXMgd2hlcmUgYSBtZXNzYWdlIHdvdWxkXFxuICAgICAgICAgIGdvIHdpdGggYSBsb3Qgb2Ygc3BhY2VcXG4gICAgICAgIDwvdGQ+XFxuICAgICAgPC90cj5cXG4gICAgICA8L3Rib2R5PlxcbiAgICA8L3RhYmxlPlxcbiAgICA8dWw+XFxuICAgICAgPGxpIG5nLXJlcGVhdD1cIml0ZW0gaW4gY3RybC5pdGVtc1wiPlxcbiAgICAgICAge3sgaXRlbSB9fVxcbiAgICAgIDwvbGk+XFxuICAgIDwvdWw+XFxuICA8L2Rpdj5cXG48L3NjcmlwdD5cXG4nOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXY+XFxuICA8aDE+YWRtaW41IEFkbWluIFNjcmVlbjwvaDE+XFxuXFxuICA8cD5UYWtpbmcgdGhlIHdvcmsgZG9uZSBpbiB0aGUgUGVvcGxlIERpcmVjdG9yeSBDb25maWd1cmF0b3JcXG4gIHRvb2wgYW4gYXBwbHlpbmcgaW4gZ2VuZXJhbGx5IHRvIGFkbWluIGZvciBLQVJMLjwvcD5cXG5cXG48L2Rpdj4nOyJdfQ==
