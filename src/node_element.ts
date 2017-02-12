import { Position, Node } from "./node";

// tslint:disable-next-line: no-string-literal
const $ = window["jQuery"];

export class NodeElement {
    protected node: Node;
    protected tree_widget;
    protected $element;

    constructor(node: Node, tree_widget) {
        this.init(node, tree_widget);
    }

    public init(node: Node, tree_widget) {
        this.node = node;
        this.tree_widget = tree_widget;

        if (! node.element) {
            node.element = this.tree_widget.element;
        }

        this.$element = $(node.element);
    }

    public addDropHint(position) {
        if (position === Position.INSIDE) {
            return new BorderDropHint(this.$element);
        } else {
            return new GhostDropHint(this.node, this.$element, position);
        }
    }

    public select() {
        const $li = this.getLi();

        $li.addClass("jqtree-selected");
        $li.attr("aria-selected", "true");

        const $span = this.getSpan();
        $span.attr("tabindex", 0);
    }

    public deselect() {
        const $li = this.getLi();

        $li.removeClass("jqtree-selected");
        $li.attr("aria-selected", "false");

        const $span = this.getSpan();
        $span.attr("tabindex", -1);
    }

    protected getUl() {
        return this.$element.children("ul:first");
    }

    protected getSpan() {
        return this.$element.children(".jqtree-element").find("span.jqtree-title");
    }

    protected getLi() {
        return this.$element;
    }
}

export class FolderElement extends NodeElement {
    public open(on_finished: Function | null, slide = true) {
        if (! this.node.is_open) {
            this.node.is_open = true;
            const $button = this.getButton();
            $button.removeClass("jqtree-closed");
            $button.html("");
            $button.append(this.tree_widget.renderer.opened_icon_element.cloneNode(false));

            const doOpen = () => {
                const $li = this.getLi();
                $li.removeClass("jqtree-closed");

                const $span = this.getSpan();
                $span.attr("aria-expanded", "true");

                if (on_finished) {
                    on_finished(this.node);
                }

                this.tree_widget._triggerEvent("tree.open", {node: this.node});
            };

            if (slide) {
                this.getUl().slideDown("fast", doOpen);
            } else {
                this.getUl().show();
                doOpen();
            }
        }
    }

    public close(slide: boolean = true) {
        if (this.node.is_open) {
            this.node.is_open = false;
            const $button = this.getButton();
            $button.addClass("jqtree-closed");
            $button.html("");
            $button.append(this.tree_widget.renderer.closed_icon_element.cloneNode(false));

            const doClose = () => {
                const $li = this.getLi();
                $li.addClass("jqtree-closed");

                const $span = this.getSpan();
                $span.attr("aria-expanded", "false");

                this.tree_widget._triggerEvent("tree.close", {node: this.node});
            };

            if (slide) {
                this.getUl().slideUp("fast", doClose);
            } else {
                this.getUl().hide();
                doClose();
            }
        }
    }

    public addDropHint(position: Object) {
        if (! this.node.is_open && position === Position.INSIDE) {
            return new BorderDropHint(this.$element);
        } else {
            return new GhostDropHint(this.node, this.$element, position);
        }
    }

    private getButton() {
        return this.$element.children(".jqtree-element").find("a.jqtree-toggler");
    }
}

export class BorderDropHint {
    private $hint;

    constructor($element) {
        const $div = $element.children(".jqtree-element");
        const width = $element.width() - 4;

        this.$hint = $('<span class="jqtree-border"></span>');
        $div.append(this.$hint);

        this.$hint.css({
            width,
            height: $div.outerHeight() - 4
        });
    }

    public remove() {
        this.$hint.remove();
    }
}

export class GhostDropHint {
    private $element;
    private node: Node;
    private $ghost;

    constructor(node: Node, $element, position: Object) {
        this.$element = $element;

        this.node = node;
        this.$ghost = $(
            `<li class="jqtree_common jqtree-ghost"><span class="jqtree_common jqtree-circle"></span>
            <span class="jqtree_common jqtree-line"></span></li>`
        );

        if (position === Position.AFTER) {
            this.moveAfter();
        } else if (position === Position.BEFORE) {
            this.moveBefore();
        } else if (position === Position.INSIDE) {
            if (node.isFolder() && node.is_open) {
                this.moveInsideOpenFolder();
            } else {
                this.moveInside();
            }
        }
    }

    public remove() {
        this.$ghost.remove();
    }

    public moveAfter() {
        this.$element.after(this.$ghost);
    }

    public moveBefore() {
        this.$element.before(this.$ghost);
    }

    public moveInsideOpenFolder() {
        $(this.node.children[0].element).before(this.$ghost);
    }

    public moveInside() {
        this.$element.after(this.$ghost);
        this.$ghost.addClass("jqtree-inside");
    }
}
