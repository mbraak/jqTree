export type HorizontalScrollDirection = "left" | "right";
export type VerticalScrollDirection = "bottom" | "top";

interface ConstructorParams {
    container: HTMLElement;
    refreshHitAreas: () => void;
}

export abstract class ScrollParent {
    protected container: HTMLElement;
    protected horizontalScrollDirection?: HorizontalScrollDirection;
    protected horizontalScrollTimeout?: number;

    protected refreshHitAreas: () => void;
    protected verticalScrollDirection?: VerticalScrollDirection;
    protected verticalScrollTimeout?: number;

    constructor({ container, refreshHitAreas }: ConstructorParams) {
        this.container = container;
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

    abstract getScrollLeft(): number;
    abstract scrollToY(top: number): void;

    public stopScrolling() {
        this.horizontalScrollDirection = undefined;
        this.verticalScrollDirection = undefined;
    }

    protected abstract getNewHorizontalScrollDirection(
        pageX: number,
    ): HorizontalScrollDirection | undefined;
    protected abstract getNewVerticalScrollDirection(
        pageY: number,
    ): undefined | VerticalScrollDirection;
    protected abstract scrollHorizontally(): void;
    protected abstract scrollVertically(): void;
}
