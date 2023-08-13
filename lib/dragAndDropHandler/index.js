"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DragAndDropHandler = void 0;
var _node = require("../node");
var _dragElement = _interopRequireDefault(require("./dragElement"));
var _hitAreasGenerator = _interopRequireDefault(require("./hitAreasGenerator"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
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
      this.dragElement = new _dragElement["default"](node.name, positionInfo.pageX - left, positionInfo.pageY - top, this.treeWidget.element, (_this$treeWidget$opti = this.treeWidget.options.autoEscape) !== null && _this$treeWidget$opti !== void 0 ? _this$treeWidget$opti : true);
      this.isDragging = true;
      this.positionInfo = positionInfo;
      this.currentItem.element.classList.add("jqtree-moving");
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
        this.currentItem.element.classList.remove("jqtree-moving");
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
          this.currentItem.element.classList.add("jqtree-moving");
        }
      }
    }
  }, {
    key: "generateHitAreas",
    value: function generateHitAreas() {
      if (!this.currentItem) {
        this.hitAreas = [];
      } else {
        var hitAreasGenerator = new _hitAreasGenerator["default"](this.treeWidget.tree, this.currentItem.node, this.getTreeDimensions().bottom);
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