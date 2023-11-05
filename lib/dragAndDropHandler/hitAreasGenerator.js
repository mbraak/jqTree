"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _node = require("../node");
var _util = require("../util");
var _visibleNodeIterator = _interopRequireDefault(require("./visibleNodeIterator"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class HitAreasGenerator extends _visibleNodeIterator.default {
  constructor(tree, currentNode, treeBottom) {
    super(tree);
    this.currentNode = currentNode;
    this.treeBottom = treeBottom;
  }
  generate() {
    this.positions = [];
    this.lastTop = 0;
    this.iterate();
    return this.generateHitAreas(this.positions);
  }
  generateHitAreas(positions) {
    let previousTop = positions[0]?.top ?? 0;
    let group = [];
    const hitAreas = [];
    for (const position of positions) {
      if (position.top !== previousTop && group.length) {
        this.generateHitAreasForGroup(hitAreas, group, previousTop, position.top);
        previousTop = position.top;
        group = [];
      }
      group.push(position);
    }
    this.generateHitAreasForGroup(hitAreas, group, previousTop, this.treeBottom);
    return hitAreas;
  }
  handleOpenFolder(node, element) {
    if (node === this.currentNode) {
      // Cannot move inside current item
      // Stop iterating
      return false;
    }

    // Cannot move before current item
    if (node.children[0] !== this.currentNode) {
      this.addPosition(node, _node.Position.Inside, (0, _util.getOffsetTop)(element));
    }

    // Continue iterating
    return true;
  }
  handleClosedFolder(node, nextNode, element) {
    const top = (0, _util.getOffsetTop)(element);
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
  handleFirstNode(node) {
    if (node !== this.currentNode) {
      this.addPosition(node, _node.Position.Before, (0, _util.getOffsetTop)(node.element));
    }
  }
  handleAfterOpenFolder(node, nextNode) {
    if (node === this.currentNode || nextNode === this.currentNode) {
      // Cannot move before or after current item
      this.addPosition(node, _node.Position.None, this.lastTop);
    } else {
      this.addPosition(node, _node.Position.After, this.lastTop);
    }
  }
  handleNode(node, nextNode, element) {
    const top = (0, _util.getOffsetTop)(element);
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
  addPosition(node, position, top) {
    const area = {
      top,
      bottom: 0,
      node,
      position
    };
    this.positions.push(area);
    this.lastTop = top;
  }
  generateHitAreasForGroup(hitAreas, positionsInGroup, top, bottom) {
    // limit positions in group
    const positionCount = Math.min(positionsInGroup.length, 4);
    const areaHeight = Math.round((bottom - top) / positionCount);
    let areaTop = top;
    let i = 0;
    while (i < positionCount) {
      const position = positionsInGroup[i];
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
}
var _default = exports.default = HitAreasGenerator;