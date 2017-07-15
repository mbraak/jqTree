import { Position, Node } from "./node";
import {
    ITreeWidget,
    IDropHint,
    INodeElement,
    OnFinishOpenNode
} from "./itree_widget";

export class NodeElement implements INodeElement {
    public node: Node;
    public $element: JQuery;
    protected tree_widget: ITreeWidget;

    constructor(node: Node, tree_widget: ITreeWidget) {
        this.init(node, tree_widget);
    }

    public init(node: Node, tree_widget: ITreeWidget) {
        this.node = node;
        this.tree_widget = tree_widget;

        if (!node.element) {
            node.element = this.tree_widget.element.get(0);
        }

        this.$element = $(node.element);
    }

    public addDropHint(position: number): IDropHint {
        if (position === Position.Inside) {
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
        $span.attr("tabindex", this.tree_widget.options.tabIndex);

        $span.focus();
    }

    public deselect() {
        const $li = this.getLi();

        $li.removeClass("jqtree-selected");
        $li.attr("aria-selected", "false");

        const $span = this.getSpan();
        $span.removeAttr("tabindex");

        $span.blur();
    }

    protected getUl() {
        return this.$element.children("ul:first");
    }

    protected getSpan() {
        return this.$element
            .children(".jqtree-element")
            .find("span.jqtree-title");
    }

    protected getLi() {
        return this.$element;
    }
}

export class FolderElement extends NodeElement {
    public open(on_finished: OnFinishOpenNode | null, slide = true) {
        if (!this.node.is_open) {
            this.node.is_open = true;

            const $button = this.getButton();
            $button.removeClass("jqtree-closed");
            $button.html("");

            const button_el = $button.get(0);

            if (button_el) {
                const icon = this.tree_widget.renderer.opened_icon_element.cloneNode(
                    false
                );

                button_el.appendChild(icon);
            }

            const doOpen = () => {
                const $li = this.getLi();
                $li.removeClass("jqtree-closed");

                const $span = this.getSpan();
                $span.attr("aria-expanded", "true");

                if (on_finished) {
                    on_finished(this.node);
                }

                this.tree_widget._triggerEvent("tree.open", {
                    node: this.node
                });
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

            const button_el = $button.get(0);

            if (button_el) {
                const icon = this.tree_widget.renderer.closed_icon_element.cloneNode(
                    false
                );

                button_el.appendChild(icon);
            }

            const doClose = () => {
                const $li = this.getLi();
                $li.addClass("jqtree-closed");

                const $span = this.getSpan();
                $span.attr("aria-expanded", "false");

                this.tree_widget._triggerEvent("tree.close", {
                    node: this.node
                });
            };

            if (slide) {
                this.getUl().slideUp("fast", doClose);
            } else {
                this.getUl().hide();
                doClose();
            }
        }
    }

    public addDropHint(position: number) {
        if (!this.node.is_open && position === Position.Inside) {
            return new BorderDropHint(this.$element);
        } else {
            return new GhostDropHint(this.node, this.$element, position);
        }
    }

    private getButton(): JQuery {
        return this.$element
            .children(".jqtree-element")
            .find("a.jqtree-toggler");
    }
}

export class BorderDropHint implements IDropHint {
    private $hint: JQuery;

    constructor($element: JQuery) {
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

export class GhostDropHint implements IDropHint {
    private $element: JQuery;
    private node: Node;
    private $ghost: JQuery;

    constructor(node: Node, $element: JQuery, position: number) {
        this.$element = $element;

        this.node = node;
        this.$ghost = $(
            `<li class="jqtree_common jqtree-ghost"><span class="jqtree_common jqtree-circle"></span>
            <span class="jqtree_common jqtree-line"></span></li>`
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
