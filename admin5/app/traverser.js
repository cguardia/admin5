var traversal = angular.module("traversal", []);

traversal.service("traverser", function ($http) {
    var self = this;
    this.siteData = {};
    this.views = [];
    var exc_text = "Missing View Property: ";

    this.loadData = function (url) {
        return $http.get(url)
            .success(function (data, status, headers, config) {
                         self.siteData = data;
                         return data;
                     });
    };

    this.addViews = function (views) {
        var newView, templateUri, template;

        views.forEach(function (currView) {

            newView = {};

            // One of templateUri/template has to be provided
            templateUri = currView.templateUri;
            template = currView.template;
            if ((templateUri === undefined) && (template === undefined)) {
                throw exc_text + "template or templateUri required";
            }
            if (templateUri) {
                // Load the template
                newView.templateUri = templateUri;
            } else if (template) {
                newView.template = template;
            }

            // name is the optional extra hop in the URL, if not
            // provided, then presumed to be the default view
            // for a resource
            newView.name = currView.name;

            // type is a string indicating the content type of
            // a resource that this view should match on.
            newView.type = currView.type;

            this.views.push(newView);
        }, this);
    };

    this.getView = function (context, view_name) {
        // Go through the registered views and return one that matches
        // the context (if provided) and view (if provided)

        return this.views[0];
    };
});

traversal.directive("trvView", function () {
    return {
        link: linkFn
    };

    function linkFn(scope, element) {
        element.addClass("plain");

        element.bind("click", function () {
            scope.clicked = true;
            element.addClass("clicked");
        });
    }
});