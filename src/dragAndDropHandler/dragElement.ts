class DragElement {
    private offsetX: number;
    private offsetY: number;
    private $element: JQuery;

    constructor(
        nodeName: string,
        offsetX: number,
        offsetY: number,
        $tree: JQuery,
        autoEscape: boolean,
    ) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.$element = jQuery("<span>").addClass(
            "jqtree-title jqtree-dragging",
        );

        if (autoEscape) {
            this.$element.text(nodeName);
        } else {
            this.$element.html(nodeName);
        }

        this.$element.css("position", "absolute");
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
}

export default DragElement;
