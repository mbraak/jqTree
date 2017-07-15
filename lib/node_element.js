"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var node_1 = require("./node");
var NodeElement = (function () {
    function NodeElement(node, tree_widget) {
        this.init(node, tree_widget);
    }
    NodeElement.prototype.init = function (node, tree_widget) {
        this.node = node;
        this.tree_widget = tree_widget;
        if (!node.element) {
            node.element = this.tree_widget.element.get(0);
        }
        this.$element = $(node.element);
    };
    NodeElement.prototype.addDropHint = function (position) {
        if (position === node_1.Position.Inside) {
            return new BorderDropHint(this.$element);
        }
        else {
            return new GhostDropHint(this.node, this.$element, position);
        }
    };
    NodeElement.prototype.select = function () {
        var $li = this.getLi();
        $li.addClass("jqtree-selected");
        $li.attr("aria-selected", "true");
        var $span = this.getSpan();
        $span.attr("tabindex", this.tree_widget.options.tabIndex);
        $span.focus();
    };
    NodeElement.prototype.deselect = function () {
        var $li = this.getLi();
        $li.removeClass("jqtree-selected");
        $li.attr("aria-selected", "false");
        var $span = this.getSpan();
        $span.removeAttr("tabindex");
        $span.blur();
    };
    NodeElement.prototype.getUl = function () {
        return this.$element.children("ul:first");
    };
    NodeElement.prototype.getSpan = function () {
        return this.$element
            .children(".jqtree-element")
            .find("span.jqtree-title");
    };
    NodeElement.prototype.getLi = function () {
        return this.$element;
    };
    return NodeElement;
}());
exports.NodeElement = NodeElement;
var FolderElement = (function (_super) {
    __extends(FolderElement, _super);
    function FolderElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FolderElement.prototype.open = function (on_finished, slide) {
        var _this = this;
        if (slide === void 0) { slide = true; }
        if (!this.node.is_open) {
            this.node.is_open = true;
            var $button = this.getButton();
            $button.removeClass("jqtree-closed");
            $button.html("");
            var button_el = $button.get(0);
            if (button_el) {
                var icon = this.tree_widget.renderer.opened_icon_element.cloneNode(false);
                button_el.appendChild(icon);
            }
            var doOpen = function () {
                var $li = _this.getLi();
                $li.removeClass("jqtree-closed");
                var $span = _this.getSpan();
                $span.attr("aria-expanded", "true");
                if (on_finished) {
                    on_finished(_this.node);
                }
                _this.tree_widget._triggerEvent("tree.open", {
                    node: _this.node
                });
            };
            if (slide) {
                this.getUl().slideDown("fast", doOpen);
            }
            else {
                this.getUl().show();
                doOpen();
            }
        }
    };
    FolderElement.prototype.close = function (slide) {
        var _this = this;
        if (slide === void 0) { slide = true; }
        if (this.node.is_open) {
            this.node.is_open = false;
            var $button = this.getButton();
            $button.addClass("jqtree-closed");
            $button.html("");
            var button_el = $button.get(0);
            if (button_el) {
                var icon = this.tree_widget.renderer.closed_icon_element.cloneNode(false);
                button_el.appendChild(icon);
            }
            var doClose = function () {
                var $li = _this.getLi();
                $li.addClass("jqtree-closed");
                var $span = _this.getSpan();
                $span.attr("aria-expanded", "false");
                _this.tree_widget._triggerEvent("tree.close", {
                    node: _this.node
                });
            };
            if (slide) {
                this.getUl().slideUp("fast", doClose);
            }
            else {
                this.getUl().hide();
                doClose();
            }
        }
    };
    FolderElement.prototype.addDropHint = function (position) {
        if (!this.node.is_open && position === node_1.Position.Inside) {
            return new BorderDropHint(this.$element);
        }
        else {
            return new GhostDropHint(this.node, this.$element, position);
        }
    };
    FolderElement.prototype.getButton = function () {
        return this.$element
            .children(".jqtree-element")
            .find("a.jqtree-toggler");
    };
    return FolderElement;
}(NodeElement));
exports.FolderElement = FolderElement;
var BorderDropHint = (function () {
    function BorderDropHint($element) {
        var $div = $element.children(".jqtree-element");
        var width = $element.width() - 4;
        this.$hint = $('<span class="jqtree-border"></span>');
        $div.append(this.$hint);
        this.$hint.css({
            width: width,
            height: $div.outerHeight() - 4
        });
    }
    BorderDropHint.prototype.remove = function () {
        this.$hint.remove();
    };
    return BorderDropHint;
}());
exports.BorderDropHint = BorderDropHint;
var GhostDropHint = (function () {
    function GhostDropHint(node, $element, position) {
        this.$element = $element;
        this.node = node;
        this.$ghost = $("<li class=\"jqtree_common jqtree-ghost\"><span class=\"jqtree_common jqtree-circle\"></span>\n            <span class=\"jqtree_common jqtree-line\"></span></li>");
        if (position === node_1.Position.After) {
            this.moveAfter();
        }
        else if (position === node_1.Position.Before) {
            this.moveBefore();
        }
        else if (position === node_1.Position.Inside) {
            if (node.isFolder() && node.is_open) {
                this.moveInsideOpenFolder();
            }
            else {
                this.moveInside();
            }
        }
    }
    GhostDropHint.prototype.remove = function () {
        this.$ghost.remove();
    };
    GhostDropHint.prototype.moveAfter = function () {
        this.$element.after(this.$ghost);
    };
    GhostDropHint.prototype.moveBefore = function () {
        this.$element.before(this.$ghost);
    };
    GhostDropHint.prototype.moveInsideOpenFolder = function () {
        $(this.node.children[0].element).before(this.$ghost);
    };
    GhostDropHint.prototype.moveInside = function () {
        this.$element.after(this.$ghost);
        this.$ghost.addClass("jqtree-inside");
    };
    return GhostDropHint;
}());
exports.GhostDropHint = GhostDropHint;
