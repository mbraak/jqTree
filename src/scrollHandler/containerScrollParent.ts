import type { ScrollDirection, ScrollParent } from "./types";

export default class ContainerScrollParent implements ScrollParent {
    private $container: JQuery<HTMLElement>;
    private refreshHitAreas: () => void;
    private scrollParentBottom: number;
    private scrollParentTop: number;
    private scrollDirection?: ScrollDirection;
    private scrollTimeout?: number;

    constructor($container: JQuery<HTMLElement>, refreshHitAreas: () => void) {
        this.$container = $container;
        this.refreshHitAreas = refreshHitAreas;

        const offsetTop = $container.offset()?.top || 0;
        const height = $container.innerHeight() || 0;

        this.scrollParentTop = offsetTop;
        this.scrollParentBottom = offsetTop + height;
    }

    public checkHorizontalScrolling(pageX: number): void {
        //
    }

    public checkVerticalScrolling(pageY: number) {
        const newScrollDirection = this.getNewScrollDirection(pageY);

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

    private getNewScrollDirection(pageY: number): ScrollDirection | undefined {
        if (pageY < this.scrollParentTop) {
            return "top";
        }

        if (pageY > this.scrollParentBottom) {
            return "bottom";
        }

        return undefined;
    }

    private scrollVertically() {
        if (!this.scrollDirection) {
            return;
        }

        const distance = this.scrollDirection === "top" ? -20 : 20;
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
