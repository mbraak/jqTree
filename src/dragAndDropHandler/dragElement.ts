interface DragElementParams {
    autoEscape: boolean;
    nodeName: string;
    offsetX: number;
    offsetY: number;
    treeElement: HTMLElement;
}

class DragElement {
    private element: HTMLElement;
    private offsetX: number;
    private offsetY: number;

    constructor({
        autoEscape,
        nodeName,
        offsetX,
        offsetY,
        treeElement,
    }: DragElementParams) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.element = this.createElement(nodeName, autoEscape);

        treeElement.appendChild(this.element);
    }

    private createElement(nodeName: string, autoEscape: boolean) {
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

    public move(pageX: number, pageY: number): void {
        this.element.style.left = `${pageX - this.offsetX}px`;
        this.element.style.top = `${pageY - this.offsetY}px`;
    }

    public remove(): void {
        this.element.remove();
    }
}

export default DragElement;
