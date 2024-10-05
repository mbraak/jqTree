import type { ScrollParent } from "./types";

import { getOffsetTop } from "../util";

type HorizontalScrollDirection = "left" | "right";
type VerticalScrollDirection = "bottom" | "top";

interface Params {
    refreshHitAreas: () => void;
    treeElement: HTMLElement;
}

export default class DocumentScrollParent implements ScrollParent {
    private documentScrollHeight?: number;
    private documentScrollWidth?: number;
    private horizontalScrollDirection?: HorizontalScrollDirection;
    private horizontalScrollTimeout?: number;
    private refreshHitAreas: () => void;
    private treeElement: HTMLElement;
    private verticalScrollDirection?: VerticalScrollDirection;
    private verticalScrollTimeout?: number;

    constructor({ refreshHitAreas, treeElement }: Params) {
        this.refreshHitAreas = refreshHitAreas;
        this.treeElement = treeElement;
    }

    private canScrollDown() {
        const documentElement = document.documentElement;

        return (
            documentElement.scrollTop + documentElement.clientHeight <
            this.getDocumentScrollHeight()
        );
    }

    private canScrollRight() {
        const documentElement = document.documentElement;

        return (
            documentElement.scrollLeft + documentElement.clientWidth <
            this.getDocumentScrollWidth()
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

    private getNewHorizontalScrollDirection(
        pageX: number,
    ): HorizontalScrollDirection | undefined {
        const scrollLeft = document.documentElement.scrollLeft;
        const windowWidth = window.innerWidth;

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

    private getNewVerticalScrollDirection(
        pageY: number,
    ): undefined | VerticalScrollDirection {
        const scrollTop = jQuery(document).scrollTop() ?? 0;
        const distanceTop = pageY - scrollTop;

        if (distanceTop < 20) {
            return "top";
        }

        const windowHeight = window.innerHeight;

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
        window.scrollBy({ behavior: "instant", left: distance, top: 0 });

        this.refreshHitAreas();

        setTimeout(this.scrollHorizontally.bind(this), 40);
    }

    private scrollVertically() {
        if (!this.verticalScrollDirection) {
            return;
        }

        const distance = this.verticalScrollDirection === "top" ? -20 : 20;
        window.scrollBy({ behavior: "instant", left: 0, top: distance });

        this.refreshHitAreas();

        setTimeout(this.scrollVertically.bind(this), 40);
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
        const treeTop = getOffsetTop(this.treeElement);

        document.documentElement.scrollTop = top + treeTop;
    }

    public stopScrolling() {
        this.horizontalScrollDirection = undefined;
        this.verticalScrollDirection = undefined;
        this.documentScrollHeight = undefined;
        this.documentScrollWidth = undefined;
    }
}
