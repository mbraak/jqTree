import { getElementPosition, getOffsetTop } from "../util";
import {
    HorizontalScrollDirection,
    ScrollParent,
    VerticalScrollDirection,
} from "./scrollParent";

export default class ContainerScrollParent extends ScrollParent {
    private scrollParentBottom?: number;
    private scrollParentTop?: number;

    public stopScrolling() {
        super.stopScrolling();

        this.horizontalScrollDirection = undefined;
        this.verticalScrollDirection = undefined;
    }

    protected getNewHorizontalScrollDirection(
        pageX: number,
    ): HorizontalScrollDirection | undefined {
        const scrollParentOffset = getElementPosition(this.container);
        const containerWidth = this.container.getBoundingClientRect().width;

        const rightEdge = scrollParentOffset.left + containerWidth;
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

    protected getNewVerticalScrollDirection(
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

    protected scrollHorizontally() {
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

    protected scrollVertically() {
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

    private getScrollParentBottom() {
        if (this.scrollParentBottom == null) {
            const containerHeight =
                this.container.getBoundingClientRect().height;
            this.scrollParentBottom =
                this.getScrollParentTop() + containerHeight;
        }

        return this.scrollParentBottom;
    }

    private getScrollParentTop() {
        if (this.scrollParentTop == null) {
            this.scrollParentTop = getOffsetTop(this.container);
        }

        return this.scrollParentTop;
    }
}
