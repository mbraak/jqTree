import { PositionInfo } from "./mouseUtils";
import createScrollParent from "./scrollHandler/createScrollParent";
import { ScrollParent } from "./scrollHandler/types";

interface ScrollHandlerParams {
    refreshHitAreas: () => void;
    treeElement: HTMLElement;
}

export default class ScrollHandler {
    private refreshHitAreas: () => void;
    private scrollParent?: ScrollParent;
    private treeElement: HTMLElement;

    constructor({ refreshHitAreas, treeElement }: ScrollHandlerParams) {
        this.refreshHitAreas = refreshHitAreas;
        this.scrollParent = undefined;
        this.treeElement = treeElement;
    }

    public checkScrolling(positionInfo: PositionInfo): void {
        this.checkVerticalScrolling(positionInfo);
        this.checkHorizontalScrolling(positionInfo);
    }

    public getScrollLeft(): number {
        return this.getScrollParent().getScrollLeft();
    }

    public scrollToY(top: number): void {
        this.getScrollParent().scrollToY(top);
    }

    public stopScrolling() {
        this.getScrollParent().stopScrolling();
    }

    private checkHorizontalScrolling(positionInfo: PositionInfo): void {
        this.getScrollParent().checkHorizontalScrolling(positionInfo.pageX);
    }

    private checkVerticalScrolling(positionInfo: PositionInfo): void {
        this.getScrollParent().checkVerticalScrolling(positionInfo.pageY);
    }

    private getScrollParent(): ScrollParent {
        if (!this.scrollParent) {
            this.scrollParent = createScrollParent(
                this.treeElement,
                this.refreshHitAreas,
            );
        }

        return this.scrollParent;
    }
}
