"use strict";
exports.__esModule = true;
var Position;
(function (Position) {
    Position[Position["Before"] = 1] = "Before";
    Position[Position["After"] = 2] = "After";
    Position[Position["Inside"] = 3] = "Inside";
    Position[Position["None"] = 4] = "None";
})(Position = exports.Position || (exports.Position = {}));
exports.position_names = {
    before: Position.Before,
    after: Position.After,
    inside: Position.Inside,
    none: Position.None
};
function getPositionName(position) {
    for (var name_1 in exports.position_names) {
        if (exports.position_names.hasOwnProperty(name_1)) {
            if (exports.position_names[name_1] === position) {
                return name_1;
            }
        }
    }
    return "";
}
exports.getPositionName = getPositionName;
function getPosition(name) {
    return exports.position_names[name];
}
exports.getPosition = getPosition;
var Node = /** @class */ (function () {
    function Node(o, is_root, node_class) {
        if (is_root === void 0) { is_root = false; }
        if (node_class === void 0) { node_class = Node; }
        this.name = "";
        this.setData(o);
        this.children = [];
        this.parent = null;
        if (is_root) {
            this.id_mapping = {};
            this.tree = this;
            this.node_class = node_class;
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
            label: 'node1',
            children: [
                { label: 'child1' },
                { label: 'child2' }
            ]
        },
        {
            label: 'node2'
        }
    ]
    */
    Node.prototype.loadFromData = function (data) {
        this.removeChildren();
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var o = data_1[_i];
            var node = new this.tree.node_class(o);
            this.addChild(node);
            if (typeof o === "object" && o["children"]) {
                node.loadFromData(o["children"]);
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
        return $.inArray(node, this.children);
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
    Node.prototype.moveNode = function (moved_node, target_node, position) {
        if (!moved_node.parent || moved_node.isParentOf(target_node)) {
            // - Node is parent of target node
            // - Or, parent is empty
            return;
        }
        else {
            moved_node.parent._removeChild(moved_node);
            if (position === Position.After) {
                if (target_node.parent) {
                    target_node.parent.addChildAtPosition(moved_node, target_node.parent.getChildIndex(target_node) + 1);
                }
            }
            else if (position === Position.Before) {
                if (target_node.parent) {
                    target_node.parent.addChildAtPosition(moved_node, target_node.parent.getChildIndex(target_node));
                }
            }
            else if (position === Position.Inside) {
                // move inside as first child
                target_node.addChildAtPosition(moved_node, 0);
            }
        }
    };
    /*
    Get the tree as data.
    */
    Node.prototype.getData = function (include_parent) {
        if (include_parent === void 0) { include_parent = false; }
        function getDataFromNodes(nodes) {
            return nodes.map(function (node) {
                var tmp_node = {};
                for (var k in node) {
                    if (["parent", "children", "element", "tree"].indexOf(k) ===
                        -1 &&
                        Object.prototype.hasOwnProperty.call(node, k)) {
                        var v = node[k];
                        tmp_node[k] = v;
                    }
                }
                if (node.hasChildren()) {
                    tmp_node["children"] = getDataFromNodes(node.children);
                }
                return tmp_node;
            });
        }
        if (include_parent) {
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
    Node.prototype.addAfter = function (node_info) {
        if (!this.parent) {
            return null;
        }
        else {
            var node = new this.tree.node_class(node_info);
            var child_index = this.parent.getChildIndex(this);
            this.parent.addChildAtPosition(node, child_index + 1);
            if (typeof node_info === "object" &&
                node_info["children"] &&
                node_info["children"].length) {
                node.loadFromData(node_info["children"]);
            }
            return node;
        }
    };
    Node.prototype.addBefore = function (node_info) {
        if (!this.parent) {
            return null;
        }
        else {
            var node = new this.tree.node_class(node_info);
            var child_index = this.parent.getChildIndex(this);
            this.parent.addChildAtPosition(node, child_index);
            if (typeof node_info === "object" &&
                node_info["children"] &&
                node_info["children"].length) {
                node.loadFromData(node_info["children"]);
            }
            return node;
        }
    };
    Node.prototype.addParent = function (node_info) {
        if (!this.parent) {
            return null;
        }
        else {
            var new_parent = new this.tree.node_class(node_info);
            new_parent._setParent(this.tree);
            var original_parent = this.parent;
            for (var _i = 0, _a = original_parent.children; _i < _a.length; _i++) {
                var child = _a[_i];
                new_parent.addChild(child);
            }
            original_parent.children = [];
            original_parent.addChild(new_parent);
            return new_parent;
        }
    };
    Node.prototype.remove = function () {
        if (this.parent) {
            this.parent.removeChild(this);
            this.parent = null;
        }
    };
    Node.prototype.append = function (node_info) {
        var node = new this.tree.node_class(node_info);
        this.addChild(node);
        if (typeof node_info === "object" &&
            node_info["children"] &&
            node_info["children"].length) {
            node.loadFromData(node_info["children"]);
        }
        return node;
    };
    Node.prototype.prepend = function (node_info) {
        var node = new this.tree.node_class(node_info);
        this.addChildAtPosition(node, 0);
        if (typeof node_info === "object" &&
            node_info["children"] &&
            node_info["children"].length) {
            node.loadFromData(node_info["children"]);
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
        var node = this;
        while (node.parent) {
            level += 1;
            node = node.parent;
        }
        return level;
    };
    Node.prototype.getNodeById = function (node_id) {
        return this.id_mapping[node_id];
    };
    Node.prototype.addNodeToIndex = function (node) {
        if (node.id != null) {
            this.id_mapping[node.id] = node;
        }
    };
    Node.prototype.removeNodeFromIndex = function (node) {
        if (node.id != null) {
            delete this.id_mapping[node.id];
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
            var previous_index = this.parent.getChildIndex(this) - 1;
            if (previous_index >= 0) {
                return this.parent.children[previous_index];
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
            var next_index = this.parent.getChildIndex(this) + 1;
            if (next_index < this.parent.children.length) {
                return this.parent.children[next_index];
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
    Node.prototype.getNextNode = function (include_children) {
        if (include_children === void 0) { include_children = true; }
        if (include_children && this.hasChildren() && this.is_open) {
            // First child
            return this.children[0];
        }
        else {
            if (!this.parent) {
                return null;
            }
            else {
                var next_sibling = this.getNextSibling();
                if (next_sibling) {
                    // Next sibling
                    return next_sibling;
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
            var previous_sibling = this.getPreviousSibling();
            if (previous_sibling) {
                if (!previous_sibling.hasChildren() ||
                    !previous_sibling.is_open) {
                    // Previous sibling
                    return previous_sibling;
                }
                else {
                    // Last child of previous sibling
                    return previous_sibling.getLastChild();
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
            var last_child = this.children[this.children.length - 1];
            if (!last_child.hasChildren() || !last_child.is_open) {
                return last_child;
            }
            else {
                return last_child.getLastChild();
            }
        }
    };
    // Init Node from data without making it the root of the tree
    Node.prototype.initFromData = function (data) {
        var _this = this;
        var addNode = function (node_data) {
            _this.setData(node_data);
            if (node_data["children"]) {
                addChildren(node_data["children"]);
            }
        };
        var addChildren = function (children_data) {
            for (var _i = 0, children_data_1 = children_data; _i < children_data_1.length; _i++) {
                var child = children_data_1[_i];
                var node = new _this.tree.node_class("");
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
