var traverser = angular.module("traverser", []);

traverser.service("traverser", function ($http) {
    var self = this;
    this.counter = 0;
    this.site_data = {};
    this.getName = function (name) {
        this.counter += 1;
        return name + " Smith";
    };

    this.sendMessage = function (msg) {
        return $http.get('somthing.json?msg=' + msg)
            .success(function (data, status, headers, config) {
                         self.site_data = data;
                         return data;
                     });
    };
});
