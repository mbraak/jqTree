import type { ScrollParent } from "./types";

import { getElementPosition, getOffsetTop } from '../util'

type HorizontalScrollDirection = "left" | "right";
type VerticalScrollDirection = "bottom" | "top";

interface Params {
    container: HTMLElement;
    refreshHitAreas: () => void;
}

export default class ContainerScrollParent implements ScrollParent {
    private container: HTMLElement;
    private horizontalScrollDirection?: HorizontalScrollDirection;
    private horizontalScrollTimeout?: number;
    private refreshHitAreas: () => void;
    private scrollParentBottom?: number;
    private scrollParentTop?: number;
    private verticalScrollDirection?: VerticalScrollDirection;
    private verticalScrollTimeout?: number;

    constructor({ container, refreshHitAreas }: Params) {
        this.container = container;
        this.refreshHitAreas = refreshHitAreas;
    }

    private getNewHorizontalScrollDirection(
        pageX: number,
    ): HorizontalScrollDirection | undefined {
        const scrollParentOffset = getElementPosition(this.container);

        const rightEdge = scrollParentOffset.left + this.container.clientWidth;
        const leftEdge = scrollParentOffset.left;
        const isNearRightEdge = pageX > rightEdge - 20;
        const isNearLeftEdge = pageX < leftEdge + 20;

        if (isNearRightEdge) {
            return "right";
        } else if (isNearLeftEdge) {
            return "left";
        }

        return undefined;
    }

    private getNewVerticalScrollDirection(
        pageY: number,
    ): undefined | VerticalScrollDirection {
        if (pageY < this.getScrollParentTop()) {
            return "top";
        }

        if (pageY > this.getScrollParentBottom()) {
            return "bottom";
        }

        return undefined;
    }

    private getScrollParentBottom() {
        if (this.scrollParentBottom == null) {
            this.scrollParentBottom = this.getScrollParentTop() + this.container.clientHeight;
        }

        return this.scrollParentBottom;
    }

    private getScrollParentTop() {
        if (this.scrollParentTop == null) {
            this.scrollParentTop = getOffsetTop(this.container)
        }

        return this.scrollParentTop;
    }

    private scrollHorizontally() {
        if (!this.horizontalScrollDirection) {
            return;
        }

        const distance = this.horizontalScrollDirection === "left" ? -20 : 20;

        this.container.scrollBy({
            behavior: "instant",
            left: distance,
            top: 0,
        });

        this.refreshHitAreas();

        setTimeout(this.scrollHorizontally.bind(this), 40);
    }

    private scrollVertically() {
        if (!this.verticalScrollDirection) {
            return;
        }

        const distance = this.verticalScrollDirection === "top" ? -20 : 20;

        this.container.scrollBy({
            behavior: "instant",
            left: 0,
            top: distance,
        });

        this.refreshHitAreas();

        setTimeout(this.scrollVertically.bind(this), 40);
    }

    public checkHorizontalScrolling(pageX: number): void {
        const newHorizontalScrollDirection =
            this.getNewHorizontalScrollDirection(pageX);

        if (this.horizontalScrollDirection !== newHorizontalScrollDirection) {
            this.horizontalScrollDirection = newHorizontalScrollDirection;

            if (this.horizontalScrollTimeout != null) {
                window.clearTimeout(this.verticalScrollTimeout);
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
        return this.container.scrollLeft;
    }

    public scrollToY(top: number): void {
        this.container.scrollTop = top;
    }

    public stopScrolling() {
        this.horizontalScrollDirection = undefined;
        this.verticalScrollDirection = undefined;
        this.scrollParentTop = undefined;
        this.scrollParentBottom = undefined;
    }
}
