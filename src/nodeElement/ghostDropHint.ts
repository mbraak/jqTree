import { DropHint } from "../dragAndDropHandler/types";

class GhostDropHint implements DropHint {
    private element: HTMLElement;
    private ghost: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
        this.ghost = this.createGhostElement();

        this.element.after(this.ghost);
        this.ghost.classList.add("jqtree-inside");
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

    public remove(): void {
        this.ghost.remove();
    }
}

export default GhostDropHint;
