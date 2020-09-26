import { Position } from "./node";
export class NodeElement {
    constructor(node, treeWidget) {
        this.init(node, treeWidget);
    }
    init(node, treeWidget) {
        this.node = node;
        this.treeWidget = treeWidget;
        if (!node.element) {
            node.element = this.treeWidget.element.get(0);
        }
        this.$element = jQuery(node.element);
    }
    addDropHint(position) {
        if (this.mustShowBorderDropHint(position)) {
            return new BorderDropHint(this.$element, this.treeWidget._getScrollLeft());
        }
        else {
            return new GhostDropHint(this.node, this.$element, position);
        }
    }
    select(mustSetFocus) {
        var _a;
        const $li = this.getLi();
        $li.addClass("jqtree-selected");
        $li.attr("aria-selected", "true");
        const $span = this.getSpan();
        $span.attr("tabindex", (_a = this.treeWidget.options.tabIndex) !== null && _a !== void 0 ? _a : null);
        if (mustSetFocus) {
            $span.focus();
        }
    }
    deselect() {
        const $li = this.getLi();
        $li.removeClass("jqtree-selected");
        $li.attr("aria-selected", "false");
        const $span = this.getSpan();
        $span.removeAttr("tabindex");
        $span.blur();
    }
    getUl() {
        return this.$element.children("ul:first");
    }
    getSpan() {
        return this.$element
            .children(".jqtree-element")
            .find("span.jqtree-title");
    }
    getLi() {
        return this.$element;
    }
    mustShowBorderDropHint(position) {
        return position === Position.Inside;
    }
}
export class FolderElement extends NodeElement {
    open(onFinished, slide = true, animationSpeed = "fast") {
        if (this.node.is_open) {
            return;
        }
        this.node.is_open = true;
        const $button = this.getButton();
        $button.removeClass("jqtree-closed");
        $button.html("");
        const buttonEl = $button.get(0);
        if (buttonEl) {
            const icon = this.treeWidget.renderer.openedIconElement.cloneNode(true);
            buttonEl.appendChild(icon);
        }
        const doOpen = () => {
            const $li = this.getLi();
            $li.removeClass("jqtree-closed");
            const $span = this.getSpan();
            $span.attr("aria-expanded", "true");
            if (onFinished) {
                onFinished(this.node);
            }
            this.treeWidget._triggerEvent("tree.open", {
                node: this.node,
            });
        };
        if (slide) {
            this.getUl().slideDown(animationSpeed, doOpen);
        }
        else {
            this.getUl().show();
            doOpen();
        }
    }
    close(slide = true, animationSpeed = "fast") {
        if (!this.node.is_open) {
            return;
        }
        this.node.is_open = false;
        const $button = this.getButton();
        $button.addClass("jqtree-closed");
        $button.html("");
        const buttonEl = $button.get(0);
        if (buttonEl) {
            const icon = this.treeWidget.renderer.closedIconElement.cloneNode(true);
            buttonEl.appendChild(icon);
        }
        const doClose = () => {
            const $li = this.getLi();
            $li.addClass("jqtree-closed");
            const $span = this.getSpan();
            $span.attr("aria-expanded", "false");
            this.treeWidget._triggerEvent("tree.close", {
                node: this.node,
            });
        };
        if (slide) {
            this.getUl().slideUp(animationSpeed, doClose);
        }
        else {
            this.getUl().hide();
            doClose();
        }
    }
    mustShowBorderDropHint(position) {
        return !this.node.is_open && position === Position.Inside;
    }
    getButton() {
        return this.$element
            .children(".jqtree-element")
            .find("a.jqtree-toggler");
    }
}
export class BorderDropHint {
    constructor($element, scrollLeft) {
        const $div = $element.children(".jqtree-element");
        const elWidth = $element.width() || 0;
        const width = Math.max(elWidth + scrollLeft - 4, 0);
        const elHeight = $div.outerHeight() || 0;
        const height = Math.max(elHeight - 4, 0);
        this.$hint = jQuery('<span class="jqtree-border"></span>');
        $div.append(this.$hint);
        this.$hint.css({ width, height });
    }
    remove() {
        this.$hint.remove();
    }
}
class GhostDropHint {
    constructor(node, $element, position) {
        this.$element = $element;
        this.node = node;
        this.$ghost = jQuery(`<li class="jqtree_common jqtree-ghost"><span class="jqtree_common jqtree-circle"></span>
            <span class="jqtree_common jqtree-line"></span></li>`);
        if (position === Position.After) {
            this.moveAfter();
        }
        else if (position === Position.Before) {
            this.moveBefore();
        }
        else if (position === Position.Inside) {
            if (node.isFolder() && node.is_open) {
                this.moveInsideOpenFolder();
            }
            else {
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
        jQuery(this.node.children[0].element).before(this.$ghost);
    }
    moveInside() {
        this.$element.after(this.$ghost);
        this.$ghost.addClass("jqtree-inside");
    }
}
