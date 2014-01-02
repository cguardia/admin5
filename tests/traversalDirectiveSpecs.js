describe("Hello World Directives 1", function () {

    var element;
    var $rootScope;
    var $scope;
    var $compile;

    beforeEach(function () {
        module("traversal");
        inject(function (_$compile_, _$rootScope_) {
            $rootScope = _$rootScope_;
            $compile = _$compile_;
            $scope = $rootScope.$new();
        });
    });

    beforeEach(function () {
        element = angular.element('<div trv-view></div>');
        $compile(element)($scope);
        $scope.$digest();
    });

    describe("trvView Directive", function () {

        it("should have a class of plain", function () {
            expect(element.hasClass("plain")).toBe(true);
        });

    });

});