import type { ScrollParent } from "./types";
import DocumentScrollParent from "./documentScrollParent";

type HorizontalScrollDirection = "left" | "right";
type VerticalScrollDirection = "bottom" | "top";

interface Params {
    $container: JQuery<HTMLElement>;
    refreshHitAreas: () => void;
    $treeElement: JQuery<HTMLElement>;
}

export default class ContainerScrollParent implements ScrollParent {
    private $container: JQuery<HTMLElement>;
    private documentScrollParent: DocumentScrollParent;
    private horizontalScrollDirection?: HorizontalScrollDirection;
    private horizontalScrollTimeout?: number;
    private refreshHitAreas: () => void;
    private scrollParentBottom: number;
    private scrollParentTop: number;
    private verticalScrollTimeout?: number;
    private verticalScrollDirection?: VerticalScrollDirection;

    constructor({ $container, refreshHitAreas, $treeElement }: Params) {
        this.$container = $container;
        this.refreshHitAreas = refreshHitAreas;

        const offsetTop = $container.offset()?.top || 0;
        const height = $container.innerHeight() || 0;

        this.scrollParentTop = offsetTop;
        this.scrollParentBottom = offsetTop + height;

        this.documentScrollParent = new DocumentScrollParent(
            $treeElement,
            refreshHitAreas,
        );
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

        if (newHorizontalScrollDirection) {
            this.documentScrollParent.resetScrolling();
        } else {
            this.documentScrollParent.checkHorizontalScrolling(pageX);
        }
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

        if (newVerticalScrollDirection) {
            this.documentScrollParent.resetScrolling();
        } else {
            this.documentScrollParent.checkVerticalScrolling(pageY);
        }
    }

    public getScrollLeft(): number {
        return this.$container.scrollLeft() || 0;
    }

    public isScrolledIntoView($element: JQuery<HTMLElement>): boolean {
        const elementHeight = $element.height() || 0;
        const viewBottom = this.$container.height() || 0;
        const originalTop = $element.offset()?.top ?? 0;
        const elementTop = originalTop - this.scrollParentTop;
        const elementBottom = elementTop + elementHeight;

        return elementBottom <= viewBottom && elementTop >= 0; // todo
    }

    public scrollToY(top: number): void {
        const container = this.$container.get(0) as HTMLElement;
        container.scrollTop = top;
    }

    private getNewVerticalScrollDirection(
        pageY: number,
    ): VerticalScrollDirection | undefined {
        if (pageY < this.scrollParentTop) {
            return "top";
        }

        if (pageY > this.scrollParentBottom) {
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
}
