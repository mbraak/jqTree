"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _containerScrollParent = _interopRequireDefault(require("./containerScrollParent"));
var _documentScrollParent = _interopRequireDefault(require("./documentScrollParent"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const hasOverFlow = $element => {
  for (const attr of ["overflow", "overflow-y"]) {
    const overflowValue = $element.css(attr);
    if (overflowValue === "auto" || overflowValue === "scroll") {
      return true;
    }
  }
  return false;
};
const getParentWithOverflow = $treeElement => {
  if (hasOverFlow($treeElement)) {
    return $treeElement;
  }
  for (const element of $treeElement.parents().get()) {
    const $element = jQuery(element);
    if (hasOverFlow($element)) {
      return $element;
    }
  }
  return null;
};
const createScrollParent = ($treeElement, refreshHitAreas) => {
  const $container = getParentWithOverflow($treeElement);
  if ($container?.length && $container[0]?.tagName !== "HTML") {
    return new _containerScrollParent.default({
      $container,
      refreshHitAreas,
      $treeElement
    });
  } else {
    return new _documentScrollParent.default($treeElement, refreshHitAreas);
  }
};
var _default = exports.default = createScrollParent;