var $, SelectNodeHandler;

$ = jQuery;

SelectNodeHandler = (function() {
  function SelectNodeHandler(tree_widget) {
    this.tree_widget = tree_widget;
    this.clear();
  }

  SelectNodeHandler.prototype.getSelectedNode = function() {
    var selected_nodes;
    selected_nodes = this.getSelectedNodes();
    if (selected_nodes.length) {
      return selected_nodes[0];
    } else {
      return false;
    }
  };

  SelectNodeHandler.prototype.getSelectedNodes = function() {
    var id, node, selected_nodes;
    if (this.selected_single_node) {
      return [this.selected_single_node];
    } else {
      selected_nodes = [];
      for (id in this.selected_nodes) {
        node = this.tree_widget.getNodeById(id);
        if (node) {
          selected_nodes.push(node);
        }
      }
      return selected_nodes;
    }
  };

  SelectNodeHandler.prototype.getSelectedNodesUnder = function(parent) {
    var id, node, selected_nodes;
    if (this.selected_single_node) {
      if (parent.isParentOf(this.selected_single_node)) {
        return [this.selected_single_node];
      } else {
        return [];
      }
    } else {
      selected_nodes = [];
      for (id in this.selected_nodes) {
        node = this.tree_widget.getNodeById(id);
        if (node && parent.isParentOf(node)) {
          selected_nodes.push(node);
        }
      }
      return selected_nodes;
    }
  };

  SelectNodeHandler.prototype.isNodeSelected = function(node) {
    if (node.id) {
      return this.selected_nodes[node.id];
    } else if (this.selected_single_node) {
      return this.selected_single_node.element === node.element;
    } else {
      return false;
    }
  };

  SelectNodeHandler.prototype.clear = function() {
    this.selected_nodes = {};
    return this.selected_single_node = null;
  };

  SelectNodeHandler.prototype.removeFromSelection = function(node, include_children) {
    if (include_children == null) {
      include_children = false;
    }
    if (!node.id) {
      if (this.selected_single_node && node.element === this.selected_single_node.element) {
        return this.selected_single_node = null;
      }
    } else {
      delete this.selected_nodes[node.id];
      if (include_children) {
        return node.iterate((function(_this) {
          return function(n) {
            delete _this.selected_nodes[node.id];
            return true;
          };
        })(this));
      }
    }
  };

  SelectNodeHandler.prototype.addToSelection = function(node) {
    if (node.id) {
      return this.selected_nodes[node.id] = true;
    } else {
      return this.selected_single_node = node;
    }
  };

  return SelectNodeHandler;

})();

module.exports = SelectNodeHandler;
