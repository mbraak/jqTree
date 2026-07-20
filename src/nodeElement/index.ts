import type { DropHint } from "../dragAndDropHandler/types";
import type { GetScrollLeft } from "../jqtreeMethodTypes";
import type { Node, Position } from "../node";

import BorderDropHint from "./borderDropHint";
import GhostDropHint from "./ghostDropHint";

export interface NodeElementParams {
    getScrollLeft: GetScrollLeft;
    node: Node;
    tabIndex?: number;
    treeElement: HTMLElement;
}

class NodeElement {
    public element: HTMLElement;
    public node: Node;
    private _getScrollLeft: GetScrollLeft;
    private _tabIndex?: number;
    private _treeElement: HTMLElement;

    constructor({
        getScrollLeft,
        node,
        tabIndex,
        treeElement,
    }: NodeElementParams) {
        this._getScrollLeft = getScrollLeft;
        this._tabIndex = tabIndex;
        this._treeElement = treeElement;

        this.init(node);
    }

    public addDropHint(position: Position): DropHint {
        if (this.mustShowBorderDropHint(position)) {
            return new BorderDropHint(this.element, this._getScrollLeft());
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

        node.element ??= this._treeElement;

        this.element = node.element;
    }

    public select(mustSetFocus: boolean): void {
        this.element.classList.add("jqtree-selected");

        const titleSpan = this.getTitleSpan();
        const tabIndex = this._tabIndex;

        // Check for null or undefined
        if (tabIndex != null) {
            titleSpan.setAttribute("tabindex", tabIndex.toString());
        }

        titleSpan.setAttribute("aria-selected", "true");

        if (mustSetFocus) {
            titleSpan.focus();
        }
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
        return position === "inside";
    }
}

export default NodeElement;
