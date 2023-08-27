import type { ScrollDirection, ScrollParent } from "./types";

export default class DocumentScrollParent implements ScrollParent {
    private $element: JQuery<HTMLElement>;
    private refreshHitAreas: () => void;
    private scrollDirection?: ScrollDirection;
    private scrollTimeout?: number;

    constructor($element: JQuery<HTMLElement>, refreshHitAreas: () => void) {
        this.$element = $element;
        this.refreshHitAreas = refreshHitAreas;
    }

    public checkHorizontalScrolling(pageX: number): void {
        //
    }

    public checkVerticalScrolling(pageY: number) {
        const newScrollDirection = this.getNewScrollDirection(pageY);

        if (this.scrollDirection !== newScrollDirection) {
            this.scrollDirection = newScrollDirection;

            if (this.scrollTimeout != null) {
                window.clearTimeout(this.scrollTimeout);
            }

            if (newScrollDirection) {
                this.scrollTimeout = window.setTimeout(
                    this.scrollVertically.bind(this),
                    40,
                );
            }
        }
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

    public resetScrolling() {
        this.scrollDirection = undefined;
    }

    private getNewScrollDirection(pageY: number): ScrollDirection | undefined {
        const scrollTop = jQuery(document).scrollTop() || 0;
        const distanceTop = pageY - scrollTop;

        if (distanceTop < 20) {
            return "top";
        }

        const windowHeight = jQuery(window).height() || 0;

        if (windowHeight - (pageY - scrollTop) < 20) {
            return "bottom";
        }

        return undefined;
    }

    private scrollVertically() {
        if (!this.scrollDirection) {
            return;
        }

        const distance = this.scrollDirection === "top" ? -20 : 20;
        window.scrollBy({ left: 0, top: distance, behavior: "instant" });

        this.refreshHitAreas();

        setTimeout(this.scrollVertically.bind(this), 40);
    }
}
