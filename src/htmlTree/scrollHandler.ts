import type { PositionInfo } from "./mouseUtils";
import type { ScrollParent } from "./scrollHandler/scrollParent";

import createScrollParent from "./scrollHandler/createScrollParent";

interface ScrollHandlerParams {
    refreshHitAreas: () => void;
    treeElement: HTMLElement;
}

export default class ScrollHandler {
    private _refreshHitAreas: () => void;
    private _scrollParent?: ScrollParent;
    private _treeElement: HTMLElement;

    constructor({ refreshHitAreas, treeElement }: ScrollHandlerParams) {
        this._refreshHitAreas = refreshHitAreas;
        this._scrollParent = undefined;
        this._treeElement = treeElement;
    }

    public checkScrolling(positionInfo: PositionInfo): void {
        this._checkVerticalScrolling(positionInfo);
        this._checkHorizontalScrolling(positionInfo);
    }

    public getScrollLeft(): number {
        return this._getScrollParent().getScrollLeft();
    }

    public scrollToY(top: number): void {
        this._getScrollParent().scrollToY(top);
    }

    public stopScrolling() {
        this._getScrollParent().stopScrolling();
    }

    private _checkHorizontalScrolling(positionInfo: PositionInfo): void {
        this._getScrollParent().checkHorizontalScrolling(positionInfo.pageX);
    }

    private _checkVerticalScrolling(positionInfo: PositionInfo): void {
        this._getScrollParent().checkVerticalScrolling(positionInfo.pageY);
    }

    private _getScrollParent(): ScrollParent {
        this._scrollParent ??= createScrollParent(
            this._treeElement,
            this._refreshHitAreas,
        );

        return this._scrollParent;
    }
}
