import { getOffsetTop } from "../util";
import {
    HorizontalScrollDirection,
    ScrollParent,
    VerticalScrollDirection,
} from "./scrollParent";

interface Params {
    refreshHitAreas: () => void;
    treeElement: HTMLElement;
}

export default class DocumentScrollParent extends ScrollParent {
    private documentScrollHeight?: number;
    private documentScrollWidth?: number;
    private treeElement: HTMLElement;

    constructor({ refreshHitAreas, treeElement }: Params) {
        super({ container: document.documentElement, refreshHitAreas });

        this.treeElement = treeElement;
    }

    public scrollToY(top: number): void {
        const treeTop = getOffsetTop(this.treeElement);

        super.scrollToY(top + treeTop);
    }

    public stopScrolling() {
        super.stopScrolling();

        this.documentScrollHeight = undefined;
        this.documentScrollWidth = undefined;
    }

    protected getNewHorizontalScrollDirection(
        pageX: number,
    ): HorizontalScrollDirection | undefined {
        const scrollLeft = this.container.scrollLeft;
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

    protected getNewVerticalScrollDirection(
        pageY: number,
    ): undefined | VerticalScrollDirection {
        const scrollTop = this.container.scrollTop;
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

    private canScrollDown() {
        return (
            this.container.scrollTop + this.container.clientHeight <
            this.getDocumentScrollHeight()
        );
    }

    private canScrollRight() {
        return (
            this.container.scrollLeft + this.container.clientWidth <
            this.getDocumentScrollWidth()
        );
    }

    private getDocumentScrollHeight() {
        // Store the original scroll height because the scroll height can increase when the drag element is moved beyond the scroll height.
        this.documentScrollHeight ??= this.container.scrollHeight;

        return this.documentScrollHeight;
    }

    private getDocumentScrollWidth() {
        // Store the original scroll width because the scroll width can increase when the drag element is moved beyond the scroll width.
        this.documentScrollWidth ??= this.container.scrollWidth;

        return this.documentScrollWidth;
    }
}
