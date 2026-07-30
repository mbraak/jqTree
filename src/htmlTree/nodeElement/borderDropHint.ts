import type { DropHint } from "htmlTree/dragAndDropHandler/types";

class BorderDropHint implements DropHint {
    private _hint?: HTMLElement;

    constructor(element: HTMLElement, scrollLeft: number) {
        const div = element.querySelector(":scope > .jqtree-element");

        if (!div) {
            this._hint = undefined;
            return;
        }

        const width = Math.max(element.offsetWidth + scrollLeft - 4, 0);
        const height = Math.max(element.clientHeight - 4, 0);

        const hint = document.createElement("span");
        hint.className = "jqtree-border";
        hint.style.width = `${width}px`;
        hint.style.height = `${height}px`;

        this._hint = hint;

        div.append(this._hint);
    }

    public remove(): void {
        this._hint?.remove();
    }
}

export default BorderDropHint;
