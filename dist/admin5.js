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

function BoxListController(resource, Restangular, $modal) {
  var _this = this;
  this.inactiveCommunities = resource;
  var baseInactives = Restangular.all('arc2box/communities');

  // Handle filters
  this.lastActivity = 540;
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
    console.log('params 329', params);
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
                   resource: function (Restangular) {
                     return Restangular.all('arc2box/communities')
                       .getList({last_activity: 540});
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
module.exports = '<div class="row">\n  <div class="col-md-10">\n    <h1>Archive to Box</h1>\n  </div>\n  <div class="col-md-1">\n    <button id="reload" class="btn btn-default btn-sm"\n            ng-click="ctrl.reload()"\n        >\n      Reload\n    </button>\n  </div>\n</div>\n\n<div class="row">\n\n  <div class="col-md-2">\n\n    <h5 class="text-muted">Filters</h5>\n\n    <form name="filters" ng-submit="ctrl.reload()"\n          class="form-horizonal" role="form">\n      <div class="form-group">\n        <input id="lastActivity"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.lastActivity"\n               placeholder="Title contains..."> days\n      </div>\n      <div class="form-group">\n        <input id="filterText"\n               type="text" class="form-control input-xs"\n               ng-model="ctrl.filterText"\n               placeholder="Title contains...">\n      </div>\n      <input class="btn btn-primary" ng-click="ctrl.reload()"\n             type="submit" value="Filter"/>\n    </form>\n  </div>\n  <div class="col-md-10">\n    <table class="table table-striped">\n      <thead>\n      <th>Name</th>\n      <th>Activity Date</th>\n      <th>Items</th>\n      <th width="90">Action</th>\n      </thead>\n      <tbody>\n      <tr\n          ng-repeat="ia in ctrl.inactiveCommunities | orderBy:\'activityDate\'">\n        <td ng-bind="ia.title">Name</td>\n        <td ng-bind="ia.last_activity.split(\'.\')[0]"></td>\n        <td ng-bind="ia.items"></td>\n        <td>\n        <span ng-if="ia.status == \'started\'">\n        <button class="btn btn-xs btn-primary"\n                ng-click="ctrl.setStatus(ia, \'stop\')">Stop\n        </button>\n        <button class="btn btn-xs btn-primary"\n                ng-click="ctrl.showLog(ia)">Log\n        </button>\n        </span>\n        <span ng-if="ia.status != \'started\'">\n        <button class="btn btn-xs btn-primary"\n                ng-click="ctrl.setStatus(ia, \'start\')">Start\n        </button>\n        </span>\n        </td>\n      </tr>\n      </tbody>\n    </table>\n  </div>\n\n</div>\n<script type="text/ng-template" id="myModalContent.html">\n  <div class="modal-header">\n    <button class="btn btn-default pull-right"\n            ng-click="ctrl.close()">\n      <i class="glyphicon glyphicon-remove-circle"></i>\n    </button>\n    <h3 class="modal-title">Log</h3>\n  </div>\n  <div class="modal-body" style="height: 400px; overflow: scroll">\n    <table class="table table-striped">\n      <tbody>\n      <tr ng-repeat="entry in ctrl.logEntries">\n        <td width="20%"\n            ng-bind="::entry.timestamp">timestamp that is long\n        </td>\n        <td ng-bind="::entry.msg">this is where a message would\n          go with a lot of space\n        </td>\n      </tr>\n      </tbody>\n    </table>\n    <ul>\n      <li ng-repeat="item in ctrl.items">\n        {{ item }}\n      </li>\n    </ul>\n  </div>\n</script>\n';
},{}],6:[function(require,module,exports){
module.exports = '<div>\n  <h1>admin5 Admin Screen</h1>\n\n  <p>Taking the work done in the People Directory Configurator\n  tool an applying in generally to admin for KARL.</p>\n\n</div>';
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwic3JjL2NvbnRyb2xsZXJzLmpzIiwic3JjL21vY2tzLmpzIiwic3JjL3N0YXRlcy5qcyIsInNyYy90ZW1wbGF0ZXMvYm94X2xpc3QuaHRtbCIsInNyYy90ZW1wbGF0ZXMvaG9tZS5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDL0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclVBOztBQ0FBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBhbmd1bGFyID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuYW5ndWxhciA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuYW5ndWxhciA6IG51bGwpO1xuXG5hbmd1bGFyLm1vZHVsZSgnYWRtaW41JywgWydtb29uZGFzaCddKVxuICAuY29uZmlnKHJlcXVpcmUoJy4vbW9ja3MnKS5Db25maWcpO1xuXG5yZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5yZXF1aXJlKCcuL3N0YXRlcycpO1xuIiwiZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoKSB7XG59XG5cbmZ1bmN0aW9uIEJveExpc3RDb250cm9sbGVyKHJlc291cmNlLCBSZXN0YW5ndWxhciwgJG1vZGFsKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHRoaXMuaW5hY3RpdmVDb21tdW5pdGllcyA9IHJlc291cmNlO1xuICB2YXIgYmFzZUluYWN0aXZlcyA9IFJlc3Rhbmd1bGFyLmFsbCgnYXJjMmJveC9jb21tdW5pdGllcycpO1xuXG4gIC8vIEhhbmRsZSBmaWx0ZXJzXG4gIHRoaXMubGFzdEFjdGl2aXR5ID0gNTQwO1xuICB0aGlzLmZpbHRlclRleHQgPSBudWxsO1xuICB0aGlzLnJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBVc2VyIGNsaWNrZWQgdGhlIFwiT3ZlciAxOCBtb250aHNcIiBjaGVja2JveCBvciB0aGUgc2VhcmNoIGJveFxuICAgIHZhciBwYXJhbXMgPSB7fTtcbiAgICAvLyBPbmx5IHNlbmQgcXVlcnkgc3RyaW5nIHBhcmFtZXRlcnMgaWYgdGhleSBhcmUgbm90IG51bGxcbiAgICBpZiAodGhpcy5sYXN0QWN0aXZpdHkpIHtcbiAgICAgIHBhcmFtcy5sYXN0X2FjdGl2aXR5ID0gdGhpcy5sYXN0QWN0aXZpdHk7XG4gICAgfVxuICAgIGlmICh0aGlzLmZpbHRlclRleHQpIHtcbiAgICAgIHBhcmFtcy5maWx0ZXIgPSB0aGlzLmZpbHRlclRleHQ7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdwYXJhbXMgMzI5JywgcGFyYW1zKTtcbiAgICBiYXNlSW5hY3RpdmVzLmdldExpc3QocGFyYW1zKVxuICAgICAgLnRoZW4oXG4gICAgICBmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICBfdGhpcy5pbmFjdGl2ZUNvbW11bml0aWVzID0gc3VjY2VzcztcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiAoZmFpbHVyZSkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdmYWlsdXJlJywgZmFpbHVyZSk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuICB0aGlzLnNldFN0YXR1cyA9IGZ1bmN0aW9uICh0YXJnZXQsIHN0YXR1cykge1xuICAgIHRhcmdldC5jdXN0b21QT1NUKHtzdGF0dXM6IHN0YXR1c30sICdzZXRTdGF0dXMnKVxuICAgICAgLnRoZW4oXG4gICAgICBmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAvLyBVcGRhdGUgd2l0aCB0aGUgcmV0dXJuZWQgc3RhdHVzXG4gICAgICAgIHRhcmdldC5zdGF0dXMgPSBzdWNjZXNzLnN0YXR1cztcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiAoZmFpbHVyZSkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdmYWlsZWQnLCBmYWlsdXJlKTtcbiAgICAgIH1cbiAgICApXG4gIH07XG5cblxuICB0aGlzLnNob3dMb2cgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3BlbihcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdteU1vZGFsQ29udGVudC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogTW9kYWxDb250cm9sbGVyLFxuICAgICAgICBjb250cm9sbGVyQXM6ICdjdHJsJyxcbiAgICAgICAgc2l6ZTogJ2xnJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIHRhcmdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIE1vZGFsQ29udHJvbGxlcigkbW9kYWxJbnN0YW5jZSwgdGFyZ2V0LCAkdGltZW91dCwgJHNjb3BlKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHRoaXMubG9nRW50cmllcyA9IFtdO1xuICB0aGlzLnVwZGF0ZUxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0YXJnZXQuY3VzdG9tR0VUKCdsb2dFbnRyaWVzJywge30pXG4gICAgICAudGhlbihcbiAgICAgIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgIF90aGlzLmxvZ0VudHJpZXMgPSBzdWNjZXNzO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIChmYWlsdXJlKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ2ZhaWx1cmUnLCBmYWlsdXJlKTtcbiAgICAgIH1cbiAgICApXG4gIH07XG4gIHRoaXMudXBkYXRlTG9nKCk7XG5cbiAgLy8gTm93IHBvbGxcbiAgdmFyIHNlY29uZHMgPSA1O1xuICB2YXIgdGltZXIgPSAkdGltZW91dChcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpcy51cGRhdGVMb2coKTtcbiAgICB9LCBzZWNvbmRzICogMTAwMFxuICApO1xuICAkc2NvcGUuJG9uKFxuICAgICdkZXN0cm95JyxcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAkdGltZW91dC5jYW5jZWwodGltZXIpO1xuICAgIH0pO1xuXG4gIHRoaXMuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgSG9tZUNvbnRyb2xsZXI6IEhvbWVDb250cm9sbGVyLFxuICBNb2RhbENvbnRyb2xsZXI6IE1vZGFsQ29udHJvbGxlcixcbiAgQm94TGlzdENvbnRyb2xsZXI6IEJveExpc3RDb250cm9sbGVyXG59OyIsInZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5mdW5jdGlvbiBNb2R1bGVDb25maWcoTWRNb2NrUmVzdFByb3ZpZGVyKSB7XG5cbiAgdmFyIHVzZU1vY2tzID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmhhc0NsYXNzKCdhNS11c2UtbW9ja3MnKTtcbiAgaWYgKCF1c2VNb2NrcykgcmV0dXJuO1xuXG4gIHZhciBjb21tdW5pdGllcyA9IFtcbiAgICB7XG4gICAgICBpZDogJzEnLCBuYW1lOiAnZGVmYXVsdCcsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvZGVmYXVsdCcsXG4gICAgICB0aXRsZTogJ0RlZmF1bHQgQ29tbXVuaXR5JywgbGFzdF9hY3Rpdml0eTogJzIwMTAvMTEvMTknLFxuICAgICAgaXRlbXM6IDQ3MjMsIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICcyJywgbmFtZTogJ2Fub3RoZXInLFxuICAgICAgdXJsOiAnL2NvbW11bml0aWVzL2Fub3RoZXInLFxuICAgICAgdGl0bGU6ICdBbm90aGVyIENvbW11bml0eScsIGxhc3RfYWN0aXZpdHk6ICcyMDExLzAxLzA5JyxcbiAgICAgIGl0ZW1zOiAyMywgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzMnLCBuYW1lOiAndGVzdGluZycsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvdGVzdGluZycsXG4gICAgICB0aXRsZTogJ1Rlc3RpbmcgMTIzIFdpdGggQSBMb25nIFRpdGxlIFRoYXQgR29lcyBPbicsXG4gICAgICBsYXN0X2FjdGl2aXR5OiAnMjAxMC8wMy8wNCcsXG4gICAgICBpdGVtczogNyxcbiAgICAgIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICc0JywgbmFtZTogJ2FmcmljYScsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvYWZyaWNhJyxcbiAgICAgIHRpdGxlOiAnQWZyaWNhLi4uaXQgaXMgYmlnJywgbGFzdF9hY3Rpdml0eTogJzIwMTQvMDQvMTYnLFxuICAgICAgaXRlbXM6IDk5OTksIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICc1JywgbmFtZTogJ21lcmljYScsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvbWVyaWNhJyxcbiAgICAgIHRpdGxlOiAnTWVyaWNhJywgbGFzdF9hY3Rpdml0eTogJzIwMTQvMTAvMDcnLFxuICAgICAgaXRlbXM6IDU0OCwgc3RhdHVzOiBudWxsXG4gICAgfVxuICBdO1xuXG4gIHZhciBpbml0aWFsTG9nRW50cmllcyA9IFtcbiAgICB7dGltZXN0YW1wOiAnMjAxNC8xMi8wMSAwOTozMDowMScsIG1zZzogJ1NvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnMlNvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnM1NvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnNFNvbWUgbWVzc2FnZSd9XG4gIF07XG5cbiAgTWRNb2NrUmVzdFByb3ZpZGVyLmFkZE1vY2tzKFxuICAgICdib3gnLFxuICAgIFtcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXNcXC8oXFxkKylcXC9zZXRTdGF0dXMvLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAgICAgLy8gR2l2ZW4gL2FwaS90b19hcmNoaXZlL3NvbWVEb2NJZC9zZXRTdGF0dXNcbiAgICAgICAgICAvLyAtIEdyYWIgdGhhdCBjb21tdW5pdHlcbiAgICAgICAgICAvLyAtIENoYW5nZSBpdHMgc3RhdHVzIHRvIHRoZSBwYXNzZWQgaW4gJ3N0YXR1cycgdmFsdWVcbiAgICAgICAgICAvLyAtIHJldHVybiBva1xuICAgICAgICAgIHZhclxuICAgICAgICAgICAgdXJsID0gcmVxdWVzdC51cmwsXG4gICAgICAgICAgICBkYXRhID0gcmVxdWVzdC5qc29uX2JvZHk7XG4gICAgICAgICAgdmFyIGlkID0gdXJsLnNwbGl0KFwiL1wiKVszXSxcbiAgICAgICAgICAgIHRhcmdldCA9IF8oY29tbXVuaXRpZXMpLmZpcnN0KHtpZDogaWR9KSxcbiAgICAgICAgICAgIG5ld1N0YXR1cyA9ICdzdG9wcGVkJztcbiAgICAgICAgICBkYXRhID0gcmVxdWVzdC5qc29uX2JvZHk7XG4gICAgICAgICAgaWYgKGRhdGEuc3RhdHVzID09ICdzdGFydCcpIHtcbiAgICAgICAgICAgIG5ld1N0YXR1cyA9ICdzdGFydGVkJztcbiAgICAgICAgICB9XG4gICAgICAgICAgdGFyZ2V0LnN0YXR1cyA9IG5ld1N0YXR1cztcbiAgICAgICAgICByZXR1cm4gWzIwMCwge3N0YXR1czogbmV3U3RhdHVzfV07XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXNcXC8oXFxkKylcXC9sb2dFbnRyaWVzLyxcbiAgICAgICAgcmVzcG9uZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gRWFjaCB0aW1lIGNhbGxlZCwgbWFrZSB1cCA1IGVudHJpZXMgYW5kIHB1dCB0aGVtXG4gICAgICAgICAgLy8gaW4gdGhlIGZyb250IG9mIHRoZSBhcnJheSwgdG8gc2ltdWxhdGUgdGhlIHNlcnZlclxuICAgICAgICAgIC8vIGdlbmVyYXRpbmcgbW9yZSBsb2cgZW50cmllcy5cbiAgICAgICAgICB2YXIgbm93LCB0aW1lc3RhbXAsIHJhbmQ7XG4gICAgICAgICAgXyhfLnJhbmdlKDE1KSkuZm9yRWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgdGltZXN0YW1wID0gbm93LnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICAgICAgICByYW5kID0gXy5yYW5kb20oMTAwMCwgOTk5OSk7XG4gICAgICAgICAgICBpbml0aWFsTG9nRW50cmllcy51bnNoaWZ0KFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgbXNnOiByYW5kICsgJyBTb21lIG1lc3NhZ2UgJyArIHRpbWVzdGFtcFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBbMjAwLCBpbml0aWFsTG9nRW50cmllc107XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXMuKiQvLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAgICAgLypcbiAgICAgICAgICAgUHJvY2VzcyB0d28gZmlsdGVyczpcbiAgICAgICAgICAgLSBpbmFjdGl2ZSA9PSAndHJ1ZScgb3Igb3RoZXJ3aXNlXG4gICAgICAgICAgIC0gZmlsdGVyVGV4dCwgbG93ZXJjYXNlIGNvbXBhcmlzb25cbiAgICAgICAgICAgKi9cbiAgICAgICAgICB2YXJcbiAgICAgICAgICAgIGxhc3RfYWN0aXZpdHkgPSBwYXJzZUludChyZXF1ZXN0LnF1ZXJ5Lmxhc3RfYWN0aXZpdHkpLFxuICAgICAgICAgICAgZmlsdGVyID0gcmVxdWVzdC5xdWVyeS5maWx0ZXI7XG5cbiAgICAgICAgICB2YXIgZmlsdGVyZWQgPSBfKGNvbW11bml0aWVzKS5jbG9uZSgpO1xuXG4gICAgICAgICAgaWYgKGxhc3RfYWN0aXZpdHkgPCAzNjApIHtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gXyhjb21tdW5pdGllcykuZmlsdGVyKFxuICAgICAgICAgICAgICBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmxhc3RfYWN0aXZpdHkuaW5kZXhPZignMjAxNCcpICE9IDA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkudmFsdWUoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZmlsdGVyKSB7XG4gICAgICAgICAgICB2YXIgZnQgPSBmaWx0ZXIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gXyhmaWx0ZXJlZCkuZmlsdGVyKFxuICAgICAgICAgICAgICBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBvcmlnID0gaXRlbS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWcuaW5kZXhPZihmdCkgPiAtMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS52YWx1ZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBbMjAwLCBmaWx0ZXJlZF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdKTtcblxuXG4gIHZhciB1c2VyID0ge1xuICAgIGlkOiAnYWRtaW4nLFxuICAgIGVtYWlsOiAnYWRtaW5AeC5jb20nLFxuICAgIGZpcnN0X25hbWU6ICdBZG1pbicsXG4gICAgbGFzdF9uYW1lOiAnTGFzdGllJyxcbiAgICB0d2l0dGVyOiAnYWRtaW4nXG4gIH07XG5cblxuICBNZE1vY2tSZXN0UHJvdmlkZXIuYWRkTW9ja3MoXG4gICAgJ2F1dGgnLFxuICAgIFtcbiAgICAgIHtcbiAgICAgICAgcGF0dGVybjogL2FwaVxcL2F1dGhcXC9tZS8sXG4gICAgICAgIHJlc3BvbnNlRGF0YTogdXNlcixcbiAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcGF0dGVybjogL2FwaVxcL2F1dGhcXC9sb2dpbi8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICB2YXIgZGF0YSA9IHJlcXVlc3QuanNvbl9ib2R5O1xuICAgICAgICAgIHZhciB1biA9IGRhdGEudXNlcm5hbWU7XG4gICAgICAgICAgdmFyIHJlc3BvbnNlO1xuXG4gICAgICAgICAgaWYgKHVuID09PSAnYWRtaW4nKSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IFsyMDQsIHt0b2tlbjogXCJtb2NrdG9rZW5cIn1dO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IFs0MDEsIHtcIm1lc3NhZ2VcIjogXCJJbnZhbGlkIGxvZ2luIG9yIHBhc3N3b3JkXCJ9XTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ29uZmlnOiBNb2R1bGVDb25maWdcbn07IiwiXG52YXIgY29udHJvbGxlcnMgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5cbmZ1bmN0aW9uIE1vZHVsZUNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9ob21lJyk7XG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdzaXRlJywge1xuICAgICAgICAgICAgIHBhcmVudDogJ3Jvb3QnXG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdzaXRlLmhvbWUnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2hvbWUnLFxuICAgICAgICAgICAgIHRpdGxlOiAnSG9tZScsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9ob21lLmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuSG9tZUNvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4nLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2FkbWluJyxcbiAgICAgICAgICAgICBwYXJlbnQ6ICdzaXRlJyxcbiAgICAgICAgICAgICB0aXRsZTogJ0FkbWluJ1xuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4uZGFzaGJvYXJkJywge1xuICAgICAgICAgICAgIHVybDogJy9kYXNoYm9hcmQnLFxuICAgICAgICAgICAgIHRpdGxlOiAnQWRtaW4gRGFzaGJvYXJkJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+QWRtaW4gRGFzaGJvYXJkPC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4uYXJjaGl2ZV9ib3gnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2FyY2hpdmVfYm94JyxcbiAgICAgICAgICAgICB0aXRsZTogJ0FyY2hpdmUgdG8gQm94JyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2JveF9saXN0Lmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuQm94TGlzdENvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnLFxuICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IGZ1bmN0aW9uIChSZXN0YW5ndWxhcikge1xuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFJlc3Rhbmd1bGFyLmFsbCgnYXJjMmJveC9jb21tdW5pdGllcycpXG4gICAgICAgICAgICAgICAgICAgICAgIC5nZXRMaXN0KHtsYXN0X2FjdGl2aXR5OiA1NDB9KTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5zaXRlYW5ub3VuY2UnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3NpdGVhbm5vdW5jZW1lbnQnLFxuICAgICAgICAgICAgIHRpdGxlOiAnU2l0ZSBBbm5vdW5jZW1lbnQnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5TaXRlIEFubm91bmNlbWVudDwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmxvZ3MnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2xvZ3MnLFxuICAgICAgICAgICAgIHRpdGxlOiAnTG9ncycsXG4gICAgICAgICAgICAgcGFyZW50OiAnYWRtaW4nXG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5sb2dzLnN5c3RlbV9sb2dzJywge1xuICAgICAgICAgICAgIHVybDogJy9zeXN0ZW1fbG9ncycsXG4gICAgICAgICAgICAgdGl0bGU6ICdTeXN0ZW0gTG9ncycsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlN5c3RlbSBMb2dzPC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4ubG9ncy5mZWVkX2R1bXAnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2ZlZWRfZHVtcCcsXG4gICAgICAgICAgICAgdGl0bGU6ICdGZWVkIER1bXAnLFxuICAgICAgICAgICAgIHN1YnNlY3Rpb246IHtzZWN0aW9uOiAnYWRtaW4ubG9ncyd9LFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5GZWVkIER1bXA8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5sb2dzLm1ldHJpY3MnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL21ldHJpY3MnLFxuICAgICAgICAgICAgIHRpdGxlOiAnTWV0cmljcycsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPk1ldHJpY3M8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5sb2dzLmRlYnVnX2NvbnZlcnRlcnMnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2RlYnVnX2NvbnZlcnRlcnMnLFxuICAgICAgICAgICAgIHRpdGxlOiAnRGVidWcgQ29udmVydGVycycsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPkRlYnVnIENvbnZlcnRlcnM8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG5cbiAgICAuc3RhdGUoJ2FkbWluLmNvbnRlbnQnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2NvbnRlbnQnLFxuICAgICAgICAgICAgIHRpdGxlOiAnQ29udGVudCcsXG4gICAgICAgICAgICAgcGFyZW50OiAnYWRtaW4nXG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5jb250ZW50Lm1vdmUnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL21vdmUnLFxuICAgICAgICAgICAgIHRpdGxlOiAnTW92ZScsXG4gICAgICAgICAgICAgc3Vic2VjdGlvbjoge3NlY3Rpb246ICdhZG1pbi5jb250ZW50J30sXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPk1vdmUgQ29udGVudDwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmNvbnRlbnQuZGVsZXRlJywge1xuICAgICAgICAgICAgIHVybDogJy9kZWxldGUnLFxuICAgICAgICAgICAgIHRpdGxlOiAnRGVsZXRlJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+RGVsZXRlIENvbnRlbnQ8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG5cbiAgICAuc3RhdGUoJ2FkbWluLnBlb3BsZScsIHtcbiAgICAgICAgICAgICB1cmw6ICcvcGVvcGxlJyxcbiAgICAgICAgICAgICB0aXRsZTogJ1Blb3BsZScsXG4gICAgICAgICAgICAgcGFyZW50OiAnYWRtaW4nXG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5wZW9wbGUuY29uZmlnJywge1xuICAgICAgICAgICAgIHVybDogJy9jb25maWcnLFxuICAgICAgICAgICAgIHRpdGxlOiAnUERDJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+UGVvcGxlIERpcmVjdG9yeSBDb25maWd1cmF0aW9uPC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4ucGVvcGxlLnVwbG9hZF9jc3YnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3VwbG9hZF9jc3YnLFxuICAgICAgICAgICAgIHRpdGxlOiAnVXBsb2FkIENTVicsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlVwbG9hZCBDU1Y8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5wZW9wbGUucmVuYW1lX21lcmdlJywge1xuICAgICAgICAgICAgIHVybDogJy9yZW5hbWVfbWVyZ2UnLFxuICAgICAgICAgICAgIHRpdGxlOiAnUmVuYW1lL01lcmdlJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+UmVuYW1lL01lcmdlPC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4uZW1haWwnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2VtYWlsJyxcbiAgICAgICAgICAgICB0aXRsZTogJ0VtYWlsJyxcbiAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmVtYWlsLnNlbmQnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3NlbmQnLFxuICAgICAgICAgICAgIHRpdGxlOiAnU2VuZCB0byBNZW1iZXJzJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+U2VuZCB0byBNZW1iZXJzPC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4uZW1haWwucXVhcmFudGluZScsIHtcbiAgICAgICAgICAgICB1cmw6ICcvcXVhcmFudGluZScsXG4gICAgICAgICAgICAgdGl0bGU6ICdWaWV3IFF1YXJhbnRpbmUnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5WaWV3IFF1YXJhbnRpbmU8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi51cGRhdGVfb2ZmaWNlcycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvdXBkYXRlX29mZmljZXMnLFxuICAgICAgICAgICAgIHRpdGxlOiAnVXBkYXRlIE9mZmljZXMnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5VcGRhdGUgT2ZmaWNlczwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbn1cblxuZnVuY3Rpb24gTW9kdWxlUnVuKFJlc3Rhbmd1bGFyLCBNZENvbmZpZywgTWROYXYpIHtcbiAgLy8gSWYgd2UgYXJlIHVzaW5nIG1vY2tzLCBkb24ndCBzZXQgYSBwcmVmaXguIE90aGVyd2lzZSwgc2V0IG9uZS5cbiAgdmFyIHVzZU1vY2tzID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmhhc0NsYXNzKCdhNS11c2UtbW9ja3MnKTtcbiAgaWYgKCF1c2VNb2Nrcykge1xuICAgIFJlc3Rhbmd1bGFyLnNldEJhc2VVcmwoJ2h0dHA6Ly9sb2NhbGhvc3Q6NjU0MycpO1xuICB9XG5cblxuICBNZENvbmZpZy5zaXRlLm5hbWUgPSAnS0FSTCBhZG1pbjUnO1xuICB2YXIgc2l0ZUNvbmZpZyA9IHtcbiAgICAnaXRlbXMnOiB7XG4gICAgICAncm9vdCc6IFtcbiAgICAgICAge1xuICAgICAgICAgICdpZCc6ICdzaXRlLmhvbWUnLFxuICAgICAgICAgICdsYWJlbCc6ICdIb21lJyxcbiAgICAgICAgICAnc3RhdGUnOiAnc2l0ZS5ob21lJyxcbiAgICAgICAgICAncHJpb3JpdHknOiAxXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICAnYWRtaW4nOiB7XG4gICAgICAgICdpZCc6ICdkYXNoYm9hcmQnLFxuICAgICAgICAnbGFiZWwnOiAnQWRtaW4nLFxuICAgICAgICAnaXRlbXMnOiB7XG4gICAgICAgICAgJ2FkbWluLmRhc2hib2FyZCc6IHtcbiAgICAgICAgICAgIGlkOiAnYWRtaW4uZGFzaGJvYXJkJyxcbiAgICAgICAgICAgIGxhYmVsOiAnQWRtaW4gRGFzaGJvYXJkJyxcbiAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uZGFzaGJvYXJkJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2FkbWluLmFyY2hpdmVfYm94Jzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi5hcmNoaXZlX2JveCcsXG4gICAgICAgICAgICBsYWJlbDogJ0FyY2hpdmUgdG8gQm94JyxcbiAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uYXJjaGl2ZV9ib3gnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAnYWRtaW4uc2l0ZWFubm91bmNlJzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi5zaXRlYW5ub3VuY2UnLFxuICAgICAgICAgICAgbGFiZWw6ICdTaXRlIEFubm91bmNlbWVudCcsXG4gICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnNpdGVhbm5vdW5jZSdcbiAgICAgICAgICB9LFxuICAgICAgICAgICdhZG1pbi5sb2dzJzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzJyxcbiAgICAgICAgICAgIGxhYmVsOiAnTG9ncycsXG4gICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAnYWRtaW4ubG9ncy5zeXN0ZW1fbG9ncyc6IHtcbiAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmxvZ3Muc3lzdGVtX2xvZ3MnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnU3lzdGVtIExvZ3MnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ubG9ncy5zeXN0ZW1fbG9ncydcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2FkbWluLmxvZ3MuZmVlZF9kdW1wJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5mZWVkX2R1bXAnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnRmVlZCBEdW1wJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmxvZ3MuZmVlZF9kdW1wJ1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAnYWRtaW4ubG9ncy5tZXRyaWNzJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5tZXRyaWNzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ01ldHJpY3MnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ubG9ncy5tZXRyaWNzJ1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAnYWRtaW4ubG9ncy5kZWJ1Z19jb252ZXJ0ZXJzJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5kZWJ1Z19jb252ZXJ0ZXJzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0RlYnVnIENvbnZlcnRlcnMnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ubG9ncy5kZWJ1Z19jb252ZXJ0ZXJzJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnYWRtaW4uY29udGVudCc6IHtcbiAgICAgICAgICAgIGlkOiAnYWRtaW4uY29udGVudCcsXG4gICAgICAgICAgICBsYWJlbDogJ0NvbnRlbnQnLFxuICAgICAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICAgICAgJ2FkbWluLmNvbnRlbnQubW92ZSc6IHtcbiAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmNvbnRlbnQubW92ZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdNb3ZlJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmNvbnRlbnQubW92ZSdcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2FkbWluLmNvbnRlbnQuZGVsZXRlJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uY29udGVudC5kZWxldGUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmNvbnRlbnQuZGVsZXRlJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnYWRtaW4ucGVvcGxlJzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi5wZW9wbGUnLFxuICAgICAgICAgICAgbGFiZWw6ICdQZW9wbGUnLFxuICAgICAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICAgICAgJ2FkbWluLnBlb3BsZS5jb25maWcnOiB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5wZW9wbGUuY29uZmlnJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1BEQycsXG4gICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5wZW9wbGUuY29uZmlnJ1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAnYWRtaW4ucGVvcGxlLnVwbG9hZF9jc3YnOiB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5wZW9wbGUudXBsb2FkX2NzdicsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdVcGxvYWQgQ1NWJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnBlb3BsZS51cGxvYWRfY3N2J1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAnYWRtaW4ucGVvcGxlLnJlbmFtZV9tZXJnZSc6IHtcbiAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZS5yZW5hbWVfbWVyZ2UnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnUmVuYW1lL01lcmdlJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnBlb3BsZS5yZW5hbWVfbWVyZ2UnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICdhZG1pbi5lbWFpbCc6IHtcbiAgICAgICAgICAgIGlkOiAnYWRtaW4uZW1haWwnLFxuICAgICAgICAgICAgbGFiZWw6ICdFbWFpbCcsXG4gICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAnYWRtaW4uZW1haWwuc2VuZCc6IHtcbiAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmVtYWlsLnNlbmQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnU2VuZCB0byBNZW1iZXJzJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmVtYWlsLnNlbmQnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdhZG1pbi5lbWFpbC5xdWFyYW50aW5lJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uZW1haWwucXVhcmFudGluZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdWaWV3IFF1YXJhbnRpbmUnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uZW1haWwucXVhcmFudGluZSdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2FkbWluLnVwZGF0ZV9vZmZpY2VzJzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi51cGRhdGVfb2ZmaWNlcycsXG4gICAgICAgICAgICBsYWJlbDogJ1VwZGF0ZSBPZmZpY2VzJyxcbiAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4udXBkYXRlX29mZmljZXMnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBNZE5hdi5pbml0KHNpdGVDb25maWcpO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgnYWRtaW41JylcbiAgLmNvbmZpZyhNb2R1bGVDb25maWcpXG4gIC5ydW4oTW9kdWxlUnVuKTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwicm93XCI+XFxuICA8ZGl2IGNsYXNzPVwiY29sLW1kLTEwXCI+XFxuICAgIDxoMT5BcmNoaXZlIHRvIEJveDwvaDE+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMVwiPlxcbiAgICA8YnV0dG9uIGlkPVwicmVsb2FkXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtXCJcXG4gICAgICAgICAgICBuZy1jbGljaz1cImN0cmwucmVsb2FkKClcIlxcbiAgICAgICAgPlxcbiAgICAgIFJlbG9hZFxcbiAgICA8L2J1dHRvbj5cXG4gIDwvZGl2PlxcbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9XCJyb3dcIj5cXG5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMlwiPlxcblxcbiAgICA8aDUgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+RmlsdGVyczwvaDU+XFxuXFxuICAgIDxmb3JtIG5hbWU9XCJmaWx0ZXJzXCIgbmctc3VibWl0PVwiY3RybC5yZWxvYWQoKVwiXFxuICAgICAgICAgIGNsYXNzPVwiZm9ybS1ob3Jpem9uYWxcIiByb2xlPVwiZm9ybVwiPlxcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XFxuICAgICAgICA8aW5wdXQgaWQ9XCJsYXN0QWN0aXZpdHlcIlxcbiAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQteHNcIlxcbiAgICAgICAgICAgICAgIG5nLW1vZGVsPVwiY3RybC5sYXN0QWN0aXZpdHlcIlxcbiAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiVGl0bGUgY29udGFpbnMuLi5cIj4gZGF5c1xcbiAgICAgIDwvZGl2PlxcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XFxuICAgICAgICA8aW5wdXQgaWQ9XCJmaWx0ZXJUZXh0XCJcXG4gICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sIGlucHV0LXhzXCJcXG4gICAgICAgICAgICAgICBuZy1tb2RlbD1cImN0cmwuZmlsdGVyVGV4dFwiXFxuICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJUaXRsZSBjb250YWlucy4uLlwiPlxcbiAgICAgIDwvZGl2PlxcbiAgICAgIDxpbnB1dCBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiIG5nLWNsaWNrPVwiY3RybC5yZWxvYWQoKVwiXFxuICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIiB2YWx1ZT1cIkZpbHRlclwiLz5cXG4gICAgPC9mb3JtPlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVwiY29sLW1kLTEwXCI+XFxuICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLXN0cmlwZWRcIj5cXG4gICAgICA8dGhlYWQ+XFxuICAgICAgPHRoPk5hbWU8L3RoPlxcbiAgICAgIDx0aD5BY3Rpdml0eSBEYXRlPC90aD5cXG4gICAgICA8dGg+SXRlbXM8L3RoPlxcbiAgICAgIDx0aCB3aWR0aD1cIjkwXCI+QWN0aW9uPC90aD5cXG4gICAgICA8L3RoZWFkPlxcbiAgICAgIDx0Ym9keT5cXG4gICAgICA8dHJcXG4gICAgICAgICAgbmctcmVwZWF0PVwiaWEgaW4gY3RybC5pbmFjdGl2ZUNvbW11bml0aWVzIHwgb3JkZXJCeTpcXCdhY3Rpdml0eURhdGVcXCdcIj5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiaWEudGl0bGVcIj5OYW1lPC90ZD5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiaWEubGFzdF9hY3Rpdml0eS5zcGxpdChcXCcuXFwnKVswXVwiPjwvdGQ+XFxuICAgICAgICA8dGQgbmctYmluZD1cImlhLml0ZW1zXCI+PC90ZD5cXG4gICAgICAgIDx0ZD5cXG4gICAgICAgIDxzcGFuIG5nLWlmPVwiaWEuc3RhdHVzID09IFxcJ3N0YXJ0ZWRcXCdcIj5cXG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNldFN0YXR1cyhpYSwgXFwnc3RvcFxcJylcIj5TdG9wXFxuICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNob3dMb2coaWEpXCI+TG9nXFxuICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgIDwvc3Bhbj5cXG4gICAgICAgIDxzcGFuIG5nLWlmPVwiaWEuc3RhdHVzICE9IFxcJ3N0YXJ0ZWRcXCdcIj5cXG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNldFN0YXR1cyhpYSwgXFwnc3RhcnRcXCcpXCI+U3RhcnRcXG4gICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgPC90ZD5cXG4gICAgICA8L3RyPlxcbiAgICAgIDwvdGJvZHk+XFxuICAgIDwvdGFibGU+XFxuICA8L2Rpdj5cXG5cXG48L2Rpdj5cXG48c2NyaXB0IHR5cGU9XCJ0ZXh0L25nLXRlbXBsYXRlXCIgaWQ9XCJteU1vZGFsQ29udGVudC5odG1sXCI+XFxuICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XFxuICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgcHVsbC1yaWdodFwiXFxuICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLmNsb3NlKClcIj5cXG4gICAgICA8aSBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlLWNpcmNsZVwiPjwvaT5cXG4gICAgPC9idXR0b24+XFxuICAgIDxoMyBjbGFzcz1cIm1vZGFsLXRpdGxlXCI+TG9nPC9oMz5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cIm1vZGFsLWJvZHlcIiBzdHlsZT1cImhlaWdodDogNDAwcHg7IG92ZXJmbG93OiBzY3JvbGxcIj5cXG4gICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtc3RyaXBlZFwiPlxcbiAgICAgIDx0Ym9keT5cXG4gICAgICA8dHIgbmctcmVwZWF0PVwiZW50cnkgaW4gY3RybC5sb2dFbnRyaWVzXCI+XFxuICAgICAgICA8dGQgd2lkdGg9XCIyMCVcIlxcbiAgICAgICAgICAgIG5nLWJpbmQ9XCI6OmVudHJ5LnRpbWVzdGFtcFwiPnRpbWVzdGFtcCB0aGF0IGlzIGxvbmdcXG4gICAgICAgIDwvdGQ+XFxuICAgICAgICA8dGQgbmctYmluZD1cIjo6ZW50cnkubXNnXCI+dGhpcyBpcyB3aGVyZSBhIG1lc3NhZ2Ugd291bGRcXG4gICAgICAgICAgZ28gd2l0aCBhIGxvdCBvZiBzcGFjZVxcbiAgICAgICAgPC90ZD5cXG4gICAgICA8L3RyPlxcbiAgICAgIDwvdGJvZHk+XFxuICAgIDwvdGFibGU+XFxuICAgIDx1bD5cXG4gICAgICA8bGkgbmctcmVwZWF0PVwiaXRlbSBpbiBjdHJsLml0ZW1zXCI+XFxuICAgICAgICB7eyBpdGVtIH19XFxuICAgICAgPC9saT5cXG4gICAgPC91bD5cXG4gIDwvZGl2Plxcbjwvc2NyaXB0Plxcbic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdj5cXG4gIDxoMT5hZG1pbjUgQWRtaW4gU2NyZWVuPC9oMT5cXG5cXG4gIDxwPlRha2luZyB0aGUgd29yayBkb25lIGluIHRoZSBQZW9wbGUgRGlyZWN0b3J5IENvbmZpZ3VyYXRvclxcbiAgdG9vbCBhbiBhcHBseWluZyBpbiBnZW5lcmFsbHkgdG8gYWRtaW4gZm9yIEtBUkwuPC9wPlxcblxcbjwvZGl2Pic7Il19
