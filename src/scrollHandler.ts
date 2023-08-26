import { JqTreeWidget } from "./tree.jquery";
import { PositionInfo } from "./types";

type ScrollDirection = "bottom" | "top";

export default class ScrollHandler {
    private treeWidget: JqTreeWidget;
    private scrollParentBottom: number;
    private isInitialized: boolean;
    private $scrollParent: JQuery | null;
    private scrollParentTop: number;
    private scrollDirection?: ScrollDirection;
    private scrollTimeout?: number;

    constructor(treeWidget: JqTreeWidget) {
        this.treeWidget = treeWidget;
        this.isInitialized = false;
    }

    public checkScrolling(positionInfo: PositionInfo): void {
        this.ensureInit();
        this.checkVerticalScrolling(positionInfo);
        this.checkHorizontalScrolling();
    }

    public scrollToY(top: number): void {
        this.ensureInit();

        if (this.$scrollParent && this.$scrollParent[0]) {
            this.$scrollParent[0].scrollTop = top;
        } else {
            const offset = this.treeWidget.$el.offset();
            const treeTop = offset ? offset.top : 0;

            jQuery(document).scrollTop(top + treeTop);
        }
    }

    public isScrolledIntoView($element: JQuery): boolean {
        this.ensureInit();

        let elementBottom: number;
        let viewBottom: number;
        let elementTop: number;
        let viewTop: number;

        const elHeight = $element.height() || 0;

        if (this.$scrollParent) {
            viewTop = 0;
            viewBottom = this.$scrollParent.height() || 0;

            const offset = $element.offset();
            const originalTop = offset ? offset.top : 0;

            elementTop = originalTop - this.scrollParentTop;
            elementBottom = elementTop + elHeight;
        } else {
            viewTop = jQuery(window).scrollTop() || 0;

            const windowHeight = jQuery(window).height() || 0;
            viewBottom = viewTop + windowHeight;

            const offset = $element.offset();

            elementTop = offset ? offset.top : 0;
            elementBottom = elementTop + elHeight;
        }

        return elementBottom <= viewBottom && elementTop >= viewTop;
    }

    public getScrollLeft(): number {
        if (!this.$scrollParent) {
            return 0;
        } else {
            return this.$scrollParent.scrollLeft() || 0;
        }
    }

    private initScrollParent(): void {
        const setDocumentAsScrollParent = (): void => {
            this.scrollParentTop = 0;
            this.scrollParentBottom = 0; // todo
            this.$scrollParent = null;
        };

        if (this.treeWidget.$el.css("position") === "fixed") {
            setDocumentAsScrollParent();
        }

        const $scrollParent = getParentWithOverflow();

        if (
            $scrollParent &&
            $scrollParent.length &&
            $scrollParent[0]?.tagName !== "HTML"
        ) {
            this.$scrollParent = $scrollParent;

            const offsetTop = this.$scrollParent.offset()?.top || 0;
            const height = this.$scrollParent.innerHeight() || 0;

            this.scrollParentTop = offsetTop;
            this.scrollParentBottom = offsetTop + height;
        } else {
            setDocumentAsScrollParent();
        }

        this.isInitialized = true;
    }

    private ensureInit(): void {
        if (!this.isInitialized) {
            this.initScrollParent();
        }
    }

    private checkVerticalScrolling(positionInfo: PositionInfo): void {
        if (positionInfo.pageY == null) {
            return;
        }

        const scrollParent = this.$scrollParent && this.$scrollParent[0];

        if (!scrollParent) {
            return;
        }

        let newScrollDirection: ScrollDirection | undefined;

        if (positionInfo.pageY < this.scrollParentTop) {
            newScrollDirection = "top";
        } else if (positionInfo.pageY > this.scrollParentBottom) {
            newScrollDirection = "bottom";
        }

        if (this.scrollDirection !== newScrollDirection) {
            this.scrollDirection = newScrollDirection;

            if (this.scrollTimeout != null) {
                window.clearTimeout(this.scrollTimeout);
            }

            if (newScrollDirection) {
                this.scrollTimeout = window.setTimeout(
                    this.scrollVertically.bind(this),
                    40,
                );
            }
        }
    }

    private checkHorizontalScrolling(): void {
        const positionInfo = this.treeWidget.dndHandler.positionInfo;

        if (!positionInfo) {
            return;
        }

        if (this.$scrollParent) {
            this.handleHorizontalScrollingWithParent(positionInfo);
        } else {
            this.handleHorizontalScrollingWithDocument(positionInfo);
        }
    }

    private handleHorizontalScrollingWithParent(
        positionInfo: PositionInfo,
    ): void {
        if (
            positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined
        ) {
            return;
        }

        const $scrollParent = this.$scrollParent;
        const scrollParentOffset = $scrollParent && $scrollParent.offset();

        if (!($scrollParent && scrollParentOffset)) {
            return;
        }

        const scrollParent = $scrollParent[0];

        if (!scrollParent) {
            return;
        }

        const canScrollRight =
            scrollParent.scrollLeft + scrollParent.clientWidth <
            scrollParent.scrollWidth;
        const canScrollLeft = scrollParent.scrollLeft > 0;

        const rightEdge = scrollParentOffset.left + scrollParent.clientWidth;
        const leftEdge = scrollParentOffset.left;
        const isNearRightEdge = positionInfo.pageX > rightEdge - 20;
        const isNearLeftEdge = positionInfo.pageX < leftEdge + 20;

        if (isNearRightEdge && canScrollRight) {
            scrollParent.scrollLeft = Math.min(
                scrollParent.scrollLeft + 20,
                scrollParent.scrollWidth,
            );
        } else if (isNearLeftEdge && canScrollLeft) {
            scrollParent.scrollLeft = Math.max(scrollParent.scrollLeft - 20, 0);
        }
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

    private scrollVertically() {
        const scrollParent = this.$scrollParent && this.$scrollParent[0];

        if (!scrollParent || !this.scrollDirection) {
            return;
        }

        const distance = this.scrollDirection === "top" ? -20 : 20;

        scrollParent.scrollBy({
            left: 0,
            top: distance,
            behavior: "instant",
        });

        this.treeWidget.refreshHitAreas();

        setTimeout(this.scrollVertically.bind(this), 40);
    }
}
