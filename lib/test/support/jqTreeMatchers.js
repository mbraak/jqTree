"use strict";
exports.__esModule = true;
var treeStructure_1 = require("./treeStructure");
var assertJqTreeFolder = function ($el) {
    /* istanbul ignore if */
    if (!$el.hasClass("jqtree-folder")) {
        throw new Error("Node is not a folder");
    }
};
expect.extend({
    notToBeSelected: function (el) {
        var $el = jQuery(el);
        /* istanbul ignore next */
        return {
            message: function () { return "The node is selected"; },
            pass: !$el.hasClass("jqtree-selected")
        };
    },
    toBeClosed: function (el) {
        var $el = jQuery(el);
        assertJqTreeFolder($el);
        /* istanbul ignore next */
        return {
            message: function () { return "The node is open"; },
            pass: $el.hasClass("jqtree-closed")
        };
    },
    toBeOpen: function (el) {
        var $el = jQuery(el);
        assertJqTreeFolder($el);
        /* istanbul ignore next */
        return {
            message: function () { return "The node is closed"; },
            pass: !$el.hasClass("jqtree-closed")
        };
    },
    toBeSelected: function (el) {
        var $el = jQuery(el);
        /* istanbul ignore next */
        return {
            message: function () { return "The node is not selected"; },
            pass: $el.hasClass("jqtree-selected")
        };
    },
    toHaveTreeStructure: function (el, expectedStructure) {
        var _this = this;
        var $el = jQuery(el);
        var receivedStructure = treeStructure_1["default"]($el);
        /* istanbul ignore next */
        return {
            message: function () {
                return _this.utils.printDiffOrStringify(expectedStructure, receivedStructure, "expected", "received", true);
            },
            pass: this.equals(receivedStructure, expectedStructure)
        };
    }
});
