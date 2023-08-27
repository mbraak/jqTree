import { JqTreeWidget } from "./tree.jquery";
import { PositionInfo } from "./types";
import { ScrollParent } from "./scrollHandler/types";
import createScrollParent from "./scrollHandler/scrollParent";

export default class ScrollHandler {
    private treeWidget: JqTreeWidget;
    private scrollParent?: ScrollParent;

    constructor(treeWidget: JqTreeWidget) {
        this.treeWidget = treeWidget;
        this.scrollParent = undefined;
    }

    public checkScrolling(positionInfo: PositionInfo): void {
        this.checkVerticalScrolling(positionInfo);
        this.checkHorizontalScrolling(positionInfo);
    }

    public scrollToY(top: number): void {
        this.getScrollParent().scrollToY(top);
    }

    public isScrolledIntoView($element: JQuery<HTMLElement>): boolean {
        return this.getScrollParent().isScrolledIntoView($element);
    }

    public getScrollLeft(): number {
        return this.getScrollParent().getScrollLeft();
    }

    private checkVerticalScrolling(positionInfo: PositionInfo): void {
        if (positionInfo.pageY == null) {
            return;
        }

        this.getScrollParent().checkVerticalScrolling(positionInfo.pageY);
    }

    private checkHorizontalScrolling(positionInfo: PositionInfo): void {
        if (positionInfo.pageX == null) {
            return;
        }

        this.getScrollParent().checkHorizontalScrolling(positionInfo.pageX);
    }

    private getScrollParent(): ScrollParent {
        if (!this.scrollParent) {
            this.scrollParent = createScrollParent(
                this.treeWidget.$el,
                this.treeWidget.refreshHitAreas.bind(this.treeWidget),
            );
        }

        return this.scrollParent;
    }
}
