export type HorizontalScrollDirection = "left" | "right";
export type VerticalScrollDirection = "bottom" | "top";

interface Params {
    refreshHitAreas: () => void;
}

export abstract class ScrollParent {
    protected horizontalScrollDirection?: HorizontalScrollDirection;
    protected horizontalScrollTimeout?: number;
    protected refreshHitAreas: () => void;
    protected verticalScrollDirection?: VerticalScrollDirection;
    protected verticalScrollTimeout?: number;

    constructor({ refreshHitAreas }: Params) {
        this.refreshHitAreas = refreshHitAreas;
    }

    public checkHorizontalScrolling(pageX: number): void {
        const newHorizontalScrollDirection =
            this.getNewHorizontalScrollDirection(pageX);

        if (this.horizontalScrollDirection !== newHorizontalScrollDirection) {
            this.horizontalScrollDirection = newHorizontalScrollDirection;

            if (this.horizontalScrollTimeout != null) {
                window.clearTimeout(this.horizontalScrollTimeout);
            }

            if (newHorizontalScrollDirection) {
                this.horizontalScrollTimeout = window.setTimeout(
                    this.scrollHorizontally.bind(this),
                    40,
                );
            }
        }
    }

    abstract checkVerticalScrolling(pageY: number): void;
    abstract getScrollLeft(): number;
    abstract scrollToY(top: number): void;
    abstract stopScrolling(): void;
    protected abstract getNewHorizontalScrollDirection(
        pageX: number,
    ): HorizontalScrollDirection | undefined;
    protected abstract scrollHorizontally(): void;
}
