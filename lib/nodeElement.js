"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodeElement = exports.FolderElement = exports.BorderDropHint = void 0;
var _node = require("./node");
class NodeElement {
  constructor(node, treeWidget) {
    this.init(node, treeWidget);
  }
  init(node, treeWidget) {
    this.node = node;
    this.treeWidget = treeWidget;
    if (!node.element) {
      const element = this.treeWidget.element.get(0);
      if (element) {
        node.element = element;
      }
    }
    if (node.element) {
      this.$element = jQuery(node.element);
    }
  }
  addDropHint(position) {
    if (this.mustShowBorderDropHint(position)) {
      return new BorderDropHint(this.$element, this.treeWidget._getScrollLeft());
    } else {
      return new GhostDropHint(this.node, this.$element, position);
    }
  }
  select(mustSetFocus) {
    const $li = this.getLi();
    $li.addClass("jqtree-selected");
    const $span = this.getSpan();
    $span.attr("tabindex", this.treeWidget.options.tabIndex ?? null);
    $span.attr("aria-selected", "true");
    if (mustSetFocus) {
      $span.trigger("focus");
    }
  }
  deselect() {
    const $li = this.getLi();
    $li.removeClass("jqtree-selected");
    const $span = this.getSpan();
    $span.removeAttr("tabindex");
    $span.attr("aria-selected", "false");
    $span.trigger("blur");
  }
  getUl() {
    return this.$element.children("ul:first");
  }
  getSpan() {
    return this.$element.children(".jqtree-element").find("span.jqtree-title");
  }
  getLi() {
    return this.$element;
  }
  mustShowBorderDropHint(position) {
    return position === _node.Position.Inside;
  }
}
exports.NodeElement = NodeElement;
class FolderElement extends NodeElement {
  open(onFinished) {
    let slide = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let animationSpeed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "fast";
    if (this.node.is_open) {
      return;
    }
    this.node.is_open = true;
    const $button = this.getButton();
    $button.removeClass("jqtree-closed");
    $button.html("");
    const buttonEl = $button.get(0);
    if (buttonEl) {
      const openedIconElement = this.treeWidget.renderer.openedIconElement;
      if (openedIconElement) {
        const icon = openedIconElement.cloneNode(true);
        buttonEl.appendChild(icon);
      }
    }
    const doOpen = () => {
      const $li = this.getLi();
      $li.removeClass("jqtree-closed");
      const $titleSpan = this.getSpan();
      $titleSpan.attr("aria-expanded", "true");
      if (onFinished) {
        onFinished(this.node);
      }
      this.treeWidget._triggerEvent("tree.open", {
        node: this.node
      });
    };
    if (slide) {
      this.getUl().slideDown(animationSpeed, doOpen);
    } else {
      this.getUl().show();
      doOpen();
    }
  }
  close() {
    let slide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    let animationSpeed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "fast";
    if (!this.node.is_open) {
      return;
    }
    this.node.is_open = false;
    const $button = this.getButton();
    $button.addClass("jqtree-closed");
    $button.html("");
    const buttonEl = $button.get(0);
    if (buttonEl) {
      const closedIconElement = this.treeWidget.renderer.closedIconElement;
      if (closedIconElement) {
        const icon = closedIconElement.cloneNode(true);
        buttonEl.appendChild(icon);
      }
    }
    const doClose = () => {
      const $li = this.getLi();
      $li.addClass("jqtree-closed");
      const $titleSpan = this.getSpan();
      $titleSpan.attr("aria-expanded", "false");
      this.treeWidget._triggerEvent("tree.close", {
        node: this.node
      });
    };
    if (slide) {
      this.getUl().slideUp(animationSpeed, doClose);
    } else {
      this.getUl().hide();
      doClose();
    }
  }
  mustShowBorderDropHint(position) {
    return !this.node.is_open && position === _node.Position.Inside;
  }
  getButton() {
    return this.$element.children(".jqtree-element").find("a.jqtree-toggler");
  }
}
exports.FolderElement = FolderElement;
class BorderDropHint {
  constructor($element, scrollLeft) {
    const $div = $element.children(".jqtree-element");
    const elWidth = $element.width() || 0;
    const width = Math.max(elWidth + scrollLeft - 4, 0);
    const elHeight = $div.outerHeight() || 0;
    const height = Math.max(elHeight - 4, 0);
    this.$hint = jQuery('<span class="jqtree-border"></span>');
    $div.append(this.$hint);
    this.$hint.css({
      width,
      height
    });
  }
  remove() {
    this.$hint.remove();
  }
}
exports.BorderDropHint = BorderDropHint;
class GhostDropHint {
  constructor(node, $element, position) {
    this.$element = $element;
    this.node = node;
    this.$ghost = jQuery(`<li class="jqtree_common jqtree-ghost"><span class="jqtree_common jqtree-circle"></span>
            <span class="jqtree_common jqtree-line"></span></li>`);
    if (position === _node.Position.After) {
      this.moveAfter();
    } else if (position === _node.Position.Before) {
      this.moveBefore();
    } else if (position === _node.Position.Inside) {
      if (node.isFolder() && node.is_open) {
        this.moveInsideOpenFolder();
      } else {
        this.moveInside();
      }
    }
  }
  remove() {
    this.$ghost.remove();
  }
  moveAfter() {
    this.$element.after(this.$ghost);
  }
  moveBefore() {
    this.$element.before(this.$ghost);
  }
  moveInsideOpenFolder() {
    const childElement = this.node.children[0]?.element;
    if (childElement) {
      jQuery(childElement).before(this.$ghost);
    }
  }
  moveInside() {
    this.$element.after(this.$ghost);
    this.$ghost.addClass("jqtree-inside");
  }
}