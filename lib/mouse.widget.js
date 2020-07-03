"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
var getPositionInfoFromMouseEvent = function (e) { return ({
    pageX: e.pageX,
    pageY: e.pageY,
    target: e.target,
    originalEvent: e
}); };
var getPositionInfoFromTouch = function (touch, e) { return ({
    pageX: touch.pageX,
    pageY: touch.pageY,
    target: touch.target,
    originalEvent: e
}); };
var MouseWidget = /** @class */ (function (_super) {
    __extends(MouseWidget, _super);
    function MouseWidget() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.mouseDown = function (e) {
            var mouseDownEvent = e;
            // Is left mouse button?
            if (mouseDownEvent.which !== 1) {
                return;
            }
            var result = _this.handleMouseDown(getPositionInfoFromMouseEvent(mouseDownEvent));
            if (result) {
                mouseDownEvent.preventDefault();
            }
            return result;
        };
        _this.mouseMove = function (e) {
            var mouseMoveEvent = e;
            return _this.handleMouseMove(e, getPositionInfoFromMouseEvent(mouseMoveEvent));
        };
        _this.mouseUp = function (e) {
            var mouseUpEvent = e;
            _this.handleMouseUp(getPositionInfoFromMouseEvent(mouseUpEvent));
        };
        _this.touchStart = function (e) {
            var touchEvent = e.originalEvent;
            if (!touchEvent) {
                return false;
            }
            if (touchEvent.touches.length > 1) {
                return false;
            }
            var touch = touchEvent.changedTouches[0];
            return _this.handleMouseDown(getPositionInfoFromTouch(touch, e));
        };
        _this.touchMove = function (e) {
            var touchEvent = e.originalEvent;
            if (!touchEvent) {
                return false;
            }
            if (touchEvent.touches.length > 1) {
                return false;
            }
            var touch = touchEvent.changedTouches[0];
            return _this.handleMouseMove(e, getPositionInfoFromTouch(touch, e));
        };
        _this.touchEnd = function (e) {
            var touchEvent = e.originalEvent;
            if (!touchEvent) {
                return false;
            }
            if (touchEvent.touches.length > 1) {
                return false;
            }
            var touch = touchEvent.changedTouches[0];
            _this.handleMouseUp(getPositionInfoFromTouch(touch, e));
            return true;
        };
        return _this;
    }
    MouseWidget.prototype.setMouseDelay = function (mouseDelay) {
        this.mouseDelay = mouseDelay;
    };
    MouseWidget.prototype.init = function () {
        this.$el.on("mousedown.mousewidget", this.mouseDown);
        this.$el.on("touchstart.mousewidget", this.touchStart);
        this.isMouseStarted = false;
        this.mouseDelay = 0;
        this.mouseDelayTimer = null;
        this.isMouseDelayMet = false;
        this.mouseDownInfo = null;
    };
    MouseWidget.prototype.deinit = function () {
        this.$el.off("mousedown.mousewidget");
        this.$el.off("touchstart.mousewidget");
        var $document = jQuery(document);
        $document.off("mousemove.mousewidget");
        $document.off("mouseup.mousewidget");
    };
    MouseWidget.prototype.handleMouseDown = function (positionInfo) {
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
    };
    MouseWidget.prototype.handleStartMouse = function () {
        var $document = jQuery(document);
        $document.on("mousemove.mousewidget", this.mouseMove);
        $document.on("touchmove.mousewidget", this.touchMove);
        $document.on("mouseup.mousewidget", this.mouseUp);
        $document.on("touchend.mousewidget", this.touchEnd);
        if (this.mouseDelay) {
            this.startMouseDelayTimer();
        }
    };
    MouseWidget.prototype.startMouseDelayTimer = function () {
        var _this = this;
        if (this.mouseDelayTimer) {
            clearTimeout(this.mouseDelayTimer);
        }
        this.mouseDelayTimer = window.setTimeout(function () {
            _this.isMouseDelayMet = true;
        }, this.mouseDelay);
        this.isMouseDelayMet = false;
    };
    MouseWidget.prototype.handleMouseMove = function (e, positionInfo) {
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
        }
        else {
            this.handleMouseUp(positionInfo);
        }
        return !this.isMouseStarted;
    };
    MouseWidget.prototype.handleMouseUp = function (positionInfo) {
        var $document = jQuery(document);
        $document.off("mousemove.mousewidget");
        $document.off("touchmove.mousewidget");
        $document.off("mouseup.mousewidget");
        $document.off("touchend.mousewidget");
        if (this.isMouseStarted) {
            this.isMouseStarted = false;
            this.mouseStop(positionInfo);
        }
    };
    return MouseWidget;
}(simple_widget_1["default"]));
exports["default"] = MouseWidget;
