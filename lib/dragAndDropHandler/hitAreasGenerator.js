"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _node = require("../node");
var _visibleNodeIterator = _interopRequireDefault(require("./visibleNodeIterator"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var HitAreasGenerator = /*#__PURE__*/function (_VisibleNodeIterator) {
  _inherits(HitAreasGenerator, _VisibleNodeIterator);
  var _super = _createSuper(HitAreasGenerator);
  function HitAreasGenerator(tree, currentNode, treeBottom) {
    var _this;
    _classCallCheck(this, HitAreasGenerator);
    _this = _super.call(this, tree);
    _defineProperty(_assertThisInitialized(_this), "currentNode", void 0);
    _defineProperty(_assertThisInitialized(_this), "treeBottom", void 0);
    _defineProperty(_assertThisInitialized(_this), "positions", void 0);
    _defineProperty(_assertThisInitialized(_this), "lastTop", void 0);
    _this.currentNode = currentNode;
    _this.treeBottom = treeBottom;
    return _this;
  }
  _createClass(HitAreasGenerator, [{
    key: "generate",
    value: function generate() {
      this.positions = [];
      this.lastTop = 0;
      this.iterate();
      return this.generateHitAreas(this.positions);
    }
  }, {
    key: "generateHitAreas",
    value: function generateHitAreas(positions) {
      var previousTop = -1;
      var group = [];
      var hitAreas = [];
      var _iterator = _createForOfIteratorHelper(positions),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var position = _step.value;
          if (position.top !== previousTop && group.length) {
            if (group.length) {
              this.generateHitAreasForGroup(hitAreas, group, previousTop, position.top);
            }
            previousTop = position.top;
            group = [];
          }
          group.push(position);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.generateHitAreasForGroup(hitAreas, group, previousTop, this.treeBottom);
      return hitAreas;
    }
  }, {
    key: "handleOpenFolder",
    value: function handleOpenFolder(node, $element) {
      if (node === this.currentNode) {
        // Cannot move inside current item
        // Stop iterating
        return false;
      }

      // Cannot move before current item
      if (node.children[0] !== this.currentNode) {
        this.addPosition(node, _node.Position.Inside, this.getTop($element));
      }

      // Continue iterating
      return true;
    }
  }, {
    key: "handleClosedFolder",
    value: function handleClosedFolder(node, nextNode, $element) {
      var top = this.getTop($element);
      if (node === this.currentNode) {
        // Cannot move after current item
        this.addPosition(node, _node.Position.None, top);
      } else {
        this.addPosition(node, _node.Position.Inside, top);

        // Cannot move before current item
        if (nextNode !== this.currentNode) {
          this.addPosition(node, _node.Position.After, top);
        }
      }
    }
  }, {
    key: "handleFirstNode",
    value: function handleFirstNode(node) {
      if (node !== this.currentNode) {
        this.addPosition(node, _node.Position.Before, this.getTop(jQuery(node.element)));
      }
    }
  }, {
    key: "handleAfterOpenFolder",
    value: function handleAfterOpenFolder(node, nextNode) {
      if (node === this.currentNode || nextNode === this.currentNode) {
        // Cannot move before or after current item
        this.addPosition(node, _node.Position.None, this.lastTop);
      } else {
        this.addPosition(node, _node.Position.After, this.lastTop);
      }
    }
  }, {
    key: "handleNode",
    value: function handleNode(node, nextNode, $element) {
      var top = this.getTop($element);
      if (node === this.currentNode) {
        // Cannot move inside current item
        this.addPosition(node, _node.Position.None, top);
      } else {
        this.addPosition(node, _node.Position.Inside, top);
      }
      if (nextNode === this.currentNode || node === this.currentNode) {
        // Cannot move before or after current item
        this.addPosition(node, _node.Position.None, top);
      } else {
        this.addPosition(node, _node.Position.After, top);
      }
    }
  }, {
    key: "getTop",
    value: function getTop($element) {
      var offset = $element.offset();
      return offset ? offset.top : 0;
    }
  }, {
    key: "addPosition",
    value: function addPosition(node, position, top) {
      var area = {
        top: top,
        bottom: 0,
        node: node,
        position: position
      };
      this.positions.push(area);
      this.lastTop = top;
    }
  }, {
    key: "generateHitAreasForGroup",
    value: function generateHitAreasForGroup(hitAreas, positionsInGroup, top, bottom) {
      // limit positions in group
      var positionCount = Math.min(positionsInGroup.length, 4);
      var areaHeight = Math.round((bottom - top) / positionCount);
      var areaTop = top;
      var i = 0;
      while (i < positionCount) {
        var position = positionsInGroup[i];
        if (position) {
          hitAreas.push({
            top: areaTop,
            bottom: areaTop + areaHeight,
            node: position.node,
            position: position.position
          });
        }
        areaTop += areaHeight;
        i += 1;
      }
    }
  }]);
  return HitAreasGenerator;
}(_visibleNodeIterator["default"]);
var _default = HitAreasGenerator;
exports["default"] = _default;