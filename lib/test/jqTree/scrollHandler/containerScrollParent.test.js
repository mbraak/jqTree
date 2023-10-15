"use strict";

var _containerScrollParent = _interopRequireDefault(require("../../../scrollHandler/containerScrollParent"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var defaultMockJQueryElementParams = {
  height: 200,
  innerHeight: 180,
  offsetTop: 20,
  scrollLeft: 0
};
var mock$JQueryElement = function mock$JQueryElement(inputParams) {
  var params = _objectSpread(_objectSpread({}, defaultMockJQueryElementParams), inputParams);
  var element = {};
  var $element = {
    get: function get(_) {
      return element;
    },
    height: function height() {
      return params.height;
    },
    innerHeight: function innerHeight() {
      return params.innerHeight;
    },
    offset: function offset() {
      return {
        top: params.offsetTop
      };
    },
    scrollLeft: function scrollLeft() {
      return params.scrollLeft;
    }
  };
  return $element;
};
var mockContainerScrollParent = function mockContainerScrollParent($container) {
  var refreshHitAreas = jest.fn();
  var $treeElement = {};
  return new _containerScrollParent["default"]({
    $container: $container,
    refreshHitAreas: refreshHitAreas,
    $treeElement: $treeElement
  });
};
describe("getScrollLeft", function () {
  it("returns the scrollLeft of the container", function () {
    var $container = mock$JQueryElement({
      scrollLeft: 10
    });
    var containerScrollParent = mockContainerScrollParent($container);
    expect(containerScrollParent.getScrollLeft()).toBe(10);
  });
});
describe("isScrolledIntoView", function () {
  it("returns true when the element is visible", function () {
    var $container = mock$JQueryElement({
      height: 100,
      offsetTop: 0
    });
    var containerScrollParent = mockContainerScrollParent($container);
    var $element = mock$JQueryElement({
      height: 10,
      offsetTop: 0
    });
    expect(containerScrollParent.isScrolledIntoView($element)).toBe(true);
  });
  it("returns false when the element is not visible", function () {
    var $container = mock$JQueryElement({
      height: 100,
      offsetTop: 0
    });
    var containerScrollParent = mockContainerScrollParent($container);
    var $element = mock$JQueryElement({
      height: 10,
      offsetTop: 150
    });
    expect(containerScrollParent.isScrolledIntoView($element)).toBe(false);
  });
});
describe("scrollToY", function () {
  it("sets scrollTop of the container", function () {
    var $container = mock$JQueryElement({
      scrollLeft: 10
    });
    var containerScrollParent = mockContainerScrollParent($container);
    containerScrollParent.scrollToY(10);
    expect($container.get(0).scrollTop).toBe(10);
  });
});