/*
This widget does the same a the mouse widget in jqueryui.
*/
import SimpleWidget from "./simple.widget";
import { IPositionInfo } from "./imouse_widget";

abstract class MouseWidget extends SimpleWidget {
    public $el: JQuery;
    protected is_mouse_started: boolean;
    protected mouse_delay: number;
    protected mouse_down_info: IPositionInfo | null;
    private _mouse_delay_timer: number | null;
    private _is_mouse_delay_met: boolean;

    public setMouseDelay(mouse_delay: number) {
        this.mouse_delay = mouse_delay;
    }

    protected _init() {
        this.$el.on("mousedown.mousewidget", $.proxy(this._mouseDown, this));
        this.$el.on("touchstart.mousewidget", $.proxy(this._touchStart, this));

        this.is_mouse_started = false;
        this.mouse_delay = 0;
        this._mouse_delay_timer = null;
        this._is_mouse_delay_met = true;
        this.mouse_down_info = null;
    }

    protected _deinit() {
        this.$el.off("mousedown.mousewidget");
        this.$el.off("touchstart.mousewidget");

        const $document = $(document);
        $document.off("mousemove.mousewidget");
        $document.off("mouseup.mousewidget");
    }

    protected _mouseDown(e: JQueryEventObject) {
        // Is left mouse button?
        if (e.which !== 1) {
            return;
        }

        const result = this._handleMouseDown(this._getPositionInfo(e));

        if (result) {
            e.preventDefault();
        }

        return result;
    }

    protected abstract _mouseCapture(
        position_info: IPositionInfo
    ): boolean | null;

    protected abstract _mouseStart(position_info: IPositionInfo): boolean;

    protected abstract _mouseDrag(position_info: IPositionInfo): void;

    protected abstract _mouseStop(position_info: IPositionInfo): void;

    private _handleMouseDown(position_info: IPositionInfo) {
        // We may have missed mouseup (out of window)
        if (this.is_mouse_started) {
            this._handleMouseUp(position_info);
        }

        this.mouse_down_info = position_info;

        if (!this._mouseCapture(position_info)) {
            return;
        }

        this._handleStartMouse();

        return true;
    }

    private _handleStartMouse() {
        const $document = $(document);
        $document.on("mousemove.mousewidget", $.proxy(this._mouseMove, this));
        $document.on("touchmove.mousewidget", $.proxy(this._touchMove, this));
        $document.on("mouseup.mousewidget", $.proxy(this._mouseUp, this));
        $document.on("touchend.mousewidget", $.proxy(this._touchEnd, this));

        if (this.mouse_delay) {
            this._startMouseDelayTimer();
        }
    }

    private _startMouseDelayTimer() {
        if (this._mouse_delay_timer) {
            clearTimeout(this._mouse_delay_timer);
        }

        this._mouse_delay_timer = setTimeout(() => {
            this._is_mouse_delay_met = true;
        }, this.mouse_delay);

        this._is_mouse_delay_met = false;
    }

    private _mouseMove(e: JQueryEventObject) {
        return this._handleMouseMove(e, this._getPositionInfo(e));
    }

    private _handleMouseMove(
        e: JQueryEventObject,
        position_info: IPositionInfo
    ) {
        if (this.is_mouse_started) {
            this._mouseDrag(position_info);
            return e.preventDefault();
        }

        if (this.mouse_delay && !this._is_mouse_delay_met) {
            return true;
        }

        if (this.mouse_down_info) {
            this.is_mouse_started =
                this._mouseStart(this.mouse_down_info) !== false;
        }

        if (this.is_mouse_started) {
            this._mouseDrag(position_info);
        } else {
            this._handleMouseUp(position_info);
        }

        return !this.is_mouse_started;
    }

    private _getPositionInfo(e: JQueryEventObject | Touch): IPositionInfo {
        return {
            page_x: e.pageX,
            page_y: e.pageY,
            target: e.target,
            original_event: e
        };
    }

    private _mouseUp(e: JQueryEventObject) {
        return this._handleMouseUp(this._getPositionInfo(e));
    }

    private _handleMouseUp(position_info: IPositionInfo) {
        const $document = $(document);
        $document.off("mousemove.mousewidget");
        $document.off("touchmove.mousewidget");
        $document.off("mouseup.mousewidget");
        $document.off("touchend.mousewidget");

        if (this.is_mouse_started) {
            this.is_mouse_started = false;
            this._mouseStop(position_info);
        }
    }

    private _touchStart(e: JQueryEventObject) {
        const touch_event = e.originalEvent as TouchEvent;

        if (touch_event.touches.length > 1) {
            return;
        }

        const touch = touch_event.changedTouches[0];

        return this._handleMouseDown(this._getPositionInfo(touch));
    }

    private _touchMove(e: JQueryEventObject) {
        const touch_event = e.originalEvent as TouchEvent;

        if (touch_event.touches.length > 1) {
            return;
        }

        const touch = touch_event.changedTouches[0];

        return this._handleMouseMove(e, this._getPositionInfo(touch));
    }

    private _touchEnd(e: JQueryEventObject) {
        const touch_event = e.originalEvent as TouchEvent;

        if (touch_event.touches.length > 1) {
            return;
        }

        const touch = touch_event.changedTouches[0];

        return this._handleMouseUp(this._getPositionInfo(touch));
    }
}

export default MouseWidget;
