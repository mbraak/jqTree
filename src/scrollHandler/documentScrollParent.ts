import type { ScrollParent } from "./types";

export default class DocumentScrollParent implements ScrollParent {
    private $element: JQuery<HTMLElement>;

    constructor($element: JQuery<HTMLElement>) {
        this.$element = $element;
    }

    public checkHorizontalScrolling(pageX: number): void {
        //
    }

    public checkVerticalScrolling(pageY: number) {
        //
    }

    public getScrollLeft(): number {
        return 0;
    }

    public isScrolledIntoView($element: JQuery<HTMLElement>): boolean {
        const $window = jQuery(window);

        const elementHeight = $element.height() || 0;
        const viewTop = $window.scrollTop() || 0;
        const windowHeight = $window.height() || 0;
        const viewBottom = viewTop + windowHeight;
        const elementTop = $element.offset()?.top ?? 0;
        const elementBottom = elementTop + elementHeight;

        return elementBottom <= viewBottom && elementTop >= 0;
    }

    public scrollToY(top: number): void {
        const offset = this.$element.offset();
        const treeTop = offset ? offset.top : 0;

        jQuery(document).scrollTop(top + treeTop);
    }
}
