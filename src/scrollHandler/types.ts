export interface ScrollParent {
    checkHorizontalScrolling(pageX: number): void;
    checkVerticalScrolling(pageY: number): void;
    getScrollLeft(): number;
    isScrolledIntoView($element: JQuery<HTMLElement>): boolean;
    scrollToY(top: number): void;
    stopScrolling(): void;
}
