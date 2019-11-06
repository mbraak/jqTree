"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var node_1 = require("./node");
var NodeElement = /** @class */ (function () {
    function NodeElement(node, treeWidget) {
        this.init(node, treeWidget);
    }
    NodeElement.prototype.init = function (node, treeWidget) {
        this.node = node;
        this.treeWidget = treeWidget;
        if (!node.element) {
            node.element = this.treeWidget.element.get(0);
        }
        this.$element = jQuery(node.element);
    };
    NodeElement.prototype.addDropHint = function (position) {
        if (this.mustShowBorderDropHint(position)) {
            return new BorderDropHint(this.$element, this.treeWidget._getScrollLeft());
        }
        else {
            return new GhostDropHint(this.node, this.$element, position);
        }
    };
    NodeElement.prototype.select = function (mustSetFocus) {
        var $li = this.getLi();
        $li.addClass("jqtree-selected");
        $li.attr("aria-selected", "true");
        var $span = this.getSpan();
        $span.attr("tabindex", this.treeWidget.options.tabIndex);
        if (mustSetFocus) {
            $span.focus();
        }
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
        return this.$element.children(".jqtree-element").find("span.jqtree-title");
    };
    NodeElement.prototype.getLi = function () {
        return this.$element;
    };
    NodeElement.prototype.mustShowBorderDropHint = function (position) {
        return position === node_1.Position.Inside;
    };
    return NodeElement;
}());
exports.NodeElement = NodeElement;
var FolderElement = /** @class */ (function (_super) {
    __extends(FolderElement, _super);
    function FolderElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FolderElement.prototype.open = function (onFinished, slide, animationSpeed) {
        var _this = this;
        if (slide === void 0) { slide = true; }
        if (animationSpeed === void 0) { animationSpeed = "fast"; }
        if (this.node.is_open) {
            return;
        }
        this.node.is_open = true; // eslint-disable-line @typescript-eslint/camelcase
        var $button = this.getButton();
        $button.removeClass("jqtree-closed");
        $button.html("");
        var buttonEl = $button.get(0);
        if (buttonEl) {
            var icon = this.treeWidget.renderer.openedIconElement.cloneNode(true);
            buttonEl.appendChild(icon);
        }
        var doOpen = function () {
            var $li = _this.getLi();
            $li.removeClass("jqtree-closed");
            var $span = _this.getSpan();
            $span.attr("aria-expanded", "true");
            if (onFinished) {
                onFinished(_this.node);
            }
            _this.treeWidget._triggerEvent("tree.open", {
                node: _this.node
            });
        };
        if (slide) {
            this.getUl().slideDown(animationSpeed, doOpen);
        }
        else {
            this.getUl().show();
            doOpen();
        }
    };
    FolderElement.prototype.close = function (slide, animationSpeed) {
        var _this = this;
        if (slide === void 0) { slide = true; }
        if (animationSpeed === void 0) { animationSpeed = "fast"; }
        if (!this.node.is_open) {
            return;
        }
        this.node.is_open = false; // eslint-disable-line @typescript-eslint/camelcase
        var $button = this.getButton();
        $button.addClass("jqtree-closed");
        $button.html("");
        var buttonEl = $button.get(0);
        if (buttonEl) {
            var icon = this.treeWidget.renderer.closedIconElement.cloneNode(true);
            buttonEl.appendChild(icon);
        }
        var doClose = function () {
            var $li = _this.getLi();
            $li.addClass("jqtree-closed");
            var $span = _this.getSpan();
            $span.attr("aria-expanded", "false");
            _this.treeWidget._triggerEvent("tree.close", {
                node: _this.node
            });
        };
        if (slide) {
            this.getUl().slideUp(animationSpeed, doClose);
        }
        else {
            this.getUl().hide();
            doClose();
        }
    };
    FolderElement.prototype.mustShowBorderDropHint = function (position) {
        return !this.node.is_open && position === node_1.Position.Inside;
    };
    FolderElement.prototype.getButton = function () {
        return this.$element.children(".jqtree-element").find("a.jqtree-toggler");
    };
    return FolderElement;
}(NodeElement));
exports.FolderElement = FolderElement;
var BorderDropHint = /** @class */ (function () {
    function BorderDropHint($element, scrollLeft) {
        var $div = $element.children(".jqtree-element");
        var elWidth = $element.width() || 0;
        var width = Math.max(elWidth + scrollLeft - 4, 0);
        var elHeight = $div.outerHeight() || 0;
        var height = Math.max(elHeight - 4, 0);
        this.$hint = jQuery('<span class="jqtree-border"></span>');
        $div.append(this.$hint);
        this.$hint.css({ width: width, height: height });
    }
    BorderDropHint.prototype.remove = function () {
        this.$hint.remove();
    };
    return BorderDropHint;
}());
exports.BorderDropHint = BorderDropHint;
var GhostDropHint = /** @class */ (function () {
    function GhostDropHint(node, $element, position) {
        this.$element = $element;
        this.node = node;
        this.$ghost = jQuery("<li class=\"jqtree_common jqtree-ghost\"><span class=\"jqtree_common jqtree-circle\"></span>\n            <span class=\"jqtree_common jqtree-line\"></span></li>");
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
        jQuery(this.node.children[0].element).before(this.$ghost);
    };
    GhostDropHint.prototype.moveInside = function () {
        this.$element.after(this.$ghost);
        this.$ghost.addClass("jqtree-inside");
    };
    return GhostDropHint;
}());
