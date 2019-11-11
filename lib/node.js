"use strict";
exports.__esModule = true;
var Position;
(function (Position) {
    Position[Position["Before"] = 1] = "Before";
    Position[Position["After"] = 2] = "After";
    Position[Position["Inside"] = 3] = "Inside";
    Position[Position["None"] = 4] = "None";
})(Position = exports.Position || (exports.Position = {}));
var positionNames = {
    before: Position.Before,
    after: Position.After,
    inside: Position.Inside,
    none: Position.None
};
exports.getPositionName = function (position) {
    for (var name_1 in positionNames) {
        if (positionNames.hasOwnProperty(name_1)) {
            if (positionNames[name_1] === position) {
                return name_1;
            }
        }
    }
    return "";
};
exports.getPosition = function (name) { return positionNames[name]; };
var Node = /** @class */ (function () {
    function Node(o, isRoot, nodeClass) {
        if (isRoot === void 0) { isRoot = false; }
        if (nodeClass === void 0) { nodeClass = Node; }
        this.name = "";
        this.isEmptyFolder = false;
        this.setData(o);
        this.children = [];
        this.parent = null;
        if (isRoot) {
            this.idMapping = {};
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
    Node.prototype.setData = function (o) {
        var _this = this;
        var setName = function (name) {
            if (name != null) {
                _this.name = name;
            }
        };
        if (!o) {
            return;
        }
        else if (typeof o !== "object") {
            setName(o);
        }
        else {
            for (var key in o) {
                if (o.hasOwnProperty(key)) {
                    var value = o[key];
                    if (key === "label") {
                        // You can use the 'label' key instead of 'name'; this is a legacy feature
                        setName(value);
                    }
                    else if (key !== "children") {
                        // You can't update the children using this function
                        this[key] = value;
                    }
                }
            }
        }
    };
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
    Node.prototype.loadFromData = function (data) {
        this.removeChildren();
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var o = data_1[_i];
            var node = new this.tree.nodeClass(o);
            this.addChild(node);
            if (typeof o === "object" && o["children"]) {
                if (o["children"].length === 0) {
                    node.isEmptyFolder = true;
                }
                else {
                    node.loadFromData(o["children"]);
                }
            }
        }
    };
    /*
    Add child.

    tree.addChild(
        new Node('child1')
    );
    */
    Node.prototype.addChild = function (node) {
        this.children.push(node);
        node._setParent(this);
    };
    /*
    Add child at position. Index starts at 0.

    tree.addChildAtPosition(
        new Node('abc'),
        1
    );
    */
    Node.prototype.addChildAtPosition = function (node, index) {
        this.children.splice(index, 0, node);
        node._setParent(this);
    };
    /*
    Remove child. This also removes the children of the node.

    tree.removeChild(tree.children[0]);
    */
    Node.prototype.removeChild = function (node) {
        // remove children from the index
        node.removeChildren();
        this._removeChild(node);
    };
    /*
    Get child index.

    var index = getChildIndex(node);
    */
    Node.prototype.getChildIndex = function (node) {
        return jQuery.inArray(node, this.children);
    };
    /*
    Does the tree have children?

    if (tree.hasChildren()) {
        //
    }
    */
    Node.prototype.hasChildren = function () {
        return this.children.length !== 0;
    };
    Node.prototype.isFolder = function () {
        return this.hasChildren() || this.load_on_demand;
    };
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
    Node.prototype.iterate = function (callback) {
        var _iterate = function (node, level) {
            if (node.children) {
                for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    var result = callback(child, level);
                    if (result && child.hasChildren()) {
                        _iterate(child, level + 1);
                    }
                }
            }
        };
        _iterate(this, 0);
    };
    /*
    Move node relative to another node.

    Argument position: Position.BEFORE, Position.AFTER or Position.Inside

    // move node1 after node2
    tree.moveNode(node1, node2, Position.AFTER);
    */
    Node.prototype.moveNode = function (movedNode, targetNode, position) {
        if (!movedNode.parent || movedNode.isParentOf(targetNode)) {
            // - Node is parent of target node
            // - Or, parent is empty
            return;
        }
        else {
            movedNode.parent._removeChild(movedNode);
            if (position === Position.After) {
                if (targetNode.parent) {
                    targetNode.parent.addChildAtPosition(movedNode, targetNode.parent.getChildIndex(targetNode) + 1);
                }
            }
            else if (position === Position.Before) {
                if (targetNode.parent) {
                    targetNode.parent.addChildAtPosition(movedNode, targetNode.parent.getChildIndex(targetNode));
                }
            }
            else if (position === Position.Inside) {
                // move inside as first child
                targetNode.addChildAtPosition(movedNode, 0);
            }
        }
    };
    /*
    Get the tree as data.
    */
    Node.prototype.getData = function (includeParent) {
        if (includeParent === void 0) { includeParent = false; }
        function getDataFromNodes(nodes) {
            return nodes.map(function (node) {
                var tmpNode = {};
                for (var k in node) {
                    if (["parent", "children", "element", "tree", "isEmptyFolder"].indexOf(k) === -1 &&
                        Object.prototype.hasOwnProperty.call(node, k)) {
                        var v = node[k];
                        tmpNode[k] = v;
                    }
                }
                if (node.hasChildren()) {
                    tmpNode["children"] = getDataFromNodes(node.children);
                }
                return tmpNode;
            });
        }
        if (includeParent) {
            return getDataFromNodes([this]);
        }
        else {
            return getDataFromNodes(this.children);
        }
    };
    Node.prototype.getNodeByName = function (name) {
        return this.getNodeByCallback(function (node) { return node.name === name; });
    };
    Node.prototype.getNodeByCallback = function (callback) {
        var result = null;
        this.iterate(function (node) {
            if (callback(node)) {
                result = node;
                return false;
            }
            else {
                return true;
            }
        });
        return result;
    };
    Node.prototype.addAfter = function (nodeInfo) {
        if (!this.parent) {
            return null;
        }
        else {
            var node = new this.tree.nodeClass(nodeInfo);
            var childIndex = this.parent.getChildIndex(this);
            this.parent.addChildAtPosition(node, childIndex + 1);
            if (typeof nodeInfo === "object" && nodeInfo["children"] && nodeInfo["children"].length) {
                node.loadFromData(nodeInfo["children"]);
            }
            return node;
        }
    };
    Node.prototype.addBefore = function (nodeInfo) {
        if (!this.parent) {
            return null;
        }
        else {
            var node = new this.tree.nodeClass(nodeInfo);
            var childIndex = this.parent.getChildIndex(this);
            this.parent.addChildAtPosition(node, childIndex);
            if (typeof nodeInfo === "object" && nodeInfo["children"] && nodeInfo["children"].length) {
                node.loadFromData(nodeInfo["children"]);
            }
            return node;
        }
    };
    Node.prototype.addParent = function (nodeInfo) {
        if (!this.parent) {
            return null;
        }
        else {
            var newParent = new this.tree.nodeClass(nodeInfo);
            newParent._setParent(this.tree);
            var originalParent = this.parent;
            for (var _i = 0, _a = originalParent.children; _i < _a.length; _i++) {
                var child = _a[_i];
                newParent.addChild(child);
            }
            originalParent.children = [];
            originalParent.addChild(newParent);
            return newParent;
        }
    };
    Node.prototype.remove = function () {
        if (this.parent) {
            this.parent.removeChild(this);
            this.parent = null;
        }
    };
    Node.prototype.append = function (nodeInfo) {
        var node = new this.tree.nodeClass(nodeInfo);
        this.addChild(node);
        if (typeof nodeInfo === "object" && nodeInfo["children"] && nodeInfo["children"].length) {
            node.loadFromData(nodeInfo["children"]);
        }
        return node;
    };
    Node.prototype.prepend = function (nodeInfo) {
        var node = new this.tree.nodeClass(nodeInfo);
        this.addChildAtPosition(node, 0);
        if (typeof nodeInfo === "object" && nodeInfo["children"] && nodeInfo["children"].length) {
            node.loadFromData(nodeInfo["children"]);
        }
        return node;
    };
    Node.prototype.isParentOf = function (node) {
        var parent = node.parent;
        while (parent) {
            if (parent === this) {
                return true;
            }
            parent = parent.parent;
        }
        return false;
    };
    Node.prototype.getLevel = function () {
        var level = 0;
        var node = this; // eslint-disable-line @typescript-eslint/no-this-alias
        while (node.parent) {
            level += 1;
            node = node.parent;
        }
        return level;
    };
    Node.prototype.getNodeById = function (nodeId) {
        return this.idMapping[nodeId];
    };
    Node.prototype.addNodeToIndex = function (node) {
        if (node.id != null) {
            this.idMapping[node.id] = node;
        }
    };
    Node.prototype.removeNodeFromIndex = function (node) {
        if (node.id != null) {
            delete this.idMapping[node.id];
        }
    };
    Node.prototype.removeChildren = function () {
        var _this = this;
        this.iterate(function (child) {
            _this.tree.removeNodeFromIndex(child);
            return true;
        });
        this.children = [];
    };
    Node.prototype.getPreviousSibling = function () {
        if (!this.parent) {
            return null;
        }
        else {
            var previousIndex = this.parent.getChildIndex(this) - 1;
            if (previousIndex >= 0) {
                return this.parent.children[previousIndex];
            }
            else {
                return null;
            }
        }
    };
    Node.prototype.getNextSibling = function () {
        if (!this.parent) {
            return null;
        }
        else {
            var nextIndex = this.parent.getChildIndex(this) + 1;
            if (nextIndex < this.parent.children.length) {
                return this.parent.children[nextIndex];
            }
            else {
                return null;
            }
        }
    };
    Node.prototype.getNodesByProperty = function (key, value) {
        return this.filter(function (node) { return node[key] === value; });
    };
    Node.prototype.filter = function (f) {
        var result = [];
        this.iterate(function (node) {
            if (f(node)) {
                result.push(node);
            }
            return true;
        });
        return result;
    };
    Node.prototype.getNextNode = function (includeChildren) {
        if (includeChildren === void 0) { includeChildren = true; }
        if (includeChildren && this.hasChildren() && this.is_open) {
            // First child
            return this.children[0];
        }
        else {
            if (!this.parent) {
                return null;
            }
            else {
                var nextSibling = this.getNextSibling();
                if (nextSibling) {
                    // Next sibling
                    return nextSibling;
                }
                else {
                    // Next node of parent
                    return this.parent.getNextNode(false);
                }
            }
        }
    };
    Node.prototype.getPreviousNode = function () {
        if (!this.parent) {
            return null;
        }
        else {
            var previousSibling = this.getPreviousSibling();
            if (previousSibling) {
                if (!previousSibling.hasChildren() || !previousSibling.is_open) {
                    // Previous sibling
                    return previousSibling;
                }
                else {
                    // Last child of previous sibling
                    return previousSibling.getLastChild();
                }
            }
            else {
                return this.getParent();
            }
        }
    };
    Node.prototype.getParent = function () {
        // Return parent except if it is the root node
        if (!this.parent) {
            return null;
        }
        else if (!this.parent.parent) {
            // Root node -> null
            return null;
        }
        else {
            return this.parent;
        }
    };
    Node.prototype.getLastChild = function () {
        if (!this.hasChildren()) {
            return null;
        }
        else {
            var lastChild = this.children[this.children.length - 1];
            if (!lastChild.hasChildren() || !lastChild.is_open) {
                return lastChild;
            }
            else {
                return lastChild.getLastChild();
            }
        }
    };
    // Init Node from data without making it the root of the tree
    Node.prototype.initFromData = function (data) {
        var _this = this;
        var addNode = function (nodeData) {
            _this.setData(nodeData);
            if (nodeData["children"]) {
                addChildren(nodeData["children"]);
            }
        };
        var addChildren = function (childrenData) {
            for (var _i = 0, childrenData_1 = childrenData; _i < childrenData_1.length; _i++) {
                var child = childrenData_1[_i];
                var node = new _this.tree.nodeClass("");
                node.initFromData(child);
                _this.addChild(node);
            }
        };
        addNode(data);
    };
    Node.prototype._setParent = function (parent) {
        this.parent = parent;
        this.tree = parent.tree;
        this.tree.addNodeToIndex(this);
    };
    Node.prototype._removeChild = function (node) {
        this.children.splice(this.getChildIndex(node), 1);
        this.tree.removeNodeFromIndex(node);
    };
    return Node;
}());
exports.Node = Node;
