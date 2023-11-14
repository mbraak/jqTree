import { Position, Node } from "../node";
import { DropHint } from "../dragAndDropHandler/types";
import BorderDropHint from "./borderDropHint";
import GhostDropHint from "./ghostDropHint";
import { GetScrollLeft } from "../jqtreeMethodTypes";

export interface NodeElementParams {
    getScrollLeft: GetScrollLeft;
    node: Node;
    tabIndex?: number;
    $treeElement: JQuery<HTMLElement>;
}

class NodeElement {
    public node: Node;
    public element: HTMLElement;
    private getScrollLeft: GetScrollLeft;
    private tabIndex?: number;
    private $treeElement: JQuery<HTMLElement>;

    constructor({
        getScrollLeft,
        node,
        tabIndex,
        $treeElement,
    }: NodeElementParams) {
        this.getScrollLeft = getScrollLeft;
        this.tabIndex = tabIndex;
        this.$treeElement = $treeElement;

        this.init(node);
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

    public addDropHint(position: number): DropHint {
        if (this.mustShowBorderDropHint(position)) {
            return new BorderDropHint(this.element, this.getScrollLeft());
        } else {
            return new GhostDropHint(this.node, this.element, position);
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
