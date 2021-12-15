"use strict";

var _treeStructure = _interopRequireDefault(require("./treeStructure"));

var _testUtil = require("./testUtil");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var assertJqTreeFolder = function assertJqTreeFolder($el) {
  /* istanbul ignore if */
  if (!$el.hasClass("jqtree-folder")) {
    throw new Error("Node is not a folder");
  }
};

expect.extend({
  toBeClosed: function toBeClosed(el) {
    var $el = jQuery(el);
    assertJqTreeFolder($el);
    /* istanbul ignore next */

    return {
      message: function message() {
        return "The node is open";
      },
      pass: $el.hasClass("jqtree-closed")
    };
  },
  toBeFocused: function toBeFocused(el) {
    /* istanbul ignore next */
    return {
      message: function message() {
        return "The is node is not focused";
      },
      pass: document.activeElement === (0, _testUtil.titleSpan)(el)[0]
    };
  },
  toBeOpen: function toBeOpen(el) {
    var $el = jQuery(el);
    assertJqTreeFolder($el);
    /* istanbul ignore next */

    return {
      message: function message() {
        return "The node is closed";
      },
      pass: !$el.hasClass("jqtree-closed")
    };
  },
  toBeSelected: function toBeSelected(el) {
    var $el = jQuery(el);
    /* istanbul ignore next */

    return {
      message: function message() {
        return "The node is not selected";
      },
      pass: $el.hasClass("jqtree-selected")
    };
  },
  toHaveTreeStructure: function toHaveTreeStructure(el, expectedStructure) {
    var _this = this;

    var $el = jQuery(el);
    var receivedStructure = (0, _treeStructure["default"])($el);
    /* istanbul ignore next */

    return {
      message: function message() {
        return _this.utils.printDiffOrStringify(expectedStructure, receivedStructure, "expected", "received", true);
      },
      pass: this.equals(receivedStructure, expectedStructure)
    };
  }
});