"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Node = exports.getPosition = exports.getPositionName = exports.Position = void 0;

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Position;
exports.Position = Position;

(function (Position) {
  Position[Position["Before"] = 1] = "Before";
  Position[Position["After"] = 2] = "After";
  Position[Position["Inside"] = 3] = "Inside";
  Position[Position["None"] = 4] = "None";
})(Position || (exports.Position = Position = {}));

var positionNames = {
  before: Position.Before,
  after: Position.After,
  inside: Position.Inside,
  none: Position.None
};

var getPositionName = function getPositionName(position) {
  for (var name in positionNames) {
    if (Object.prototype.hasOwnProperty.call(positionNames, name)) {
      if (positionNames[name] === position) {
        return name;
      }
    }
  }

  return "";
};

exports.getPositionName = getPositionName;

var getPosition = function getPosition(name) {
  return positionNames[name];
};

exports.getPosition = getPosition;

var Node = /*#__PURE__*/function () {
  function Node() {
    var o = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var isRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var nodeClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Node;

    _classCallCheck(this, Node);

    _defineProperty(this, "id", void 0);

    _defineProperty(this, "name", void 0);

    _defineProperty(this, "children", void 0);

    _defineProperty(this, "parent", void 0);

    _defineProperty(this, "idMapping", void 0);

    _defineProperty(this, "tree", void 0);

    _defineProperty(this, "nodeClass", void 0);

    _defineProperty(this, "load_on_demand", void 0);

    _defineProperty(this, "is_open", void 0);

    _defineProperty(this, "element", void 0);

    _defineProperty(this, "is_loading", void 0);

    _defineProperty(this, "isEmptyFolder", void 0);

    this.name = "";
    this.isEmptyFolder = false;
    this.load_on_demand = false;
    this.setData(o);
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
  setdata(object): set attributes of the node
   Examples:
      setdata('node1')
       setData({ name: 'node1', id: 1});
       setData({ name: 'node2', id: 2, color: 'green'});
   * This is an internal function; it is not in the docs
  * Does not remove existing node values
  */


  _createClass(Node, [{
    key: "setData",
    value: function setData(o) {
      if (!o) {
        return;
      } else if (typeof o === "string") {
        this.name = o;
      } else if (_typeof(o) === "object") {
        for (var _key in o) {
          if (Object.prototype.hasOwnProperty.call(o, _key)) {
            var value = o[_key];

            if (_key === "label" || _key === "name") {
              // You can use the 'label' key instead of 'name'; this is a legacy feature
              if (typeof value === "string") {
                this.name = value;
              }
            } else if (_key !== "children" && _key !== "parent") {
              // You can't update the children or the parent using this function
              this[_key] = value;
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

  }, {
    key: "loadFromData",
    value: function loadFromData(data) {
      this.removeChildren();

      var _iterator = _createForOfIteratorHelper(data),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var o = _step.value;

          var _node = this.createNode(o);

          this.addChild(_node);

          if (_typeof(o) === "object" && o["children"] && o["children"] instanceof Array) {
            if (o["children"].length === 0) {
              _node.isEmptyFolder = true;
            } else {
              _node.loadFromData(o["children"]);
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return this;
    }
    /*
    Add child.
     tree.addChild(
        new Node('child1')
    );
    */

  }, {
    key: "addChild",
    value: function addChild(node) {
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

  }, {
    key: "addChildAtPosition",
    value: function addChildAtPosition(node, index) {
      this.children.splice(index, 0, node);
      node.setParent(this);
    }
    /*
    Remove child. This also removes the children of the node.
     tree.removeChild(tree.children[0]);
    */

  }, {
    key: "removeChild",
    value: function removeChild(node) {
      // remove children from the index
      node.removeChildren();
      this.doRemoveChild(node);
    }
    /*
    Get child index.
     var index = getChildIndex(node);
    */

  }, {
    key: "getChildIndex",
    value: function getChildIndex(node) {
      return this.children.indexOf(node);
    }
    /*
    Does the tree have children?
     if (tree.hasChildren()) {
        //
    }
    */

  }, {
    key: "hasChildren",
    value: function hasChildren() {
      return this.children.length !== 0;
    }
  }, {
    key: "isFolder",
    value: function isFolder() {
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

  }, {
    key: "iterate",
    value: function iterate(callback) {
      var _iterate = function _iterate(node, level) {
        if (node.children) {
          var _iterator2 = _createForOfIteratorHelper(node.children),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var child = _step2.value;
              var result = callback(child, level);

              if (result && child.hasChildren()) {
                _iterate(child, level + 1);
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
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

  }, {
    key: "moveNode",
    value: function moveNode(movedNode, targetNode, position) {
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

  }, {
    key: "getData",
    value: function getData() {
      var includeParent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var getDataFromNodes = function getDataFromNodes(nodes) {
        return nodes.map(function (node) {
          var tmpNode = {};

          for (var k in node) {
            if (["parent", "children", "element", "idMapping", "load_on_demand", "nodeClass", "tree", "isEmptyFolder"].indexOf(k) === -1 && Object.prototype.hasOwnProperty.call(node, k)) {
              var v = node[k];
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
  }, {
    key: "getNodeByName",
    value: function getNodeByName(name) {
      return this.getNodeByCallback(function (node) {
        return node.name === name;
      });
    }
  }, {
    key: "getNodeByNameMustExist",
    value: function getNodeByNameMustExist(name) {
      var node = this.getNodeByCallback(function (n) {
        return n.name === name;
      });

      if (!node) {
        throw "Node with name ".concat(name, " not found");
      }

      return node;
    }
  }, {
    key: "getNodeByCallback",
    value: function getNodeByCallback(callback) {
      var result = null;
      this.iterate(function (node) {
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
  }, {
    key: "addAfter",
    value: function addAfter(nodeInfo) {
      if (!this.parent) {
        return null;
      } else {
        var _node2 = this.createNode(nodeInfo);

        var childIndex = this.parent.getChildIndex(this);
        this.parent.addChildAtPosition(_node2, childIndex + 1);

        if (_typeof(nodeInfo) === "object" && nodeInfo["children"] && nodeInfo["children"] instanceof Array && nodeInfo["children"].length) {
          _node2.loadFromData(nodeInfo["children"]);
        }

        return _node2;
      }
    }
  }, {
    key: "addBefore",
    value: function addBefore(nodeInfo) {
      if (!this.parent) {
        return null;
      } else {
        var _node3 = this.createNode(nodeInfo);

        var childIndex = this.parent.getChildIndex(this);
        this.parent.addChildAtPosition(_node3, childIndex);

        if (_typeof(nodeInfo) === "object" && nodeInfo["children"] && nodeInfo["children"] instanceof Array && nodeInfo["children"].length) {
          _node3.loadFromData(nodeInfo["children"]);
        }

        return _node3;
      }
    }
  }, {
    key: "addParent",
    value: function addParent(nodeInfo) {
      if (!this.parent) {
        return null;
      } else {
        var newParent = this.createNode(nodeInfo);

        if (this.tree) {
          newParent.setParent(this.tree);
        }

        var originalParent = this.parent;

        var _iterator3 = _createForOfIteratorHelper(originalParent.children),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var child = _step3.value;
            newParent.addChild(child);
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        originalParent.children = [];
        originalParent.addChild(newParent);
        return newParent;
      }
    }
  }, {
    key: "remove",
    value: function remove() {
      if (this.parent) {
        this.parent.removeChild(this);
        this.parent = null;
      }
    }
  }, {
    key: "append",
    value: function append(nodeInfo) {
      var node = this.createNode(nodeInfo);
      this.addChild(node);

      if (_typeof(nodeInfo) === "object" && nodeInfo["children"] && nodeInfo["children"] instanceof Array && nodeInfo["children"].length) {
        node.loadFromData(nodeInfo["children"]);
      }

      return node;
    }
  }, {
    key: "prepend",
    value: function prepend(nodeInfo) {
      var node = this.createNode(nodeInfo);
      this.addChildAtPosition(node, 0);

      if (_typeof(nodeInfo) === "object" && nodeInfo["children"] && nodeInfo["children"] instanceof Array && nodeInfo["children"].length) {
        node.loadFromData(nodeInfo["children"]);
      }

      return node;
    }
  }, {
    key: "isParentOf",
    value: function isParentOf(node) {
      var parent = node.parent;

      while (parent) {
        if (parent === this) {
          return true;
        }

        parent = parent.parent;
      }

      return false;
    }
  }, {
    key: "getLevel",
    value: function getLevel() {
      var level = 0;
      var node = this; // eslint-disable-line @typescript-eslint/no-this-alias

      while (node.parent) {
        level += 1;
        node = node.parent;
      }

      return level;
    }
  }, {
    key: "getNodeById",
    value: function getNodeById(nodeId) {
      return this.idMapping.get(nodeId) || null;
    }
  }, {
    key: "addNodeToIndex",
    value: function addNodeToIndex(node) {
      if (node.id != null) {
        this.idMapping.set(node.id, node);
      }
    }
  }, {
    key: "removeNodeFromIndex",
    value: function removeNodeFromIndex(node) {
      if (node.id != null) {
        this.idMapping["delete"](node.id);
      }
    }
  }, {
    key: "removeChildren",
    value: function removeChildren() {
      var _this = this;

      this.iterate(function (child) {
        var _this$tree;

        (_this$tree = _this.tree) === null || _this$tree === void 0 ? void 0 : _this$tree.removeNodeFromIndex(child);
        return true;
      });
      this.children = [];
    }
  }, {
    key: "getPreviousSibling",
    value: function getPreviousSibling() {
      if (!this.parent) {
        return null;
      } else {
        var previousIndex = this.parent.getChildIndex(this) - 1;

        if (previousIndex >= 0) {
          return this.parent.children[previousIndex];
        } else {
          return null;
        }
      }
    }
  }, {
    key: "getNextSibling",
    value: function getNextSibling() {
      if (!this.parent) {
        return null;
      } else {
        var nextIndex = this.parent.getChildIndex(this) + 1;

        if (nextIndex < this.parent.children.length) {
          return this.parent.children[nextIndex];
        } else {
          return null;
        }
      }
    }
  }, {
    key: "getNodesByProperty",
    value: function getNodesByProperty(key, value) {
      return this.filter(function (node) {
        return node[key] === value;
      });
    }
  }, {
    key: "filter",
    value: function filter(f) {
      var result = [];
      this.iterate(function (node) {
        if (f(node)) {
          result.push(node);
        }

        return true;
      });
      return result;
    }
  }, {
    key: "getNextNode",
    value: function getNextNode() {
      var includeChildren = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (includeChildren && this.hasChildren() && this.is_open) {
        // First child
        return this.children[0];
      } else {
        if (!this.parent) {
          return null;
        } else {
          var nextSibling = this.getNextSibling();

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
  }, {
    key: "getPreviousNode",
    value: function getPreviousNode() {
      if (!this.parent) {
        return null;
      } else {
        var previousSibling = this.getPreviousSibling();

        if (previousSibling) {
          if (!previousSibling.hasChildren() || !previousSibling.is_open) {
            // Previous sibling
            return previousSibling;
          } else {
            // Last child of previous sibling
            return previousSibling.getLastChild();
          }
        } else {
          return this.getParent();
        }
      }
    }
  }, {
    key: "getParent",
    value: function getParent() {
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
  }, {
    key: "getLastChild",
    value: function getLastChild() {
      if (!this.hasChildren()) {
        return null;
      } else {
        var lastChild = this.children[this.children.length - 1];

        if (!(lastChild.hasChildren() && lastChild.is_open)) {
          return lastChild;
        } else {
          return lastChild.getLastChild();
        }
      }
    } // Init Node from data without making it the root of the tree

  }, {
    key: "initFromData",
    value: function initFromData(data) {
      var _this2 = this;

      var addNode = function addNode(nodeData) {
        _this2.setData(nodeData);

        if (_typeof(nodeData) === "object" && nodeData["children"] && nodeData["children"] instanceof Array && nodeData["children"].length) {
          addChildren(nodeData["children"]);
        }
      };

      var addChildren = function addChildren(childrenData) {
        var _iterator4 = _createForOfIteratorHelper(childrenData),
            _step4;

        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var child = _step4.value;

            var _node4 = _this2.createNode();

            _node4.initFromData(child);

            _this2.addChild(_node4);
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
      };

      addNode(data);
    }
  }, {
    key: "setParent",
    value: function setParent(parent) {
      var _this$tree2;

      this.parent = parent;
      this.tree = parent.tree;
      (_this$tree2 = this.tree) === null || _this$tree2 === void 0 ? void 0 : _this$tree2.addNodeToIndex(this);
    }
  }, {
    key: "doRemoveChild",
    value: function doRemoveChild(node) {
      var _this$tree3;

      this.children.splice(this.getChildIndex(node), 1);
      (_this$tree3 = this.tree) === null || _this$tree3 === void 0 ? void 0 : _this$tree3.removeNodeFromIndex(node);
    }
  }, {
    key: "getNodeClass",
    value: function getNodeClass() {
      var _this$tree4;

      return this.nodeClass || (this === null || this === void 0 ? void 0 : (_this$tree4 = this.tree) === null || _this$tree4 === void 0 ? void 0 : _this$tree4.nodeClass) || Node;
    }
  }, {
    key: "createNode",
    value: function createNode(nodeData) {
      var nodeClass = this.getNodeClass();
      return new nodeClass(nodeData);
    }
  }]);

  return Node;
}();

exports.Node = Node;