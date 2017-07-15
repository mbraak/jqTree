"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
/*
This widget does the same a the mouse widget in jqueryui.
*/
var simple_widget_1 = require("./simple.widget");
var MouseWidget = (function (_super) {
    __extends(MouseWidget, _super);
    function MouseWidget() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MouseWidget.prototype.setMouseDelay = function (mouse_delay) {
        this.mouse_delay = mouse_delay;
    };
    MouseWidget.prototype._init = function () {
        this.$el.on("mousedown.mousewidget", $.proxy(this._mouseDown, this));
        this.$el.on("touchstart.mousewidget", $.proxy(this._touchStart, this));
        this.is_mouse_started = false;
        this.mouse_delay = 0;
        this._mouse_delay_timer = null;
        this._is_mouse_delay_met = true;
        this.mouse_down_info = null;
    };
    MouseWidget.prototype._deinit = function () {
        this.$el.off("mousedown.mousewidget");
        this.$el.off("touchstart.mousewidget");
        var $document = $(document);
        $document.off("mousemove.mousewidget");
        $document.off("mouseup.mousewidget");
    };
    MouseWidget.prototype._mouseDown = function (e) {
        // Is left mouse button?
        if (e.which !== 1) {
            return;
        }
        var result = this._handleMouseDown(this._getPositionInfo(e));
        if (result) {
            e.preventDefault();
        }
        return result;
    };
    MouseWidget.prototype._handleMouseDown = function (position_info) {
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
    };
    MouseWidget.prototype._handleStartMouse = function () {
        var $document = $(document);
        $document.on("mousemove.mousewidget", $.proxy(this._mouseMove, this));
        $document.on("touchmove.mousewidget", $.proxy(this._touchMove, this));
        $document.on("mouseup.mousewidget", $.proxy(this._mouseUp, this));
        $document.on("touchend.mousewidget", $.proxy(this._touchEnd, this));
        if (this.mouse_delay) {
            this._startMouseDelayTimer();
        }
    };
    MouseWidget.prototype._startMouseDelayTimer = function () {
        var _this = this;
        if (this._mouse_delay_timer) {
            clearTimeout(this._mouse_delay_timer);
        }
        this._mouse_delay_timer = setTimeout(function () {
            _this._is_mouse_delay_met = true;
        }, this.mouse_delay);
        this._is_mouse_delay_met = false;
    };
    MouseWidget.prototype._mouseMove = function (e) {
        return this._handleMouseMove(e, this._getPositionInfo(e));
    };
    MouseWidget.prototype._handleMouseMove = function (e, position_info) {
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
        }
        else {
            this._handleMouseUp(position_info);
        }
        return !this.is_mouse_started;
    };
    MouseWidget.prototype._getPositionInfo = function (e) {
        return {
            page_x: e.pageX,
            page_y: e.pageY,
            target: e.target,
            original_event: e
        };
    };
    MouseWidget.prototype._mouseUp = function (e) {
        return this._handleMouseUp(this._getPositionInfo(e));
    };
    MouseWidget.prototype._handleMouseUp = function (position_info) {
        var $document = $(document);
        $document.off("mousemove.mousewidget");
        $document.off("touchmove.mousewidget");
        $document.off("mouseup.mousewidget");
        $document.off("touchend.mousewidget");
        if (this.is_mouse_started) {
            this.is_mouse_started = false;
            this._mouseStop(position_info);
        }
    };
    MouseWidget.prototype._touchStart = function (e) {
        var touch_event = e.originalEvent;
        if (touch_event.touches.length > 1) {
            return;
        }
        var touch = touch_event.changedTouches[0];
        return this._handleMouseDown(this._getPositionInfo(touch));
    };
    MouseWidget.prototype._touchMove = function (e) {
        var touch_event = e.originalEvent;
        if (touch_event.touches.length > 1) {
            return;
        }
        var touch = touch_event.changedTouches[0];
        return this._handleMouseMove(e, this._getPositionInfo(touch));
    };
    MouseWidget.prototype._touchEnd = function (e) {
        var touch_event = e.originalEvent;
        if (touch_event.touches.length > 1) {
            return;
        }
        var touch = touch_event.changedTouches[0];
        return this._handleMouseUp(this._getPositionInfo(touch));
    };
    return MouseWidget;
}(simple_widget_1["default"]));
exports["default"] = MouseWidget;
