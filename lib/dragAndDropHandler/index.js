"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DragAndDropHandler = void 0;
var _node = require("../node");
var _dragElement = _interopRequireDefault(require("./dragElement"));
var _hitAreasGenerator = _interopRequireDefault(require("./hitAreasGenerator"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class DragAndDropHandler {
  constructor(treeWidget) {
    this.treeWidget = treeWidget;
    this.hoveredArea = null;
    this.hitAreas = [];
    this.isDragging = false;
    this.currentItem = null;
  }
  mouseCapture(positionInfo) {
    const element = positionInfo.target;
    if (!this.mustCaptureElement(element)) {
      return null;
    }
    if (this.treeWidget.options.onIsMoveHandle && !this.treeWidget.options.onIsMoveHandle(jQuery(element))) {
      return null;
    }
    let nodeElement = this.treeWidget._getNodeElement(element);
    if (nodeElement && this.treeWidget.options.onCanMove) {
      if (!this.treeWidget.options.onCanMove(nodeElement.node)) {
        nodeElement = null;
      }
    }
    this.currentItem = nodeElement;
    return this.currentItem != null;
  }
  mouseStart(positionInfo) {
    if (!this.currentItem || positionInfo.pageX === undefined || positionInfo.pageY === undefined) {
      return false;
    }
    this.refresh();
    const offset = jQuery(positionInfo.target).offset();
    const left = offset ? offset.left : 0;
    const top = offset ? offset.top : 0;
    const node = this.currentItem.node;
    this.dragElement = new _dragElement.default(node.name, positionInfo.pageX - left, positionInfo.pageY - top, this.treeWidget.element, this.treeWidget.options.autoEscape ?? true);
    this.isDragging = true;
    this.currentItem.element.classList.add("jqtree-moving");
    return true;
  }
  mouseDrag(positionInfo) {
    if (!this.currentItem || !this.dragElement || positionInfo.pageX === undefined || positionInfo.pageY === undefined) {
      return false;
    }
    this.dragElement.move(positionInfo.pageX, positionInfo.pageY);
    const area = this.findHoveredArea(positionInfo.pageX, positionInfo.pageY);
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
  mouseStop(positionInfo) {
    this.moveItem(positionInfo);
    this.clear();
    this.removeHover();
    this.removeDropHint();
    this.removeHitAreas();
    const currentItem = this.currentItem;
    if (this.currentItem) {
      this.currentItem.element.classList.remove("jqtree-moving");
      this.currentItem = null;
    }
    this.isDragging = false;
    if (!this.hoveredArea && currentItem) {
      if (this.treeWidget.options.onDragStop) {
        this.treeWidget.options.onDragStop(currentItem.node, positionInfo.originalEvent);
      }
    }
    return false;
  }
  refresh() {
    this.removeHitAreas();
    if (this.currentItem) {
      this.generateHitAreas();
      this.currentItem = this.treeWidget._getNodeElementForNode(this.currentItem.node);
      if (this.isDragging) {
        this.currentItem.element.classList.add("jqtree-moving");
      }
    }
  }
  generateHitAreas() {
    if (!this.currentItem) {
      this.hitAreas = [];
    } else {
      const hitAreasGenerator = new _hitAreasGenerator.default(this.treeWidget.tree, this.currentItem.node, this.getTreeDimensions().bottom);
      this.hitAreas = hitAreasGenerator.generate();
    }
  }
  mustCaptureElement(element) {
    const nodeName = element.nodeName;
    return nodeName !== "INPUT" && nodeName !== "SELECT" && nodeName !== "TEXTAREA";
  }
  canMoveToArea(area) {
    if (!this.treeWidget.options.onCanMoveTo) {
      return true;
    }
    if (!this.currentItem) {
      return false;
    }
    const positionName = (0, _node.getPositionName)(area.position);
    return this.treeWidget.options.onCanMoveTo(this.currentItem.node, area.node, positionName);
  }
  removeHitAreas() {
    this.hitAreas = [];
  }
  clear() {
    if (this.dragElement) {
      this.dragElement.remove();
      this.dragElement = null;
    }
  }
  removeDropHint() {
    if (this.previousGhost) {
      this.previousGhost.remove();
    }
  }
  removeHover() {
    this.hoveredArea = null;
  }
  findHoveredArea(x, y) {
    const dimensions = this.getTreeDimensions();
    if (x < dimensions.left || y < dimensions.top || x > dimensions.right || y > dimensions.bottom) {
      return null;
    }
    let low = 0;
    let high = this.hitAreas.length;
    while (low < high) {
      const mid = low + high >> 1;
      const area = this.hitAreas[mid];
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
  mustOpenFolderTimer(area) {
    const node = area.node;
    return node.isFolder() && !node.is_open && area.position === _node.Position.Inside;
  }
  updateDropHint() {
    if (!this.hoveredArea) {
      return;
    }

    // remove previous drop hint
    this.removeDropHint();

    // add new drop hint
    const nodeElement = this.treeWidget._getNodeElementForNode(this.hoveredArea.node);
    this.previousGhost = nodeElement.addDropHint(this.hoveredArea.position);
  }
  startOpenFolderTimer(folder) {
    const openFolder = () => {
      this.treeWidget._openNode(folder, this.treeWidget.options.slide, () => {
        this.refresh();
        this.updateDropHint();
      });
    };
    this.stopOpenFolderTimer();
    const openFolderDelay = this.treeWidget.options.openFolderDelay;
    if (openFolderDelay !== false) {
      this.openFolderTimer = window.setTimeout(openFolder, openFolderDelay);
    }
  }
  stopOpenFolderTimer() {
    if (this.openFolderTimer) {
      clearTimeout(this.openFolderTimer);
      this.openFolderTimer = null;
    }
  }
  moveItem(positionInfo) {
    if (this.currentItem && this.hoveredArea && this.hoveredArea.position !== _node.Position.None && this.canMoveToArea(this.hoveredArea)) {
      const movedNode = this.currentItem.node;
      const targetNode = this.hoveredArea.node;
      const position = this.hoveredArea.position;
      const previousParent = movedNode.parent;
      if (position === _node.Position.Inside) {
        this.hoveredArea.node.is_open = true;
      }
      const doMove = () => {
        this.treeWidget.tree.moveNode(movedNode, targetNode, position);
        this.treeWidget.element.empty();
        this.treeWidget._refreshElements(null);
      };
      const event = this.treeWidget._triggerEvent("tree.move", {
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
  getTreeDimensions() {
    // Return the dimensions of the tree. Add a margin to the bottom to allow
    // to drag-and-drop after the last element.
    const offset = this.treeWidget.element.offset();
    if (!offset) {
      return {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      };
    } else {
      const el = this.treeWidget.element;
      const width = el.width() || 0;
      const height = el.height() || 0;
      const left = offset.left + this.treeWidget._getScrollLeft();
      return {
        left,
        top: offset.top,
        right: left + width,
        bottom: offset.top + height + 16
      };
    }
  }
}
exports.DragAndDropHandler = DragAndDropHandler;