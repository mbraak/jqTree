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

    private handleHorizontalScrollingWithDocument(
        positionInfo: PositionInfo,
    ): void {
        if (
            positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined
        ) {
            return;
        }

        const $document = jQuery(document);

        const scrollLeft = $document.scrollLeft() || 0;
        const windowWidth = jQuery(window).width() || 0;

        const canScrollLeft = scrollLeft > 0;

        const isNearRightEdge = positionInfo.pageX > windowWidth - 20;
        const isNearLeftEdge = positionInfo.pageX - scrollLeft < 20;

        if (isNearRightEdge) {
            $document.scrollLeft(scrollLeft + 20);
        } else if (isNearLeftEdge && canScrollLeft) {
            $document.scrollLeft(Math.max(scrollLeft - 20, 0));
        }
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
