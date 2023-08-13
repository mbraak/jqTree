"use strict";

var _jestAxe = require("jest-axe");
require("../../tree.jquery");
var _exampleData = _interopRequireDefault(require("../support/exampleData"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
expect.extend(_jestAxe.toHaveNoViolations);
beforeEach(() => {
  $("body").append('<div id="tree1"></div>');
});
afterEach(() => {
  const $tree = $("#tree1");
  $tree.tree("destroy");
  $tree.remove();
});
it("has an accessible ui", async () => {
  const $tree = $("#tree1");
  $tree.tree({
    data: _exampleData.default
  });
  const element = $tree.get()[0];
  await expect((0, _jestAxe.axe)(element)).resolves.toHaveNoViolations();
});