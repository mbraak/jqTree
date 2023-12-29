import { PositionInfo } from "./mouseUtils";
import { ScrollParent } from "./scrollHandler/types";
import createScrollParent from "./scrollHandler/createScrollParent";

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

    public stopScrolling() {
        this.getScrollParent().stopScrolling();
    }

    public scrollToY(top: number): void {
        this.getScrollParent().scrollToY(top);
    }

    public getScrollLeft(): number {
        return this.getScrollParent().getScrollLeft();
    }

    private checkVerticalScrolling(positionInfo: PositionInfo): void {
        this.getScrollParent().checkVerticalScrolling(positionInfo.pageY);
    }

    private checkHorizontalScrolling(positionInfo: PositionInfo): void {
        this.getScrollParent().checkHorizontalScrolling(positionInfo.pageX);
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
