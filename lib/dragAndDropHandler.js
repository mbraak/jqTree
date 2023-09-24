"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HitAreasGenerator = exports.DragAndDropHandler = void 0;
var _node = require("./node");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var DragAndDropHandler = /*#__PURE__*/function () {
  function DragAndDropHandler(treeWidget) {
    _classCallCheck(this, DragAndDropHandler);
    _defineProperty(this, "hitAreas", void 0);
    _defineProperty(this, "isDragging", void 0);
    _defineProperty(this, "currentItem", void 0);
    _defineProperty(this, "hoveredArea", void 0);
    _defineProperty(this, "positionInfo", void 0);
    _defineProperty(this, "treeWidget", void 0);
    _defineProperty(this, "dragElement", void 0);
    _defineProperty(this, "previousGhost", void 0);
    _defineProperty(this, "openFolderTimer", void 0);
    this.treeWidget = treeWidget;
    this.hoveredArea = null;
    this.hitAreas = [];
    this.isDragging = false;
    this.currentItem = null;
    this.positionInfo = null;
  }
  _createClass(DragAndDropHandler, [{
    key: "mouseCapture",
    value: function mouseCapture(positionInfo) {
      var $element = jQuery(positionInfo.target);
      if (!this.mustCaptureElement($element)) {
        return null;
      }
      if (this.treeWidget.options.onIsMoveHandle && !this.treeWidget.options.onIsMoveHandle($element)) {
        return null;
      }
      var nodeElement = this.treeWidget._getNodeElement($element);
      if (nodeElement && this.treeWidget.options.onCanMove) {
        if (!this.treeWidget.options.onCanMove(nodeElement.node)) {
          nodeElement = null;
        }
      }
      this.currentItem = nodeElement;
      return this.currentItem != null;
    }
  }, {
    key: "mouseStart",
    value: function mouseStart(positionInfo) {
      var _this$treeWidget$opti;
      if (!this.currentItem || positionInfo.pageX === undefined || positionInfo.pageY === undefined) {
        return false;
      }
      this.refresh();
      var offset = jQuery(positionInfo.target).offset();
      var left = offset ? offset.left : 0;
      var top = offset ? offset.top : 0;
      var node = this.currentItem.node;
      this.dragElement = new DragElement(node.name, positionInfo.pageX - left, positionInfo.pageY - top, this.treeWidget.element, (_this$treeWidget$opti = this.treeWidget.options.autoEscape) !== null && _this$treeWidget$opti !== void 0 ? _this$treeWidget$opti : true);
      this.isDragging = true;
      this.positionInfo = positionInfo;
      this.currentItem.$element.addClass("jqtree-moving");
      return true;
    }
  }, {
    key: "mouseDrag",
    value: function mouseDrag(positionInfo) {
      if (!this.currentItem || !this.dragElement || positionInfo.pageX === undefined || positionInfo.pageY === undefined) {
        return false;
      }
      this.dragElement.move(positionInfo.pageX, positionInfo.pageY);
      this.positionInfo = positionInfo;
      var area = this.findHoveredArea(positionInfo.pageX, positionInfo.pageY);
      if (area && this.canMoveToArea(area)) {
        if (!area.node.isFolder()) {
          this.stopOpenFolderTimer();
        }
        if (this.hoveredArea !== area) {
          this.hoveredArea = area;

          // If this is a closed folder, start timer to open it
          if (this.mustOpenFolderTimer(area)) {
            this.startOpenFolderTimer(area.node);
          } else {
            this.stopOpenFolderTimer();
          }
          this.updateDropHint();
        }
      } else {
        this.removeDropHint();
        this.stopOpenFolderTimer();
        this.hoveredArea = area;
      }
      if (!area) {
        if (this.treeWidget.options.onDragMove) {
          this.treeWidget.options.onDragMove(this.currentItem.node, positionInfo.originalEvent);
        }
      }
      return true;
    }
  }, {
    key: "mouseStop",
    value: function mouseStop(positionInfo) {
      this.moveItem(positionInfo);
      this.clear();
      this.removeHover();
      this.removeDropHint();
      this.removeHitAreas();
      var currentItem = this.currentItem;
      if (this.currentItem) {
        this.currentItem.$element.removeClass("jqtree-moving");
        this.currentItem = null;
      }
      this.isDragging = false;
      this.positionInfo = null;
      if (!this.hoveredArea && currentItem) {
        if (this.treeWidget.options.onDragStop) {
          this.treeWidget.options.onDragStop(currentItem.node, positionInfo.originalEvent);
        }
      }
      return false;
    }
  }, {
    key: "refresh",
    value: function refresh() {
      this.removeHitAreas();
      if (this.currentItem) {
        this.generateHitAreas();
        this.currentItem = this.treeWidget._getNodeElementForNode(this.currentItem.node);
        if (this.isDragging) {
          this.currentItem.$element.addClass("jqtree-moving");
        }
      }
    }
  }, {
    key: "generateHitAreas",
    value: function generateHitAreas() {
      if (!this.currentItem) {
        this.hitAreas = [];
      } else {
        var hitAreasGenerator = new HitAreasGenerator(this.treeWidget.tree, this.currentItem.node, this.getTreeDimensions().bottom);
        this.hitAreas = hitAreasGenerator.generate();
      }
    }
  }, {
    key: "mustCaptureElement",
    value: function mustCaptureElement($element) {
      return !$element.is("input,select,textarea");
    }
  }, {
    key: "canMoveToArea",
    value: function canMoveToArea(area) {
      if (!this.treeWidget.options.onCanMoveTo) {
        return true;
      }
      if (!this.currentItem) {
        return false;
      }
      var positionName = (0, _node.getPositionName)(area.position);
      return this.treeWidget.options.onCanMoveTo(this.currentItem.node, area.node, positionName);
    }
  }, {
    key: "removeHitAreas",
    value: function removeHitAreas() {
      this.hitAreas = [];
    }
  }, {
    key: "clear",
    value: function clear() {
      if (this.dragElement) {
        this.dragElement.remove();
        this.dragElement = null;
      }
    }
  }, {
    key: "removeDropHint",
    value: function removeDropHint() {
      if (this.previousGhost) {
        this.previousGhost.remove();
      }
    }
  }, {
    key: "removeHover",
    value: function removeHover() {
      this.hoveredArea = null;
    }
  }, {
    key: "findHoveredArea",
    value: function findHoveredArea(x, y) {
      var dimensions = this.getTreeDimensions();
      if (x < dimensions.left || y < dimensions.top || x > dimensions.right || y > dimensions.bottom) {
        return null;
      }
      var low = 0;
      var high = this.hitAreas.length;
      while (low < high) {
        var mid = low + high >> 1;
        var area = this.hitAreas[mid];
        if (!area) {
          return null;
        }
        if (y < area.top) {
          high = mid;
        } else if (y > area.bottom) {
          low = mid + 1;
        } else {
          return area;
        }
      }
      return null;
    }
  }, {
    key: "mustOpenFolderTimer",
    value: function mustOpenFolderTimer(area) {
      var node = area.node;
      return node.isFolder() && !node.is_open && area.position === _node.Position.Inside;
    }
  }, {
    key: "updateDropHint",
    value: function updateDropHint() {
      if (!this.hoveredArea) {
        return;
      }

      // remove previous drop hint
      this.removeDropHint();

      // add new drop hint
      var nodeElement = this.treeWidget._getNodeElementForNode(this.hoveredArea.node);
      this.previousGhost = nodeElement.addDropHint(this.hoveredArea.position);
    }
  }, {
    key: "startOpenFolderTimer",
    value: function startOpenFolderTimer(folder) {
      var _this = this;
      var openFolder = function openFolder() {
        _this.treeWidget._openNode(folder, _this.treeWidget.options.slide, function () {
          _this.refresh();
          _this.updateDropHint();
        });
      };
      this.stopOpenFolderTimer();
      var openFolderDelay = this.treeWidget.options.openFolderDelay;
      if (openFolderDelay !== false) {
        this.openFolderTimer = window.setTimeout(openFolder, openFolderDelay);
      }
    }
  }, {
    key: "stopOpenFolderTimer",
    value: function stopOpenFolderTimer() {
      if (this.openFolderTimer) {
        clearTimeout(this.openFolderTimer);
        this.openFolderTimer = null;
      }
    }
  }, {
    key: "moveItem",
    value: function moveItem(positionInfo) {
      var _this2 = this;
      if (this.currentItem && this.hoveredArea && this.hoveredArea.position !== _node.Position.None && this.canMoveToArea(this.hoveredArea)) {
        var movedNode = this.currentItem.node;
        var targetNode = this.hoveredArea.node;
        var position = this.hoveredArea.position;
        var previousParent = movedNode.parent;
        if (position === _node.Position.Inside) {
          this.hoveredArea.node.is_open = true;
        }
        var doMove = function doMove() {
          _this2.treeWidget.tree.moveNode(movedNode, targetNode, position);
          _this2.treeWidget.element.empty();
          _this2.treeWidget._refreshElements(null);
        };
        var event = this.treeWidget._triggerEvent("tree.move", {
          move_info: {
            moved_node: movedNode,
            target_node: targetNode,
            position: (0, _node.getPositionName)(position),
            previous_parent: previousParent,
            do_move: doMove,
            original_event: positionInfo.originalEvent
          }
        });
        if (!event.isDefaultPrevented()) {
          doMove();
        }
      }
    }
  }, {
    key: "getTreeDimensions",
    value: function getTreeDimensions() {
      // Return the dimensions of the tree. Add a margin to the bottom to allow
      // to drag-and-drop after the last element.
      var offset = this.treeWidget.element.offset();
      if (!offset) {
        return {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0
        };
      } else {
        var el = this.treeWidget.element;
        var width = el.width() || 0;
        var height = el.height() || 0;
        var left = offset.left + this.treeWidget._getScrollLeft();
        return {
          left: left,
          top: offset.top,
          right: left + width,
          bottom: offset.top + height + 16
        };
      }
    }
  }]);
  return DragAndDropHandler;
}();
exports.DragAndDropHandler = DragAndDropHandler;
var VisibleNodeIterator = /*#__PURE__*/function () {
  function VisibleNodeIterator(tree) {
    _classCallCheck(this, VisibleNodeIterator);
    _defineProperty(this, "tree", void 0);
    this.tree = tree;
  }
  _createClass(VisibleNodeIterator, [{
    key: "iterate",
    value: function iterate() {
      var _this3 = this;
      var isFirstNode = true;
      var _iterateNode = function _iterateNode(node, nextNode) {
        var mustIterateInside = (node.is_open || !node.element) && node.hasChildren();
        var $element = null;
        if (node.element) {
          $element = jQuery(node.element);
          if (!$element.is(":visible")) {
            return;
          }
          if (isFirstNode) {
            _this3.handleFirstNode(node);
            isFirstNode = false;
          }
          if (!node.hasChildren()) {
            _this3.handleNode(node, nextNode, $element);
          } else if (node.is_open) {
            if (!_this3.handleOpenFolder(node, $element)) {
              mustIterateInside = false;
            }
          } else {
            _this3.handleClosedFolder(node, nextNode, $element);
          }
        }
        if (mustIterateInside) {
          var childrenLength = node.children.length;
          node.children.forEach(function (_, i) {
            var child = node.children[i];
            if (child) {
              if (i === childrenLength - 1) {
                _iterateNode(child, null);
              } else {
                var nextChild = node.children[i + 1];
                if (nextChild) {
                  _iterateNode(child, nextChild);
                }
              }
            }
          });
          if (node.is_open && $element) {
            _this3.handleAfterOpenFolder(node, nextNode);
          }
        }
      };
      _iterateNode(this.tree, null);
    }
  }]);
  return VisibleNodeIterator;
}();
var HitAreasGenerator = /*#__PURE__*/function (_VisibleNodeIterator) {
  _inherits(HitAreasGenerator, _VisibleNodeIterator);
  var _super = _createSuper(HitAreasGenerator);
  function HitAreasGenerator(tree, currentNode, treeBottom) {
    var _this4;
    _classCallCheck(this, HitAreasGenerator);
    _this4 = _super.call(this, tree);
    _defineProperty(_assertThisInitialized(_this4), "currentNode", void 0);
    _defineProperty(_assertThisInitialized(_this4), "treeBottom", void 0);
    _defineProperty(_assertThisInitialized(_this4), "positions", void 0);
    _defineProperty(_assertThisInitialized(_this4), "lastTop", void 0);
    _this4.currentNode = currentNode;
    _this4.treeBottom = treeBottom;
    return _this4;
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

        // Dnd over the current element is not possible: add a position with type None for the top and the bottom.
        var top = this.getTop($element);
        var height = $element.height() || 0;
        this.addPosition(node, _node.Position.None, top);
        if (height > 5) {
          // Subtract 5 pixels to allow more space for the next element.
          this.addPosition(node, _node.Position.None, top + height - 5);
        }

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
        if (position && position.position !== _node.Position.None) {
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
}(VisibleNodeIterator);
exports.HitAreasGenerator = HitAreasGenerator;
var DragElement = /*#__PURE__*/function () {
  function DragElement(nodeName, offsetX, offsetY, $tree, autoEscape) {
    _classCallCheck(this, DragElement);
    _defineProperty(this, "offsetX", void 0);
    _defineProperty(this, "offsetY", void 0);
    _defineProperty(this, "$element", void 0);
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.$element = jQuery("<span>").addClass("jqtree-title jqtree-dragging");
    if (autoEscape) {
      this.$element.text(nodeName);
    } else {
      this.$element.html(nodeName);
    }
    this.$element.css("position", "absolute");
    $tree.append(this.$element);
  }
  _createClass(DragElement, [{
    key: "move",
    value: function move(pageX, pageY) {
      this.$element.offset({
        left: pageX - this.offsetX,
        top: pageY - this.offsetY
      });
    }
  }, {
    key: "remove",
    value: function remove() {
      this.$element.remove();
    }
  }]);
  return DragElement;
}();