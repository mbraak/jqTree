const $ = window["jQuery"];


export default class ScrollHandler {
    tree_widget;
    previous_top: number;
    is_initialized: boolean;
    $scroll_parent;
    scroll_parent_top: number;

    constructor(tree_widget) {
        this.tree_widget = tree_widget;
        this.previous_top = -1;
        this.is_initialized = false;
    }

    _initScrollParent() {
        const getParentWithOverflow = () => {
            const css_values = ['overflow', 'overflow-y'];

            const hasOverFlow = (el) => {
                for (let css_value of css_values) {
                    if ($.css(el, css_value) in ['auto', 'scroll']) {
                        return true;
                    }
                }

                return false;
            }

            if (hasOverFlow(this.tree_widget.$el[0])) {
                return this.tree_widget.$el;
            }

            for (let el of this.tree_widget.$el.parents()) {
                if (hasOverFlow(el)) {
                    return $(el);
                }
            }

            return null;
        }

        const setDocumentAsScrollParent = () => {
            this.scroll_parent_top = 0;
            this.$scroll_parent = null;
        }

        if (this.tree_widget.$el.css('position') == 'fixed') {
            setDocumentAsScrollParent();
        }

        const $scroll_parent = getParentWithOverflow();

        if ($scroll_parent && $scroll_parent.length && $scroll_parent[0].tagName != 'HTML') {
            this.$scroll_parent = $scroll_parent;
            this.scroll_parent_top = this.$scroll_parent.offset().top;
        }
        else {
            setDocumentAsScrollParent();
        }

        this.is_initialized = true;
    }

    _ensureInit() {
        if (! this.is_initialized) {
            this._initScrollParent();
        }
    }

    checkScrolling() {
        this._ensureInit();

        const hovered_area = this.tree_widget.dnd_handler.hovered_area;

        if (hovered_area && hovered_area.top != this.previous_top) {
            this.previous_top = hovered_area.top;

            if (this.$scroll_parent) {
                this._handleScrollingWithScrollParent(hovered_area);
            }
            else {
                this._handleScrollingWithDocument(hovered_area);
            }
        }
    }

    _handleScrollingWithScrollParent(area) {
        const distance_bottom = this.scroll_parent_top + this.$scroll_parent[0].offsetHeight - area.bottom;

        if (distance_bottom < 20) {
            this.$scroll_parent[0].scrollTop += 20;
            this.tree_widget.refreshHitAreas();
            this.previous_top = -1;
        }
        else if ((area.top - this.scroll_parent_top) < 20) {
            this.$scroll_parent[0].scrollTop -= 20;
            this.tree_widget.refreshHitAreas();
            this.previous_top = -1;
        }
    }

    _handleScrollingWithDocument(area) {
        const distance_top = area.top - $(document).scrollTop();

        if (distance_top < 20) {
            $(document).scrollTop($(document).scrollTop() - 20);
        }
        else if ($(window).height() - (area.bottom - $(document).scrollTop()) < 20) {
            $(document).scrollTop($(document).scrollTop() + 20);
        }
    }

    scrollTo(top: number) {
        this._ensureInit()

        if (this.$scroll_parent) {
            this.$scroll_parent[0].scrollTop = top;
        }
        else {
            const tree_top = this.tree_widget.$el.offset().top;
            $(document).scrollTop(top + tree_top);
        }
    }

    isScrolledIntoView(element): boolean {
        this._ensureInit();

        const $element = $(element);

        let element_bottom;
        let view_bottom;
        let element_top;
        let view_top;

        if (this.$scroll_parent) {
            view_top = 0;
            view_bottom = this.$scroll_parent.height();

            element_top = $element.offset().top - this.scroll_parent_top;
            element_bottom = element_top + $element.height();
        }
        else {
            view_top = $(window).scrollTop();
            view_bottom = view_top + $(window).height();

            element_top = $element.offset().top;
            element_bottom = element_top + $element.height();
        }

        return ((element_bottom <= view_bottom) && (element_top >= view_top));
    }
}
