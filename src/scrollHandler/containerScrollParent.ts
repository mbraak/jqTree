import type {
    HorizontalScrollDirection,
    VerticalScrollDirection,
} from "./scrollParent";

import { getElementPosition, getOffsetTop } from "../positionUtils";
import { ScrollParent } from "./scrollParent";


export default class ContainerScrollParent extends ScrollParent {
    private _scrollParentBottom?: number;
    private _scrollParentTop?: number;

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
        if (pageY < this._getScrollParentTop()) {
            return "top";
        }

        if (pageY > this._getScrollParentBottom()) {
            return "bottom";
        }

        return undefined;
    }

    private _getScrollParentBottom() {
        if (this._scrollParentBottom == null) {
            const containerHeight =
                this.container.getBoundingClientRect().height;
            this._scrollParentBottom =
                this._getScrollParentTop() + containerHeight;
        }

        return this._scrollParentBottom;
    }

    private _getScrollParentTop() {
        this._scrollParentTop ??= getOffsetTop(this.container);

        return this._scrollParentTop;
    }
}
