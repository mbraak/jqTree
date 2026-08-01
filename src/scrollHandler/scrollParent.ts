export type HorizontalScrollDirection = "left" | "right";
export type VerticalScrollDirection = "bottom" | "top";

interface ConstructorParams {
    container: HTMLElement;
    refreshHitAreas: () => void;
}

export abstract class ScrollParent {
    protected _container: HTMLElement;
    protected _horizontalScrollDirection?: HorizontalScrollDirection;
    protected _horizontalScrollTimeout?: number;

    protected _refreshHitAreas: () => void;
    protected _verticalScrollDirection?: VerticalScrollDirection;
    protected _verticalScrollTimeout?: number;

    constructor({ container, refreshHitAreas }: ConstructorParams) {
        this._container = container;
        this._refreshHitAreas = refreshHitAreas;
    }

    public checkHorizontalScrolling(pageX: number): void {
        const newHorizontalScrollDirection =
            this._getNewHorizontalScrollDirection(pageX);

        if (this._horizontalScrollDirection !== newHorizontalScrollDirection) {
            this._horizontalScrollDirection = newHorizontalScrollDirection;

            if (this._horizontalScrollTimeout != null) {
                window.clearTimeout(this._horizontalScrollTimeout);
            }

            if (newHorizontalScrollDirection) {
                this._horizontalScrollTimeout = window.setTimeout(
                    this._scrollHorizontally.bind(this),
                    40,
                );
            }
        }
    }

    public checkVerticalScrolling(pageY: number) {
        const newVerticalScrollDirection =
            this._getNewVerticalScrollDirection(pageY);

        if (this._verticalScrollDirection !== newVerticalScrollDirection) {
            this._verticalScrollDirection = newVerticalScrollDirection;

            if (this._verticalScrollTimeout != null) {
                window.clearTimeout(this._verticalScrollTimeout);
                this._verticalScrollTimeout = undefined;
            }

            if (newVerticalScrollDirection) {
                this._verticalScrollTimeout = window.setTimeout(
                    this._scrollVertically.bind(this),
                    40,
                );
            }
        }
    }

    public getScrollLeft(): number {
        return this._container.scrollLeft;
    }

    public scrollToY(top: number): void {
        this._container.scrollTop = top;
    }

    public stopScrolling() {
        this._horizontalScrollDirection = undefined;
        this._verticalScrollDirection = undefined;
    }

    protected abstract _getNewHorizontalScrollDirection(
        pageX: number,
    ): HorizontalScrollDirection | undefined;
    protected abstract _getNewVerticalScrollDirection(
        pageY: number,
    ): undefined | VerticalScrollDirection;

    protected _scrollHorizontally() {
        if (!this._horizontalScrollDirection) {
            return;
        }

        const distance = this._horizontalScrollDirection === "left" ? -20 : 20;
        this._container.scrollBy({
            behavior: "instant",
            left: distance,
            top: 0,
        });

        this._refreshHitAreas();

        setTimeout(this._scrollHorizontally.bind(this), 40);
    }

    protected _scrollVertically() {
        if (!this._verticalScrollDirection) {
            return;
        }

        const distance = this._verticalScrollDirection === "top" ? -20 : 20;
        this._container.scrollBy({
            behavior: "instant",
            left: 0,
            top: distance,
        });

        this._refreshHitAreas();

        setTimeout(this._scrollVertically.bind(this), 40);
    }
}
