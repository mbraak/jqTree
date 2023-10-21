"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPositionName = exports.getPosition = exports.Position = exports.Node = void 0;
var _nodeUtils = require("./nodeUtils");
let Position = exports.Position = /*#__PURE__*/function (Position) {
  Position[Position["Before"] = 1] = "Before";
  Position[Position["After"] = 2] = "After";
  Position[Position["Inside"] = 3] = "Inside";
  Position[Position["None"] = 4] = "None";
  return Position;
}({});
const positionNames = {
  before: Position.Before,
  after: Position.After,
  inside: Position.Inside,
  none: Position.None
};
const getPositionName = position => {
  for (const name in positionNames) {
    if (Object.prototype.hasOwnProperty.call(positionNames, name)) {
      if (positionNames[name] === position) {
        return name;
      }
    }
  }
  return "";
};
exports.getPositionName = getPositionName;
const getPosition = name => positionNames[name];
exports.getPosition = getPosition;
class Node {
  constructor() {
    let nodeData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    let isRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let nodeClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Node;
    this.name = "";
    this.load_on_demand = false;
    this.isEmptyFolder = nodeData != null && (0, _nodeUtils.isNodeRecordWithChildren)(nodeData) && nodeData.children.length === 0;
    this.setData(nodeData);
    this.children = [];
    this.parent = null;
    if (isRoot) {
      this.idMapping = new Map();
      this.tree = this;
      this.nodeClass = nodeClass;
    }
  }

  /*
  Set the data of this node.
   setData(string): set the name of the node
  setData(object): set attributes of the node
   Examples:
      setData('node1')
       setData({ name: 'node1', id: 1});
       setData({ name: 'node2', id: 2, color: 'green'});
   * This is an internal function; it is not in the docs
  * Does not remove existing node values
  */
  setData(o) {
    if (!o) {
      return;
    } else if (typeof o === "string") {
      this.name = o;
    } else if (typeof o === "object") {
      for (const key in o) {
        if (Object.prototype.hasOwnProperty.call(o, key)) {
          const value = o[key];
          if (key === "label" || key === "name") {
            // You can use the 'label' key instead of 'name'; this is a legacy feature
            if (typeof value === "string") {
              this.name = value;
            }
          } else if (key !== "children" && key !== "parent") {
            // You can't update the children or the parent using this function
            this[key] = value;
          }
        }
      }
    }
  }

  /*
  Create tree from data.
   Structure of data is:
  [
      {
          name: 'node1',
          children: [
              { name: 'child1' },
              { name: 'child2' }
          ]
      },
      {
          name: 'node2'
      }
  ]
  */
  loadFromData(data) {
    this.removeChildren();
    for (const childData of data) {
      const node = this.createNode(childData);
      this.addChild(node);
      if ((0, _nodeUtils.isNodeRecordWithChildren)(childData)) {
        node.loadFromData(childData.children);
      }
    }
    return this;
  }

  /*
  Add child.
   tree.addChild(
      new Node('child1')
  );
  */
  addChild(node) {
    this.children.push(node);
    node.setParent(this);
  }

  /*
  Add child at position. Index starts at 0.
   tree.addChildAtPosition(
      new Node('abc'),
      1
  );
  */
  addChildAtPosition(node, index) {
    this.children.splice(index, 0, node);
    node.setParent(this);
  }

  /*
  Remove child. This also removes the children of the node.
   tree.removeChild(tree.children[0]);
  */
  removeChild(node) {
    // remove children from the index
    node.removeChildren();
    this.doRemoveChild(node);
  }

  /*
  Get child index.
   var index = getChildIndex(node);
  */
  getChildIndex(node) {
    return this.children.indexOf(node);
  }

  /*
  Does the tree have children?
   if (tree.hasChildren()) {
      //
  }
  */
  hasChildren() {
    return this.children.length !== 0;
  }
  isFolder() {
    return this.hasChildren() || this.load_on_demand;
  }

  /*
  Iterate over all the nodes in the tree.
   Calls callback with (node, level).
   The callback must return true to continue the iteration on current node.
   tree.iterate(
      function(node, level) {
         console.log(node.name);
          // stop iteration after level 2
         return (level <= 2);
      }
  );
   */
  iterate(callback) {
    const _iterate = (node, level) => {
      if (node.children) {
        for (const child of node.children) {
          const result = callback(child, level);
          if (result && child.hasChildren()) {
            _iterate(child, level + 1);
          }
        }
      }
    };
    _iterate(this, 0);
  }

