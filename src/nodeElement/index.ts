import { DropHint } from "../dragAndDropHandler/types";
import { GetScrollLeft } from "../jqtreeMethodTypes";
import { Node } from "../node";
import { Position } from "../position";
import BorderDropHint from "./borderDropHint";
import GhostDropHint from "./ghostDropHint";

export interface NodeElementParams {
    $treeElement: JQuery;
    getScrollLeft: GetScrollLeft;
    node: Node;
    tabIndex?: number;
}

class NodeElement {
    private $treeElement: JQuery;
    private getScrollLeft: GetScrollLeft;
    private tabIndex?: number;
    public element: HTMLElement;
    public node: Node;

    constructor({
        $treeElement,
        getScrollLeft,
        node,
        tabIndex,
    }: NodeElementParams) {
        this.getScrollLeft = getScrollLeft;
        this.tabIndex = tabIndex;
        this.$treeElement = $treeElement;

        this.init(node);
    }

    protected getTitleSpan(): HTMLSpanElement {
        return this.element.querySelector(
            ":scope > .jqtree-element > span.jqtree-title",
        ) as HTMLSpanElement;
    }

    protected getUl(): HTMLUListElement {
        return this.element.querySelector(":scope > ul") as HTMLUListElement;
    }

    protected mustShowBorderDropHint(position: Position): boolean {
        return position === Position.Inside;
    }

    public addDropHint(position: number): DropHint {
        if (this.mustShowBorderDropHint(position)) {
            return new BorderDropHint(this.element, this.getScrollLeft());
        } else {
            return new GhostDropHint(this.node, this.element, position);
        }
    }

    public deselect(): void {
        this.element.classList.remove("jqtree-selected");

        const titleSpan = this.getTitleSpan();
        titleSpan.removeAttribute("tabindex");
        titleSpan.setAttribute("aria-selected", "false");

        titleSpan.blur();
    }

    public init(node: Node): void {
        this.node = node;

        if (!node.element) {
            const element = this.$treeElement.get(0);

            if (element) {
                node.element = element;
            }
        }

        if (node.element) {
            this.element = node.element;
        }
    }

    public select(mustSetFocus: boolean): void {
        this.element.classList.add("jqtree-selected");

        const titleSpan = this.getTitleSpan();
        const tabIndex = this.tabIndex;

        // Check for null or undefined
        if (tabIndex != null) {
            titleSpan.setAttribute("tabindex", tabIndex.toString());
        }

        titleSpan.setAttribute("aria-selected", "true");

        if (mustSetFocus) {
            titleSpan.focus();
        }
    }
}

export default NodeElement;
