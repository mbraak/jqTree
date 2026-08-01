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

        this._horizontalScrollDirection = undefined;
        this._verticalScrollDirection = undefined;
    }

    protected _getNewHorizontalScrollDirection(
        pageX: number,
    ): HorizontalScrollDirection | undefined {
        const scrollParentOffset = getElementPosition(this._container);
        const containerWidth = this._container.getBoundingClientRect().width;

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

    protected _getNewVerticalScrollDirection(
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
                this._container.getBoundingClientRect().height;
            this._scrollParentBottom =
                this._getScrollParentTop() + containerHeight;
        }

        return this._scrollParentBottom;
    }

    private _getScrollParentTop() {
        this._scrollParentTop ??= getOffsetTop(this._container);

        return this._scrollParentTop;
    }
}
