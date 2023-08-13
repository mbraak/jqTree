import { Position, Node } from "../node";
import { DropHint } from "../types";

class GhostDropHint implements DropHint {
    private $element: JQuery<Element>;
    private node: Node;
    private $ghost: JQuery;

    constructor(node: Node, $element: JQuery<Element>, position: Position) {
        this.$element = $element;

        this.node = node;
        this.$ghost = jQuery(
            `<li class="jqtree_common jqtree-ghost"><span class="jqtree_common jqtree-circle"></span>
          <span class="jqtree_common jqtree-line"></span></li>`,
        );

        if (position === Position.After) {
            this.moveAfter();
        } else if (position === Position.Before) {
            this.moveBefore();
        } else if (position === Position.Inside) {
            if (node.isFolder() && node.is_open) {
                this.moveInsideOpenFolder();
            } else {
                this.moveInside();
            }
        }
    }

    public remove(): void {
        this.$ghost.remove();
    }

    public moveAfter(): void {
        this.$element.after(this.$ghost);
    }

    public moveBefore(): void {
        this.$element.before(this.$ghost);
    }

    public moveInsideOpenFolder(): void {
        const childElement = this.node.children[0]?.element;

        if (childElement) {
            jQuery(childElement).before(this.$ghost);
        }
    }

    public moveInside(): void {
        this.$element.after(this.$ghost);
        this.$ghost.addClass("jqtree-inside");
    }
}

export default GhostDropHint;
