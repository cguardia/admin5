describe("Traversal Service", function () {

    var httpBackend, views;
    var traverser = {};
    traverser.addViews = null;
    traverser.getView = null;

    beforeEach(function () {
        module("traversal");

        inject(function ($httpBackend, _traverser_) {
            httpBackend = $httpBackend;
            traverser = _traverser_;
        });
    });

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe("Traverser exists", function () {

        it("should be importable", function () {
            expect(traverser).toBeDefined();
        });

        it("should have siteData and loadData", function () {
            expect(traverser.siteData).toBeDefined();
            expect(angular.isFunction(traverser.loadData)).toBe(true);
        });

        it("should have views and addViews", function () {
            expect(traverser.views).toBeDefined();
            expect(traverser.addViews).toBeDefined();
        });

    });

    describe("Traverser loads HTTP data", function () {

        var returnData, url;

        it('Correctly load the data and store result', function () {

            // Mock the HTTP call
            returnData = { sections: [1, 2, 3] };
            url = '/site_data.json';
            httpBackend.expectGET(url).respond(returnData);

            // Load the data
            var result = null;
            traverser.loadData(url).then(function (data) {
                result = data;
            });
            httpBackend.flush();

            expect(result.data.sections).toEqual([1, 2, 3]);
        });

    });


    describe("traverser adding views", function () {
        it("should start with no views", function () {
            expect(traverser.views.length).toBe(0);
        });

        it("should accept an empty sequence of views", function () {
            var views = [];
            traverser.addViews(views);
            expect(traverser.views.length).toBe(0);
        });

        it("should accept a basic valid view", function () {
            views = [
                {templateUri: "/some/uri"}
            ];
            traverser.addViews(views);
            expect(traverser.views.length).toBe(1);
            expect(traverser.views[0].templateUri).toBe("/some/uri");
        });

        it("should fail when view missing required properties", function () {
            views = [
                {name: "view_one"}
            ];

            function f() {
                traverser.addViews(views);
            }

            expect(f).toThrow("Missing View Property: template or templateUri required");
        });

        it("should accept type/name/templateUri", function () {
            views = [
                {
                    name: "some_view",
                    type: "SomeType",
                    templateUri: "/some/uri"}
            ];
            traverser.addViews(views);
            var v = traverser.views[0];
            expect(v.name).toBe("some_view");
            expect(v.type).toBe("SomeType");
            expect(v.templateUri).toBe("/some/uri");
        });

    });


    describe("traverser adding views", function () {
        it("should match a simple view", function () {
            views = [
                {
                    name: "some_view",
                    templateUri: "/some/uri"}
            ];
            traverser.addViews(views);
            var v = traverser.getView({}, {});
            expect(v.templateUri).toBe("/some/uri");
        });

    });
});