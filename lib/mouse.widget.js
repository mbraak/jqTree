/*
This widget does the same a the mouse widget in jqueryui.
*/
import SimpleWidget from "./simple.widget";
const getPositionInfoFromMouseEvent = (e) => ({
    pageX: e.pageX,
    pageY: e.pageY,
    target: e.target,
    originalEvent: e,
});
const getPositionInfoFromTouch = (touch, e) => ({
    pageX: touch.pageX,
    pageY: touch.pageY,
    target: touch.target,
    originalEvent: e,
});
class MouseWidget extends SimpleWidget {
    constructor() {
        super(...arguments);
        this.mouseDown = (e) => {
            // Left mouse button?
            if (e.button !== 0) {
                return;
            }
            const result = this.handleMouseDown(getPositionInfoFromMouseEvent(e));
            if (result && e.cancelable) {
                e.preventDefault();
            }
        };
        this.mouseMove = (e) => {
            this.handleMouseMove(e, getPositionInfoFromMouseEvent(e));
        };
        this.mouseUp = (e) => {
            this.handleMouseUp(getPositionInfoFromMouseEvent(e));
        };
        this.touchStart = (e) => {
            if (!e) {
                return;
            }
            if (e.touches.length > 1) {
                return;
            }
            const touch = e.changedTouches[0];
            this.handleMouseDown(getPositionInfoFromTouch(touch, e));
        };
        this.touchMove = (e) => {
            if (!e) {
                return;
            }
            if (e.touches.length > 1) {
                return;
            }
            const touch = e.changedTouches[0];
            this.handleMouseMove(e, getPositionInfoFromTouch(touch, e));
        };
        this.touchEnd = (e) => {
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
    setMouseDelay(mouseDelay) {
        this.mouseDelay = mouseDelay;
    }
    init() {
        const element = this.$el.get(0);
        element.addEventListener("mousedown", this.mouseDown, {
            passive: false,
        });
        element.addEventListener("touchstart", this.touchStart, {
            passive: false,
        });
        this.isMouseStarted = false;
        this.mouseDelay = 0;
        this.mouseDelayTimer = null;
        this.isMouseDelayMet = false;
        this.mouseDownInfo = null;
    }
    deinit() {
        const el = this.$el.get(0);
        el.removeEventListener("mousedown", this.mouseDown);
        el.removeEventListener("touchstart", this.touchStart);
        document.removeEventListener("mousemove", this.mouseMove);
        document.removeEventListener("touchmove", this.touchMove);
        document.removeEventListener("mouseup", this.mouseUp);
        document.removeEventListener("touchend", this.touchEnd);
    }
    handleMouseDown(positionInfo) {
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
    handleStartMouse() {
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
        if (this.mouseDelay) {
            this.startMouseDelayTimer();
        }
    }
    startMouseDelayTimer() {
        if (this.mouseDelayTimer) {
            clearTimeout(this.mouseDelayTimer);
        }
        this.mouseDelayTimer = window.setTimeout(() => {
            this.isMouseDelayMet = true;
        }, this.mouseDelay);
        this.isMouseDelayMet = false;
    }
    handleMouseMove(e, positionInfo) {
        if (this.isMouseStarted) {
            this.mouseDrag(positionInfo);
            if (e.cancelable) {
                e.preventDefault();
            }
            return;
        }
        if (this.mouseDelay && !this.isMouseDelayMet) {
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
        }
        else {
            this.handleMouseUp(positionInfo);
        }
    }
    handleMouseUp(positionInfo) {
        document.removeEventListener("mousemove", this.mouseMove);
        document.removeEventListener("touchmove", this.touchMove);
        document.removeEventListener("mouseup", this.mouseUp);
        document.removeEventListener("touchend", this.touchEnd);
        if (this.isMouseStarted) {
            this.isMouseStarted = false;
            this.mouseStop(positionInfo);
        }
    }
}
export default MouseWidget;
