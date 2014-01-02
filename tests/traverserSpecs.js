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
        it("should have counter and getName", function () {
            expect(traverser.counter).toBeDefined();
            expect(angular.isFunction(traverser.getName)).toBe(true);
        });
    });

    describe("Traverser", function () {
        it("should append Smith to string", function () {
            expect(traverser.counter).toBe(0);
            expect(traverser.getName("John")).toBe("John Smith");
            expect(traverser.counter).toBe(1);
        });
    });

    describe("Traverser loads HTTP data", function () {

        it('should send the msg and return the response.', function () {
            //set up some data for the http call to return and test later.
            var returnData = { excited: true };

            //expectGET to make sure this is called once.
            httpBackend.expectGET('somthing.json?msg=wee').respond(returnData);

            var result = null;
            traverser.sendMessage('wee').then(function (data) {
                result = data;
            });
            httpBackend.flush();

            expect(result.data.excited).toBe(true);
        });

    });

});