import { DropHint } from "..//types";

class BorderDropHint implements DropHint {
    private $hint: JQuery<Element>;

    constructor($element: JQuery<Element>, scrollLeft: number) {
        const $div = $element.children(".jqtree-element");

        const elWidth = $element.width() || 0;
        const width = Math.max(elWidth + scrollLeft - 4, 0);

        const elHeight = $div.outerHeight() || 0;
        const height = Math.max(elHeight - 4, 0);

        this.$hint = jQuery('<span class="jqtree-border"></span>');
        $div.append(this.$hint);

        this.$hint.css({ width, height });
    }

    public remove(): void {
        this.$hint.remove();
    }
}

export default BorderDropHint;
