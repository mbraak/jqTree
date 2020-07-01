"use strict";
exports.__esModule = true;
var $ = require("jquery");
require("../tree.jquery");
var exampleData_1 = require("./exampleData");
beforeEach(function () {
    $("body").append('<div id="tree1"></div>');
});
describe("create", function () {
    describe("with data", function () {
        test("creates a tree", function () {
            $("#tree1").tree({
                data: exampleData_1["default"]
            });
            expect($("#tree1").children().length).toBe(1);
        });
    });
});
