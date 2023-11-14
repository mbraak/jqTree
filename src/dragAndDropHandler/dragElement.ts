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
        const $element = jQuery("<span>").addClass(
            "jqtree-title jqtree-dragging",
        );

        if (autoEscape) {
            $element.text(nodeName);
        } else {
            $element.html(nodeName);
        }

        $element.css("position", "absolute");

        return $element;
    }
}

export default DragElement;
