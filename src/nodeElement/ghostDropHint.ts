import { DropHint } from "../dragAndDropHandler/types";
import { Node } from "../node";
import { Position } from "../position";

class GhostDropHint implements DropHint {
    private element: HTMLElement;
    private ghost: HTMLElement;
    private node: Node;

    constructor(node: Node, element: HTMLElement, position: Position) {
        this.element = element;
        this.node = node;
        this.ghost = this.createGhostElement();

        switch (position) {
            case Position.After:
                this.moveAfter();
                break;

            case Position.Before:
                this.moveBefore();
                break;

            case Position.Inside: {
                if (node.isFolder() && node.is_open) {
                    this.moveInsideOpenFolder();
                } else {
                    this.moveInside();
                }
            }
        }
    }

    public remove(): void {
        this.ghost.remove();
    }

    private createGhostElement() {
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

    private moveAfter(): void {
        this.element.after(this.ghost);
    }

    private moveBefore(): void {
        this.element.before(this.ghost);
    }

    private moveInside(): void {
        this.element.after(this.ghost);
        this.ghost.classList.add("jqtree-inside");
    }

    private moveInsideOpenFolder(): void {
        const childElement = this.node.children[0]?.element;

        if (childElement) {
            childElement.before(this.ghost);
        }
    }
}

export default GhostDropHint;
