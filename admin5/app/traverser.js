var traverser = angular.module("traverser", []);

traverser.service("traverser", function ($http) {
    var self = this;
    this.siteData = {};

    this.loadData = function (url) {
        return $http.get(url)
            .success(function (data, status, headers, config) {
                         self.siteData = data;
                         return data;
                     });
    };
});
