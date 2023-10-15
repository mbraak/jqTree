import type { ScrollParent } from "./types";

type HorizontalScrollDirection = "left" | "right";
type VerticalScrollDirection = "bottom" | "top";

export default class DocumentScrollParent implements ScrollParent {
    private $element: JQuery<HTMLElement>;
    private horizontalScrollDirection?: HorizontalScrollDirection;
    private horizontalScrollTimeout?: number;
    private refreshHitAreas: () => void;
    private verticalScrollDirection?: VerticalScrollDirection;
    private verticalScrollTimeout?: number;
    private documentScrollHeight?: number;
    private documentScrollWidth?: number;

    constructor($element: JQuery<HTMLElement>, refreshHitAreas: () => void) {
        this.$element = $element;
        this.refreshHitAreas = refreshHitAreas;
    }

    public checkHorizontalScrolling(pageX: number): void {
        const newHorizontalScrollDirection =
            this.getNewHorizontalScrollDirection(pageX);

        if (this.horizontalScrollDirection !== newHorizontalScrollDirection) {
            this.horizontalScrollDirection = newHorizontalScrollDirection;

            if (this.horizontalScrollTimeout != null) {
                window.clearTimeout(this.horizontalScrollTimeout);
            }

            if (newHorizontalScrollDirection) {
                this.horizontalScrollTimeout = window.setTimeout(
                    this.scrollHorizontally.bind(this),
                    40,
                );
            }
        }
    }

    public checkVerticalScrolling(pageY: number) {
        const newVerticalScrollDirection =
            this.getNewVerticalScrollDirection(pageY);

        if (this.verticalScrollDirection !== newVerticalScrollDirection) {
            this.verticalScrollDirection = newVerticalScrollDirection;

            if (this.verticalScrollTimeout != null) {
                window.clearTimeout(this.verticalScrollTimeout);
                this.verticalScrollTimeout = undefined;
            }

            if (newVerticalScrollDirection) {
                this.verticalScrollTimeout = window.setTimeout(
                    this.scrollVertically.bind(this),
                    40,
                );
            }
        }
    }

    public getScrollLeft(): number {
        return document.documentElement.scrollLeft;
    }

    public scrollToY(top: number): void {
        const offset = this.$element.offset();
        const treeTop = offset ? offset.top : 0;

        jQuery(document).scrollTop(top + treeTop);
    }

    public stopScrolling() {
        this.horizontalScrollDirection = undefined;
        this.verticalScrollDirection = undefined;
        this.documentScrollHeight = undefined;
        this.documentScrollWidth = undefined;
    }

    private getNewHorizontalScrollDirection(
        pageX: number,
    ): HorizontalScrollDirection | undefined {
        const $document = jQuery(document);

        const scrollLeft = $document.scrollLeft() || 0;
        const windowWidth = jQuery(window).width() || 0;

        const isNearRightEdge = pageX > windowWidth - 20;
        const isNearLeftEdge = pageX - scrollLeft < 20;

        if (isNearRightEdge && this.canScrollRight()) {
            return "right";
        }

        if (isNearLeftEdge) {
            return "left";
        }

        return undefined;
    }

    private canScrollRight() {
        const documentElement = document.documentElement;

        return (
            documentElement.scrollLeft + documentElement.clientWidth <
            this.getDocumentScrollWidth()
        );
    }

    private canScrollDown() {
        const documentElement = document.documentElement;

        return (
            documentElement.scrollTop + documentElement.clientHeight <
            this.getDocumentScrollHeight()
        );
    }

    private getDocumentScrollHeight() {
        // Store the original scroll height because the scroll height can increase when the drag element is moved beyond the scroll height.
        if (this.documentScrollHeight == null) {
            this.documentScrollHeight = document.documentElement.scrollHeight;
        }

        return this.documentScrollHeight;
    }

    private getDocumentScrollWidth() {
        // Store the original scroll width because the scroll width can increase when the drag element is moved beyond the scroll width.
        if (this.documentScrollWidth == null) {
            this.documentScrollWidth = document.documentElement.scrollWidth;
        }

        return this.documentScrollWidth;
    }

    private getNewVerticalScrollDirection(
        pageY: number,
    ): VerticalScrollDirection | undefined {
        const scrollTop = jQuery(document).scrollTop() || 0;
        const distanceTop = pageY - scrollTop;

        if (distanceTop < 20) {
            return "top";
        }

        const windowHeight = jQuery(window).height() || 0;

        if (windowHeight - (pageY - scrollTop) < 20 && this.canScrollDown()) {
            return "bottom";
        }

        return undefined;
    }

    private scrollHorizontally() {
        if (!this.horizontalScrollDirection) {
            return;
        }

        const distance = this.horizontalScrollDirection === "left" ? -20 : 20;
        window.scrollBy({ left: distance, top: 0, behavior: "instant" });

        this.refreshHitAreas();

        setTimeout(this.scrollHorizontally.bind(this), 40);
    }

    private scrollVertically() {
        if (!this.verticalScrollDirection) {
            return;
        }

        const distance = this.verticalScrollDirection === "top" ? -20 : 20;
        window.scrollBy({ left: 0, top: distance, behavior: "instant" });

        this.refreshHitAreas();

        setTimeout(this.scrollVertically.bind(this), 40);
    }
}
