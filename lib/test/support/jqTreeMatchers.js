"use strict";

var _treeStructure = _interopRequireDefault(require("./treeStructure"));
var _testUtil = require("./testUtil");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const assertJqTreeFolder = $el => {
  /* istanbul ignore if */
  if (!$el.hasClass("jqtree-folder")) {
    throw new Error("Node is not a folder");
  }
};
expect.extend({
  toBeClosed(el) {
    const $el = jQuery(el);
    assertJqTreeFolder($el);

    /* istanbul ignore next */
    return {
      message: () => "The node is open",
      pass: $el.hasClass("jqtree-closed")
    };
  },
  toBeFocused(el) {
    /* istanbul ignore next */
    return {
      message: () => "The is node is not focused",
      pass: document.activeElement === (0, _testUtil.titleSpan)(el)[0]
    };
  },
  toBeOpen(el) {
    const $el = jQuery(el);
    assertJqTreeFolder($el);

    /* istanbul ignore next */
    return {
      message: () => "The node is closed",
      pass: !$el.hasClass("jqtree-closed")
    };
  },
  toBeSelected(el) {
    const $el = jQuery(el);

    /* istanbul ignore next */
    return {
      message: () => "The node is not selected",
      pass: $el.hasClass("jqtree-selected")
    };
  },
  toHaveTreeStructure(el, expectedStructure) {
    const $el = jQuery(el);
    const receivedStructure = (0, _treeStructure.default)($el);

    /* istanbul ignore next */
    return {
      message: () => this.utils.printDiffOrStringify(expectedStructure, receivedStructure, "expected", "received", true),
      pass: this.equals(receivedStructure, expectedStructure)
    };
  }
});