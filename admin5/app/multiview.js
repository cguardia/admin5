var multiview = angular.module("MultiViewApp", ['MultiViewDirectives']);

multiview.value('MultiViewPaths',
                {'/': {
                    content: {
                        templateUrl: 'partials/root_content.html'
                    },
                    secondaryContent: {
                        templateUrl: 'partials/root_secondary.html',
                        controller: 'ListUsersCtrl'
                    }
                },
                    '/cats': {
                        content: {
                            templateUrl: 'partials/cats_content.html',
                            controller: 'ListCatsCtrl'
                        },
                        secondaryContent: {
                            templateUrl: 'partials/cats_secondary.html',
                            controller: 'CatOfTheMinuteCtrl'
                        }
                    }
                });


/* creating the controllers and their data */
multiview.controller('ListUsersCtrl', ['$scope', function ($scope) {
    $scope.users = ['Lord Nikon', 'Acid Burn', 'Crash Override'];
}]);

multiview.value('cats', ['Toonces', 'Stache', 'Americat', 'Cassiopeia',
    'Puck', 'Dica', 'Vivian', 'Shosh', 'Gray', 'Bashful', 'Querida',
    'Ignatowski', 'Aenias', 'Ramsay', 'Ishcabible', 'Guinness',
    'Roux', 'Gefahr']);

multiview.controller('ListCatsCtrl', ['$scope', 'cats', function ($scope, cats) {
    $scope.cats = cats;
}]);

multiview.controller('CatOfTheMinuteCtrl', ['$scope', 'cats', function ($scope, cats) {
    var randIndex = Math.floor(Math.random() * cats.length);
    $scope.cat = cats[randIndex];
}]);

