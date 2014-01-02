var traversal = angular.module("traversal", []);

traversal.service("traverser", function ($rootScope, $location, $http) {
    var self = this;
    this.siteData = {};
    this.views = [];
    var exc_text = "Missing View Property: ";


    $rootScope.$on(
        '$locationChangeSuccess', function (event) {
            event.preventDefault();
            self.traverseTo($location.path());
        }
    );

    this.traverseTo = function (path) {
        $rootScope.$broadcast("traverserChanged", path);
    };

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


traversal.directive("trvView", ['$rootScope', '$compile',
    '$controller', '$location', '$sce', '$http',
    '$templateCache', 'traverser',
    function ($rootScope, $compile, $controller, $location, $sce, $http, $templateCache, traverser) {
        return {
            transclude: 'element',
            compile: function (element, attr, linker) {
                return function (scope, $element, attr) {
                    var currentElement,
                        panel = attr.trvView;

                    $rootScope.$on("traverserChanged", function (event, newPath) {
                        console.log("newPath", newPath);
                    });


                    $rootScope.$on('$locationChangeSuccess', update);
                    update();

                    // update view
                    function update(evt, newUrl, oldUrl) {
                        if (!newUrl) {
                            return
                        }

                        var url = newUrl.match(/#(\/.*)/),
                            match, templateUrl, template, controller;

                        console.log("newUrl", newUrl, url);

                        var MultiViewPaths = traverser.MultiViewPaths;

                        match = url ? MultiViewPaths[url[1]] : MultiViewPaths['/'];
                        templateUrl = match[panel].templateUrl;
                        controller = match[panel].controller;

                        if (templateUrl) {
                            var newScope = scope.$new(),
                                locals = {},
                                newController = controller;

                            templateUrl = $sce.getTrustedResourceUrl(templateUrl);
                            $http.get(templateUrl, {cache: $templateCache})
                                .then(function (response) {
                                          template = response.data;

                                          linker(newScope, function (clone) {
                                              clone.html(template);
                                              $element.parent().append(clone);

                                              if (currentElement) {
                                                  currentElement.remove();
                                              }

                                              var link = $compile(clone.contents());

                                              currentElement = clone;

                                              if (newController) {
                                                  locals.$scope = newScope;
                                                  var controller = $controller(newController, locals);
                                                  clone.data('$ngControllerController', newController);
                                                  clone.children().data('$ngControllerController', newController);
                                              }

                                              link(newScope);
                                              newScope.$emit('$viewContentLoaded');
                                          });

                                      });

                        } else {
                            //cleanup last view
                        }
                    }
                }
            }
        }
    }]);