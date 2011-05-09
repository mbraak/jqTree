// todo: move into tree.jquery.js
// todo: do not use Classy

var Position = {
    BEFORE: 1,
    AFTER: 2,
    INSIDE: 3
};

var Node = Class.$extend({
    __init__: function(name) {
        this.name = name;
        this.children = [];
        this.parent = null;
    },

    loadFromData: function(data) {
        this.children = [];

        var self = this;
        $.each(data, function() {
            var node = new Node(this.label);
            self.addChild(node);

            if (this.children) {
                node.loadFromData(this.children);
            }
        });
    },

    addChild: function(node) {
        this.children.push(node);
        node.parent = this;
    },

    addChildAtPosition: function(node, index) {
        this.children.splice(index, 0, node);
        node.parent = this;
    },

    removeChild: function(node) {
        this.children.splice(
            this.getChildIndex(node),
            1
        );
    },

    getChildIndex: function(node) {
        return this.children.indexOf(node);
    },

    hasChildren: function() {
        return (this.children.length != 0);
    },

    iterate: function(callback, level) {
        if (! level) {
            level = 0;
        }

        $.each(this.children, function() {
            var result = callback(this, level);

            if (this.hasChildren() && result) {
                this.iterate(callback, level + 1);
            }
        });
    },

    moveNode: function(moved_node, target_node, position) {
        // todo: check for illegal move
        moved_node.parent.removeChild(moved_node);
        if (position == Position.AFTER) {
            target_node.parent.addChildAtPosition(
                moved_node,
                target_node.parent.getChildIndex(target_node) + 1
            );
        }
        else if (position == Position.BEFORE) {
            target_node.parent.addChildAtPosition(
                moved_node,
                target_node.parent.getChildIndex(target_node)
            );
        }
        else if (position == Position.INSIDE) {
            target_node.addChild(moved_node);
        }
    }
});

Node.createFromData = function(data) {
    var tree = new Tree();
    tree.loadFromData(data);
    return tree;
};

var Tree = Node;