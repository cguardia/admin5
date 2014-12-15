(function () {
  function ModuleConfig(moondashMockRestProvider) {

    function getParams(url) {
      // This will be replaced with url.js later
      var params = {};
      var queryString = url.split("?")[1];
      if (queryString) {
        var parts = queryString.split('&');
        if (!parts) {
          // Only one argument
          parts = [queryString];
        }
        parts.forEach(function (part) {
          var p = part.split('=');
          params[p[0]] = p[1];
        });
      }
      return params;
    }

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

    moondashMockRestProvider.addMocks(
      'box',
      [
        {
          method: 'POST',
          pattern: /arc2box\/communities\/(\d+)\/setStatus/,
          responder: function (method, url, data) {
            // Given /api/to_archive/someDocId/setStatus
            // - Grab that community
            // - Change its status to the passed in 'status' value
            // - return ok
            var id = url.split("/")[3],
              target = _(communities).first({id: id}),
              newStatus = 'stopped';
            data = angular.fromJson(data);
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
          responder: function (method, url) {
            /*
             Process two filters:
             - inactive == 'true' or otherwise
             - filterText, lowercase comparison
             */
            var params = getParams(url);
            var filtered = _(communities).clone();

            if (params.last_activity) {
              filtered = _(communities).filter(
                function (item) {
                  return item.last_activity.indexOf('2014') != 0;
                }
              ).value();
            }

            if (params.filter) {
              var ft = params.filter.toLowerCase();
              filtered = _(filtered).filter(
                function (item) {
                  var orig = item.title.toLowerCase();
                  return orig.indexOf(ft) > -1;
                }
              ).value();
            }

            return [200, filtered];
          }
        }
      ]);

  }

  angular.module('k5')
    .config(ModuleConfig);

})();
