"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.togglerLink = exports.titleSpan = exports.singleChild = void 0;
const singleChild = ($el, selector) => {
  const $result = $el.children(selector);

  /* istanbul ignore if */
  if ($result.length === 0) {
    throw `No child found for selector '${selector}'`;
  }

  /* istanbul ignore if */
  if ($result.length > 1) {
    throw `Multiple elements found for selector '${selector}'`;
  }
  return $result;
};
exports.singleChild = singleChild;
const titleSpan = liNode => singleChild(nodeElement(liNode), "span.jqtree-title");
exports.titleSpan = titleSpan;
const togglerLink = liNode => singleChild(nodeElement(liNode), "a.jqtree-toggler");
exports.togglerLink = togglerLink;
const nodeElement = liNode => singleChild(jQuery(liNode), "div.jqtree-element ");