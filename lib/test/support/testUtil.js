"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.togglerLink = exports.titleSpan = exports.singleChild = void 0;
var singleChild = exports.singleChild = function singleChild($el, selector) {
  var $result = $el.children(selector);

  /* istanbul ignore if */
  if ($result.length === 0) {
    throw "No child found for selector '".concat(selector, "'");
  }

  /* istanbul ignore if */
  if ($result.length > 1) {
    throw "Multiple elements found for selector '".concat(selector, "'");
  }
  return $result;
};
var titleSpan = exports.titleSpan = function titleSpan(liNode) {
  return singleChild(nodeElement(liNode), "span.jqtree-title");
};
var togglerLink = exports.togglerLink = function togglerLink(liNode) {
  return singleChild(nodeElement(liNode), "a.jqtree-toggler");
};
var nodeElement = function nodeElement(liNode) {
  return singleChild(jQuery(liNode), "div.jqtree-element ");
};