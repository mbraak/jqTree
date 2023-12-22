import { PositionInfo } from "./mouseWidgetTypes";

const getPositionInfoFromMouseEvent = (e: MouseEvent): PositionInfo => ({
    originalEvent: e,
    pageX: e.pageX,
    pageY: e.pageY,
    target: e.target as HTMLElement,
});

const getPositionInfoFromTouch = (
    touch: Touch,
    e: TouchEvent,
): PositionInfo => ({
    originalEvent: e,
    pageX: touch.pageX,
    pageY: touch.pageY,
    target: touch.target as HTMLElement,
});

interface MouseHandlerParams {
    element: HTMLElement;
    getMouseDelay: () => number;
    onMouseCapture: (positionInfo: PositionInfo) => boolean | null;
    onMouseDrag: (positionInfo: PositionInfo) => void;
    onMouseStart: (positionInfo: PositionInfo) => boolean;
    onMouseStop: (positionInfo: PositionInfo) => void;
}

class MouseHandler {
    private element: HTMLElement;
    private getMouseDelay: () => number;
    private isMouseDelayMet: boolean;
    private isMouseStarted: boolean;
    private mouseDelayTimer: number | null;
    private mouseDownInfo: PositionInfo | null;
    private onMouseCapture: (positionInfo: PositionInfo) => boolean | null;
    private onMouseDrag: (positionInfo: PositionInfo) => void;
    private onMouseStart: (positionInfo: PositionInfo) => boolean;
    private onMouseStop: (positionInfo: PositionInfo) => void;

    constructor({
        element,
        getMouseDelay,
        onMouseCapture,
        onMouseDrag,
        onMouseStart,
        onMouseStop,
    }: MouseHandlerParams) {
        this.element = element;
        this.getMouseDelay = getMouseDelay;
        this.onMouseCapture = onMouseCapture;
        this.onMouseDrag = onMouseDrag;
        this.onMouseStart = onMouseStart;
        this.onMouseStop = onMouseStop;

        element.addEventListener("mousedown", this.mouseDown, {
            passive: false,
        });
        element.addEventListener("touchstart", this.touchStart, {
            passive: false,
        });

        this.isMouseStarted = false;
        this.mouseDelayTimer = null;
        this.isMouseDelayMet = false;
        this.mouseDownInfo = null;
    }

    public deinit(): void {
        this.element.removeEventListener("mousedown", this.mouseDown);
        this.element.removeEventListener("touchstart", this.touchStart);
        this.removeMouseMoveEventListeners();
    }

    private mouseDown = (e: MouseEvent): void => {
        // Left mouse button?
        if (e.button !== 0) {
            return;
        }

        const result = this.handleMouseDown(getPositionInfoFromMouseEvent(e));

        if (result && e.cancelable) {
            e.preventDefault();
        }
    };

    private handleMouseDown(positionInfo: PositionInfo): boolean {
        // We may have missed mouseup (out of window)
        if (this.isMouseStarted) {
            this.handleMouseUp(positionInfo);
        }

        this.mouseDownInfo = positionInfo;

        if (!this.onMouseCapture(positionInfo)) {
            return false;
        }

        this.handleStartMouse();

        return true;
    }

    private handleStartMouse(): void {
        document.addEventListener("mousemove", this.mouseMove, {
            passive: false,
        });
        document.addEventListener("touchmove", this.touchMove, {
            passive: false,
        });
        document.addEventListener("mouseup", this.mouseUp, { passive: false });
        document.addEventListener("touchend", this.touchEnd, {
            passive: false,
        });

        const mouseDelay = this.getMouseDelay();

        if (mouseDelay) {
            this.startMouseDelayTimer(mouseDelay);
        } else {
            this.isMouseDelayMet = true;
        }
    }

    private startMouseDelayTimer(mouseDelay: number): void {
        if (this.mouseDelayTimer) {
            clearTimeout(this.mouseDelayTimer);
        }

        this.mouseDelayTimer = window.setTimeout(() => {
            if (this.mouseDownInfo) {
                this.isMouseDelayMet = true;
            }
        }, mouseDelay);

        this.isMouseDelayMet = false;
    }

    private mouseMove = (e: MouseEvent): void => {
        this.handleMouseMove(e, getPositionInfoFromMouseEvent(e));
    };

    private handleMouseMove(
        e: MouseEvent | TouchEvent,
        positionInfo: PositionInfo,
    ): void {
        if (this.isMouseStarted) {
            this.onMouseDrag(positionInfo);

            if (e.cancelable) {
                e.preventDefault();
            }
            return;
        }

        if (!this.isMouseDelayMet) {
            return;
        }

        if (this.mouseDownInfo) {
            this.isMouseStarted =
                this.onMouseStart(this.mouseDownInfo) !== false;
        }

        if (this.isMouseStarted) {
            this.onMouseDrag(positionInfo);

            if (e.cancelable) {
                e.preventDefault();
            }
        } else {
            this.handleMouseUp(positionInfo);
        }
    }

    private mouseUp = (e: MouseEvent): void => {
        this.handleMouseUp(getPositionInfoFromMouseEvent(e));
    };

    private handleMouseUp(positionInfo: PositionInfo): void {
        this.removeMouseMoveEventListeners();
        this.isMouseDelayMet = false;
        this.mouseDownInfo = null;

        if (this.isMouseStarted) {
            this.isMouseStarted = false;
            this.onMouseStop(positionInfo);
        }
    }

    private removeMouseMoveEventListeners() {
        document.removeEventListener("mousemove", this.mouseMove);
        document.removeEventListener("touchmove", this.touchMove);
        document.removeEventListener("mouseup", this.mouseUp);
        document.removeEventListener("touchend", this.touchEnd);
    }

    private touchStart = (e: TouchEvent): void => {
        if (!e) {
            return;
        }

        if (e.touches.length > 1) {
            return;
        }

        const touch = e.changedTouches[0];

        if (!touch) {
            return;
        }

        this.handleMouseDown(getPositionInfoFromTouch(touch, e));
    };

    private touchMove = (e: TouchEvent): void => {
        if (!e) {
            return;
        }

        if (e.touches.length > 1) {
            return;
        }

        const touch = e.changedTouches[0];

        if (!touch) {
            return;
        }

        this.handleMouseMove(e, getPositionInfoFromTouch(touch, e));
    };

    private touchEnd = (e: TouchEvent): void => {
        if (!e) {
            return;
        }

        if (e.touches.length > 1) {
            return;
        }

        const touch = e.changedTouches[0];

        if (!touch) {
            return;
        }

        this.handleMouseUp(getPositionInfoFromTouch(touch, e));
    };
}

export default MouseHandler;
