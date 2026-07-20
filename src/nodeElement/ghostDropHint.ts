import type { DropHint } from "../dragAndDropHandler/types";
import type { Node, Position } from "../node";

class GhostDropHint implements DropHint {
    private _element: HTMLElement;
    private _ghost: HTMLElement;
    private _node: Node;

    constructor(node: Node, element: HTMLElement, position: Position) {
        this._element = element;
        this._node = node;
        this._ghost = this._createGhostElement();

        switch (position) {
            case "after":
                this._moveAfter();
                break;

            case "before":
                this._moveBefore();
                break;

            case "inside": {
                if (node.isFolder() && node.is_open) {
                    this._moveInsideOpenFolder();
                } else {
                    this._moveInside();
                }
            }
        }
    }

    public remove(): void {
        this._ghost.remove();
    }

    private _createGhostElement() {
        const ghost = document.createElement("li");
        ghost.className = "jqtree_common jqtree-ghost";

        const circleSpan = document.createElement("span");
        circleSpan.className = "jqtree_common jqtree-circle";
        ghost.append(circleSpan);

        const lineSpan = document.createElement("span");
        lineSpan.className = "jqtree_common jqtree-line";
        ghost.append(lineSpan);

        return ghost;
    }

    private _moveAfter(): void {
        this._element.after(this._ghost);
    }

    private _moveBefore(): void {
        this._element.before(this._ghost);
    }

    private _moveInside(): void {
        this._element.after(this._ghost);
        this._ghost.classList.add("jqtree-inside");
    }

    private _moveInsideOpenFolder(): void {
        const childElement = this._node.children[0]?.element;

        if (childElement) {
            childElement.before(this._ghost);
        }
    }
}

export default GhostDropHint;
