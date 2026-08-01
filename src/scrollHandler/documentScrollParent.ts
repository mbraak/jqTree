import type {
    HorizontalScrollDirection,
    VerticalScrollDirection,
} from "./scrollParent";

import { getOffsetTop } from "../positionUtils";
import { ScrollParent } from "./scrollParent";

interface Params {
    refreshHitAreas: () => void;
    treeElement: HTMLElement;
}

export default class DocumentScrollParent extends ScrollParent {
    private _documentScrollHeight?: number;
    private _documentScrollWidth?: number;
    private _treeElement: HTMLElement;

    constructor({ refreshHitAreas, treeElement }: Params) {
        super({ container: document.documentElement, refreshHitAreas });

        this._treeElement = treeElement;
    }

    public scrollToY(top: number): void {
        const treeTop = getOffsetTop(this._treeElement);

        super.scrollToY(top + treeTop);
    }

    public stopScrolling() {
        super.stopScrolling();

        this._documentScrollHeight = undefined;
        this._documentScrollWidth = undefined;
    }

    protected _getNewHorizontalScrollDirection(
        pageX: number,
    ): HorizontalScrollDirection | undefined {
        const scrollLeft = this._container.scrollLeft;
        const windowWidth = window.innerWidth;

        const isNearRightEdge = pageX > windowWidth - 20;
        const isNearLeftEdge = pageX - scrollLeft < 20;

        if (isNearRightEdge && this._canScrollRight()) {
            return "right";
        }

        if (isNearLeftEdge) {
            return "left";
        }

        return undefined;
    }

    protected _getNewVerticalScrollDirection(
        pageY: number,
    ): undefined | VerticalScrollDirection {
        const scrollTop = this._container.scrollTop;
        const distanceTop = pageY - scrollTop;

        if (distanceTop < 20) {
            return "top";
        }

        const windowHeight = window.innerHeight;

        if (windowHeight - (pageY - scrollTop) < 20 && this._canScrollDown()) {
            return "bottom";
        }

        return undefined;
    }

    private _canScrollDown() {
        return (
            this._container.scrollTop + this._container.clientHeight <
            this._getDocumentScrollHeight()
        );
    }

    private _canScrollRight() {
        return (
            this._container.scrollLeft + this._container.clientWidth <
            this._getDocumentScrollWidth()
        );
    }

    private _getDocumentScrollHeight() {
        // Store the original scroll height because the scroll height can increase when the drag element is moved beyond the scroll height.
        this._documentScrollHeight ??= this._container.scrollHeight;

        return this._documentScrollHeight;
    }

    private _getDocumentScrollWidth() {
        // Store the original scroll width because the scroll width can increase when the drag element is moved beyond the scroll width.
        this._documentScrollWidth ??= this._container.scrollWidth;

        return this._documentScrollWidth;
    }
}
