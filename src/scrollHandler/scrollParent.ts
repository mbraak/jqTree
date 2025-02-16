export type HorizontalScrollDirection = "left" | "right";
export type VerticalScrollDirection = "bottom" | "top";

interface Params {
    refreshHitAreas: () => void;
}

export abstract class ScrollParent {
    protected refreshHitAreas: () => void;

    constructor({ refreshHitAreas }: Params) {
        this.refreshHitAreas = refreshHitAreas;
    }

    abstract checkHorizontalScrolling(pageX: number): void;
    abstract checkVerticalScrolling(pageY: number): void;
    abstract getScrollLeft(): number;
    abstract scrollToY(top: number): void;
    abstract stopScrolling(): void;
}
