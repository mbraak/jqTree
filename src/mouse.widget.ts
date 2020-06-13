/*
This widget does the same a the mouse widget in jqueryui.
*/
import SimpleWidget from "./simple.widget";
import { PositionInfo } from "./types";

type MouseEvent = JQuery.MouseEventBase<unknown, unknown, unknown, HTMLElement>;

abstract class MouseWidget<WidgetOptions> extends SimpleWidget<WidgetOptions> {
    public $el: JQuery;
    protected isMouseStarted: boolean;
    protected mouseDelay: number;
    protected mouseDownInfo: PositionInfo | null;
    private mouseDelayTimer: number | null;
    private isMouseDelayMet: boolean;

    public setMouseDelay(mouseDelay: number): void {
        this.mouseDelay = mouseDelay;
    }

    public init(): void {
        this.$el.on("mousedown.mousewidget", this.mouseDown);
        this.$el.on("touchstart.mousewidget", this.touchStart);

        this.isMouseStarted = false;
        this.mouseDelay = 0;
        this.mouseDelayTimer = null;
        this.isMouseDelayMet = true;
        this.mouseDownInfo = null;
    }

    public deinit(): void {
        this.$el.off("mousedown.mousewidget");
        this.$el.off("touchstart.mousewidget");

        const $document = jQuery(document);
        $document.off("mousemove.mousewidget");
        $document.off("mouseup.mousewidget");
    }

    protected abstract mouseCapture(positionInfo: PositionInfo): boolean | null;

    protected abstract mouseStart(positionInfo: PositionInfo): boolean;

    protected abstract mouseDrag(positionInfo: PositionInfo): void;

    protected abstract mouseStop(positionInfo: PositionInfo): void;

    private mouseDown = (e: JQuery.Event): boolean | undefined => {
        const mouseDownEvent = e as MouseEvent;

        // Is left mouse button?
        if (mouseDownEvent.which !== 1) {
            return;
        }

        const result = this.handleMouseDown(
            this.getPositionInfo(mouseDownEvent)
        );

        if (result) {
            mouseDownEvent.preventDefault();
        }

        return result;
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

    private mouseMove = (e: JQuery.Event): boolean => {
        const mouseMoveEvent = e as MouseEvent;

        return this.handleMouseMove(e, this.getPositionInfo(mouseMoveEvent));
    };

    private handleMouseMove(
        e: JQuery.Event,
        positionInfo: PositionInfo
    ): boolean {
        if (this.isMouseStarted) {
            this.mouseDrag(positionInfo);
            e.preventDefault();
            return false;
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

    private getPositionInfo(e: MouseEvent): PositionInfo {
        return {
            pageX: e.pageX,
            pageY: e.pageY,
            target: e.target,
            originalEvent: e,
        };
    }

    private mouseUp = (e: JQuery.Event): void => {
        const mouseUpEvent = e as JQuery.MouseUpEvent;

        this.handleMouseUp(this.getPositionInfo(mouseUpEvent));
    };

    private handleMouseUp(positionInfo: PositionInfo): void {
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

    private touchStart = (e: JQuery.Event): boolean => {
        const touchEvent = (e as JQuery.TouchStartEvent).originalEvent;

        if (!touchEvent) {
            return false;
        }

        if (touchEvent.touches.length > 1) {
            return false;
        }

        // todo
        //const touch = touchEvent.changedTouches[0];

        //return this.handleMouseDown(this.getPositionInfo(touch));
        return false;
    };

    private touchMove = (e: JQuery.Event): boolean => {
        const touchEvent = (e as JQuery.TouchMoveEvent).originalEvent;

        if (!touchEvent) {
            return false;
        }

        if (touchEvent.touches.length > 1) {
            return false;
        }

        // todo
        //const touch = touchEvent.changedTouches[0];

        //return this.handleMouseMove(e, this.getPositionInfo(touch));
        return false;
    };

    private touchEnd = (e: JQuery.Event): boolean => {
        const touchEvent = (e as JQuery.TouchEndEvent).originalEvent;

        if (!touchEvent) {
            return false;
        }

        if (touchEvent.touches.length > 1) {
            return false;
        }

        // todo
        //const touch = touchEvent.changedTouches[0];

        //this.handleMouseUp(this.getPositionInfo(touch));
        return false;
    };
}

export default MouseWidget;
