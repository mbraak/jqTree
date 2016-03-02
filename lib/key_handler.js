var $, KeyHandler,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = jQuery;

KeyHandler = (function() {
  var DOWN, LEFT, RIGHT, UP;

  LEFT = 37;

  UP = 38;

  RIGHT = 39;

  DOWN = 40;

  function KeyHandler(tree_widget) {
    this.selectNode = bind(this.selectNode, this);
    this.tree_widget = tree_widget;
    if (tree_widget.options.keyboardSupport) {
      $(document).bind('keydown.jqtree', $.proxy(this.handleKeyDown, this));
    }
  }

  KeyHandler.prototype.deinit = function() {
    return $(document).unbind('keydown.jqtree');
  };

  KeyHandler.prototype.moveDown = function() {
    var node;
    node = this.tree_widget.getSelectedNode();
    if (node) {
      return this.selectNode(node.getNextNode());
    } else {
      return false;
    }
  };

  KeyHandler.prototype.moveUp = function() {
    var node;
    node = this.tree_widget.getSelectedNode();
    if (node) {
      return this.selectNode(node.getPreviousNode());
    } else {
      return false;
    }
  };

  KeyHandler.prototype.moveRight = function() {
    var node;
    node = this.tree_widget.getSelectedNode();
    if (!node) {
      return true;
    } else if (!node.isFolder()) {
      return true;
    } else {
      if (node.is_open) {
        return this.selectNode(node.getNextNode());
      } else {
        this.tree_widget.openNode(node);
        return false;
      }
    }
  };

  KeyHandler.prototype.moveLeft = function() {
    var node;
    node = this.tree_widget.getSelectedNode();
    if (!node) {
      return true;
    } else if (node.isFolder() && node.is_open) {
      this.tree_widget.closeNode(node);
      return false;
    } else {
      return this.selectNode(node.getParent());
    }
  };

  KeyHandler.prototype.handleKeyDown = function(e) {
    var key;
    if (!this.tree_widget.options.keyboardSupport) {
      return true;
    }
    if ($(document.activeElement).is('textarea,input,select')) {
      return true;
    }
    if (!this.tree_widget.getSelectedNode()) {
      return true;
    }
    key = e.which;
    switch (key) {
      case DOWN:
        return this.moveDown();
      case UP:
        return this.moveUp();
      case RIGHT:
        return this.moveRight();
      case LEFT:
        return this.moveLeft();
    }
    return true;
  };

  KeyHandler.prototype.selectNode = function(node) {
    if (!node) {
      return true;
    } else {
      this.tree_widget.selectNode(node);
      if (this.tree_widget.scroll_handler && (!this.tree_widget.scroll_handler.isScrolledIntoView($(node.element).find('.jqtree-element')))) {
        this.tree_widget.scrollToNode(node);
      }
      return false;
    }
  };

  return KeyHandler;

})();

module.exports = KeyHandler;
