import { Position, Node } from "../node";
import { JqTreeWidget } from "../tree.jquery";
import { DropHint } from "../types";
import BorderDropHint from "./borderDropHint";
import GhostDropHint from "./ghostDropHint";

class NodeElement {
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
                this.element,
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

export default NodeElement;
