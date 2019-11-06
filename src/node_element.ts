import { Position, Node } from "./node";
import { ITreeWidget, IDropHint, INodeElement, OnFinishOpenNode } from "./itree_widget";

export class NodeElement implements INodeElement {
    public node: Node;
    public $element: JQuery<any>;
    protected treeWidget: ITreeWidget;

    constructor(node: Node, treeWidget: ITreeWidget) {
        this.init(node, treeWidget);
    }

    public init(node: Node, treeWidget: ITreeWidget): void {
        this.node = node;
        this.treeWidget = treeWidget;

        if (!node.element) {
            node.element = this.treeWidget.element.get(0);
        }

        this.$element = jQuery(node.element);
    }

    public addDropHint(position: number): IDropHint {
        if (this.mustShowBorderDropHint(position)) {
            return new BorderDropHint(this.$element, this.treeWidget._getScrollLeft());
        } else {
            return new GhostDropHint(this.node, this.$element, position);
        }
    }

    public select(mustSetFocus: boolean): void {
        const $li = this.getLi();

        $li.addClass("jqtree-selected");
        $li.attr("aria-selected", "true");

        const $span = this.getSpan();
        $span.attr("tabindex", this.treeWidget.options.tabIndex);

        if (mustSetFocus) {
            $span.focus();
        }
    }

    public deselect(): void {
        const $li = this.getLi();

        $li.removeClass("jqtree-selected");
        $li.attr("aria-selected", "false");

        const $span = this.getSpan();
        $span.removeAttr("tabindex");

        $span.blur();
    }

    protected getUl(): JQuery<any> {
        return this.$element.children("ul:first");
    }

    protected getSpan(): JQuery<any> {
        return this.$element.children(".jqtree-element").find("span.jqtree-title");
    }

    protected getLi(): JQuery<any> {
        return this.$element;
    }

    protected mustShowBorderDropHint(position: number): boolean {
        return position === Position.Inside;
    }
}

export class FolderElement extends NodeElement {
    public open(onFinished: OnFinishOpenNode | null, slide = true, animationSpeed = "fast"): void {
        if (this.node.is_open) {
            return;
        }

        this.node.is_open = true; // eslint-disable-line @typescript-eslint/camelcase

        const $button = this.getButton();
        $button.removeClass("jqtree-closed");
        $button.html("");

        const buttonEl = $button.get(0);

        if (buttonEl) {
            const icon = this.treeWidget.renderer.openedIconElement.cloneNode(true);

            buttonEl.appendChild(icon);
        }

        const doOpen = (): void => {
            const $li = this.getLi();
            $li.removeClass("jqtree-closed");

            const $span = this.getSpan();
            $span.attr("aria-expanded", "true");

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

    public close(slide = true, animationSpeed = "fast"): void {
        if (!this.node.is_open) {
            return;
        }

        this.node.is_open = false; // eslint-disable-line @typescript-eslint/camelcase

        const $button = this.getButton();
        $button.addClass("jqtree-closed");
        $button.html("");

        const buttonEl = $button.get(0);

        if (buttonEl) {
            const icon = this.treeWidget.renderer.closedIconElement.cloneNode(true);

            buttonEl.appendChild(icon);
        }

        const doClose = (): void => {
            const $li = this.getLi();
            $li.addClass("jqtree-closed");

            const $span = this.getSpan();
            $span.attr("aria-expanded", "false");

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

    protected mustShowBorderDropHint(position: number): boolean {
        return !this.node.is_open && position === Position.Inside;
    }

    private getButton(): JQuery {
        return this.$element.children(".jqtree-element").find("a.jqtree-toggler");
    }
}

export class BorderDropHint implements IDropHint {
    private $hint: JQuery;

    constructor($element: JQuery, scrollLeft: number) {
        const $div = $element.children(".jqtree-element");

        const elWidth = $element.width() || 0;
        const width = Math.max(elWidth + scrollLeft - 4, 0);

        const elHeight = $div.outerHeight() || 0;
        const height = Math.max(elHeight - 4, 0);

        this.$hint = jQuery('<span class="jqtree-border"></span>');
        $div.append(this.$hint);

        this.$hint.css({ width, height });
    }

    public remove(): void {
        this.$hint.remove();
    }
}

class GhostDropHint implements IDropHint {
    private $element: JQuery;
    private node: Node;
    private $ghost: JQuery;

    constructor(node: Node, $element: JQuery, position: number) {
        this.$element = $element;

        this.node = node;
        this.$ghost = jQuery(
            `<li class="jqtree_common jqtree-ghost"><span class="jqtree_common jqtree-circle"></span>
            <span class="jqtree_common jqtree-line"></span></li>`
        );

        if (position === Position.After) {
            this.moveAfter();
        } else if (position === Position.Before) {
            this.moveBefore();
        } else if (position === Position.Inside) {
            if (node.isFolder() && node.is_open) {
                this.moveInsideOpenFolder();
            } else {
                this.moveInside();
            }
        }
    }

    public remove(): void {
        this.$ghost.remove();
    }

    public moveAfter(): void {
        this.$element.after(this.$ghost);
    }

    public moveBefore(): void {
        this.$element.before(this.$ghost);
    }

    public moveInsideOpenFolder(): void {
        jQuery(this.node.children[0].element).before(this.$ghost);
    }

    public moveInside(): void {
        this.$element.after(this.$ghost);
        this.$ghost.addClass("jqtree-inside");
    }
}
