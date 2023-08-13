import { DropHint } from "..//types";

class BorderDropHint implements DropHint {
    private $hint?: JQuery<Element>;

    constructor(element: HTMLElement, scrollLeft: number) {
        const div = element.querySelector(":scope > .jqtree-element");

        if (!div) {
            this.$hint = undefined;
            return;
        }

        const width = Math.max(element.offsetWidth + scrollLeft - 4, 0);
        const height = Math.max(element.clientHeight - 4, 0);

        this.$hint = jQuery('<span class="jqtree-border"></span>');
        jQuery(div).append(this.$hint);

        this.$hint.css({ width, height });
    }

    public remove(): void {
        this.$hint?.remove();
    }
}

export default BorderDropHint;
