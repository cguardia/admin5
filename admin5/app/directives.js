var directives = angular.module("MultiViewDirectives", []);


directives.directive("ngMultiView", ['$rootScope', '$compile',
    '$controller', '$location', '$sce', '$http', '$templateCache', 'MultiViewPaths',
    function ($rootScope, $compile, $controller, $location, $sce, $http, $templateCache, MultiViewPaths) {
        return {
            transclude: 'element',
            compile: function (element, attr, linker) {
                return function (scope, $element, attr) {
                    var currentElement,
                        panel = attr.ngMultiView;

                    $rootScope.$on('$locationChangeSuccess', update);
                    update();

                    // update view
                    function update(evt, newUrl, oldUrl) {
                        if (!newUrl) {
                            return
                        }
                        var url = newUrl.match(/#(\/.*)/),
                            match, templateUrl, template, controller;

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