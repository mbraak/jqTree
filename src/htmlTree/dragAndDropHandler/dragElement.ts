interface DragElementParams {
    autoEscape: boolean;
    nodeName: string;
    offsetX: number;
    offsetY: number;
    treeElement: HTMLElement;
}

class DragElement {
    private _element: HTMLElement;
    private _offsetX: number;
    private _offsetY: number;

    constructor({
        autoEscape,
        nodeName,
        offsetX,
        offsetY,
        treeElement,
    }: DragElementParams) {
        this._offsetX = offsetX;
        this._offsetY = offsetY;

        this._element = this._createElement(nodeName, autoEscape);

        treeElement.appendChild(this._element);
    }

    public move(pageX: number, pageY: number): void {
        this._element.style.left = `${pageX - this._offsetX}px`;
        this._element.style.top = `${pageY - this._offsetY}px`;
    }

    public remove(): void {
        this._element.remove();
    }

    private _createElement(nodeName: string, autoEscape: boolean) {
        const element = document.createElement("span");
        element.classList.add("jqtree-title", "jqtree-dragging");

        if (autoEscape) {
            element.textContent = nodeName;
        } else {
            element.innerHTML = nodeName;
        }

        element.style.position = "absolute";

        return element;
    }
}

export default DragElement;
