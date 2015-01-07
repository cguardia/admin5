(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);

angular.module('admin5', ['moondash'])
  .config(require('./mocks').Config);

require('./controllers');
require('./states');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./controllers":2,"./mocks":3,"./states":4}],2:[function(require,module,exports){
function HomeController (resource) {
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
    baseInactives.getList(
      {
        last_activity: this.lastActivity,
        filter: this.filterText
      }
    )
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
                 controllerAs: 'ctrl',
                 resolve: {
                   resource: function (Restangular) {
                     return Restangular.one('api').get();
                   }
                 }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwic3JjL2NvbnRyb2xsZXJzLmpzIiwic3JjL21vY2tzLmpzIiwic3JjL3N0YXRlcy5qcyIsInNyYy90ZW1wbGF0ZXMvYm94X2xpc3QuaHRtbCIsInNyYy90ZW1wbGF0ZXMvaG9tZS5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxVUE7O0FDQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFuZ3VsYXIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5hbmd1bGFyIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5hbmd1bGFyIDogbnVsbCk7XG5cbmFuZ3VsYXIubW9kdWxlKCdhZG1pbjUnLCBbJ21vb25kYXNoJ10pXG4gIC5jb25maWcocmVxdWlyZSgnLi9tb2NrcycpLkNvbmZpZyk7XG5cbnJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcbnJlcXVpcmUoJy4vc3RhdGVzJyk7XG4iLCJmdW5jdGlvbiBIb21lQ29udHJvbGxlciAocmVzb3VyY2UpIHtcbn1cblxuZnVuY3Rpb24gQm94TGlzdENvbnRyb2xsZXIocmVzb3VyY2UsIFJlc3Rhbmd1bGFyLCAkbW9kYWwpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdGhpcy5pbmFjdGl2ZUNvbW11bml0aWVzID0gcmVzb3VyY2U7XG4gIHZhciBiYXNlSW5hY3RpdmVzID0gUmVzdGFuZ3VsYXIuYWxsKCdhcmMyYm94L2NvbW11bml0aWVzJyk7XG5cbiAgLy8gSGFuZGxlIGZpbHRlcnNcbiAgdGhpcy5sYXN0QWN0aXZpdHkgPSA1NDA7XG4gIHRoaXMuZmlsdGVyVGV4dCA9IG51bGw7XG4gIHRoaXMucmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFVzZXIgY2xpY2tlZCB0aGUgXCJPdmVyIDE4IG1vbnRoc1wiIGNoZWNrYm94IG9yIHRoZSBzZWFyY2ggYm94XG4gICAgYmFzZUluYWN0aXZlcy5nZXRMaXN0KFxuICAgICAge1xuICAgICAgICBsYXN0X2FjdGl2aXR5OiB0aGlzLmxhc3RBY3Rpdml0eSxcbiAgICAgICAgZmlsdGVyOiB0aGlzLmZpbHRlclRleHRcbiAgICAgIH1cbiAgICApXG4gICAgICAudGhlbihcbiAgICAgIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgIF90aGlzLmluYWN0aXZlQ29tbXVuaXRpZXMgPSBzdWNjZXNzO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIChmYWlsdXJlKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ2ZhaWx1cmUnLCBmYWlsdXJlKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIHRoaXMuc2V0U3RhdHVzID0gZnVuY3Rpb24gKHRhcmdldCwgc3RhdHVzKSB7XG4gICAgdGFyZ2V0LmN1c3RvbVBPU1Qoe3N0YXR1czogc3RhdHVzfSwgJ3NldFN0YXR1cycpXG4gICAgICAudGhlbihcbiAgICAgIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgIC8vIFVwZGF0ZSB3aXRoIHRoZSByZXR1cm5lZCBzdGF0dXNcbiAgICAgICAgdGFyZ2V0LnN0YXR1cyA9IHN1Y2Nlc3Muc3RhdHVzO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIChmYWlsdXJlKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ2ZhaWxlZCcsIGZhaWx1cmUpO1xuICAgICAgfVxuICAgIClcbiAgfTtcblxuXG4gIHRoaXMuc2hvd0xvZyA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICB2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKFxuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ215TW9kYWxDb250ZW50Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBNb2RhbENvbnRyb2xsZXIsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnLFxuICAgICAgICBzaXplOiAnbGcnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgdGFyZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gTW9kYWxDb250cm9sbGVyKCRtb2RhbEluc3RhbmNlLCB0YXJnZXQsICR0aW1lb3V0LCAkc2NvcGUpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdGhpcy5sb2dFbnRyaWVzID0gW107XG4gIHRoaXMudXBkYXRlTG9nID0gZnVuY3Rpb24gKCkge1xuICAgIHRhcmdldC5jdXN0b21HRVQoJ2xvZ0VudHJpZXMnLCB7fSlcbiAgICAgIC50aGVuKFxuICAgICAgZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgX3RoaXMubG9nRW50cmllcyA9IHN1Y2Nlc3M7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gKGZhaWx1cmUpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnZmFpbHVyZScsIGZhaWx1cmUpO1xuICAgICAgfVxuICAgIClcbiAgfTtcbiAgdGhpcy51cGRhdGVMb2coKTtcblxuICAvLyBOb3cgcG9sbFxuICB2YXIgc2Vjb25kcyA9IDU7XG4gIHZhciB0aW1lciA9ICR0aW1lb3V0KFxuICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgIF90aGlzLnVwZGF0ZUxvZygpO1xuICAgIH0sIHNlY29uZHMgKiAxMDAwXG4gICk7XG4gICRzY29wZS4kb24oXG4gICAgJ2Rlc3Ryb3knLFxuICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lcik7XG4gICAgfSk7XG5cbiAgdGhpcy5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBIb21lQ29udHJvbGxlcjogSG9tZUNvbnRyb2xsZXIsXG4gIE1vZGFsQ29udHJvbGxlcjogTW9kYWxDb250cm9sbGVyLFxuICBCb3hMaXN0Q29udHJvbGxlcjogQm94TGlzdENvbnRyb2xsZXJcbn07IiwidmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbmZ1bmN0aW9uIE1vZHVsZUNvbmZpZyhNZE1vY2tSZXN0UHJvdmlkZXIpIHtcblxuICB2YXIgdXNlTW9ja3MgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuaGFzQ2xhc3MoJ2E1LXVzZS1tb2NrcycpO1xuICBpZiAoIXVzZU1vY2tzKSByZXR1cm47XG5cbiAgdmFyIGNvbW11bml0aWVzID0gW1xuICAgIHtcbiAgICAgIGlkOiAnMScsIG5hbWU6ICdkZWZhdWx0JyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy9kZWZhdWx0JyxcbiAgICAgIHRpdGxlOiAnRGVmYXVsdCBDb21tdW5pdHknLCBsYXN0X2FjdGl2aXR5OiAnMjAxMC8xMS8xOScsXG4gICAgICBpdGVtczogNDcyMywgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzInLCBuYW1lOiAnYW5vdGhlcicsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvYW5vdGhlcicsXG4gICAgICB0aXRsZTogJ0Fub3RoZXIgQ29tbXVuaXR5JywgbGFzdF9hY3Rpdml0eTogJzIwMTEvMDEvMDknLFxuICAgICAgaXRlbXM6IDIzLCBzdGF0dXM6IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnMycsIG5hbWU6ICd0ZXN0aW5nJyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy90ZXN0aW5nJyxcbiAgICAgIHRpdGxlOiAnVGVzdGluZyAxMjMgV2l0aCBBIExvbmcgVGl0bGUgVGhhdCBHb2VzIE9uJyxcbiAgICAgIGxhc3RfYWN0aXZpdHk6ICcyMDEwLzAzLzA0JyxcbiAgICAgIGl0ZW1zOiA3LFxuICAgICAgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzQnLCBuYW1lOiAnYWZyaWNhJyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy9hZnJpY2EnLFxuICAgICAgdGl0bGU6ICdBZnJpY2EuLi5pdCBpcyBiaWcnLCBsYXN0X2FjdGl2aXR5OiAnMjAxNC8wNC8xNicsXG4gICAgICBpdGVtczogOTk5OSwgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzUnLCBuYW1lOiAnbWVyaWNhJyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy9tZXJpY2EnLFxuICAgICAgdGl0bGU6ICdNZXJpY2EnLCBsYXN0X2FjdGl2aXR5OiAnMjAxNC8xMC8wNycsXG4gICAgICBpdGVtczogNTQ4LCBzdGF0dXM6IG51bGxcbiAgICB9XG4gIF07XG5cbiAgdmFyIGluaXRpYWxMb2dFbnRyaWVzID0gW1xuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnU29tZSBtZXNzYWdlJ30sXG4gICAge3RpbWVzdGFtcDogJzIwMTQvMTIvMDEgMDk6MzA6MDEnLCBtc2c6ICcyU29tZSBtZXNzYWdlJ30sXG4gICAge3RpbWVzdGFtcDogJzIwMTQvMTIvMDEgMDk6MzA6MDEnLCBtc2c6ICczU29tZSBtZXNzYWdlJ30sXG4gICAge3RpbWVzdGFtcDogJzIwMTQvMTIvMDEgMDk6MzA6MDEnLCBtc2c6ICc0U29tZSBtZXNzYWdlJ31cbiAgXTtcblxuICBNZE1vY2tSZXN0UHJvdmlkZXIuYWRkTW9ja3MoXG4gICAgJ2JveCcsXG4gICAgW1xuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcGF0dGVybjogL2FyYzJib3hcXC9jb21tdW5pdGllc1xcLyhcXGQrKVxcL3NldFN0YXR1cy8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICAvLyBHaXZlbiAvYXBpL3RvX2FyY2hpdmUvc29tZURvY0lkL3NldFN0YXR1c1xuICAgICAgICAgIC8vIC0gR3JhYiB0aGF0IGNvbW11bml0eVxuICAgICAgICAgIC8vIC0gQ2hhbmdlIGl0cyBzdGF0dXMgdG8gdGhlIHBhc3NlZCBpbiAnc3RhdHVzJyB2YWx1ZVxuICAgICAgICAgIC8vIC0gcmV0dXJuIG9rXG4gICAgICAgICAgdmFyXG4gICAgICAgICAgICB1cmwgPSByZXF1ZXN0LnVybCxcbiAgICAgICAgICAgIGRhdGEgPSByZXF1ZXN0Lmpzb25fYm9keTtcbiAgICAgICAgICB2YXIgaWQgPSB1cmwuc3BsaXQoXCIvXCIpWzNdLFxuICAgICAgICAgICAgdGFyZ2V0ID0gXyhjb21tdW5pdGllcykuZmlyc3Qoe2lkOiBpZH0pLFxuICAgICAgICAgICAgbmV3U3RhdHVzID0gJ3N0b3BwZWQnO1xuICAgICAgICAgIGRhdGEgPSByZXF1ZXN0Lmpzb25fYm9keTtcbiAgICAgICAgICBpZiAoZGF0YS5zdGF0dXMgPT0gJ3N0YXJ0Jykge1xuICAgICAgICAgICAgbmV3U3RhdHVzID0gJ3N0YXJ0ZWQnO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0YXJnZXQuc3RhdHVzID0gbmV3U3RhdHVzO1xuICAgICAgICAgIHJldHVybiBbMjAwLCB7c3RhdHVzOiBuZXdTdGF0dXN9XTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgcGF0dGVybjogL2FyYzJib3hcXC9jb21tdW5pdGllc1xcLyhcXGQrKVxcL2xvZ0VudHJpZXMvLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBFYWNoIHRpbWUgY2FsbGVkLCBtYWtlIHVwIDUgZW50cmllcyBhbmQgcHV0IHRoZW1cbiAgICAgICAgICAvLyBpbiB0aGUgZnJvbnQgb2YgdGhlIGFycmF5LCB0byBzaW11bGF0ZSB0aGUgc2VydmVyXG4gICAgICAgICAgLy8gZ2VuZXJhdGluZyBtb3JlIGxvZyBlbnRyaWVzLlxuICAgICAgICAgIHZhciBub3csIHRpbWVzdGFtcCwgcmFuZDtcbiAgICAgICAgICBfKF8ucmFuZ2UoMTUpKS5mb3JFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICB0aW1lc3RhbXAgPSBub3cudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICAgICAgICAgIHJhbmQgPSBfLnJhbmRvbSgxMDAwLCA5OTk5KTtcbiAgICAgICAgICAgIGluaXRpYWxMb2dFbnRyaWVzLnVuc2hpZnQoXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgICBtc2c6IHJhbmQgKyAnIFNvbWUgbWVzc2FnZSAnICsgdGltZXN0YW1wXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIFsyMDAsIGluaXRpYWxMb2dFbnRyaWVzXTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgcGF0dGVybjogL2FyYzJib3hcXC9jb21tdW5pdGllcy4qJC8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICAvKlxuICAgICAgICAgICBQcm9jZXNzIHR3byBmaWx0ZXJzOlxuICAgICAgICAgICAtIGluYWN0aXZlID09ICd0cnVlJyBvciBvdGhlcndpc2VcbiAgICAgICAgICAgLSBmaWx0ZXJUZXh0LCBsb3dlcmNhc2UgY29tcGFyaXNvblxuICAgICAgICAgICAqL1xuICAgICAgICAgIHZhclxuICAgICAgICAgICAgbGFzdF9hY3Rpdml0eSA9IHBhcnNlSW50KHJlcXVlc3QucXVlcnkubGFzdF9hY3Rpdml0eSksXG4gICAgICAgICAgICBmaWx0ZXIgPSByZXF1ZXN0LnF1ZXJ5LmZpbHRlcjtcblxuICAgICAgICAgIHZhciBmaWx0ZXJlZCA9IF8oY29tbXVuaXRpZXMpLmNsb25lKCk7XG5cbiAgICAgICAgICBpZiAobGFzdF9hY3Rpdml0eSA8IDM2MCkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBfKGNvbW11bml0aWVzKS5maWx0ZXIoXG4gICAgICAgICAgICAgIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0ubGFzdF9hY3Rpdml0eS5pbmRleE9mKCcyMDE0JykgIT0gMDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS52YWx1ZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChmaWx0ZXIpIHtcbiAgICAgICAgICAgIHZhciBmdCA9IGZpbHRlci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBfKGZpbHRlcmVkKS5maWx0ZXIoXG4gICAgICAgICAgICAgIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9yaWcgPSBpdGVtLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZy5pbmRleE9mKGZ0KSA+IC0xO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLnZhbHVlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIFsyMDAsIGZpbHRlcmVkXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0pO1xuXG5cbiAgdmFyIHVzZXIgPSB7XG4gICAgaWQ6ICdhZG1pbicsXG4gICAgZW1haWw6ICdhZG1pbkB4LmNvbScsXG4gICAgZmlyc3RfbmFtZTogJ0FkbWluJyxcbiAgICBsYXN0X25hbWU6ICdMYXN0aWUnLFxuICAgIHR3aXR0ZXI6ICdhZG1pbidcbiAgfTtcblxuXG4gIE1kTW9ja1Jlc3RQcm92aWRlci5hZGRNb2NrcyhcbiAgICAnYXV0aCcsXG4gICAgW1xuICAgICAge1xuICAgICAgICBwYXR0ZXJuOiAvYXBpXFwvYXV0aFxcL21lLyxcbiAgICAgICAgcmVzcG9uc2VEYXRhOiB1c2VyLFxuICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBwYXR0ZXJuOiAvYXBpXFwvYXV0aFxcL2xvZ2luLyxcbiAgICAgICAgcmVzcG9uZGVyOiBmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgICAgICAgIHZhciBkYXRhID0gcmVxdWVzdC5qc29uX2JvZHk7XG4gICAgICAgICAgdmFyIHVuID0gZGF0YS51c2VybmFtZTtcbiAgICAgICAgICB2YXIgcmVzcG9uc2U7XG5cbiAgICAgICAgICBpZiAodW4gPT09ICdhZG1pbicpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0gWzIwNCwge3Rva2VuOiBcIm1vY2t0b2tlblwifV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0gWzQwMSwge1wibWVzc2FnZVwiOiBcIkludmFsaWQgbG9naW4gb3IgcGFzc3dvcmRcIn1dO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0pO1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDb25maWc6IE1vZHVsZUNvbmZpZ1xufTsiLCJcbnZhciBjb250cm9sbGVycyA9IHJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcblxuZnVuY3Rpb24gTW9kdWxlQ29uZmlnKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL2hvbWUnKTtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ3NpdGUnLCB7XG4gICAgICAgICAgICAgcGFyZW50OiAncm9vdCdcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ3NpdGUuaG9tZScsIHtcbiAgICAgICAgICAgICB1cmw6ICcvaG9tZScsXG4gICAgICAgICAgICAgdGl0bGU6ICdIb21lJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2hvbWUuaHRtbCcpLFxuICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVycy5Ib21lQ29udHJvbGxlcixcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnY3RybCcsXG4gICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogZnVuY3Rpb24gKFJlc3Rhbmd1bGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmVzdGFuZ3VsYXIub25lKCdhcGknKS5nZXQoKTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbicsIHtcbiAgICAgICAgICAgICB1cmw6ICcvYWRtaW4nLFxuICAgICAgICAgICAgIHBhcmVudDogJ3NpdGUnLFxuICAgICAgICAgICAgIHRpdGxlOiAnQWRtaW4nXG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5kYXNoYm9hcmQnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2Rhc2hib2FyZCcsXG4gICAgICAgICAgICAgdGl0bGU6ICdBZG1pbiBEYXNoYm9hcmQnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5BZG1pbiBEYXNoYm9hcmQ8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5hcmNoaXZlX2JveCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvYXJjaGl2ZV9ib3gnLFxuICAgICAgICAgICAgIHRpdGxlOiAnQXJjaGl2ZSB0byBCb3gnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvYm94X2xpc3QuaHRtbCcpLFxuICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVycy5Cb3hMaXN0Q29udHJvbGxlcixcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnY3RybCcsXG4gICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogZnVuY3Rpb24gKFJlc3Rhbmd1bGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmVzdGFuZ3VsYXIuYWxsKCdhcmMyYm94L2NvbW11bml0aWVzJylcbiAgICAgICAgICAgICAgICAgICAgICAgLmdldExpc3Qoe2xhc3RfYWN0aXZpdHk6IDU0MH0pO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLnNpdGVhbm5vdW5jZScsIHtcbiAgICAgICAgICAgICB1cmw6ICcvc2l0ZWFubm91bmNlbWVudCcsXG4gICAgICAgICAgICAgdGl0bGU6ICdTaXRlIEFubm91bmNlbWVudCcsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlNpdGUgQW5ub3VuY2VtZW50PC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4ubG9ncycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvbG9ncycsXG4gICAgICAgICAgICAgdGl0bGU6ICdMb2dzJyxcbiAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmxvZ3Muc3lzdGVtX2xvZ3MnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3N5c3RlbV9sb2dzJyxcbiAgICAgICAgICAgICB0aXRsZTogJ1N5c3RlbSBMb2dzJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+U3lzdGVtIExvZ3M8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5sb2dzLmZlZWRfZHVtcCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvZmVlZF9kdW1wJyxcbiAgICAgICAgICAgICB0aXRsZTogJ0ZlZWQgRHVtcCcsXG4gICAgICAgICAgICAgc3Vic2VjdGlvbjoge3NlY3Rpb246ICdhZG1pbi5sb2dzJ30sXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPkZlZWQgRHVtcDwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmxvZ3MubWV0cmljcycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvbWV0cmljcycsXG4gICAgICAgICAgICAgdGl0bGU6ICdNZXRyaWNzJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+TWV0cmljczwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmxvZ3MuZGVidWdfY29udmVydGVycycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvZGVidWdfY29udmVydGVycycsXG4gICAgICAgICAgICAgdGl0bGU6ICdEZWJ1ZyBDb252ZXJ0ZXJzJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+RGVidWcgQ29udmVydGVyczwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcblxuICAgIC5zdGF0ZSgnYWRtaW4uY29udGVudCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvY29udGVudCcsXG4gICAgICAgICAgICAgdGl0bGU6ICdDb250ZW50JyxcbiAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLmNvbnRlbnQubW92ZScsIHtcbiAgICAgICAgICAgICB1cmw6ICcvbW92ZScsXG4gICAgICAgICAgICAgdGl0bGU6ICdNb3ZlJyxcbiAgICAgICAgICAgICBzdWJzZWN0aW9uOiB7c2VjdGlvbjogJ2FkbWluLmNvbnRlbnQnfSxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+TW92ZSBDb250ZW50PC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4uY29udGVudC5kZWxldGUnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2RlbGV0ZScsXG4gICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5EZWxldGUgQ29udGVudDwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcblxuICAgIC5zdGF0ZSgnYWRtaW4ucGVvcGxlJywge1xuICAgICAgICAgICAgIHVybDogJy9wZW9wbGUnLFxuICAgICAgICAgICAgIHRpdGxlOiAnUGVvcGxlJyxcbiAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLnBlb3BsZS5jb25maWcnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2NvbmZpZycsXG4gICAgICAgICAgICAgdGl0bGU6ICdQREMnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5QZW9wbGUgRGlyZWN0b3J5IENvbmZpZ3VyYXRpb248L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5wZW9wbGUudXBsb2FkX2NzdicsIHtcbiAgICAgICAgICAgICB1cmw6ICcvdXBsb2FkX2NzdicsXG4gICAgICAgICAgICAgdGl0bGU6ICdVcGxvYWQgQ1NWJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+VXBsb2FkIENTVjwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLnBlb3BsZS5yZW5hbWVfbWVyZ2UnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3JlbmFtZV9tZXJnZScsXG4gICAgICAgICAgICAgdGl0bGU6ICdSZW5hbWUvTWVyZ2UnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5SZW5hbWUvTWVyZ2U8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5lbWFpbCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvZW1haWwnLFxuICAgICAgICAgICAgIHRpdGxlOiAnRW1haWwnLFxuICAgICAgICAgICAgIHBhcmVudDogJ2FkbWluJ1xuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYWRtaW4uZW1haWwuc2VuZCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvc2VuZCcsXG4gICAgICAgICAgICAgdGl0bGU6ICdTZW5kIHRvIE1lbWJlcnMnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5TZW5kIHRvIE1lbWJlcnM8L2gxPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhZG1pbi5lbWFpbC5xdWFyYW50aW5lJywge1xuICAgICAgICAgICAgIHVybDogJy9xdWFyYW50aW5lJyxcbiAgICAgICAgICAgICB0aXRsZTogJ1ZpZXcgUXVhcmFudGluZScsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlZpZXcgUXVhcmFudGluZTwvaDE+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2FkbWluLnVwZGF0ZV9vZmZpY2VzJywge1xuICAgICAgICAgICAgIHVybDogJy91cGRhdGVfb2ZmaWNlcycsXG4gICAgICAgICAgICAgdGl0bGU6ICdVcGRhdGUgT2ZmaWNlcycsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlVwZGF0ZSBPZmZpY2VzPC9oMT4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxufVxuXG5mdW5jdGlvbiBNb2R1bGVSdW4oUmVzdGFuZ3VsYXIsIE1kQ29uZmlnLCBNZE5hdikge1xuICAvLyBJZiB3ZSBhcmUgdXNpbmcgbW9ja3MsIGRvbid0IHNldCBhIHByZWZpeC4gT3RoZXJ3aXNlLCBzZXQgb25lLlxuICB2YXIgdXNlTW9ja3MgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuaGFzQ2xhc3MoJ2E1LXVzZS1tb2NrcycpO1xuICBpZiAoIXVzZU1vY2tzKSB7XG4gICAgUmVzdGFuZ3VsYXIuc2V0QmFzZVVybCgnaHR0cDovL2xvY2FsaG9zdDo2NTQzJyk7XG4gIH1cblxuXG4gIE1kQ29uZmlnLnNpdGUubmFtZSA9ICdLQVJMIGFkbWluNSc7XG4gIHZhciBzaXRlQ29uZmlnID0ge1xuICAgICdpdGVtcyc6IHtcbiAgICAgICdyb290JzogW1xuICAgICAgICB7XG4gICAgICAgICAgJ2lkJzogJ3NpdGUuaG9tZScsXG4gICAgICAgICAgJ2xhYmVsJzogJ0hvbWUnLFxuICAgICAgICAgICdzdGF0ZSc6ICdzaXRlLmhvbWUnLFxuICAgICAgICAgICdwcmlvcml0eSc6IDFcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgICdhZG1pbic6IHtcbiAgICAgICAgJ2lkJzogJ2Rhc2hib2FyZCcsXG4gICAgICAgICdsYWJlbCc6ICdBZG1pbicsXG4gICAgICAgICdpdGVtcyc6IHtcbiAgICAgICAgICAnYWRtaW4uZGFzaGJvYXJkJzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi5kYXNoYm9hcmQnLFxuICAgICAgICAgICAgbGFiZWw6ICdBZG1pbiBEYXNoYm9hcmQnLFxuICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5kYXNoYm9hcmQnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAnYWRtaW4uYXJjaGl2ZV9ib3gnOiB7XG4gICAgICAgICAgICBpZDogJ2FkbWluLmFyY2hpdmVfYm94JyxcbiAgICAgICAgICAgIGxhYmVsOiAnQXJjaGl2ZSB0byBCb3gnLFxuICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5hcmNoaXZlX2JveCdcbiAgICAgICAgICB9LFxuICAgICAgICAgICdhZG1pbi5zaXRlYW5ub3VuY2UnOiB7XG4gICAgICAgICAgICBpZDogJ2FkbWluLnNpdGVhbm5vdW5jZScsXG4gICAgICAgICAgICBsYWJlbDogJ1NpdGUgQW5ub3VuY2VtZW50JyxcbiAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uc2l0ZWFubm91bmNlJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2FkbWluLmxvZ3MnOiB7XG4gICAgICAgICAgICBpZDogJ2FkbWluLmxvZ3MnLFxuICAgICAgICAgICAgbGFiZWw6ICdMb2dzJyxcbiAgICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICAgICdhZG1pbi5sb2dzLnN5c3RlbV9sb2dzJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5zeXN0ZW1fbG9ncycsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdTeXN0ZW0gTG9ncycsXG4gICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5sb2dzLnN5c3RlbV9sb2dzJ1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAnYWRtaW4ubG9ncy5mZWVkX2R1bXAnOiB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzLmZlZWRfZHVtcCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdGZWVkIER1bXAnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ubG9ncy5mZWVkX2R1bXAnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdhZG1pbi5sb2dzLm1ldHJpY3MnOiB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzLm1ldHJpY3MnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnTWV0cmljcycsXG4gICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5sb2dzLm1ldHJpY3MnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdhZG1pbi5sb2dzLmRlYnVnX2NvbnZlcnRlcnMnOiB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzLmRlYnVnX2NvbnZlcnRlcnMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVidWcgQ29udmVydGVycycsXG4gICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5sb2dzLmRlYnVnX2NvbnZlcnRlcnMnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICdhZG1pbi5jb250ZW50Jzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi5jb250ZW50JyxcbiAgICAgICAgICAgIGxhYmVsOiAnQ29udGVudCcsXG4gICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAnYWRtaW4uY29udGVudC5tb3ZlJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uY29udGVudC5tb3ZlJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ01vdmUnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uY29udGVudC5tb3ZlJ1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAnYWRtaW4uY29udGVudC5kZWxldGUnOiB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5jb250ZW50LmRlbGV0ZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uY29udGVudC5kZWxldGUnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICdhZG1pbi5wZW9wbGUnOiB7XG4gICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZScsXG4gICAgICAgICAgICBsYWJlbDogJ1Blb3BsZScsXG4gICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAnYWRtaW4ucGVvcGxlLmNvbmZpZyc6IHtcbiAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZS5jb25maWcnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnUERDJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnBlb3BsZS5jb25maWcnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdhZG1pbi5wZW9wbGUudXBsb2FkX2Nzdic6IHtcbiAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZS51cGxvYWRfY3N2JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1VwbG9hZCBDU1YnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ucGVvcGxlLnVwbG9hZF9jc3YnXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdhZG1pbi5wZW9wbGUucmVuYW1lX21lcmdlJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ucGVvcGxlLnJlbmFtZV9tZXJnZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdSZW5hbWUvTWVyZ2UnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ucGVvcGxlLnJlbmFtZV9tZXJnZSdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2FkbWluLmVtYWlsJzoge1xuICAgICAgICAgICAgaWQ6ICdhZG1pbi5lbWFpbCcsXG4gICAgICAgICAgICBsYWJlbDogJ0VtYWlsJyxcbiAgICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICAgICdhZG1pbi5lbWFpbC5zZW5kJzoge1xuICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uZW1haWwuc2VuZCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdTZW5kIHRvIE1lbWJlcnMnLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uZW1haWwuc2VuZCdcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2FkbWluLmVtYWlsLnF1YXJhbnRpbmUnOiB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5lbWFpbC5xdWFyYW50aW5lJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1ZpZXcgUXVhcmFudGluZScsXG4gICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5lbWFpbC5xdWFyYW50aW5lJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnYWRtaW4udXBkYXRlX29mZmljZXMnOiB7XG4gICAgICAgICAgICBpZDogJ2FkbWluLnVwZGF0ZV9vZmZpY2VzJyxcbiAgICAgICAgICAgIGxhYmVsOiAnVXBkYXRlIE9mZmljZXMnLFxuICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi51cGRhdGVfb2ZmaWNlcydcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIE1kTmF2LmluaXQoc2l0ZUNvbmZpZyk7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdhZG1pbjUnKVxuICAuY29uZmlnKE1vZHVsZUNvbmZpZylcbiAgLnJ1bihNb2R1bGVSdW4pOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgY2xhc3M9XCJyb3dcIj5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMTBcIj5cXG4gICAgPGgxPkFyY2hpdmUgdG8gQm94PC9oMT5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC0xXCI+XFxuICAgIDxidXR0b24gaWQ9XCJyZWxvYWRcIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBidG4tc21cIlxcbiAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5yZWxvYWQoKVwiXFxuICAgICAgICA+XFxuICAgICAgUmVsb2FkXFxuICAgIDwvYnV0dG9uPlxcbiAgPC9kaXY+XFxuPC9kaXY+XFxuXFxuPGRpdiBjbGFzcz1cInJvd1wiPlxcblxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC0yXCI+XFxuXFxuICAgIDxoNSBjbGFzcz1cInRleHQtbXV0ZWRcIj5GaWx0ZXJzPC9oNT5cXG5cXG4gICAgPGZvcm0gbmFtZT1cImZpbHRlcnNcIiBuZy1zdWJtaXQ9XCJjdHJsLnJlbG9hZCgpXCJcXG4gICAgICAgICAgY2xhc3M9XCJmb3JtLWhvcml6b25hbFwiIHJvbGU9XCJmb3JtXCI+XFxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cXG4gICAgICAgIDxpbnB1dCBpZD1cImxhc3RBY3Rpdml0eVwiXFxuICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbCBpbnB1dC14c1wiXFxuICAgICAgICAgICAgICAgbmctbW9kZWw9XCJjdHJsLmxhc3RBY3Rpdml0eVwiXFxuICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJUaXRsZSBjb250YWlucy4uLlwiPiBkYXlzXFxuICAgICAgPC9kaXY+XFxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cXG4gICAgICAgIDxpbnB1dCBpZD1cImZpbHRlclRleHRcIlxcbiAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQteHNcIlxcbiAgICAgICAgICAgICAgIG5nLW1vZGVsPVwiY3RybC5maWx0ZXJUZXh0XCJcXG4gICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlRpdGxlIGNvbnRhaW5zLi4uXCI+XFxuICAgICAgPC9kaXY+XFxuICAgICAgPGlucHV0IGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgbmctY2xpY2s9XCJjdHJsLnJlbG9hZCgpXCJcXG4gICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPVwiRmlsdGVyXCIvPlxcbiAgICA8L2Zvcm0+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMTBcIj5cXG4gICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtc3RyaXBlZFwiPlxcbiAgICAgIDx0aGVhZD5cXG4gICAgICA8dGg+TmFtZTwvdGg+XFxuICAgICAgPHRoPkFjdGl2aXR5IERhdGU8L3RoPlxcbiAgICAgIDx0aD5JdGVtczwvdGg+XFxuICAgICAgPHRoIHdpZHRoPVwiOTBcIj5BY3Rpb248L3RoPlxcbiAgICAgIDwvdGhlYWQ+XFxuICAgICAgPHRib2R5PlxcbiAgICAgIDx0clxcbiAgICAgICAgICBuZy1yZXBlYXQ9XCJpYSBpbiBjdHJsLmluYWN0aXZlQ29tbXVuaXRpZXMgfCBvcmRlckJ5OlxcJ2FjdGl2aXR5RGF0ZVxcJ1wiPlxcbiAgICAgICAgPHRkIG5nLWJpbmQ9XCJpYS50aXRsZVwiPk5hbWU8L3RkPlxcbiAgICAgICAgPHRkIG5nLWJpbmQ9XCJpYS5sYXN0X2FjdGl2aXR5LnNwbGl0KFxcJy5cXCcpWzBdXCI+PC90ZD5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiaWEuaXRlbXNcIj48L3RkPlxcbiAgICAgICAgPHRkPlxcbiAgICAgICAgPHNwYW4gbmctaWY9XCJpYS5zdGF0dXMgPT0gXFwnc3RhcnRlZFxcJ1wiPlxcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2V0U3RhdHVzKGlhLCBcXCdzdG9wXFwnKVwiPlN0b3BcXG4gICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2hvd0xvZyhpYSlcIj5Mb2dcXG4gICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgPHNwYW4gbmctaWY9XCJpYS5zdGF0dXMgIT0gXFwnc3RhcnRlZFxcJ1wiPlxcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2V0U3RhdHVzKGlhLCBcXCdzdGFydFxcJylcIj5TdGFydFxcbiAgICAgICAgPC9idXR0b24+XFxuICAgICAgICA8L3NwYW4+XFxuICAgICAgICA8L3RkPlxcbiAgICAgIDwvdHI+XFxuICAgICAgPC90Ym9keT5cXG4gICAgPC90YWJsZT5cXG4gIDwvZGl2PlxcblxcbjwvZGl2PlxcbjxzY3JpcHQgdHlwZT1cInRleHQvbmctdGVtcGxhdGVcIiBpZD1cIm15TW9kYWxDb250ZW50Lmh0bWxcIj5cXG4gIDxkaXYgY2xhc3M9XCJtb2RhbC1oZWFkZXJcIj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBwdWxsLXJpZ2h0XCJcXG4gICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuY2xvc2UoKVwiPlxcbiAgICAgIDxpIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUtY2lyY2xlXCI+PC9pPlxcbiAgICA8L2J1dHRvbj5cXG4gICAgPGgzIGNsYXNzPVwibW9kYWwtdGl0bGVcIj5Mb2c8L2gzPlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVwibW9kYWwtYm9keVwiIHN0eWxlPVwiaGVpZ2h0OiA0MDBweDsgb3ZlcmZsb3c6IHNjcm9sbFwiPlxcbiAgICA8dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1zdHJpcGVkXCI+XFxuICAgICAgPHRib2R5PlxcbiAgICAgIDx0ciBuZy1yZXBlYXQ9XCJlbnRyeSBpbiBjdHJsLmxvZ0VudHJpZXNcIj5cXG4gICAgICAgIDx0ZCB3aWR0aD1cIjIwJVwiXFxuICAgICAgICAgICAgbmctYmluZD1cIjo6ZW50cnkudGltZXN0YW1wXCI+dGltZXN0YW1wIHRoYXQgaXMgbG9uZ1xcbiAgICAgICAgPC90ZD5cXG4gICAgICAgIDx0ZCBuZy1iaW5kPVwiOjplbnRyeS5tc2dcIj50aGlzIGlzIHdoZXJlIGEgbWVzc2FnZSB3b3VsZFxcbiAgICAgICAgICBnbyB3aXRoIGEgbG90IG9mIHNwYWNlXFxuICAgICAgICA8L3RkPlxcbiAgICAgIDwvdHI+XFxuICAgICAgPC90Ym9keT5cXG4gICAgPC90YWJsZT5cXG4gICAgPHVsPlxcbiAgICAgIDxsaSBuZy1yZXBlYXQ9XCJpdGVtIGluIGN0cmwuaXRlbXNcIj5cXG4gICAgICAgIHt7IGl0ZW0gfX1cXG4gICAgICA8L2xpPlxcbiAgICA8L3VsPlxcbiAgPC9kaXY+XFxuPC9zY3JpcHQ+XFxuJzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2PlxcbiAgPGgxPmFkbWluNSBBZG1pbiBTY3JlZW48L2gxPlxcblxcbiAgPHA+VGFraW5nIHRoZSB3b3JrIGRvbmUgaW4gdGhlIFBlb3BsZSBEaXJlY3RvcnkgQ29uZmlndXJhdG9yXFxuICB0b29sIGFuIGFwcGx5aW5nIGluIGdlbmVyYWxseSB0byBhZG1pbiBmb3IgS0FSTC48L3A+XFxuXFxuPC9kaXY+JzsiXX0=
