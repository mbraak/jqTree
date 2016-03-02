var $, BorderDropHint, FolderElement, GhostDropHint, NodeElement, Position, node,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

node = require('./node');

Position = node.Position;

$ = jQuery;

NodeElement = (function() {
  function NodeElement(node, tree_widget) {
    this.init(node, tree_widget);
  }

  NodeElement.prototype.init = function(node, tree_widget) {
    this.node = node;
    this.tree_widget = tree_widget;
    if (!node.element) {
      node.element = this.tree_widget.element;
    }
    return this.$element = $(node.element);
  };

  NodeElement.prototype.getUl = function() {
    return this.$element.children('ul:first');
  };

  NodeElement.prototype.getSpan = function() {
    return this.$element.children('.jqtree-element').find('span.jqtree-title');
  };

  NodeElement.prototype.getLi = function() {
    return this.$element;
  };

  NodeElement.prototype.addDropHint = function(position) {
    if (position === Position.INSIDE) {
      return new BorderDropHint(this.$element);
    } else {
      return new GhostDropHint(this.node, this.$element, position);
    }
  };

  NodeElement.prototype.select = function() {
    var $li, $span;
    $li = this.getLi();
    $li.addClass('jqtree-selected');
    $li.attr('aria-selected', 'true');
    $span = this.getSpan();
    return $span.attr('tabindex', 0);
  };

  NodeElement.prototype.deselect = function() {
    var $li, $span;
    $li = this.getLi();
    $li.removeClass('jqtree-selected');
    $li.attr('aria-selected', 'false');
    $span = this.getSpan();
    return $span.attr('tabindex', -1);
  };

  return NodeElement;

})();

FolderElement = (function(superClass) {
  extend(FolderElement, superClass);

  function FolderElement() {
    return FolderElement.__super__.constructor.apply(this, arguments);
  }

  FolderElement.prototype.open = function(on_finished, slide) {
    var $button, doOpen;
    if (slide == null) {
      slide = true;
    }
    if (!this.node.is_open) {
      this.node.is_open = true;
      $button = this.getButton();
      $button.removeClass('jqtree-closed');
      $button.html('');
      $button.append(this.tree_widget.renderer.opened_icon_element.cloneNode(false));
      doOpen = (function(_this) {
        return function() {
          var $li, $span;
          $li = _this.getLi();
          $li.removeClass('jqtree-closed');
          $span = _this.getSpan();
          $span.attr('aria-expanded', 'true');
          if (on_finished) {
            on_finished();
          }
          return _this.tree_widget._triggerEvent('tree.open', {
            node: _this.node
          });
        };
      })(this);
      if (slide) {
        return this.getUl().slideDown('fast', doOpen);
      } else {
        this.getUl().show();
        return doOpen();
      }
    }
  };

  FolderElement.prototype.close = function(slide) {
    var $button, doClose;
    if (slide == null) {
      slide = true;
    }
    if (this.node.is_open) {
      this.node.is_open = false;
      $button = this.getButton();
      $button.addClass('jqtree-closed');
      $button.html('');
      $button.append(this.tree_widget.renderer.closed_icon_element.cloneNode(false));
      doClose = (function(_this) {
        return function() {
          var $li, $span;
          $li = _this.getLi();
          $li.addClass('jqtree-closed');
          $span = _this.getSpan();
          $span.attr('aria-expanded', 'false');
          return _this.tree_widget._triggerEvent('tree.close', {
            node: _this.node
          });
        };
      })(this);
      if (slide) {
        return this.getUl().slideUp('fast', doClose);
      } else {
        this.getUl().hide();
        return doClose();
      }
    }
  };

  FolderElement.prototype.getButton = function() {
    return this.$element.children('.jqtree-element').find('a.jqtree-toggler');
  };

  FolderElement.prototype.addDropHint = function(position) {
    if (!this.node.is_open && position === Position.INSIDE) {
      return new BorderDropHint(this.$element);
    } else {
      return new GhostDropHint(this.node, this.$element, position);
    }
  };

  return FolderElement;

})(NodeElement);

BorderDropHint = (function() {
  function BorderDropHint($element) {
    var $div, width;
    $div = $element.children('.jqtree-element');
    width = $element.width() - 4;
    this.$hint = $('<span class="jqtree-border"></span>');
    $div.append(this.$hint);
    this.$hint.css({
      width: width,
      height: $div.outerHeight() - 4
    });
  }

  BorderDropHint.prototype.remove = function() {
    return this.$hint.remove();
  };

  return BorderDropHint;

})();

GhostDropHint = (function() {
  function GhostDropHint(node, $element, position) {
    this.$element = $element;
    this.node = node;
    this.$ghost = $('<li class="jqtree_common jqtree-ghost"><span class="jqtree_common jqtree-circle"></span><span class="jqtree_common jqtree-line"></span></li>');
    if (position === Position.AFTER) {
      this.moveAfter();
    } else if (position === Position.BEFORE) {
      this.moveBefore();
    } else if (position === Position.INSIDE) {
      if (node.isFolder() && node.is_open) {
        this.moveInsideOpenFolder();
      } else {
        this.moveInside();
      }
    }
  }

  GhostDropHint.prototype.remove = function() {
    return this.$ghost.remove();
  };

  GhostDropHint.prototype.moveAfter = function() {
    return this.$element.after(this.$ghost);
  };

  GhostDropHint.prototype.moveBefore = function() {
    return this.$element.before(this.$ghost);
  };

  GhostDropHint.prototype.moveInsideOpenFolder = function() {
    return $(this.node.children[0].element).before(this.$ghost);
  };

  GhostDropHint.prototype.moveInside = function() {
    this.$element.after(this.$ghost);
    return this.$ghost.addClass('jqtree-inside');
  };

  return GhostDropHint;

})();

module.exports = {
  BorderDropHint: BorderDropHint,
  FolderElement: FolderElement,
  GhostDropHint: GhostDropHint,
  NodeElement: NodeElement
};
