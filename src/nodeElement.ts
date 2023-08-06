import { Position, Node } from "./node";
import { JqTreeWidget } from "./tree.jquery";
import { DropHint } from "./types";

export type OnFinishOpenNode = (node: Node) => void;

export class NodeElement {
    public node: Node;
    public element: HTMLElement;
    protected treeWidget: JqTreeWidget;

    constructor(node: Node, treeWidget: JqTreeWidget) {
        this.init(node, treeWidget);
    }

    public init(node: Node, treeWidget: JqTreeWidget): void {
        this.node = node;
        this.treeWidget = treeWidget;

        if (!node.element) {
            const element = this.treeWidget.element.get(0);

            if (element) {
                node.element = element;
            }
        }

        if (node.element) {
            this.element = node.element;
        }
    }

    public addDropHint(position: number): DropHint {
        if (this.mustShowBorderDropHint(position)) {
            return new BorderDropHint(
                jQuery(this.element),
                this.treeWidget._getScrollLeft(),
            );
        } else {
            return new GhostDropHint(this.node, jQuery(this.element), position);
        }
    }

    public select(mustSetFocus: boolean): void {
        this.element.classList.add("jqtree-selected");

        const titleSpan = this.getTitleSpan();
        const tabIndex = this.treeWidget.options.tabIndex;

        // Check for null or undefined
        if (tabIndex != null) {
            titleSpan.setAttribute("tabindex", tabIndex.toString());
        }

        titleSpan.setAttribute("aria-selected", "true");

        if (mustSetFocus) {
            titleSpan.focus();
        }
    }

    public deselect(): void {
        this.element.classList.remove("jqtree-selected");

        const titleSpan = this.getTitleSpan();
        titleSpan.removeAttribute("tabindex");
        titleSpan.setAttribute("aria-selected", "false");

        titleSpan.blur();
    }

    protected getUl(): HTMLUListElement {
        return this.element.querySelector(":scope > ul") as HTMLUListElement;
    }

    protected getTitleSpan(): HTMLSpanElement {
        return this.element.querySelector(
            ":scope > .jqtree-element > span.jqtree-title",
        ) as HTMLSpanElement;
    }

    protected mustShowBorderDropHint(position: Position): boolean {
        return position === Position.Inside;
    }
}

export class FolderElement extends NodeElement {
    public open(
        onFinished: OnFinishOpenNode | null,
        slide = true,
        animationSpeed: JQuery.Duration = "fast",
    ): void {
        if (this.node.is_open) {
            return;
        }

        this.node.is_open = true;

        const button = this.getButton();
        button.classList.remove("jqtree-closed");
        button.innerHTML = "";

        const openedIconElement = this.treeWidget.renderer.openedIconElement;

        if (openedIconElement) {
            const icon = openedIconElement.cloneNode(true);
            button.appendChild(icon);
        }

        const doOpen = (): void => {
            this.element.classList.remove("jqtree-closed");

            const titleSpan = this.getTitleSpan();
            titleSpan.setAttribute("aria-expanded", "true");

            if (onFinished) {
                onFinished(this.node);
            }

            this.treeWidget._triggerEvent("tree.open", {
                node: this.node,
            });
        };

        if (slide) {
            jQuery(this.getUl()).slideDown(animationSpeed, doOpen);
        } else {
            jQuery(this.getUl()).show();
            doOpen();
        }
    }

    public close(
        slide = true,
        animationSpeed: JQuery.Duration | undefined = "fast",
    ): void {
        if (!this.node.is_open) {
            return;
        }

        this.node.is_open = false;

        const button = this.getButton();
        button.classList.add("jqtree-closed");
        button.innerHTML = "";

        const closedIconElement = this.treeWidget.renderer.closedIconElement;

        if (closedIconElement) {
            const icon = closedIconElement.cloneNode(true);
            button.appendChild(icon);
        }

        const doClose = (): void => {
            this.element.classList.add("jqtree-closed");

            const titleSpan = this.getTitleSpan();
            titleSpan.setAttribute("aria-expanded", "false");

            this.treeWidget._triggerEvent("tree.close", {
                node: this.node,
            });
        };

        if (slide) {
            jQuery(this.getUl()).slideUp(animationSpeed, doClose);
        } else {
            jQuery(this.getUl()).hide();
            doClose();
        }
    }

    protected mustShowBorderDropHint(position: Position): boolean {
        return !this.node.is_open && position === Position.Inside;
    }

    private getButton(): HTMLLinkElement {
        return this.element.querySelector(
            ":scope > .jqtree-element > a.jqtree-toggler",
        ) as HTMLLinkElement;
    }
}

export class BorderDropHint implements DropHint {
    private $hint: JQuery<Element>;

    constructor($element: JQuery<Element>, scrollLeft: number) {
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

class GhostDropHint implements DropHint {
    private $element: JQuery<Element>;
    private node: Node;
    private $ghost: JQuery;

    constructor(node: Node, $element: JQuery<Element>, position: Position) {
        this.$element = $element;

        this.node = node;
        this.$ghost = jQuery(
            `<li class="jqtree_common jqtree-ghost"><span class="jqtree_common jqtree-circle"></span>
            <span class="jqtree_common jqtree-line"></span></li>`,
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
        const childElement = this.node.children[0]?.element;

        if (childElement) {
            jQuery(childElement).before(this.$ghost);
        }
    }

    public moveInside(): void {
        this.$element.after(this.$ghost);
        this.$ghost.addClass("jqtree-inside");
    }
}
