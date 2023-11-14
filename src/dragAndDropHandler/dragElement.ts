interface DragElementParams {
    autoEscape: boolean;
    nodeName: string;
    offsetX: number;
    offsetY: number;
    $tree: JQuery;
}

class DragElement {
    private offsetX: number;
    private offsetY: number;
    private $element: JQuery<HTMLElement>;

    constructor({
        autoEscape,
        nodeName,
        offsetX,
        offsetY,
        $tree,
    }: DragElementParams) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.$element = this.createElement(nodeName, autoEscape);

        $tree.append(this.$element);
    }

    public move(pageX: number, pageY: number): void {
        this.$element.offset({
            left: pageX - this.offsetX,
            top: pageY - this.offsetY,
        });
    }

    public remove(): void {
        this.$element.remove();
    }

    private createElement(nodeName: string, autoEscape: boolean) {
        const element = document.createElement("span");
        element.classList.add("jqtree-title", "jqtree-dragging");

        if (autoEscape) {
            element.textContent = nodeName;
        } else {
            element.innerHTML = nodeName;
        }

        element.style.pointerEvents = "absolute";

        return jQuery(element);
    }
}

export default DragElement;
