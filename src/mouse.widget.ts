/*
This widget does the same a the mouse widget in jqueryui.
*/
import SimpleWidget from "./simple.widget";
import { IPositionInfo } from "./imouseWidget";

abstract class MouseWidget extends SimpleWidget {
    public $el: JQuery;
    protected isMouseStarted: boolean;
    protected mouseDelay: number;
    protected mouseDownInfo: IPositionInfo | null;
    private mouseDelayTimer: number | null;
    private isMouseDelayMet: boolean;

    public setMouseDelay(mouseDelay: number): void {
        this.mouseDelay = mouseDelay;
    }

    protected init(): void {
        this.$el.on("mousedown.mousewidget", this.mouseDown);
        this.$el.on("touchstart.mousewidget", this.touchStart);

        this.isMouseStarted = false;
        this.mouseDelay = 0;
        this.mouseDelayTimer = null;
        this.isMouseDelayMet = true;
        this.mouseDownInfo = null;
    }

    protected deinit(): void {
        this.$el.off("mousedown.mousewidget");
        this.$el.off("touchstart.mousewidget");

        const $document = jQuery(document);
        $document.off("mousemove.mousewidget");
        $document.off("mouseup.mousewidget");
    }

    protected abstract mouseCapture(
        positionInfo: IPositionInfo
    ): boolean | null;

    protected abstract mouseStart(positionInfo: IPositionInfo): boolean;

    protected abstract mouseDrag(positionInfo: IPositionInfo): void;

    protected abstract mouseStop(positionInfo: IPositionInfo): void;

    private mouseDown = (e: JQuery.Event): boolean | undefined => {
        // Is left mouse button?
        if (e.which !== 1) {
            return;
        }

        const result = this.handleMouseDown(this.getPositionInfo(e));

        if (result) {
            e.preventDefault();
        }

        return result;
    };

    private handleMouseDown(positionInfo: IPositionInfo): true | undefined {
        // We may have missed mouseup (out of window)
        if (this.isMouseStarted) {
            this.handleMouseUp(positionInfo);
        }

        this.mouseDownInfo = positionInfo;

        if (!this.mouseCapture(positionInfo)) {
            return;
        }

        this.handleStartMouse();

        return true;
    }

    private handleStartMouse(): void {
        const $document = jQuery(document);
        $document.on("mousemove.mousewidget", this.mouseMove);
        $document.on("touchmove.mousewidget", this.touchMove);
        $document.on("mouseup.mousewidget", this.mouseUp);
        $document.on("touchend.mousewidget", this.touchEnd);

        if (this.mouseDelay) {
            this.startMouseDelayTimer();
        }
    }

    private startMouseDelayTimer(): void {
        if (this.mouseDelayTimer) {
            clearTimeout(this.mouseDelayTimer);
        }

        this.mouseDelayTimer = window.setTimeout(() => {
            this.isMouseDelayMet = true;
        }, this.mouseDelay);

        this.isMouseDelayMet = false;
    }

    private mouseMove = (e: JQuery.Event) =>
        this.handleMouseMove(e, this.getPositionInfo(e));

    private handleMouseMove(e: JQuery.Event, positionInfo: IPositionInfo) {
        if (this.isMouseStarted) {
            this.mouseDrag(positionInfo);
            return e.preventDefault();
        }

        if (this.mouseDelay && !this.isMouseDelayMet) {
            return true;
        }

        if (this.mouseDownInfo) {
            this.isMouseStarted = this.mouseStart(this.mouseDownInfo) !== false;
        }

        if (this.isMouseStarted) {
            this.mouseDrag(positionInfo);
        } else {
            this.handleMouseUp(positionInfo);
        }

        return !this.isMouseStarted;
    }

    private getPositionInfo(e: JQuery.Event | Touch): IPositionInfo {
        return {
            pageX: e.pageX,
            pageY: e.pageY,
            target: (e as any).target,
            originalEvent: e
        };
    }

    private mouseUp = (e: JQuery.Event): void =>
        this.handleMouseUp(this.getPositionInfo(e));

    private handleMouseUp(positionInfo: IPositionInfo): void {
        const $document = jQuery(document);
        $document.off("mousemove.mousewidget");
        $document.off("touchmove.mousewidget");
        $document.off("mouseup.mousewidget");
        $document.off("touchend.mousewidget");

        if (this.isMouseStarted) {
            this.isMouseStarted = false;
            this.mouseStop(positionInfo);
        }
    }

    private touchStart = (e: JQuery.Event) => {
        const touchEvent = (e as any).originalEvent as TouchEvent;

        if (touchEvent.touches.length > 1) {
            return;
        }

        const touch = touchEvent.changedTouches[0];

        return this.handleMouseDown(this.getPositionInfo(touch));
    };

    private touchMove = (e: JQuery.Event) => {
        const touchEvent = (e as any).originalEvent as TouchEvent;

        if (touchEvent.touches.length > 1) {
            return;
        }

        const touch = touchEvent.changedTouches[0];

        return this.handleMouseMove(e, this.getPositionInfo(touch));
    };

    private touchEnd = (e: JQuery.Event) => {
        const touchEvent = (e as any).originalEvent as TouchEvent;

        if (touchEvent.touches.length > 1) {
            return;
        }

        const touch = touchEvent.changedTouches[0];

        return this.handleMouseUp(this.getPositionInfo(touch));
    };
}

export default MouseWidget;
