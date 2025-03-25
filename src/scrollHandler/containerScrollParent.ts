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
        this.scrollParentTop ??= getOffsetTop(this.container);

        return this.scrollParentTop;
    }
}
