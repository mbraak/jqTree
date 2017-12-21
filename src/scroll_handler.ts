import { ITreeWidget, IHitArea } from "./itree_widget";
import { IPositionInfo } from "./imouse_widget";

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
        this.ensureInit();
        this.checkVerticalScrolling();
        this.checkHorizontalScrolling();
    }

    public scrollToY(top: number) {
        this.ensureInit();

        if (this.$scroll_parent) {
            this.$scroll_parent[0].scrollTop = top;
        } else {
            const offset = this.tree_widget.$el.offset();
            const tree_top = offset ? offset.top : 0;

            jQuery(document).scrollTop(top + tree_top);
        }
    }

    public isScrolledIntoView($element: JQuery): boolean {
        this.ensureInit();

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

    public getScrollLeft(): number {
        if (!this.$scroll_parent) {
            return 0;
        } else {
            return this.$scroll_parent.scrollLeft() || 0;
        }
    }

    private initScrollParent() {
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

    private ensureInit() {
        if (!this.is_initialized) {
            this.initScrollParent();
        }
    }

    private handleVerticalScrollingWithScrollParent(area: IHitArea) {
        const scroll_parent = this.$scroll_parent && this.$scroll_parent[0];

        if (!scroll_parent) {
            return;
        }

        const distance_bottom =
            this.scroll_parent_top + scroll_parent.offsetHeight - area.bottom;

        if (distance_bottom < 20) {
            scroll_parent.scrollTop += 20;
            this.tree_widget.refreshHitAreas();
            this.previous_top = -1;
        } else if (area.top - this.scroll_parent_top < 20) {
            scroll_parent.scrollTop -= 20;
            this.tree_widget.refreshHitAreas();
            this.previous_top = -1;
        }
    }

    private handleVerticalScrollingWithDocument(area: IHitArea) {
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

    private checkVerticalScrolling() {
        const hovered_area =
            this.tree_widget.dnd_handler &&
            this.tree_widget.dnd_handler.hovered_area;

        if (hovered_area && hovered_area.top !== this.previous_top) {
            this.previous_top = hovered_area.top;

            if (this.$scroll_parent) {
                this.handleVerticalScrollingWithScrollParent(hovered_area);
            } else {
                this.handleVerticalScrollingWithDocument(hovered_area);
            }
        }
    }

    private checkHorizontalScrolling() {
        const position_info =
            this.tree_widget.dnd_handler &&
            this.tree_widget.dnd_handler.position_info;

        if (!position_info) {
            return;
        }

        if (this.$scroll_parent) {
            this.handleHorizontalScrollingWithParent(position_info);
        } else {
            this.handleHorizontalScrollingWithDocument(position_info);
        }
    }

    private handleHorizontalScrollingWithParent(position_info: IPositionInfo) {
        const $scroll_parent = this.$scroll_parent;
        const scroll_parent_offset = $scroll_parent && $scroll_parent.offset();

        if (!($scroll_parent && scroll_parent_offset)) {
            return;
        }

        const scroll_parent = $scroll_parent[0];

        const can_scroll_right =
            scroll_parent.scrollLeft + scroll_parent.clientWidth <
            scroll_parent.scrollWidth;
        const can_scroll_left = scroll_parent.scrollLeft > 0;

        const right_edge =
            scroll_parent_offset.left + scroll_parent.clientWidth;
        const left_edge = scroll_parent_offset.left;
        const is_near_right_edge = position_info.page_x > right_edge - 20;
        const is_near_left_edge = position_info.page_x < left_edge + 20;

        if (is_near_right_edge && can_scroll_right) {
            scroll_parent.scrollLeft = Math.min(
                scroll_parent.scrollLeft + 20,
                scroll_parent.scrollWidth
            );
        } else if (is_near_left_edge && can_scroll_left) {
            scroll_parent.scrollLeft = Math.max(
                scroll_parent.scrollLeft - 20,
                0
            );
        }
    }

    private handleHorizontalScrollingWithDocument(
        position_info: IPositionInfo
    ) {
        const $document = jQuery(document);

        const scroll_left = $document.scrollLeft() || 0;
        const window_width = jQuery(window).width() || 0;

        const can_scroll_left = scroll_left > 0;

        const is_near_right_edge = position_info.page_x > window_width - 20;
        const is_near_left_edge = position_info.page_x - scroll_left < 20;

        if (is_near_right_edge) {
            $document.scrollLeft(scroll_left + 20);
        } else if (is_near_left_edge && can_scroll_left) {
            $document.scrollLeft(Math.max(scroll_left - 20, 0));
        }
    }
}
