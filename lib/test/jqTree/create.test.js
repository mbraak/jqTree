"use strict";

var _givens = _interopRequireDefault(require("givens"));
require("../../tree.jquery");
var _exampleData = _interopRequireDefault(require("../support/exampleData"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
beforeEach(function () {
  $("body").append('<div id="tree1"></div>');
});
afterEach(function () {
  var $tree = $("#tree1");
  $tree.tree("destroy");
  $tree.remove();
});
describe("create with data", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
  });
  it("creates a tree", function () {
    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      name: "node1",
      open: false,
      selected: false,
      children: [expect.objectContaining({
        name: "child1"
      }), expect.objectContaining({
        name: "child2"
      })]
    }), expect.objectContaining({
      name: "node2",
      open: false,
      selected: false,
      children: [expect.objectContaining({
        name: "node3",
        open: false,
        children: [expect.objectContaining({
          name: "child3"
        })]
      })]
    })]);
  });
});