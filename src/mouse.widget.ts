/*
This widget does the same a the mouse widget in jqueryui.
*/

import SimpleWidget from "./simple.widget";

const $ = window["jQuery"];


export default class MouseWidget extends SimpleWidget {
    is_mouse_started: boolean;
    mouse_delay: number;
    _mouse_delay_timer;
    _is_mouse_delay_met: boolean;
    mouse_down_info: Object | null;

    _init() {
        this.$el.on("mousedown.mousewidget", $.proxy(this._mouseDown, this));
        this.$el.on("touchstart.mousewidget", $.proxy(this._touchStart, this));

        this.is_mouse_started = false;
        this.mouse_delay = 0;
        this._mouse_delay_timer = null;
        this._is_mouse_delay_met = true;
        this.mouse_down_info = null;
    }

    _deinit() {
        this.$el.off("mousedown.mousewidget");
        this.$el.off("touchstart.mousewidget");

        const $document = $(document);
        $document.off("mousemove.mousewidget");
        $document.off("mouseup.mousewidget");
    }

    _mouseDown(e) {
        // Is left mouse button?
        if (e.which != 1) {
            return;
        }

        const result = this._handleMouseDown(
            e,
            this._getPositionInfo(e)
        );

        if (result) {
            e.preventDefault();
        }

        return result;
    }

    _handleMouseDown(e, position_info: Object) {
        // We may have missed mouseup (out of window)
        if (this.is_mouse_started) {
            this._handleMouseUp(position_info);
        }

        this.mouse_down_info = position_info;

        if (! this._mouseCapture(position_info)) {
            return;
        }

        this._handleStartMouse();

        return true;
    }

    _handleStartMouse() {
        const $document = $(document);
        $document.on("mousemove.mousewidget", $.proxy(this._mouseMove, this));
        $document.on("touchmove.mousewidget", $.proxy(this._touchMove, this));
        $document.on("mouseup.mousewidget", $.proxy(this._mouseUp, this));
        $document.on("touchend.mousewidget", $.proxy(this._touchEnd, this));

        if (this.mouse_delay) {
            this._startMouseDelayTimer();
        }
    }

    _startMouseDelayTimer() {
        if (this._mouse_delay_timer) {
            clearTimeout(this._mouse_delay_timer);
        }

        this._mouse_delay_timer = setTimeout(
            () => {
                this._is_mouse_delay_met = true;
            },
            this.mouse_delay
        );

        this._is_mouse_delay_met = false;
    }

    _mouseMove(e) {
        return this._handleMouseMove(
            e,
            this._getPositionInfo(e)
        );
    }

    _handleMouseMove(e, position_info: Object) {
        if (this.is_mouse_started) {
            this._mouseDrag(position_info);
            return e.preventDefault();
        }

        if (this.mouse_delay && ! this._is_mouse_delay_met) {
            return true;
        }

        this.is_mouse_started = this._mouseStart(this.mouse_down_info) != false;

        if (this.is_mouse_started) {
            this._mouseDrag(position_info);
        }
        else {
            this._handleMouseUp(position_info);
        }

        return ! this.is_mouse_started;
    }

    _getPositionInfo(e) {
        return {
            page_x: e.pageX,
            page_y: e.pageY,
            target: e.target,
            original_event: e
        };
    }

    _mouseUp(e) {
        return this._handleMouseUp(
            this._getPositionInfo(e)
        );
    }

    _handleMouseUp(position_info: Object) {
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

    _mouseCapture(position_info) {
        return true;
    }

    _mouseStart(position_info): boolean {
        return false;
    }

    _mouseDrag(position_info) {
        //
    }

    _mouseStop(position_info) {
        //
    }

    setMouseDelay(mouse_delay: number) {
        this.mouse_delay = mouse_delay;
    }

    _touchStart(e) {
        if (e.originalEvent.touches.length > 1) {
            return;
        }

        const touch = e.originalEvent.changedTouches[0];

        return this._handleMouseDown(
            e,
            this._getPositionInfo(touch)
        );
    }

    _touchMove(e) {
        if (e.originalEvent.touches.length > 1) {
            return;
        }

        const touch = e.originalEvent.changedTouches[0];

        return this._handleMouseMove(
            e,
            this._getPositionInfo(touch)
        );
    }

    _touchEnd(e) {
        if (e.originalEvent.touches.length > 1) {
            return;
        }

        const touch = e.originalEvent.changedTouches[0];

        return this._handleMouseUp(
            this._getPositionInfo(touch)
        );
    }
}
