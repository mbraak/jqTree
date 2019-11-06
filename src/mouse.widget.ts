/*
This widget does the same a the mouse widget in jqueryui.
*/
import SimpleWidget from "./simple.widget";
import { IPositionInfo } from "./imouse_widget";

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

    protected _init(): void {
        this.$el.on("mousedown.mousewidget", this.mouseDown);
        this.$el.on("touchstart.mousewidget", this.touchStart);

        this.isMouseStarted = false;
        this.mouseDelay = 0;
        this.mouseDelayTimer = null;
        this.isMouseDelayMet = true;
        this.mouseDownInfo = null;
    }

    protected _deinit(): void {
        this.$el.off("mousedown.mousewidget");
        this.$el.off("touchstart.mousewidget");

        const $document = jQuery(document);
        $document.off("mousemove.mousewidget");
        $document.off("mouseup.mousewidget");
    }

    protected abstract _mouseCapture(positionInfo: IPositionInfo): boolean | null;

    protected abstract _mouseStart(positionInfo: IPositionInfo): boolean;

    protected abstract _mouseDrag(positionInfo: IPositionInfo): void;

    protected abstract _mouseStop(positionInfo: IPositionInfo): void;

    private mouseDown = (e: JQuery.Event): boolean | undefined => {
        // Is left mouse button?
        if (e.which !== 1) {
            return;
        }

        const result = this._handleMouseDown(this._getPositionInfo(e));

        if (result) {
            e.preventDefault();
        }

        return result;
    };

    private _handleMouseDown(positionInfo: IPositionInfo): true | undefined {
        // We may have missed mouseup (out of window)
        if (this.isMouseStarted) {
            this._handleMouseUp(positionInfo);
        }

        this.mouseDownInfo = positionInfo;

        if (!this._mouseCapture(positionInfo)) {
            return;
        }

        this._handleStartMouse();

        return true;
    }

    private _handleStartMouse(): void {
        const $document = jQuery(document);
        $document.on("mousemove.mousewidget", this.mouseMove);
        $document.on("touchmove.mousewidget", this.touchMove);
        $document.on("mouseup.mousewidget", this.mouseUp);
        $document.on("touchend.mousewidget", this.touchEnd);

        if (this.mouseDelay) {
            this._startMouseDelayTimer();
        }
    }

    private _startMouseDelayTimer(): void {
        if (this.mouseDelayTimer) {
            clearTimeout(this.mouseDelayTimer);
        }

        this.mouseDelayTimer = window.setTimeout(() => {
            this.isMouseDelayMet = true;
        }, this.mouseDelay);

        this.isMouseDelayMet = false;
    }

    private mouseMove = (e: JQuery.Event) => this._handleMouseMove(e, this._getPositionInfo(e));

    private _handleMouseMove(e: JQuery.Event, positionInfo: IPositionInfo) {
        if (this.isMouseStarted) {
            this._mouseDrag(positionInfo);
            return e.preventDefault();
        }

        if (this.mouseDelay && !this.isMouseDelayMet) {
            return true;
        }

        if (this.mouseDownInfo) {
            this.isMouseStarted = this._mouseStart(this.mouseDownInfo) !== false;
        }

        if (this.isMouseStarted) {
            this._mouseDrag(positionInfo);
        } else {
            this._handleMouseUp(positionInfo);
        }

        return !this.isMouseStarted;
    }

    private _getPositionInfo(e: JQuery.Event | Touch): IPositionInfo {
        return {
            pageX: e.pageX,
            pageY: e.pageY,
            target: (e as any).target,
            originalEvent: e
        };
    }

    private mouseUp = (e: JQuery.Event): void => this._handleMouseUp(this._getPositionInfo(e));

    private _handleMouseUp(positionInfo: IPositionInfo): void {
        const $document = jQuery(document);
        $document.off("mousemove.mousewidget");
        $document.off("touchmove.mousewidget");
        $document.off("mouseup.mousewidget");
        $document.off("touchend.mousewidget");

        if (this.isMouseStarted) {
            this.isMouseStarted = false;
            this._mouseStop(positionInfo);
        }
    }

    private touchStart = (e: JQuery.Event) => {
        const touchEvent = (e as any).originalEvent as TouchEvent;

        if (touchEvent.touches.length > 1) {
            return;
        }

        const touch = touchEvent.changedTouches[0];

        return this._handleMouseDown(this._getPositionInfo(touch));
    };

    private touchMove = (e: JQuery.Event) => {
        const touchEvent = (e as any).originalEvent as TouchEvent;

        if (touchEvent.touches.length > 1) {
            return;
        }

        const touch = touchEvent.changedTouches[0];

        return this._handleMouseMove(e, this._getPositionInfo(touch));
    };

    private touchEnd = (e: JQuery.Event) => {
        const touchEvent = (e as any).originalEvent as TouchEvent;

        if (touchEvent.touches.length > 1) {
            return;
        }

        const touch = touchEvent.changedTouches[0];

        return this._handleMouseUp(this._getPositionInfo(touch));
    };
}

export default MouseWidget;