  /*
  Move node relative to another node.
   Argument position: Position.BEFORE, Position.AFTER or Position.Inside
   // move node1 after node2
  tree.moveNode(node1, node2, Position.AFTER);
  */
  moveNode(movedNode, targetNode, position) {
    if (!movedNode.parent || movedNode.isParentOf(targetNode)) {
      // - Node is parent of target node
      // - Or, parent is empty
      return false;
    } else {
      movedNode.parent.doRemoveChild(movedNode);
      switch (position) {
        case Position.After:
          {
            if (targetNode.parent) {
              targetNode.parent.addChildAtPosition(movedNode, targetNode.parent.getChildIndex(targetNode) + 1);
              return true;
            }
            return false;
          }
        case Position.Before:
          {
            if (targetNode.parent) {
              targetNode.parent.addChildAtPosition(movedNode, targetNode.parent.getChildIndex(targetNode));
              return true;
            }
            return false;
          }
        case Position.Inside:
          {
            // move inside as first child
            targetNode.addChildAtPosition(movedNode, 0);
            return true;
          }
        default:
          return false;
      }
    }
  }

  /*
  Get the tree as data.
  */
  getData() {
    let includeParent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    const getDataFromNodes = nodes => {
      return nodes.map(node => {
        const tmpNode = {};
        for (const k in node) {
          if (["parent", "children", "element", "idMapping", "load_on_demand", "nodeClass", "tree", "isEmptyFolder"].indexOf(k) === -1 && Object.prototype.hasOwnProperty.call(node, k)) {
            const v = node[k];
            tmpNode[k] = v;
          }
        }
        if (node.hasChildren()) {
          tmpNode["children"] = getDataFromNodes(node.children);
        }
        return tmpNode;
      });
    };
    if (includeParent) {
      return getDataFromNodes([this]);
    } else {
      return getDataFromNodes(this.children);
    }
  }
  getNodeByName(name) {
    return this.getNodeByCallback(node => node.name === name);
  }
  getNodeByNameMustExist(name) {
    const node = this.getNodeByCallback(n => n.name === name);
    if (!node) {
      throw `Node with name ${name} not found`;
    }
    return node;
  }
  getNodeByCallback(callback) {
    let result = null;
    this.iterate(node => {
      if (result) {
        return false;
      } else if (callback(node)) {
        result = node;
        return false;
      } else {
        return true;
      }
    });
    return result;
  }
  addAfter(nodeInfo) {
    if (!this.parent) {
      return null;
    } else {
      const node = this.createNode(nodeInfo);
      const childIndex = this.parent.getChildIndex(this);
      this.parent.addChildAtPosition(node, childIndex + 1);
      node.loadChildrenFromData(nodeInfo);
      return node;
    }
  }
  addBefore(nodeInfo) {
    if (!this.parent) {
      return null;
    } else {
      const node = this.createNode(nodeInfo);
      const childIndex = this.parent.getChildIndex(this);
      this.parent.addChildAtPosition(node, childIndex);
      node.loadChildrenFromData(nodeInfo);
      return node;
    }
  }
  addParent(nodeInfo) {
    if (!this.parent) {
      return null;
    } else {
      const newParent = this.createNode(nodeInfo);
      if (this.tree) {
        newParent.setParent(this.tree);
      }
      const originalParent = this.parent;
      for (const child of originalParent.children) {
        newParent.addChild(child);
      }
      originalParent.children = [];
      originalParent.addChild(newParent);
      return newParent;
    }
  }
  remove() {
    if (this.parent) {
      this.parent.removeChild(this);
      this.parent = null;
    }
  }
  append(nodeInfo) {
    const node = this.createNode(nodeInfo);
    this.addChild(node);
    node.loadChildrenFromData(nodeInfo);
    return node;
  }
  prepend(nodeInfo) {
    const node = this.createNode(nodeInfo);
    this.addChildAtPosition(node, 0);
    node.loadChildrenFromData(nodeInfo);
    return node;
  }
  isParentOf(node) {
    let parent = node.parent;
    while (parent) {
      if (parent === this) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }
  getLevel() {
    let level = 0;
    let node = this; // eslint-disable-line @typescript-eslint/no-this-alias

    while (node.parent) {
      level += 1;
      node = node.parent;
    }
    return level;
  }
  getNodeById(nodeId) {
    return this.idMapping.get(nodeId) || null;
  }
  addNodeToIndex(node) {
    if (node.id != null) {
      this.idMapping.set(node.id, node);
    }
  }
  removeNodeFromIndex(node) {
    if (node.id != null) {
      this.idMapping.delete(node.id);
    }
  }
  removeChildren() {
    this.iterate(child => {
      this.tree?.removeNodeFromIndex(child);
      return true;
    });
    this.children = [];
  }
  getPreviousSibling() {
    if (!this.parent) {
      return null;
    } else {
      const previousIndex = this.parent.getChildIndex(this) - 1;
      if (previousIndex >= 0) {
        return this.parent.children[previousIndex] || null;
      } else {
        return null;
      }
    }
  }
  getNextSibling() {
    if (!this.parent) {
      return null;
    } else {
      const nextIndex = this.parent.getChildIndex(this) + 1;
      if (nextIndex < this.parent.children.length) {
        return this.parent.children[nextIndex] || null;
      } else {
        return null;
      }
    }
  }
  getNodesByProperty(key, value) {
    return this.filter(node => node[key] === value);
  }
  filter(f) {
    const result = [];
    this.iterate(node => {
      if (f(node)) {
        result.push(node);
      }
      return true;
    });
    return result;
  }
  getNextNode() {
    let includeChildren = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    if (includeChildren && this.hasChildren()) {
      return this.children[0] || null;
    } else if (!this.parent) {
      return null;
    } else {
      const nextSibling = this.getNextSibling();
      if (nextSibling) {
        return nextSibling;
      } else {
        return this.parent.getNextNode(false);
      }
    }
  }
  getNextVisibleNode() {
    if (this.hasChildren() && this.is_open) {
      // First child
      return this.children[0] || null;
    } else {
      if (!this.parent) {
        return null;
      } else {
        const nextSibling = this.getNextSibling();
        if (nextSibling) {
          // Next sibling
          return nextSibling;
        } else {
          // Next node of parent
          return this.parent.getNextNode(false);
        }
      }
    }
  }
  getPreviousNode() {
    if (!this.parent) {
      return null;
    } else {
      const previousSibling = this.getPreviousSibling();
      if (!previousSibling) {
        return this.getParent();
      } else if (previousSibling.hasChildren()) {
        return previousSibling.getLastChild();
      } else {
        return previousSibling;
      }
    }
  }
  getPreviousVisibleNode() {
    if (!this.parent) {
      return null;
    } else {
      const previousSibling = this.getPreviousSibling();
      if (!previousSibling) {
        return this.getParent();
      } else if (!previousSibling.hasChildren() || !previousSibling.is_open) {
        // Previous sibling
        return previousSibling;
      } else {
        // Last child of previous sibling
        return previousSibling.getLastChild();
      }
    }
  }
  getParent() {
    // Return parent except if it is the root node
    if (!this.parent) {
      return null;
    } else if (!this.parent.parent) {
      // Root node -> null
      return null;
    } else {
      return this.parent;
    }
  }
  getLastChild() {
    if (!this.hasChildren()) {
      return null;
    } else {
      const lastChild = this.children[this.children.length - 1];
      if (!lastChild) {
        return null;
      }
      if (!(lastChild.hasChildren() && lastChild.is_open)) {
        return lastChild;
      } else {
        return lastChild?.getLastChild();
      }
    }
  }

  // Init Node from data without making it the root of the tree
  initFromData(data) {
    const addNode = nodeData => {
      this.setData(nodeData);
      if ((0, _nodeUtils.isNodeRecordWithChildren)(nodeData) && nodeData.children.length) {
        addChildren(nodeData.children);
      }
    };
    const addChildren = childrenData => {
      for (const child of childrenData) {
        const node = this.createNode();
        node.initFromData(child);
        this.addChild(node);
      }
    };
    addNode(data);
  }
  setParent(parent) {
    this.parent = parent;
    this.tree = parent.tree;
    this.tree?.addNodeToIndex(this);
  }
  doRemoveChild(node) {
    this.children.splice(this.getChildIndex(node), 1);
    this.tree?.removeNodeFromIndex(node);
  }
  getNodeClass() {
    return this.nodeClass || this?.tree?.nodeClass || Node;
  }
  createNode(nodeData) {
    const nodeClass = this.getNodeClass();
    return new nodeClass(nodeData);
  }

  // Load children data from nodeInfo if it has children
  loadChildrenFromData(nodeInfo) {
    if ((0, _nodeUtils.isNodeRecordWithChildren)(nodeInfo) && nodeInfo.children.length) {
      this.loadFromData(nodeInfo.children);
    }
  }
}
exports.Node = Node;