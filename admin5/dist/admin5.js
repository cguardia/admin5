(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

angular.module('admin5', ['moondash'])
  .config(require('./mocks').Config);

require('./controllers');
require('./states');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbInZhciBhbmd1bGFyID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2FuZ3VsYXInXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2FuZ3VsYXInXSA6IG51bGwpO1xuXG5hbmd1bGFyLm1vZHVsZSgnYWRtaW41JywgWydtb29uZGFzaCddKVxuICAuY29uZmlnKHJlcXVpcmUoJy4vbW9ja3MnKS5Db25maWcpO1xuXG5yZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5yZXF1aXJlKCcuL3N0YXRlcycpO1xuIl19
},{"./controllers":2,"./mocks":3,"./states":4}],2:[function(require,module,exports){
function HomeController () {
}

function BoxLoginController ($stateParams) {
    this.loginUrl = $stateParams.url;
}

function BoxListController (Restangular, $modal, $http) {
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

    this.clearExceptions = function () {
        var url = '/arc2box/clear_exceptions';
        $http.post(url)
            .success(
                function () {
                    console.debug('clear exceptions');
                    _this.reload();
                })
            .error(
                function (error) {
                    console.debug('clear exceptions error', error);
                }
            );
        return false;
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

function ModalController ($modalInstance, target, $http) {
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
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2Nrcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsidmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG5cbmZ1bmN0aW9uIE1vZHVsZUNvbmZpZyhNZE1vY2tSZXN0UHJvdmlkZXIpIHtcblxuICB2YXIgdXNlTW9ja3MgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuaGFzQ2xhc3MoJ2E1LXVzZS1tb2NrcycpO1xuICBpZiAoIXVzZU1vY2tzKSByZXR1cm47XG5cbiAgdmFyIGNvbW11bml0aWVzID0gW1xuICAgIHtcbiAgICAgIGlkOiAnMScsIG5hbWU6ICdkZWZhdWx0JyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy9kZWZhdWx0JyxcbiAgICAgIHRpdGxlOiAnRGVmYXVsdCBDb21tdW5pdHknLCBsYXN0X2FjdGl2aXR5OiAnMjAxMC8xMS8xOScsXG4gICAgICBpdGVtczogNDcyMywgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzInLCBuYW1lOiAnYW5vdGhlcicsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvYW5vdGhlcicsXG4gICAgICB0aXRsZTogJ0Fub3RoZXIgQ29tbXVuaXR5JywgbGFzdF9hY3Rpdml0eTogJzIwMTEvMDEvMDknLFxuICAgICAgaXRlbXM6IDIzLCBzdGF0dXM6IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnMycsIG5hbWU6ICd0ZXN0aW5nJyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy90ZXN0aW5nJyxcbiAgICAgIHRpdGxlOiAnVGVzdGluZyAxMjMgV2l0aCBBIExvbmcgVGl0bGUgVGhhdCBHb2VzIE9uJyxcbiAgICAgIGxhc3RfYWN0aXZpdHk6ICcyMDEwLzAzLzA0JyxcbiAgICAgIGl0ZW1zOiA3LFxuICAgICAgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzQnLCBuYW1lOiAnYWZyaWNhJyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy9hZnJpY2EnLFxuICAgICAgdGl0bGU6ICdBZnJpY2EuLi5pdCBpcyBiaWcnLCBsYXN0X2FjdGl2aXR5OiAnMjAxNC8wNC8xNicsXG4gICAgICBpdGVtczogOTk5OSwgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzUnLCBuYW1lOiAnbWVyaWNhJyxcbiAgICAgIHVybDogJy9jb21tdW5pdGllcy9tZXJpY2EnLFxuICAgICAgdGl0bGU6ICdNZXJpY2EnLCBsYXN0X2FjdGl2aXR5OiAnMjAxNC8xMC8wNycsXG4gICAgICBpdGVtczogNTQ4LCBzdGF0dXM6IG51bGxcbiAgICB9XG4gIF07XG5cbiAgdmFyIGluaXRpYWxMb2dFbnRyaWVzID0gW1xuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnU29tZSBtZXNzYWdlJ30sXG4gICAge3RpbWVzdGFtcDogJzIwMTQvMTIvMDEgMDk6MzA6MDEnLCBtc2c6ICcyU29tZSBtZXNzYWdlJ30sXG4gICAge3RpbWVzdGFtcDogJzIwMTQvMTIvMDEgMDk6MzA6MDEnLCBtc2c6ICczU29tZSBtZXNzYWdlJ30sXG4gICAge3RpbWVzdGFtcDogJzIwMTQvMTIvMDEgMDk6MzA6MDEnLCBtc2c6ICc0U29tZSBtZXNzYWdlJ31cbiAgXTtcblxuICBNZE1vY2tSZXN0UHJvdmlkZXIuYWRkTW9ja3MoXG4gICAgJ2JveCcsXG4gICAgW1xuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcGF0dGVybjogL2FyYzJib3hcXC9jb21tdW5pdGllc1xcLyhcXGQrKVxcL3NldFN0YXR1cy8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICAvLyBHaXZlbiAvYXBpL3RvX2FyY2hpdmUvc29tZURvY0lkL3NldFN0YXR1c1xuICAgICAgICAgIC8vIC0gR3JhYiB0aGF0IGNvbW11bml0eVxuICAgICAgICAgIC8vIC0gQ2hhbmdlIGl0cyBzdGF0dXMgdG8gdGhlIHBhc3NlZCBpbiAnc3RhdHVzJyB2YWx1ZVxuICAgICAgICAgIC8vIC0gcmV0dXJuIG9rXG4gICAgICAgICAgdmFyXG4gICAgICAgICAgICB1cmwgPSByZXF1ZXN0LnVybCxcbiAgICAgICAgICAgIGRhdGEgPSByZXF1ZXN0Lmpzb25fYm9keTtcbiAgICAgICAgICB2YXIgaWQgPSB1cmwuc3BsaXQoXCIvXCIpWzNdLFxuICAgICAgICAgICAgdGFyZ2V0ID0gXyhjb21tdW5pdGllcykuZmlyc3Qoe2lkOiBpZH0pLFxuICAgICAgICAgICAgbmV3U3RhdHVzID0gJ3N0b3BwZWQnO1xuICAgICAgICAgIGRhdGEgPSByZXF1ZXN0Lmpzb25fYm9keTtcbiAgICAgICAgICBpZiAoZGF0YS5zdGF0dXMgPT0gJ3N0YXJ0Jykge1xuICAgICAgICAgICAgbmV3U3RhdHVzID0gJ3N0YXJ0ZWQnO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0YXJnZXQuc3RhdHVzID0gbmV3U3RhdHVzO1xuICAgICAgICAgIHJldHVybiBbMjAwLCB7c3RhdHVzOiBuZXdTdGF0dXN9XTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgcGF0dGVybjogL2FyYzJib3hcXC9jb21tdW5pdGllc1xcLyhcXGQrKVxcL2xvZ0VudHJpZXMvLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBFYWNoIHRpbWUgY2FsbGVkLCBtYWtlIHVwIDUgZW50cmllcyBhbmQgcHV0IHRoZW1cbiAgICAgICAgICAvLyBpbiB0aGUgZnJvbnQgb2YgdGhlIGFycmF5LCB0byBzaW11bGF0ZSB0aGUgc2VydmVyXG4gICAgICAgICAgLy8gZ2VuZXJhdGluZyBtb3JlIGxvZyBlbnRyaWVzLlxuICAgICAgICAgIHZhciBub3csIHRpbWVzdGFtcCwgcmFuZDtcbiAgICAgICAgICBfKF8ucmFuZ2UoMTUpKS5mb3JFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICB0aW1lc3RhbXAgPSBub3cudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICAgICAgICAgIHJhbmQgPSBfLnJhbmRvbSgxMDAwLCA5OTk5KTtcbiAgICAgICAgICAgIGluaXRpYWxMb2dFbnRyaWVzLnVuc2hpZnQoXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgICBtc2c6IHJhbmQgKyAnIFNvbWUgbWVzc2FnZSAnICsgdGltZXN0YW1wXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIFsyMDAsIGluaXRpYWxMb2dFbnRyaWVzXTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgcGF0dGVybjogL2FyYzJib3hcXC9jb21tdW5pdGllcy4qJC8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICAvKlxuICAgICAgICAgICBQcm9jZXNzIHR3byBmaWx0ZXJzOlxuICAgICAgICAgICAtIGluYWN0aXZlID09ICd0cnVlJyBvciBvdGhlcndpc2VcbiAgICAgICAgICAgLSBmaWx0ZXJUZXh0LCBsb3dlcmNhc2UgY29tcGFyaXNvblxuICAgICAgICAgICAqL1xuICAgICAgICAgIHZhclxuICAgICAgICAgICAgbGFzdF9hY3Rpdml0eSA9IHBhcnNlSW50KHJlcXVlc3QucXVlcnkubGFzdF9hY3Rpdml0eSksXG4gICAgICAgICAgICBmaWx0ZXIgPSByZXF1ZXN0LnF1ZXJ5LmZpbHRlcjtcblxuICAgICAgICAgIHZhciBmaWx0ZXJlZCA9IF8oY29tbXVuaXRpZXMpLmNsb25lKCk7XG5cbiAgICAgICAgICBpZiAobGFzdF9hY3Rpdml0eSA8IDM2MCkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBfKGNvbW11bml0aWVzKS5maWx0ZXIoXG4gICAgICAgICAgICAgIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0ubGFzdF9hY3Rpdml0eS5pbmRleE9mKCcyMDE0JykgIT0gMDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS52YWx1ZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChmaWx0ZXIpIHtcbiAgICAgICAgICAgIHZhciBmdCA9IGZpbHRlci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBfKGZpbHRlcmVkKS5maWx0ZXIoXG4gICAgICAgICAgICAgIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9yaWcgPSBpdGVtLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZy5pbmRleE9mKGZ0KSA+IC0xO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLnZhbHVlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIFsyMDAsIGZpbHRlcmVkXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0pO1xuXG5cbiAgdmFyIHVzZXIgPSB7XG4gICAgaWQ6ICdhZG1pbicsXG4gICAgZW1haWw6ICdhZG1pbkB4LmNvbScsXG4gICAgZmlyc3RfbmFtZTogJ0FkbWluJyxcbiAgICBsYXN0X25hbWU6ICdMYXN0aWUnLFxuICAgIHR3aXR0ZXI6ICdhZG1pbidcbiAgfTtcblxuXG4gIE1kTW9ja1Jlc3RQcm92aWRlci5hZGRNb2NrcyhcbiAgICAnYXV0aCcsXG4gICAgW1xuICAgICAge1xuICAgICAgICBwYXR0ZXJuOiAvYXBpXFwvYXV0aFxcL21lLyxcbiAgICAgICAgcmVzcG9uc2VEYXRhOiB1c2VyLFxuICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBwYXR0ZXJuOiAvYXBpXFwvYXV0aFxcL2xvZ2luLyxcbiAgICAgICAgcmVzcG9uZGVyOiBmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgICAgICAgIHZhciBkYXRhID0gcmVxdWVzdC5qc29uX2JvZHk7XG4gICAgICAgICAgdmFyIHVuID0gZGF0YS51c2VybmFtZTtcbiAgICAgICAgICB2YXIgcmVzcG9uc2U7XG5cbiAgICAgICAgICBpZiAodW4gPT09ICdhZG1pbicpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0gWzIwNCwge3Rva2VuOiBcIm1vY2t0b2tlblwifV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0gWzQwMSwge1wibWVzc2FnZVwiOiBcIkludmFsaWQgbG9naW4gb3IgcGFzc3dvcmRcIn1dO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0pO1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDb25maWc6IE1vZHVsZUNvbmZpZ1xufTsiXX0=
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
module.exports = '<div class="row">\n    <div class="col-md-10">\n        <h1>Archive to Box</h1>\n    </div>\n</div>\n\n<div class="row">\n\n    <div class="col-md-2">\n\n        <h5 class="text-muted">Filters</h5>\n\n        <form name="filters" ng-submit="ctrl.reload()"\n              class="form-horizonal" role="form">\n            <div class="form-group">\n                <input id="lastActivity"\n                       type="text" class="form-control input-xs"\n                       ng-model="ctrl.lastActivity"\n                       placeholder="Activity..."> days\n            </div>\n            <div class="form-group">\n                <input id="filterText"\n                       type="text" class="form-control input-xs"\n                       ng-model="ctrl.filterText"\n                       placeholder="Title contains...">\n            </div>\n            <div class="form-group">\n\n                <input id="limit"\n                       type="text" class="form-control input-xs"\n                       ng-model="ctrl.limit"\n                       placeholder="Limit..."> items\n            </div>\n            <div>\n                <button id="filter" class="btn btn-primary"\n                        type="submit">\n            <span ng-hide="ctrl.isSubmitting">\n              Filter\n            </span>\n                    <span ng-show="ctrl.isSubmitting">\n                <i class="fa fa-spinner fa-spin"></i>\n            </span>\n                </button>\n            </div>\n        </form>\n        <div style="margin-top: 2em">\n            <button id="clear_exceptions" class="btn"\n                    ng-click="ctrl.clearExceptions()">\n                Clear Exceptions\n            </button>\n\n        </div>\n    </div>\n    <div class="col-md-10">\n        <div ng-if="ctrl.isLoading()">\n            <em>Loading inactive communities...</em>\n        </div>\n        <div ng-if="ctrl.inactiveCommunities.length==0">\n            <em>No communities matching those criteria</em>\n        </div>\n        <table class="table table-striped"\n               ng-if="ctrl.inactiveCommunities.length>0">\n            <thead>\n            <th>Title</th>\n            <th>Activity Date</th>\n            <th>Items</th>\n            <th width="110">Status</th>\n            <th width="160">Action</th>\n            </thead>\n            <tbody>\n            <tr\n                    ng-repeat="ia in ctrl.inactiveCommunities | orderBy:\'activityDate\'">\n                <td>\n                    <a ng-href="/communities/{{ia.name}}"\n                       ng-bind="ia.title">Title</a>\n                </td>\n                <td ng-bind="ia.last_activity.split(\'.\')[0]"></td>\n                <td ng-bind="ia.items"></td>\n                <td>\n                    <span ng-if="ia.status == null">default</span>\n                    <span ng-if="ia.status != null"\n                          ng-bind="ia.status">default</span>\n                </td>\n                <td>\n        <span ng-if="ia.status == null">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'copy\')">Copy\n            </button>\n        </span>\n                    <span ng-if="ia.status == \'copying\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'stop\')">Stop\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n                    <span ng-if="ia.status == \'reviewing\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'mothball\')">Mothball\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.setStatus(ia, \'stop\')">Stop\n            </button>\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n                    <span ng-if="ia.status == \'removing\'">\n            <button class="btn btn-xs btn-primary"\n                    ng-click="ctrl.showLog(ia)">Log\n            </button>\n        </span>\n                </td>\n            </tr>\n            </tbody>\n        </table>\n    </div>\n\n</div>\n<script type="text/ng-template" id="myModalContent.html">\n    <div class="modal-header">\n        <button class="btn btn-default pull-right"\n                ng-click="ctrl.close()">\n            <i class="glyphicon glyphicon-remove-circle"></i>\n        </button>\n        <h3 class="modal-title">Log</h3>\n    </div>\n    <div class="modal-body" style="height: 400px; overflow: scroll">\n        <table class="table table-striped">\n            <tbody>\n            <tr ng-repeat="entry in ctrl.logEntries">\n                <td width="20%"\n                    ng-bind="::entry.timestamp.split(\'.\')[0]">timestamp that is\n                    long\n                </td>\n                <td ng-bind="::entry.level"></td>\n                <td ng-bind="::entry.message">this is where a message would\n                    go with a lot of space\n                </td>\n            </tr>\n            </tbody>\n        </table>\n        <ul>\n            <li ng-repeat="item in ctrl.items">\n                {{ item }}\n            </li>\n        </ul>\n    </div>\n</script>\n';
},{}],6:[function(require,module,exports){
module.exports = '<div class="row">\n  <div class="col-md-10">\n    <h1>Box Login</h1>\n  </div>\n  <div class="col-md-8">\n    <p>Either you have never logged KARL into Box, or the token Box\n      last gave you is now expired or invalid. Please click the\n      button below to log KARL back into Box.</p>\n\n    <div ng-if="ctrl.loginUrl">\n      <a\n          class="btn btn-primary btn-lg"\n          href="{{ctrl.loginUrl}}">\n        Login\n      </a>\n    </div>\n    <div ng-if="!ctrl.loginUrl" class="alert alert-warning">\n      You don\'t have a Box URL for logging in. This likely happened\n      due to a reload of this page. Click on <code>Archive to\n      Box</code> to correct.\n    </div>\n  </div>\n</div>';
},{}],7:[function(require,module,exports){
module.exports = '<div>\n  <h1>admin5 Admin Screen</h1>\n\n  <p>Taking the work done in the People Directory Configurator\n  tool an applying in generally to admin for KARL.</p>\n\n</div>';
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwic3JjL2NvbnRyb2xsZXJzLmpzIiwic3JjL21vY2tzLmpzIiwic3JjL3N0YXRlcy5qcyIsInNyYy90ZW1wbGF0ZXMvYm94X2xpc3QuaHRtbCIsInNyYy90ZW1wbGF0ZXMvYm94X2xvZ2luLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hvbWUuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsV0E7O0FDQUE7O0FDQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xudmFyIGFuZ3VsYXIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snYW5ndWxhciddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnYW5ndWxhciddIDogbnVsbCk7XG5cbmFuZ3VsYXIubW9kdWxlKCdhZG1pbjUnLCBbJ21vb25kYXNoJ10pXG4gIC5jb25maWcocmVxdWlyZSgnLi9tb2NrcycpLkNvbmZpZyk7XG5cbnJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcbnJlcXVpcmUoJy4vc3RhdGVzJyk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW5OeVl5OXRiMlIxYkdVdWFuTWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEVpTENKbWFXeGxJam9pWjJWdVpYSmhkR1ZrTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYkluWmhjaUJoYm1kMWJHRnlJRDBnS0hSNWNHVnZaaUIzYVc1a2IzY2dJVDA5SUZ3aWRXNWtaV1pwYm1Wa1hDSWdQeUIzYVc1a2IzZGJKMkZ1WjNWc1lYSW5YU0E2SUhSNWNHVnZaaUJuYkc5aVlXd2dJVDA5SUZ3aWRXNWtaV1pwYm1Wa1hDSWdQeUJuYkc5aVlXeGJKMkZ1WjNWc1lYSW5YU0E2SUc1MWJHd3BPMXh1WEc1aGJtZDFiR0Z5TG0xdlpIVnNaU2duWVdSdGFXNDFKeXdnV3lkdGIyOXVaR0Z6YUNkZEtWeHVJQ0F1WTI5dVptbG5LSEpsY1hWcGNtVW9KeTR2Ylc5amEzTW5LUzVEYjI1bWFXY3BPMXh1WEc1eVpYRjFhWEpsS0NjdUwyTnZiblJ5YjJ4c1pYSnpKeWs3WEc1eVpYRjFhWEpsS0NjdUwzTjBZWFJsY3ljcE8xeHVJbDE5IiwiZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIgKCkge1xufVxuXG5mdW5jdGlvbiBCb3hMb2dpbkNvbnRyb2xsZXIgKCRzdGF0ZVBhcmFtcykge1xuICAgIHRoaXMubG9naW5VcmwgPSAkc3RhdGVQYXJhbXMudXJsO1xufVxuXG5mdW5jdGlvbiBCb3hMaXN0Q29udHJvbGxlciAoUmVzdGFuZ3VsYXIsICRtb2RhbCwgJGh0dHApIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5pbmFjdGl2ZUNvbW11bml0aWVzID0gbnVsbDtcbiAgICB0aGlzLmlzTG9hZGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5hY3RpdmVDb21tdW5pdGllcyA9PT0gbnVsbDtcbiAgICB9O1xuXG4gICAgdmFyIGJhc2VJbmFjdGl2ZXMgPSBSZXN0YW5ndWxhci5hbGwoJ2FyYzJib3gvY29tbXVuaXRpZXMnKTtcblxuICAgIC8vIEhhbmRsZSBmaWx0ZXJzXG4gICAgdGhpcy5sYXN0QWN0aXZpdHkgPSA5MDA7XG4gICAgdGhpcy5saW1pdCA9IDIwO1xuICAgIHRoaXMuZmlsdGVyVGV4dCA9IG51bGw7XG4gICAgdGhpcy5yZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIF90aGlzLmlzU3VibWl0dGluZyA9IHRydWU7XG4gICAgICAgIC8vIFVzZXIgY2xpY2tlZCB0aGUgXCJPdmVyIDE4IG1vbnRoc1wiIGNoZWNrYm94IG9yIHRoZSBzZWFyY2ggYm94XG4gICAgICAgIHZhciBwYXJhbXMgPSB7fTtcbiAgICAgICAgLy8gT25seSBzZW5kIHF1ZXJ5IHN0cmluZyBwYXJhbWV0ZXJzIGlmIHRoZXkgYXJlIG5vdCBudWxsXG4gICAgICAgIGlmICh0aGlzLmxhc3RBY3Rpdml0eSB8fCB0aGlzLmxhc3RBY3Rpdml0eSA9PT0gMCkge1xuICAgICAgICAgICAgcGFyYW1zLmxhc3RfYWN0aXZpdHkgPSB0aGlzLmxhc3RBY3Rpdml0eTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5saW1pdCkge1xuICAgICAgICAgICAgcGFyYW1zLmxpbWl0ID0gdGhpcy5saW1pdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5maWx0ZXJUZXh0KSB7XG4gICAgICAgICAgICBwYXJhbXMuZmlsdGVyID0gdGhpcy5maWx0ZXJUZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgYmFzZUluYWN0aXZlcy5nZXRMaXN0KHBhcmFtcylcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmlzU3VibWl0dGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5pbmFjdGl2ZUNvbW11bml0aWVzID0gc3VjY2VzcztcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChmYWlsdXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ2ZhaWx1cmUnLCBmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgIH07XG5cbiAgICB0aGlzLmNsZWFyRXhjZXB0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHVybCA9ICcvYXJjMmJveC9jbGVhcl9leGNlcHRpb25zJztcbiAgICAgICAgJGh0dHAucG9zdCh1cmwpXG4gICAgICAgICAgICAuc3VjY2VzcyhcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ2NsZWFyIGV4Y2VwdGlvbnMnKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMucmVsb2FkKCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5lcnJvcihcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnY2xlYXIgZXhjZXB0aW9ucyBlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIC8vIExldCdzIGdvIGFoZWFkIGFuZCBsb2FkIHRoaXMgdGhlIGZpcnN0IHRpbWVcbiAgICB0aGlzLnJlbG9hZCgpO1xuXG4gICAgdGhpcy5zZXRTdGF0dXMgPSBmdW5jdGlvbiAodGFyZ2V0LCBhY3Rpb24pIHtcbiAgICAgICAgdmFyIHVybCA9ICcvYXJjMmJveC9jb21tdW5pdGllcy8nICsgdGFyZ2V0Lm5hbWU7XG4gICAgICAgICRodHRwLnBhdGNoKHVybCwge2FjdGlvbjogYWN0aW9ufSlcbiAgICAgICAgICAgIC5zdWNjZXNzKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1Zygnc3VjY2VzcyBzZXR0aW5nICcgKyB0YXJnZXQubmFtZSArICcgdG8gJyArIGFjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnJlbG9hZCgpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZXJyb3IoXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIClcbiAgICB9O1xuXG5cbiAgICB0aGlzLnNob3dMb2cgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdteU1vZGFsQ29udGVudC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBNb2RhbENvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnY3RybCcsXG4gICAgICAgICAgICAgICAgc2l6ZTogJ2xnJyxcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gTW9kYWxDb250cm9sbGVyICgkbW9kYWxJbnN0YW5jZSwgdGFyZ2V0LCAkaHR0cCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5sb2dFbnRyaWVzID0gW107XG4gICAgdGhpcy51cGRhdGVMb2cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB1cmwgPSAnL2FyYzJib3gvY29tbXVuaXRpZXMvJyArIHRhcmdldC5uYW1lO1xuICAgICAgICAkaHR0cC5nZXQodXJsKVxuICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5sb2dFbnRyaWVzID0gc3VjY2Vzcy5sb2c7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYWlsdXJlIG9uIGdldHRpbmcgbG9nIGVudHJpZXMnKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH07XG4gICAgdGhpcy51cGRhdGVMb2coKTtcblxuICAgIHRoaXMuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9O1xufVxuXG5leHBvcnRzLkhvbWVDb250cm9sbGVyID0gSG9tZUNvbnRyb2xsZXI7XG5leHBvcnRzLkJveExvZ2luQ29udHJvbGxlciA9IEJveExvZ2luQ29udHJvbGxlcjtcbmV4cG9ydHMuTW9kYWxDb250cm9sbGVyID0gTW9kYWxDb250cm9sbGVyO1xuZXhwb3J0cy5Cb3hMaXN0Q29udHJvbGxlciA9IEJveExpc3RDb250cm9sbGVyOyIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xuXG5mdW5jdGlvbiBNb2R1bGVDb25maWcoTWRNb2NrUmVzdFByb3ZpZGVyKSB7XG5cbiAgdmFyIHVzZU1vY2tzID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmhhc0NsYXNzKCdhNS11c2UtbW9ja3MnKTtcbiAgaWYgKCF1c2VNb2NrcykgcmV0dXJuO1xuXG4gIHZhciBjb21tdW5pdGllcyA9IFtcbiAgICB7XG4gICAgICBpZDogJzEnLCBuYW1lOiAnZGVmYXVsdCcsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvZGVmYXVsdCcsXG4gICAgICB0aXRsZTogJ0RlZmF1bHQgQ29tbXVuaXR5JywgbGFzdF9hY3Rpdml0eTogJzIwMTAvMTEvMTknLFxuICAgICAgaXRlbXM6IDQ3MjMsIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICcyJywgbmFtZTogJ2Fub3RoZXInLFxuICAgICAgdXJsOiAnL2NvbW11bml0aWVzL2Fub3RoZXInLFxuICAgICAgdGl0bGU6ICdBbm90aGVyIENvbW11bml0eScsIGxhc3RfYWN0aXZpdHk6ICcyMDExLzAxLzA5JyxcbiAgICAgIGl0ZW1zOiAyMywgc3RhdHVzOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzMnLCBuYW1lOiAndGVzdGluZycsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvdGVzdGluZycsXG4gICAgICB0aXRsZTogJ1Rlc3RpbmcgMTIzIFdpdGggQSBMb25nIFRpdGxlIFRoYXQgR29lcyBPbicsXG4gICAgICBsYXN0X2FjdGl2aXR5OiAnMjAxMC8wMy8wNCcsXG4gICAgICBpdGVtczogNyxcbiAgICAgIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICc0JywgbmFtZTogJ2FmcmljYScsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvYWZyaWNhJyxcbiAgICAgIHRpdGxlOiAnQWZyaWNhLi4uaXQgaXMgYmlnJywgbGFzdF9hY3Rpdml0eTogJzIwMTQvMDQvMTYnLFxuICAgICAgaXRlbXM6IDk5OTksIHN0YXR1czogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICc1JywgbmFtZTogJ21lcmljYScsXG4gICAgICB1cmw6ICcvY29tbXVuaXRpZXMvbWVyaWNhJyxcbiAgICAgIHRpdGxlOiAnTWVyaWNhJywgbGFzdF9hY3Rpdml0eTogJzIwMTQvMTAvMDcnLFxuICAgICAgaXRlbXM6IDU0OCwgc3RhdHVzOiBudWxsXG4gICAgfVxuICBdO1xuXG4gIHZhciBpbml0aWFsTG9nRW50cmllcyA9IFtcbiAgICB7dGltZXN0YW1wOiAnMjAxNC8xMi8wMSAwOTozMDowMScsIG1zZzogJ1NvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnMlNvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnM1NvbWUgbWVzc2FnZSd9LFxuICAgIHt0aW1lc3RhbXA6ICcyMDE0LzEyLzAxIDA5OjMwOjAxJywgbXNnOiAnNFNvbWUgbWVzc2FnZSd9XG4gIF07XG5cbiAgTWRNb2NrUmVzdFByb3ZpZGVyLmFkZE1vY2tzKFxuICAgICdib3gnLFxuICAgIFtcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXNcXC8oXFxkKylcXC9zZXRTdGF0dXMvLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAgICAgLy8gR2l2ZW4gL2FwaS90b19hcmNoaXZlL3NvbWVEb2NJZC9zZXRTdGF0dXNcbiAgICAgICAgICAvLyAtIEdyYWIgdGhhdCBjb21tdW5pdHlcbiAgICAgICAgICAvLyAtIENoYW5nZSBpdHMgc3RhdHVzIHRvIHRoZSBwYXNzZWQgaW4gJ3N0YXR1cycgdmFsdWVcbiAgICAgICAgICAvLyAtIHJldHVybiBva1xuICAgICAgICAgIHZhclxuICAgICAgICAgICAgdXJsID0gcmVxdWVzdC51cmwsXG4gICAgICAgICAgICBkYXRhID0gcmVxdWVzdC5qc29uX2JvZHk7XG4gICAgICAgICAgdmFyIGlkID0gdXJsLnNwbGl0KFwiL1wiKVszXSxcbiAgICAgICAgICAgIHRhcmdldCA9IF8oY29tbXVuaXRpZXMpLmZpcnN0KHtpZDogaWR9KSxcbiAgICAgICAgICAgIG5ld1N0YXR1cyA9ICdzdG9wcGVkJztcbiAgICAgICAgICBkYXRhID0gcmVxdWVzdC5qc29uX2JvZHk7XG4gICAgICAgICAgaWYgKGRhdGEuc3RhdHVzID09ICdzdGFydCcpIHtcbiAgICAgICAgICAgIG5ld1N0YXR1cyA9ICdzdGFydGVkJztcbiAgICAgICAgICB9XG4gICAgICAgICAgdGFyZ2V0LnN0YXR1cyA9IG5ld1N0YXR1cztcbiAgICAgICAgICByZXR1cm4gWzIwMCwge3N0YXR1czogbmV3U3RhdHVzfV07XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXNcXC8oXFxkKylcXC9sb2dFbnRyaWVzLyxcbiAgICAgICAgcmVzcG9uZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gRWFjaCB0aW1lIGNhbGxlZCwgbWFrZSB1cCA1IGVudHJpZXMgYW5kIHB1dCB0aGVtXG4gICAgICAgICAgLy8gaW4gdGhlIGZyb250IG9mIHRoZSBhcnJheSwgdG8gc2ltdWxhdGUgdGhlIHNlcnZlclxuICAgICAgICAgIC8vIGdlbmVyYXRpbmcgbW9yZSBsb2cgZW50cmllcy5cbiAgICAgICAgICB2YXIgbm93LCB0aW1lc3RhbXAsIHJhbmQ7XG4gICAgICAgICAgXyhfLnJhbmdlKDE1KSkuZm9yRWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgdGltZXN0YW1wID0gbm93LnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICAgICAgICByYW5kID0gXy5yYW5kb20oMTAwMCwgOTk5OSk7XG4gICAgICAgICAgICBpbml0aWFsTG9nRW50cmllcy51bnNoaWZ0KFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgbXNnOiByYW5kICsgJyBTb21lIG1lc3NhZ2UgJyArIHRpbWVzdGFtcFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBbMjAwLCBpbml0aWFsTG9nRW50cmllc107XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcmMyYm94XFwvY29tbXVuaXRpZXMuKiQvLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAgICAgLypcbiAgICAgICAgICAgUHJvY2VzcyB0d28gZmlsdGVyczpcbiAgICAgICAgICAgLSBpbmFjdGl2ZSA9PSAndHJ1ZScgb3Igb3RoZXJ3aXNlXG4gICAgICAgICAgIC0gZmlsdGVyVGV4dCwgbG93ZXJjYXNlIGNvbXBhcmlzb25cbiAgICAgICAgICAgKi9cbiAgICAgICAgICB2YXJcbiAgICAgICAgICAgIGxhc3RfYWN0aXZpdHkgPSBwYXJzZUludChyZXF1ZXN0LnF1ZXJ5Lmxhc3RfYWN0aXZpdHkpLFxuICAgICAgICAgICAgZmlsdGVyID0gcmVxdWVzdC5xdWVyeS5maWx0ZXI7XG5cbiAgICAgICAgICB2YXIgZmlsdGVyZWQgPSBfKGNvbW11bml0aWVzKS5jbG9uZSgpO1xuXG4gICAgICAgICAgaWYgKGxhc3RfYWN0aXZpdHkgPCAzNjApIHtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gXyhjb21tdW5pdGllcykuZmlsdGVyKFxuICAgICAgICAgICAgICBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmxhc3RfYWN0aXZpdHkuaW5kZXhPZignMjAxNCcpICE9IDA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkudmFsdWUoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZmlsdGVyKSB7XG4gICAgICAgICAgICB2YXIgZnQgPSBmaWx0ZXIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gXyhmaWx0ZXJlZCkuZmlsdGVyKFxuICAgICAgICAgICAgICBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBvcmlnID0gaXRlbS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWcuaW5kZXhPZihmdCkgPiAtMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS52YWx1ZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBbMjAwLCBmaWx0ZXJlZF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdKTtcblxuXG4gIHZhciB1c2VyID0ge1xuICAgIGlkOiAnYWRtaW4nLFxuICAgIGVtYWlsOiAnYWRtaW5AeC5jb20nLFxuICAgIGZpcnN0X25hbWU6ICdBZG1pbicsXG4gICAgbGFzdF9uYW1lOiAnTGFzdGllJyxcbiAgICB0d2l0dGVyOiAnYWRtaW4nXG4gIH07XG5cblxuICBNZE1vY2tSZXN0UHJvdmlkZXIuYWRkTW9ja3MoXG4gICAgJ2F1dGgnLFxuICAgIFtcbiAgICAgIHtcbiAgICAgICAgcGF0dGVybjogL2FwaVxcL2F1dGhcXC9tZS8sXG4gICAgICAgIHJlc3BvbnNlRGF0YTogdXNlcixcbiAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcGF0dGVybjogL2FwaVxcL2F1dGhcXC9sb2dpbi8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICB2YXIgZGF0YSA9IHJlcXVlc3QuanNvbl9ib2R5O1xuICAgICAgICAgIHZhciB1biA9IGRhdGEudXNlcm5hbWU7XG4gICAgICAgICAgdmFyIHJlc3BvbnNlO1xuXG4gICAgICAgICAgaWYgKHVuID09PSAnYWRtaW4nKSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IFsyMDQsIHt0b2tlbjogXCJtb2NrdG9rZW5cIn1dO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IFs0MDEsIHtcIm1lc3NhZ2VcIjogXCJJbnZhbGlkIGxvZ2luIG9yIHBhc3N3b3JkXCJ9XTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ29uZmlnOiBNb2R1bGVDb25maWdcbn07XG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkluTnlZeTl0YjJOcmN5NXFjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPMEZCUVVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFTSXNJbVpwYkdVaU9pSm5aVzVsY21GMFpXUXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpZG1GeUlGOGdQU0FvZEhsd1pXOW1JSGRwYm1SdmR5QWhQVDBnWENKMWJtUmxabWx1WldSY0lpQS9JSGRwYm1SdmQxc25YeWRkSURvZ2RIbHdaVzltSUdkc2IySmhiQ0FoUFQwZ1hDSjFibVJsWm1sdVpXUmNJaUEvSUdkc2IySmhiRnNuWHlkZElEb2diblZzYkNrN1hHNWNibVoxYm1OMGFXOXVJRTF2WkhWc1pVTnZibVpwWnloTlpFMXZZMnRTWlhOMFVISnZkbWxrWlhJcElIdGNibHh1SUNCMllYSWdkWE5sVFc5amEzTWdQU0JoYm1kMWJHRnlMbVZzWlcxbGJuUW9aRzlqZFcxbGJuUXVZbTlrZVNrdWFHRnpRMnhoYzNNb0oyRTFMWFZ6WlMxdGIyTnJjeWNwTzF4dUlDQnBaaUFvSVhWelpVMXZZMnR6S1NCeVpYUjFjbTQ3WEc1Y2JpQWdkbUZ5SUdOdmJXMTFibWwwYVdWeklEMGdXMXh1SUNBZ0lIdGNiaUFnSUNBZ0lHbGtPaUFuTVNjc0lHNWhiV1U2SUNka1pXWmhkV3gwSnl4Y2JpQWdJQ0FnSUhWeWJEb2dKeTlqYjIxdGRXNXBkR2xsY3k5a1pXWmhkV3gwSnl4Y2JpQWdJQ0FnSUhScGRHeGxPaUFuUkdWbVlYVnNkQ0JEYjIxdGRXNXBkSGtuTENCc1lYTjBYMkZqZEdsMmFYUjVPaUFuTWpBeE1DOHhNUzh4T1Njc1hHNGdJQ0FnSUNCcGRHVnRjem9nTkRjeU15d2djM1JoZEhWek9pQnVkV3hzWEc0Z0lDQWdmU3hjYmlBZ0lDQjdYRzRnSUNBZ0lDQnBaRG9nSnpJbkxDQnVZVzFsT2lBbllXNXZkR2hsY2ljc1hHNGdJQ0FnSUNCMWNtdzZJQ2N2WTI5dGJYVnVhWFJwWlhNdllXNXZkR2hsY2ljc1hHNGdJQ0FnSUNCMGFYUnNaVG9nSjBGdWIzUm9aWElnUTI5dGJYVnVhWFI1Snl3Z2JHRnpkRjloWTNScGRtbDBlVG9nSnpJd01URXZNREV2TURrbkxGeHVJQ0FnSUNBZ2FYUmxiWE02SURJekxDQnpkR0YwZFhNNklHNTFiR3hjYmlBZ0lDQjlMRnh1SUNBZ0lIdGNiaUFnSUNBZ0lHbGtPaUFuTXljc0lHNWhiV1U2SUNkMFpYTjBhVzVuSnl4Y2JpQWdJQ0FnSUhWeWJEb2dKeTlqYjIxdGRXNXBkR2xsY3k5MFpYTjBhVzVuSnl4Y2JpQWdJQ0FnSUhScGRHeGxPaUFuVkdWemRHbHVaeUF4TWpNZ1YybDBhQ0JCSUV4dmJtY2dWR2wwYkdVZ1ZHaGhkQ0JIYjJWeklFOXVKeXhjYmlBZ0lDQWdJR3hoYzNSZllXTjBhWFpwZEhrNklDY3lNREV3THpBekx6QTBKeXhjYmlBZ0lDQWdJR2wwWlcxek9pQTNMRnh1SUNBZ0lDQWdjM1JoZEhWek9pQnVkV3hzWEc0Z0lDQWdmU3hjYmlBZ0lDQjdYRzRnSUNBZ0lDQnBaRG9nSnpRbkxDQnVZVzFsT2lBbllXWnlhV05oSnl4Y2JpQWdJQ0FnSUhWeWJEb2dKeTlqYjIxdGRXNXBkR2xsY3k5aFpuSnBZMkVuTEZ4dUlDQWdJQ0FnZEdsMGJHVTZJQ2RCWm5KcFkyRXVMaTVwZENCcGN5QmlhV2NuTENCc1lYTjBYMkZqZEdsMmFYUjVPaUFuTWpBeE5DOHdOQzh4Tmljc1hHNGdJQ0FnSUNCcGRHVnRjem9nT1RrNU9Td2djM1JoZEhWek9pQnVkV3hzWEc0Z0lDQWdmU3hjYmlBZ0lDQjdYRzRnSUNBZ0lDQnBaRG9nSnpVbkxDQnVZVzFsT2lBbmJXVnlhV05oSnl4Y2JpQWdJQ0FnSUhWeWJEb2dKeTlqYjIxdGRXNXBkR2xsY3k5dFpYSnBZMkVuTEZ4dUlDQWdJQ0FnZEdsMGJHVTZJQ2ROWlhKcFkyRW5MQ0JzWVhOMFgyRmpkR2wyYVhSNU9pQW5NakF4TkM4eE1DOHdOeWNzWEc0Z0lDQWdJQ0JwZEdWdGN6b2dOVFE0TENCemRHRjBkWE02SUc1MWJHeGNiaUFnSUNCOVhHNGdJRjA3WEc1Y2JpQWdkbUZ5SUdsdWFYUnBZV3hNYjJkRmJuUnlhV1Z6SUQwZ1cxeHVJQ0FnSUh0MGFXMWxjM1JoYlhBNklDY3lNREUwTHpFeUx6QXhJREE1T2pNd09qQXhKeXdnYlhObk9pQW5VMjl0WlNCdFpYTnpZV2RsSjMwc1hHNGdJQ0FnZTNScGJXVnpkR0Z0Y0RvZ0p6SXdNVFF2TVRJdk1ERWdNRGs2TXpBNk1ERW5MQ0J0YzJjNklDY3lVMjl0WlNCdFpYTnpZV2RsSjMwc1hHNGdJQ0FnZTNScGJXVnpkR0Z0Y0RvZ0p6SXdNVFF2TVRJdk1ERWdNRGs2TXpBNk1ERW5MQ0J0YzJjNklDY3pVMjl0WlNCdFpYTnpZV2RsSjMwc1hHNGdJQ0FnZTNScGJXVnpkR0Z0Y0RvZ0p6SXdNVFF2TVRJdk1ERWdNRGs2TXpBNk1ERW5MQ0J0YzJjNklDYzBVMjl0WlNCdFpYTnpZV2RsSjMxY2JpQWdYVHRjYmx4dUlDQk5aRTF2WTJ0U1pYTjBVSEp2ZG1sa1pYSXVZV1JrVFc5amEzTW9YRzRnSUNBZ0oySnZlQ2NzWEc0Z0lDQWdXMXh1SUNBZ0lDQWdlMXh1SUNBZ0lDQWdJQ0J0WlhSb2IyUTZJQ2RRVDFOVUp5eGNiaUFnSUNBZ0lDQWdjR0YwZEdWeWJqb2dMMkZ5WXpKaWIzaGNYQzlqYjIxdGRXNXBkR2xsYzF4Y0x5aGNYR1FyS1Z4Y0wzTmxkRk4wWVhSMWN5OHNYRzRnSUNBZ0lDQWdJSEpsYzNCdmJtUmxjam9nWm5WdVkzUnBiMjRnS0hKbGNYVmxjM1FwSUh0Y2JpQWdJQ0FnSUNBZ0lDQXZMeUJIYVhabGJpQXZZWEJwTDNSdlgyRnlZMmhwZG1VdmMyOXRaVVJ2WTBsa0wzTmxkRk4wWVhSMWMxeHVJQ0FnSUNBZ0lDQWdJQzh2SUMwZ1IzSmhZaUIwYUdGMElHTnZiVzExYm1sMGVWeHVJQ0FnSUNBZ0lDQWdJQzh2SUMwZ1EyaGhibWRsSUdsMGN5QnpkR0YwZFhNZ2RHOGdkR2hsSUhCaGMzTmxaQ0JwYmlBbmMzUmhkSFZ6SnlCMllXeDFaVnh1SUNBZ0lDQWdJQ0FnSUM4dklDMGdjbVYwZFhKdUlHOXJYRzRnSUNBZ0lDQWdJQ0FnZG1GeVhHNGdJQ0FnSUNBZ0lDQWdJQ0IxY213Z1BTQnlaWEYxWlhOMExuVnliQ3hjYmlBZ0lDQWdJQ0FnSUNBZ0lHUmhkR0VnUFNCeVpYRjFaWE4wTG1wemIyNWZZbTlrZVR0Y2JpQWdJQ0FnSUNBZ0lDQjJZWElnYVdRZ1BTQjFjbXd1YzNCc2FYUW9YQ0l2WENJcFd6TmRMRnh1SUNBZ0lDQWdJQ0FnSUNBZ2RHRnlaMlYwSUQwZ1h5aGpiMjF0ZFc1cGRHbGxjeWt1Wm1seWMzUW9lMmxrT2lCcFpIMHBMRnh1SUNBZ0lDQWdJQ0FnSUNBZ2JtVjNVM1JoZEhWeklEMGdKM04wYjNCd1pXUW5PMXh1SUNBZ0lDQWdJQ0FnSUdSaGRHRWdQU0J5WlhGMVpYTjBMbXB6YjI1ZlltOWtlVHRjYmlBZ0lDQWdJQ0FnSUNCcFppQW9aR0YwWVM1emRHRjBkWE1nUFQwZ0ozTjBZWEowSnlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYm1WM1UzUmhkSFZ6SUQwZ0ozTjBZWEowWldRbk8xeHVJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNCMFlYSm5aWFF1YzNSaGRIVnpJRDBnYm1WM1UzUmhkSFZ6TzF4dUlDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCYk1qQXdMQ0I3YzNSaGRIVnpPaUJ1WlhkVGRHRjBkWE45WFR0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2ZTeGNiaUFnSUNBZ0lIdGNiaUFnSUNBZ0lDQWdiV1YwYUc5a09pQW5SMFZVSnl4Y2JpQWdJQ0FnSUNBZ2NHRjBkR1Z5YmpvZ0wyRnlZekppYjNoY1hDOWpiMjF0ZFc1cGRHbGxjMXhjTHloY1hHUXJLVnhjTDJ4dlowVnVkSEpwWlhNdkxGeHVJQ0FnSUNBZ0lDQnlaWE53YjI1a1pYSTZJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQXZMeUJGWVdOb0lIUnBiV1VnWTJGc2JHVmtMQ0J0WVd0bElIVndJRFVnWlc1MGNtbGxjeUJoYm1RZ2NIVjBJSFJvWlcxY2JpQWdJQ0FnSUNBZ0lDQXZMeUJwYmlCMGFHVWdabkp2Ym5RZ2IyWWdkR2hsSUdGeWNtRjVMQ0IwYnlCemFXMTFiR0YwWlNCMGFHVWdjMlZ5ZG1WeVhHNGdJQ0FnSUNBZ0lDQWdMeThnWjJWdVpYSmhkR2x1WnlCdGIzSmxJR3h2WnlCbGJuUnlhV1Z6TGx4dUlDQWdJQ0FnSUNBZ0lIWmhjaUJ1YjNjc0lIUnBiV1Z6ZEdGdGNDd2djbUZ1WkR0Y2JpQWdJQ0FnSUNBZ0lDQmZLRjh1Y21GdVoyVW9NVFVwS1M1bWIzSkZZV05vS0daMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUc1dmR5QTlJRzVsZHlCRVlYUmxLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhVzFsYzNSaGJYQWdQU0J1YjNjdWRHOU1iMk5oYkdWVGRISnBibWNvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpoYm1RZ1BTQmZMbkpoYm1SdmJTZ3hNREF3TENBNU9UazVLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbHVhWFJwWVd4TWIyZEZiblJ5YVdWekxuVnVjMmhwWm5Rb1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFXMWxjM1JoYlhBNklIUnBiV1Z6ZEdGdGNDeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnRjMmM2SUhKaGJtUWdLeUFuSUZOdmJXVWdiV1Z6YzJGblpTQW5JQ3NnZEdsdFpYTjBZVzF3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lDazdYRzRnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlGc3lNREFzSUdsdWFYUnBZV3hNYjJkRmJuUnlhV1Z6WFR0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2ZTeGNiaUFnSUNBZ0lIdGNiaUFnSUNBZ0lDQWdiV1YwYUc5a09pQW5SMFZVSnl4Y2JpQWdJQ0FnSUNBZ2NHRjBkR1Z5YmpvZ0wyRnlZekppYjNoY1hDOWpiMjF0ZFc1cGRHbGxjeTRxSkM4c1hHNGdJQ0FnSUNBZ0lISmxjM0J2Ym1SbGNqb2dablZ1WTNScGIyNGdLSEpsY1hWbGMzUXBJSHRjYmlBZ0lDQWdJQ0FnSUNBdktseHVJQ0FnSUNBZ0lDQWdJQ0JRY205alpYTnpJSFIzYnlCbWFXeDBaWEp6T2x4dUlDQWdJQ0FnSUNBZ0lDQXRJR2x1WVdOMGFYWmxJRDA5SUNkMGNuVmxKeUJ2Y2lCdmRHaGxjbmRwYzJWY2JpQWdJQ0FnSUNBZ0lDQWdMU0JtYVd4MFpYSlVaWGgwTENCc2IzZGxjbU5oYzJVZ1kyOXRjR0Z5YVhOdmJseHVJQ0FnSUNBZ0lDQWdJQ0FxTDF4dUlDQWdJQ0FnSUNBZ0lIWmhjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2JHRnpkRjloWTNScGRtbDBlU0E5SUhCaGNuTmxTVzUwS0hKbGNYVmxjM1F1Y1hWbGNua3ViR0Z6ZEY5aFkzUnBkbWwwZVNrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0JtYVd4MFpYSWdQU0J5WlhGMVpYTjBMbkYxWlhKNUxtWnBiSFJsY2p0Y2JseHVJQ0FnSUNBZ0lDQWdJSFpoY2lCbWFXeDBaWEpsWkNBOUlGOG9ZMjl0YlhWdWFYUnBaWE1wTG1Oc2IyNWxLQ2s3WEc1Y2JpQWdJQ0FnSUNBZ0lDQnBaaUFvYkdGemRGOWhZM1JwZG1sMGVTQThJRE0yTUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWm1sc2RHVnlaV1FnUFNCZktHTnZiVzExYm1sMGFXVnpLUzVtYVd4MFpYSW9YRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lHWjFibU4wYVc5dUlDaHBkR1Z0S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdsMFpXMHViR0Z6ZEY5aFkzUnBkbWwwZVM1cGJtUmxlRTltS0NjeU1ERTBKeWtnSVQwZ01EdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnS1M1MllXeDFaU2dwTzF4dUlDQWdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0FnSUdsbUlDaG1hV3gwWlhJcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQm1kQ0E5SUdacGJIUmxjaTUwYjB4dmQyVnlRMkZ6WlNncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnWm1sc2RHVnlaV1FnUFNCZktHWnBiSFJsY21Wa0tTNW1hV3gwWlhJb1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUNocGRHVnRLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHOXlhV2NnUFNCcGRHVnRMbTVoYldVdWRHOU1iM2RsY2tOaGMyVW9LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdiM0pwWnk1cGJtUmxlRTltS0daMEtTQStJQzB4TzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQXBMblpoYkhWbEtDazdYRzRnSUNBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlGc3lNREFzSUdacGJIUmxjbVZrWFR0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2ZWeHVJQ0FnSUYwcE8xeHVYRzVjYmlBZ2RtRnlJSFZ6WlhJZ1BTQjdYRzRnSUNBZ2FXUTZJQ2RoWkcxcGJpY3NYRzRnSUNBZ1pXMWhhV3c2SUNkaFpHMXBia0I0TG1OdmJTY3NYRzRnSUNBZ1ptbHljM1JmYm1GdFpUb2dKMEZrYldsdUp5eGNiaUFnSUNCc1lYTjBYMjVoYldVNklDZE1ZWE4wYVdVbkxGeHVJQ0FnSUhSM2FYUjBaWEk2SUNkaFpHMXBiaWRjYmlBZ2ZUdGNibHh1WEc0Z0lFMWtUVzlqYTFKbGMzUlFjbTkyYVdSbGNpNWhaR1JOYjJOcmN5aGNiaUFnSUNBbllYVjBhQ2NzWEc0Z0lDQWdXMXh1SUNBZ0lDQWdlMXh1SUNBZ0lDQWdJQ0J3WVhSMFpYSnVPaUF2WVhCcFhGd3ZZWFYwYUZ4Y0wyMWxMeXhjYmlBZ0lDQWdJQ0FnY21WemNHOXVjMlZFWVhSaE9pQjFjMlZ5TEZ4dUlDQWdJQ0FnSUNCaGRYUm9aVzUwYVdOaGRHVTZJSFJ5ZFdWY2JpQWdJQ0FnSUgwc1hHNGdJQ0FnSUNCN1hHNGdJQ0FnSUNBZ0lHMWxkR2h2WkRvZ0oxQlBVMVFuTEZ4dUlDQWdJQ0FnSUNCd1lYUjBaWEp1T2lBdllYQnBYRnd2WVhWMGFGeGNMMnh2WjJsdUx5eGNiaUFnSUNBZ0lDQWdjbVZ6Y0c5dVpHVnlPaUJtZFc1amRHbHZiaUFvY21WeGRXVnpkQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lIWmhjaUJrWVhSaElEMGdjbVZ4ZFdWemRDNXFjMjl1WDJKdlpIazdYRzRnSUNBZ0lDQWdJQ0FnZG1GeUlIVnVJRDBnWkdGMFlTNTFjMlZ5Ym1GdFpUdGNiaUFnSUNBZ0lDQWdJQ0IyWVhJZ2NtVnpjRzl1YzJVN1hHNWNiaUFnSUNBZ0lDQWdJQ0JwWmlBb2RXNGdQVDA5SUNkaFpHMXBiaWNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsYzNCdmJuTmxJRDBnV3pJd05Dd2dlM1J2YTJWdU9pQmNJbTF2WTJ0MGIydGxibHdpZlYwN1hHNGdJQ0FnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGMzQnZibk5sSUQwZ1d6UXdNU3dnZTF3aWJXVnpjMkZuWlZ3aU9pQmNJa2x1ZG1Gc2FXUWdiRzluYVc0Z2IzSWdjR0Z6YzNkdmNtUmNJbjFkTzF4dUlDQWdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJ5WlhOd2IyNXpaVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnZlZ4dUlDQWdJRjBwTzF4dVhHNTlYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnZTF4dUlDQkRiMjVtYVdjNklFMXZaSFZzWlVOdmJtWnBaMXh1ZlRzaVhYMD0iLCJ2YXIgY29udHJvbGxlcnMgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5cbmZ1bmN0aW9uIE1vZHVsZUNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL2hvbWUnKTtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ3NpdGUnLCB7XG4gICAgICAgICAgICAgICAgICAgcGFyZW50OiAncm9vdCdcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnc2l0ZS5ob21lJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9ob21lJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0hvbWUnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvaG9tZS5odG1sJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVycy5Ib21lQ29udHJvbGxlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICAgICAgICAgICAgICAgcGFyZW50OiAnc2l0ZScsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdBZG1pbidcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uZGFzaGJvYXJkJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9kYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnQWRtaW4gRGFzaGJvYXJkJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+QWRtaW4gRGFzaGJvYXJkPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmFyY2hpdmVfYm94Jywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9hcmNoaXZlX2JveCcsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdBcmNoaXZlIHRvIEJveCcsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9ib3hfbGlzdC5odG1sJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVycy5Cb3hMaXN0Q29udHJvbGxlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiBmdW5jdGlvbiAoJGh0dHAsICRzdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdXJsID0gJy9hcmMyYm94L3Rva2VuP2ludmFsaWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KHVybClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbGlkID0gc3VjY2Vzcy52YWxpZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1cmwgPSBzdWNjZXNzLnVybDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhZG1pbi5ib3hfbG9naW4nLCB7dXJsOiB1cmx9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdyZXNvbHZlIHZhbGlkVG9rZW4gZXJyb3InKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmJveF9sb2dpbicsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvYm94X2xvZ2luJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0JveCBMb2dpbicsXG4gICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgIHVybDogJydcbiAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvYm94X2xvZ2luLmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLkJveExvZ2luQ29udHJvbGxlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLnNpdGVhbm5vdW5jZScsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2l0ZWFubm91bmNlbWVudCcsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdTaXRlIEFubm91bmNlbWVudCcsXG4gICAgICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgxPlNpdGUgQW5ub3VuY2VtZW50PC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmxvZ3MnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2xvZ3MnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnTG9ncycsXG4gICAgICAgICAgICAgICAgICAgcGFyZW50OiAnYWRtaW4nXG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmxvZ3Muc3lzdGVtX2xvZ3MnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL3N5c3RlbV9sb2dzJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1N5c3RlbSBMb2dzJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+U3lzdGVtIExvZ3M8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ubG9ncy5mZWVkX2R1bXAnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2ZlZWRfZHVtcCcsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdGZWVkIER1bXAnLFxuICAgICAgICAgICAgICAgICAgIHN1YnNlY3Rpb246IHtzZWN0aW9uOiAnYWRtaW4ubG9ncyd9LFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5GZWVkIER1bXA8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4ubG9ncy5tZXRyaWNzJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9tZXRyaWNzJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ01ldHJpY3MnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5NZXRyaWNzPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmxvZ3MuZGVidWdfY29udmVydGVycycsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvZGVidWdfY29udmVydGVycycsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdEZWJ1ZyBDb252ZXJ0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+RGVidWcgQ29udmVydGVyczwvaDE+J1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAuc3RhdGUoJ2FkbWluLmNvbnRlbnQnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2NvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnQ29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgcGFyZW50OiAnYWRtaW4nXG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmNvbnRlbnQubW92ZScsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvbW92ZScsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdNb3ZlJyxcbiAgICAgICAgICAgICAgICAgICBzdWJzZWN0aW9uOiB7c2VjdGlvbjogJ2FkbWluLmNvbnRlbnQnfSxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+TW92ZSBDb250ZW50PC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLmNvbnRlbnQuZGVsZXRlJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9kZWxldGUnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnRGVsZXRlJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+RGVsZXRlIENvbnRlbnQ8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgLnN0YXRlKCdhZG1pbi5wZW9wbGUnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL3Blb3BsZScsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdQZW9wbGUnLFxuICAgICAgICAgICAgICAgICAgIHBhcmVudDogJ2FkbWluJ1xuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbi5wZW9wbGUuY29uZmlnJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9jb25maWcnLFxuICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnUERDJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+UGVvcGxlIERpcmVjdG9yeSBDb25maWd1cmF0aW9uPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLnBlb3BsZS51cGxvYWRfY3N2Jywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy91cGxvYWRfY3N2JyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1VwbG9hZCBDU1YnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5VcGxvYWQgQ1NWPC9oMT4nXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluLnBlb3BsZS5yZW5hbWVfbWVyZ2UnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL3JlbmFtZV9tZXJnZScsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdSZW5hbWUvTWVyZ2UnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5SZW5hbWUvTWVyZ2U8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uZW1haWwnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2VtYWlsJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0VtYWlsJyxcbiAgICAgICAgICAgICAgICAgICBwYXJlbnQ6ICdhZG1pbidcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uZW1haWwuc2VuZCcsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2VuZCcsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdTZW5kIHRvIE1lbWJlcnMnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5TZW5kIHRvIE1lbWJlcnM8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4uZW1haWwucXVhcmFudGluZScsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvcXVhcmFudGluZScsXG4gICAgICAgICAgICAgICAgICAgdGl0bGU6ICdWaWV3IFF1YXJhbnRpbmUnLFxuICAgICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMT5WaWV3IFF1YXJhbnRpbmU8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4udXBkYXRlX29mZmljZXMnLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL3VwZGF0ZV9vZmZpY2VzJyxcbiAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1VwZGF0ZSBPZmZpY2VzJyxcbiAgICAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDE+VXBkYXRlIE9mZmljZXM8L2gxPidcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG59XG5cbmZ1bmN0aW9uIE1vZHVsZVJ1bihSZXN0YW5ndWxhciwgTWRDb25maWcsIE1kTmF2KSB7XG4gICAgLy8gSWYgd2UgYXJlIHVzaW5nIG1vY2tzLCBkb24ndCBzZXQgYSBwcmVmaXguIE90aGVyd2lzZSwgc2V0IG9uZS5cbiAgICB2YXIgdXNlTW9ja3MgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuaGFzQ2xhc3MoJ2E1LXVzZS1tb2NrcycpO1xuICAgIGlmICghdXNlTW9ja3MpIHtcbiAgICAgICAgUmVzdGFuZ3VsYXIuc2V0QmFzZVVybCgnLycpO1xuICAgIH1cblxuXG4gICAgTWRDb25maWcuc2l0ZS5uYW1lID0gJ0tBUkwgYWRtaW41JztcblxuICAgIE1kTmF2LmluaXQoe1xuICAgICAgICAgICAgICAgICAgIFwicm9vdFwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJzaXRlLmhvbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJIb21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YXRlXCI6IFwic2l0ZS5ob21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcInByaW9yaXR5XCI6IDFcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgYWRtaW46IHtcbiAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0FkbWluJyxcbiAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmRhc2hib2FyZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdBZG1pbiBEYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uZGFzaGJvYXJkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmFyY2hpdmVfYm94JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0FyY2hpdmUgdG8gQm94JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmFyY2hpdmVfYm94J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnNpdGVhbm5vdW5jZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTaXRlIEFubm91bmNlbWVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5zaXRlYW5ub3VuY2UnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdMb2dzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmxvZ3Muc3lzdGVtX2xvZ3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTeXN0ZW0gTG9ncycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmxvZ3Muc3lzdGVtX2xvZ3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4ubG9ncy5mZWVkX2R1bXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdGZWVkIER1bXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5sb2dzLmZlZWRfZHVtcCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5sb2dzLm1ldHJpY3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdNZXRyaWNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ubG9ncy5tZXRyaWNzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmxvZ3MuZGVidWdfY29udmVydGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0RlYnVnIENvbnZlcnRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5sb2dzLmRlYnVnX2NvbnZlcnRlcnMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uY29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdDb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmNvbnRlbnQubW92ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ01vdmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5jb250ZW50Lm1vdmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWRtaW4uY29udGVudC5kZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5jb250ZW50LmRlbGV0ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5wZW9wbGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUGVvcGxlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZS5jb25maWcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdQREMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5wZW9wbGUuY29uZmlnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnBlb3BsZS51cGxvYWRfY3N2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVXBsb2FkIENTVicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnBlb3BsZS51cGxvYWRfY3N2J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5wZW9wbGUucmVuYW1lX21lcmdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUmVuYW1lL01lcmdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4ucGVvcGxlLnJlbmFtZV9tZXJnZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5lbWFpbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFbWFpbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZG1pbi5lbWFpbC5zZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU2VuZCB0byBNZW1iZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnYWRtaW4uZW1haWwuc2VuZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmVtYWlsLnF1YXJhbnRpbmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWaWV3IFF1YXJhbnRpbmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdhZG1pbi5lbWFpbC5xdWFyYW50aW5lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLmVtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLmVtYWlsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FkbWluLnVwZGF0ZV9vZmZpY2VzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1VwZGF0ZSBPZmZpY2VzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2FkbWluLnVwZGF0ZV9vZmZpY2VzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfSk7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdhZG1pbjUnKVxuICAgIC5jb25maWcoTW9kdWxlQ29uZmlnKVxuICAgIC5ydW4oTW9kdWxlUnVuKTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwicm93XCI+XFxuICAgIDxkaXYgY2xhc3M9XCJjb2wtbWQtMTBcIj5cXG4gICAgICAgIDxoMT5BcmNoaXZlIHRvIEJveDwvaDE+XFxuICAgIDwvZGl2PlxcbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9XCJyb3dcIj5cXG5cXG4gICAgPGRpdiBjbGFzcz1cImNvbC1tZC0yXCI+XFxuXFxuICAgICAgICA8aDUgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+RmlsdGVyczwvaDU+XFxuXFxuICAgICAgICA8Zm9ybSBuYW1lPVwiZmlsdGVyc1wiIG5nLXN1Ym1pdD1cImN0cmwucmVsb2FkKClcIlxcbiAgICAgICAgICAgICAgY2xhc3M9XCJmb3JtLWhvcml6b25hbFwiIHJvbGU9XCJmb3JtXCI+XFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cXG4gICAgICAgICAgICAgICAgPGlucHV0IGlkPVwibGFzdEFjdGl2aXR5XCJcXG4gICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQteHNcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgbmctbW9kZWw9XCJjdHJsLmxhc3RBY3Rpdml0eVwiXFxuICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkFjdGl2aXR5Li4uXCI+IGRheXNcXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxcbiAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJmaWx0ZXJUZXh0XCJcXG4gICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQteHNcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgbmctbW9kZWw9XCJjdHJsLmZpbHRlclRleHRcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJUaXRsZSBjb250YWlucy4uLlwiPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XFxuXFxuICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cImxpbWl0XCJcXG4gICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQteHNcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgbmctbW9kZWw9XCJjdHJsLmxpbWl0XCJcXG4gICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTGltaXQuLi5cIj4gaXRlbXNcXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2PlxcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiZmlsdGVyXCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIj5cXG4gICAgICAgICAgICA8c3BhbiBuZy1oaWRlPVwiY3RybC5pc1N1Ym1pdHRpbmdcIj5cXG4gICAgICAgICAgICAgIEZpbHRlclxcbiAgICAgICAgICAgIDwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIG5nLXNob3c9XCJjdHJsLmlzU3VibWl0dGluZ1wiPlxcbiAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhIGZhLXNwaW5uZXIgZmEtc3BpblwiPjwvaT5cXG4gICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgPC9mb3JtPlxcbiAgICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6IDJlbVwiPlxcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJjbGVhcl9leGNlcHRpb25zXCIgY2xhc3M9XCJidG5cIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLmNsZWFyRXhjZXB0aW9ucygpXCI+XFxuICAgICAgICAgICAgICAgIENsZWFyIEV4Y2VwdGlvbnNcXG4gICAgICAgICAgICA8L2J1dHRvbj5cXG5cXG4gICAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cImNvbC1tZC0xMFwiPlxcbiAgICAgICAgPGRpdiBuZy1pZj1cImN0cmwuaXNMb2FkaW5nKClcIj5cXG4gICAgICAgICAgICA8ZW0+TG9hZGluZyBpbmFjdGl2ZSBjb21tdW5pdGllcy4uLjwvZW0+XFxuICAgICAgICA8L2Rpdj5cXG4gICAgICAgIDxkaXYgbmctaWY9XCJjdHJsLmluYWN0aXZlQ29tbXVuaXRpZXMubGVuZ3RoPT0wXCI+XFxuICAgICAgICAgICAgPGVtPk5vIGNvbW11bml0aWVzIG1hdGNoaW5nIHRob3NlIGNyaXRlcmlhPC9lbT5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtc3RyaXBlZFwiXFxuICAgICAgICAgICAgICAgbmctaWY9XCJjdHJsLmluYWN0aXZlQ29tbXVuaXRpZXMubGVuZ3RoPjBcIj5cXG4gICAgICAgICAgICA8dGhlYWQ+XFxuICAgICAgICAgICAgPHRoPlRpdGxlPC90aD5cXG4gICAgICAgICAgICA8dGg+QWN0aXZpdHkgRGF0ZTwvdGg+XFxuICAgICAgICAgICAgPHRoPkl0ZW1zPC90aD5cXG4gICAgICAgICAgICA8dGggd2lkdGg9XCIxMTBcIj5TdGF0dXM8L3RoPlxcbiAgICAgICAgICAgIDx0aCB3aWR0aD1cIjE2MFwiPkFjdGlvbjwvdGg+XFxuICAgICAgICAgICAgPC90aGVhZD5cXG4gICAgICAgICAgICA8dGJvZHk+XFxuICAgICAgICAgICAgPHRyXFxuICAgICAgICAgICAgICAgICAgICBuZy1yZXBlYXQ9XCJpYSBpbiBjdHJsLmluYWN0aXZlQ29tbXVuaXRpZXMgfCBvcmRlckJ5OlxcJ2FjdGl2aXR5RGF0ZVxcJ1wiPlxcbiAgICAgICAgICAgICAgICA8dGQ+XFxuICAgICAgICAgICAgICAgICAgICA8YSBuZy1ocmVmPVwiL2NvbW11bml0aWVzL3t7aWEubmFtZX19XCJcXG4gICAgICAgICAgICAgICAgICAgICAgIG5nLWJpbmQ9XCJpYS50aXRsZVwiPlRpdGxlPC9hPlxcbiAgICAgICAgICAgICAgICA8L3RkPlxcbiAgICAgICAgICAgICAgICA8dGQgbmctYmluZD1cImlhLmxhc3RfYWN0aXZpdHkuc3BsaXQoXFwnLlxcJylbMF1cIj48L3RkPlxcbiAgICAgICAgICAgICAgICA8dGQgbmctYmluZD1cImlhLml0ZW1zXCI+PC90ZD5cXG4gICAgICAgICAgICAgICAgPHRkPlxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gbmctaWY9XCJpYS5zdGF0dXMgPT0gbnVsbFwiPmRlZmF1bHQ8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyAhPSBudWxsXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWJpbmQ9XCJpYS5zdGF0dXNcIj5kZWZhdWx0PC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8L3RkPlxcbiAgICAgICAgICAgICAgICA8dGQ+XFxuICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBudWxsXCI+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNldFN0YXR1cyhpYSwgXFwnY29weVxcJylcIj5Db3B5XFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBcXCdjb3B5aW5nXFwnXCI+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNldFN0YXR1cyhpYSwgXFwnc3RvcFxcJylcIj5TdG9wXFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4teHMgYnRuLXByaW1hcnlcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJjdHJsLnNob3dMb2coaWEpXCI+TG9nXFxuICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBuZy1pZj1cImlhLnN0YXR1cyA9PSBcXCdyZXZpZXdpbmdcXCdcIj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2V0U3RhdHVzKGlhLCBcXCdtb3RoYmFsbFxcJylcIj5Nb3RoYmFsbFxcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5zZXRTdGF0dXMoaWEsIFxcJ3N0b3BcXCcpXCI+U3RvcFxcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5XCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5zaG93TG9nKGlhKVwiPkxvZ1xcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gbmctaWY9XCJpYS5zdGF0dXMgPT0gXFwncmVtb3ZpbmdcXCdcIj5cXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeVwiXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImN0cmwuc2hvd0xvZyhpYSlcIj5Mb2dcXG4gICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgIDwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPC90ZD5cXG4gICAgICAgICAgICA8L3RyPlxcbiAgICAgICAgICAgIDwvdGJvZHk+XFxuICAgICAgICA8L3RhYmxlPlxcbiAgICA8L2Rpdj5cXG5cXG48L2Rpdj5cXG48c2NyaXB0IHR5cGU9XCJ0ZXh0L25nLXRlbXBsYXRlXCIgaWQ9XCJteU1vZGFsQ29udGVudC5odG1sXCI+XFxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1oZWFkZXJcIj5cXG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgcHVsbC1yaWdodFwiXFxuICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiY3RybC5jbG9zZSgpXCI+XFxuICAgICAgICAgICAgPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZS1jaXJjbGVcIj48L2k+XFxuICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgIDxoMyBjbGFzcz1cIm1vZGFsLXRpdGxlXCI+TG9nPC9oMz5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCIgc3R5bGU9XCJoZWlnaHQ6IDQwMHB4OyBvdmVyZmxvdzogc2Nyb2xsXCI+XFxuICAgICAgICA8dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1zdHJpcGVkXCI+XFxuICAgICAgICAgICAgPHRib2R5PlxcbiAgICAgICAgICAgIDx0ciBuZy1yZXBlYXQ9XCJlbnRyeSBpbiBjdHJsLmxvZ0VudHJpZXNcIj5cXG4gICAgICAgICAgICAgICAgPHRkIHdpZHRoPVwiMjAlXCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLWJpbmQ9XCI6OmVudHJ5LnRpbWVzdGFtcC5zcGxpdChcXCcuXFwnKVswXVwiPnRpbWVzdGFtcCB0aGF0IGlzXFxuICAgICAgICAgICAgICAgICAgICBsb25nXFxuICAgICAgICAgICAgICAgIDwvdGQ+XFxuICAgICAgICAgICAgICAgIDx0ZCBuZy1iaW5kPVwiOjplbnRyeS5sZXZlbFwiPjwvdGQ+XFxuICAgICAgICAgICAgICAgIDx0ZCBuZy1iaW5kPVwiOjplbnRyeS5tZXNzYWdlXCI+dGhpcyBpcyB3aGVyZSBhIG1lc3NhZ2Ugd291bGRcXG4gICAgICAgICAgICAgICAgICAgIGdvIHdpdGggYSBsb3Qgb2Ygc3BhY2VcXG4gICAgICAgICAgICAgICAgPC90ZD5cXG4gICAgICAgICAgICA8L3RyPlxcbiAgICAgICAgICAgIDwvdGJvZHk+XFxuICAgICAgICA8L3RhYmxlPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICAgIDxsaSBuZy1yZXBlYXQ9XCJpdGVtIGluIGN0cmwuaXRlbXNcIj5cXG4gICAgICAgICAgICAgICAge3sgaXRlbSB9fVxcbiAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICA8L2Rpdj5cXG48L3NjcmlwdD5cXG4nOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgY2xhc3M9XCJyb3dcIj5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtMTBcIj5cXG4gICAgPGgxPkJveCBMb2dpbjwvaDE+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJjb2wtbWQtOFwiPlxcbiAgICA8cD5FaXRoZXIgeW91IGhhdmUgbmV2ZXIgbG9nZ2VkIEtBUkwgaW50byBCb3gsIG9yIHRoZSB0b2tlbiBCb3hcXG4gICAgICBsYXN0IGdhdmUgeW91IGlzIG5vdyBleHBpcmVkIG9yIGludmFsaWQuIFBsZWFzZSBjbGljayB0aGVcXG4gICAgICBidXR0b24gYmVsb3cgdG8gbG9nIEtBUkwgYmFjayBpbnRvIEJveC48L3A+XFxuXFxuICAgIDxkaXYgbmctaWY9XCJjdHJsLmxvZ2luVXJsXCI+XFxuICAgICAgPGFcXG4gICAgICAgICAgY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgYnRuLWxnXCJcXG4gICAgICAgICAgaHJlZj1cInt7Y3RybC5sb2dpblVybH19XCI+XFxuICAgICAgICBMb2dpblxcbiAgICAgIDwvYT5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgbmctaWY9XCIhY3RybC5sb2dpblVybFwiIGNsYXNzPVwiYWxlcnQgYWxlcnQtd2FybmluZ1wiPlxcbiAgICAgIFlvdSBkb25cXCd0IGhhdmUgYSBCb3ggVVJMIGZvciBsb2dnaW5nIGluLiBUaGlzIGxpa2VseSBoYXBwZW5lZFxcbiAgICAgIGR1ZSB0byBhIHJlbG9hZCBvZiB0aGlzIHBhZ2UuIENsaWNrIG9uIDxjb2RlPkFyY2hpdmUgdG9cXG4gICAgICBCb3g8L2NvZGU+IHRvIGNvcnJlY3QuXFxuICAgIDwvZGl2PlxcbiAgPC9kaXY+XFxuPC9kaXY+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2PlxcbiAgPGgxPmFkbWluNSBBZG1pbiBTY3JlZW48L2gxPlxcblxcbiAgPHA+VGFraW5nIHRoZSB3b3JrIGRvbmUgaW4gdGhlIFBlb3BsZSBEaXJlY3RvcnkgQ29uZmlndXJhdG9yXFxuICB0b29sIGFuIGFwcGx5aW5nIGluIGdlbmVyYWxseSB0byBhZG1pbiBmb3IgS0FSTC48L3A+XFxuXFxuPC9kaXY+JzsiXX0=
