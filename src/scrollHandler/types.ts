export interface ScrollParent {
    checkHorizontalScrolling(pageX: number): void;
    checkVerticalScrolling(pageY: number): void;
    getScrollLeft(): number;
    scrollToY(top: number): void;
    stopScrolling(): void;
}
