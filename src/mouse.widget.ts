/*
This widget does the same a the mouse widget in jqueryui.
*/
import SimpleWidget from "./simple.widget";
import { PositionInfo } from "./types";

const getPositionInfoFromMouseEvent = (e: MouseEvent): PositionInfo => ({
    pageX: e.pageX,
    pageY: e.pageY,
    target: e.target as HTMLElement,
    originalEvent: e,
});

const getPositionInfoFromTouch = (
    touch: Touch,
    e: TouchEvent
): PositionInfo => ({
    pageX: touch.pageX,
    pageY: touch.pageY,
    target: touch.target as HTMLElement,
    originalEvent: e,
});

abstract class MouseWidget<WidgetOptions> extends SimpleWidget<WidgetOptions> {
    protected isMouseStarted: boolean;
    protected mouseDownInfo: PositionInfo | null;
    private mouseDelayTimer: number | null;
    private isMouseDelayMet: boolean;

    public init(): void {
        const element = this.$el.get(0);

        if (element) {
            element.addEventListener("mousedown", this.mouseDown, {
                passive: false,
            });
            element.addEventListener("touchstart", this.touchStart, {
                passive: false,
            });
        }

        this.isMouseStarted = false;
        this.mouseDelayTimer = null;
        this.isMouseDelayMet = false;
        this.mouseDownInfo = null;
    }

    public deinit(): void {
        const el = this.$el.get(0);

        if (el) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            (el as any).removeEventListener("mousedown", this.mouseDown, {
                passive: false,
            });

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            (el as any).removeEventListener("touchstart", this.touchStart, {
                passive: false,
            });
        }

        this.removeMouseMoveEventListeners();
    }

    protected abstract mouseCapture(positionInfo: PositionInfo): boolean | null;

    protected abstract mouseStart(positionInfo: PositionInfo): boolean;

    protected abstract mouseDrag(positionInfo: PositionInfo): void;

    protected abstract mouseStop(positionInfo: PositionInfo): void;

    protected abstract getMouseDelay(): number;

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

        if (!this.mouseCapture(positionInfo)) {
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
        positionInfo: PositionInfo
    ): void {
        if (this.isMouseStarted) {
            this.mouseDrag(positionInfo);

            if (e.cancelable) {
                e.preventDefault();
            }
            return;
        }

        if (!this.isMouseDelayMet) {
            return;
        }

        if (this.mouseDownInfo) {
            this.isMouseStarted = this.mouseStart(this.mouseDownInfo) !== false;
        }

        if (this.isMouseStarted) {
            this.mouseDrag(positionInfo);

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
            this.mouseStop(positionInfo);
        }
    }

    private removeMouseMoveEventListeners() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (document as any).removeEventListener("mousemove", this.mouseMove, {
            passive: false,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (document as any).removeEventListener("touchmove", this.touchMove, {
            passive: false,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (document as any).removeEventListener("mouseup", this.mouseUp, {
            passive: false,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (document as any).removeEventListener("touchend", this.touchEnd, {
            passive: false,
        });
    }

    private touchStart = (e: TouchEvent): void => {
        if (!e) {
            return;
        }

        if (e.touches.length > 1) {
            return;
        }

        const touch = e.changedTouches[0];

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

        this.handleMouseUp(getPositionInfoFromTouch(touch, e));
    };
}

export default MouseWidget;
