describe("Traverser Service", function () {

    var traverser, httpBackend;

    beforeEach(function () {
        module("traverser");

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
        it("should have siteData and loadData", function () {
            expect(traverser.siteData).toBeDefined();
            expect(angular.isFunction(traverser.loadData)).toBe(true);
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

});