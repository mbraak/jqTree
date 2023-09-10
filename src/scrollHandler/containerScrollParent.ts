import type { ScrollParent } from "./types";

type HorizontalScrollDirection = "left" | "right";
type VerticalScrollDirection = "bottom" | "top";

interface Params {
    $container: JQuery<HTMLElement>;
    refreshHitAreas: () => void;
    $treeElement: JQuery<HTMLElement>;
}

export default class ContainerScrollParent implements ScrollParent {
    private $container: JQuery<HTMLElement>;
    private horizontalScrollDirection?: HorizontalScrollDirection;
    private horizontalScrollTimeout?: number;
    private refreshHitAreas: () => void;
    private scrollParentBottom?: number;
    private scrollParentTop?: number;
    private verticalScrollTimeout?: number;
    private verticalScrollDirection?: VerticalScrollDirection;

    constructor({ $container, refreshHitAreas }: Params) {
        this.$container = $container;
        this.refreshHitAreas = refreshHitAreas;
    }

    public checkHorizontalScrolling(pageX: number): void {
        const newHorizontalScrollDirection =
            this.getNewHorizontalScrollDirection(pageX);

        if (this.horizontalScrollDirection !== newHorizontalScrollDirection) {
            this.horizontalScrollDirection = newHorizontalScrollDirection;

            if (this.horizontalScrollTimeout != null) {
                window.clearTimeout(this.verticalScrollTimeout);
            }

            if (newHorizontalScrollDirection) {
                this.horizontalScrollTimeout = window.setTimeout(
                    this.scrollHorizontally.bind(this),
                    40,
                );
            }
        }
    }

    public checkVerticalScrolling(pageY: number) {
        const newVerticalScrollDirection =
            this.getNewVerticalScrollDirection(pageY);

        if (this.verticalScrollDirection !== newVerticalScrollDirection) {
            this.verticalScrollDirection = newVerticalScrollDirection;

            if (this.verticalScrollTimeout != null) {
                window.clearTimeout(this.verticalScrollTimeout);
                this.verticalScrollTimeout = undefined;
            }

            if (newVerticalScrollDirection) {
                this.verticalScrollTimeout = window.setTimeout(
                    this.scrollVertically.bind(this),
                    40,
                );
            }
        }
    }

    public getScrollLeft(): number {
        return this.$container.scrollLeft() || 0;
    }

    public isScrolledIntoView($element: JQuery<HTMLElement>): boolean {
        const elementHeight = $element.height() || 0;
        const viewBottom = this.$container.height() || 0;
        const originalTop = $element.offset()?.top ?? 0;
        const elementTop = originalTop - this.getScrollParentTop();
        const elementBottom = elementTop + elementHeight;

        return elementBottom <= viewBottom && elementTop >= 0;
    }

    public scrollToY(top: number): void {
        const container = this.$container.get(0) as HTMLElement;
        container.scrollTop = top;
    }

    public stopScrolling() {
        this.horizontalScrollDirection = undefined;
        this.verticalScrollDirection = undefined;
        this.scrollParentTop = undefined;
        this.scrollParentBottom = undefined;
    }

    private getNewHorizontalScrollDirection(
        pageX: number,
    ): HorizontalScrollDirection | undefined {
        const scrollParentOffset = this.$container.offset();
        if (!scrollParentOffset) {
            return undefined;
        }

        const container = this.$container.get(0) as HTMLElement;

        const rightEdge = scrollParentOffset.left + container.clientWidth;
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

    private getNewVerticalScrollDirection(
        pageY: number,
    ): VerticalScrollDirection | undefined {
        if (pageY < this.getScrollParentTop()) {
            return "top";
        }

        if (pageY > this.getScrollParentBottom()) {
            return "bottom";
        }

        return undefined;
    }

    private scrollHorizontally() {
        if (!this.horizontalScrollDirection) {
            return;
        }

        const distance = this.horizontalScrollDirection === "left" ? -20 : 20;
        const container = this.$container.get(0) as HTMLElement;

        container.scrollBy({
            left: distance,
            top: 0,
            behavior: "instant",
        });

        this.refreshHitAreas();

        setTimeout(this.scrollHorizontally.bind(this), 40);
    }

    private scrollVertically() {
        if (!this.verticalScrollDirection) {
            return;
        }

        const distance = this.verticalScrollDirection === "top" ? -20 : 20;
        const container = this.$container.get(0) as HTMLElement;

        container.scrollBy({
            left: 0,
            top: distance,
            behavior: "instant",
        });

        this.refreshHitAreas();

        setTimeout(this.scrollVertically.bind(this), 40);
    }

    private getScrollParentTop() {
        if (this.scrollParentTop == null) {
            this.scrollParentTop = this.$container.offset()?.top || 0;
        }

        return this.scrollParentTop;
    }

    private getScrollParentBottom() {
        if (this.scrollParentBottom == null) {
            this.scrollParentBottom =
                this.getScrollParentTop() +
                (this.$container.innerHeight() ?? 0);
        }

        return this.scrollParentBottom;
    }
}
