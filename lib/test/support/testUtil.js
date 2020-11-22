"use strict";
exports.__esModule = true;
exports.togglerLink = exports.titleSpan = exports.singleChild = void 0;
var singleChild = function ($el, selector) {
    var $result = $el.children(selector);
    /* istanbul ignore if */
    if ($result.length === 0) {
        throw "No child found for selector '" + selector + "'";
    }
    /* istanbul ignore if */
    if ($result.length > 1) {
        throw "Multiple elements found for selector '" + selector + "'";
    }
    return $result;
};
exports.singleChild = singleChild;
var titleSpan = function (liNode) { return exports.singleChild(nodeElement(liNode), "span.jqtree-title"); };
exports.titleSpan = titleSpan;
var togglerLink = function (liNode) { return exports.singleChild(nodeElement(liNode), "a.jqtree-toggler"); };
exports.togglerLink = togglerLink;
var nodeElement = function (liNode) { return exports.singleChild(jQuery(liNode), "div.jqtree-element "); };
