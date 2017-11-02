import { ITreeWidget, IHitArea } from "./itree_widget";

export default class ScrollHandler {
    private tree_widget: ITreeWidget;
    private previous_top: number;
    private is_initialized: boolean;
    private $scroll_parent: JQuery | null;
    private scroll_parent_top: number;

    constructor(tree_widget: ITreeWidget) {
        this.tree_widget = tree_widget;
        this.previous_top = -1;
        this.is_initialized = false;
    }

    public checkScrolling() {
        this._ensureInit();

        if (this.tree_widget.dnd_handler) {
            const hovered_area = this.tree_widget.dnd_handler.hovered_area;

            if (hovered_area && hovered_area.top !== this.previous_top) {
                this.previous_top = hovered_area.top;

                if (this.$scroll_parent) {
                    this._handleScrollingWithScrollParent(hovered_area);
                } else {
                    this._handleScrollingWithDocument(hovered_area);
                }
            }
        }
    }

    public scrollTo(top: number) {
        this._ensureInit();

        if (this.$scroll_parent) {
            this.$scroll_parent[0].scrollTop = top;
        } else {
            const offset = this.tree_widget.$el.offset();
            const tree_top = offset ? offset.top : 0;

            jQuery(document).scrollTop(top + tree_top);
        }
    }

    public isScrolledIntoView($element: JQuery): boolean {
        this._ensureInit();

        let element_bottom: number;
        let view_bottom: number;
        let element_top: number;
        let view_top: number;

        const el_height = $element.height() || 0;

        if (this.$scroll_parent) {
            view_top = 0;
            view_bottom = this.$scroll_parent.height() || 0;

            const offset = $element.offset();
            const original_top = offset ? offset.top : 0;

            element_top = original_top - this.scroll_parent_top;
            element_bottom = element_top + el_height;
        } else {
            view_top = jQuery(window).scrollTop() || 0;

            const window_height = jQuery(window).height() || 0;
            view_bottom = view_top + window_height;

            const offset = $element.offset();

            element_top = offset ? offset.top : 0;
            element_bottom = element_top + el_height;
        }

        return element_bottom <= view_bottom && element_top >= view_top;
    }

    private _initScrollParent() {
        const getParentWithOverflow = () => {
            const css_attributes = ["overflow", "overflow-y"];

            const hasOverFlow = ($el: JQuery) => {
                for (const attr of css_attributes) {
                    const overflow_value = $el.css(attr);
                    if (
                        overflow_value === "auto" ||
                        overflow_value === "scroll"
                    ) {
                        return true;
                    }
                }

                return false;
            };

            if (hasOverFlow(this.tree_widget.$el)) {
                return this.tree_widget.$el;
            }

            for (const el of this.tree_widget.$el.parents().get()) {
                const $el = jQuery(el);
                if (hasOverFlow($el)) {
                    return $el;
                }
            }

            return null;
        };

        const setDocumentAsScrollParent = () => {
            this.scroll_parent_top = 0;
            this.$scroll_parent = null;
        };

        if (this.tree_widget.$el.css("position") === "fixed") {
            setDocumentAsScrollParent();
        }

        const $scroll_parent = getParentWithOverflow();

        if (
            $scroll_parent &&
            $scroll_parent.length &&
            $scroll_parent[0].tagName !== "HTML"
        ) {
            this.$scroll_parent = $scroll_parent;

            const offset = this.$scroll_parent.offset();
            this.scroll_parent_top = offset ? offset.top : 0;
        } else {
            setDocumentAsScrollParent();
        }

        this.is_initialized = true;
    }

    private _ensureInit() {
        if (!this.is_initialized) {
            this._initScrollParent();
        }
    }

    private _handleScrollingWithScrollParent(area: IHitArea) {
        if (!this.$scroll_parent) {
            return;
        } else {
            const distance_bottom =
                this.scroll_parent_top +
                this.$scroll_parent[0].offsetHeight -
                area.bottom;

            if (distance_bottom < 20) {
                this.$scroll_parent[0].scrollTop += 20;
                this.tree_widget.refreshHitAreas();
                this.previous_top = -1;
            } else if (area.top - this.scroll_parent_top < 20) {
                this.$scroll_parent[0].scrollTop -= 20;
                this.tree_widget.refreshHitAreas();
                this.previous_top = -1;
            }
        }
    }

    private _handleScrollingWithDocument(area: IHitArea) {
        const scroll_top = jQuery(document).scrollTop() || 0;
        const distance_top = area.top - scroll_top;

        if (distance_top < 20) {
            jQuery(document).scrollTop(scroll_top - 20);
        } else {
            const window_height = jQuery(window).height() || 0;

            if (window_height - (area.bottom - scroll_top) < 20) {
                jQuery(document).scrollTop(scroll_top + 20);
            }
        }
    }
}
