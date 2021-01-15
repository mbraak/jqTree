"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
            // Left mouse button?
            if (e.button !== 0) {
                return;
            }
            var result = _this.handleMouseDown(getPositionInfoFromMouseEvent(e));
            if (result && e.cancelable) {
                e.preventDefault();
            }
        };
        _this.mouseMove = function (e) {
            _this.handleMouseMove(e, getPositionInfoFromMouseEvent(e));
        };
        _this.mouseUp = function (e) {
            _this.handleMouseUp(getPositionInfoFromMouseEvent(e));
        };
        _this.touchStart = function (e) {
            if (!e) {
                return;
            }
            if (e.touches.length > 1) {
                return;
            }
            var touch = e.changedTouches[0];
            _this.handleMouseDown(getPositionInfoFromTouch(touch, e));
        };
        _this.touchMove = function (e) {
            if (!e) {
                return;
            }
            if (e.touches.length > 1) {
                return;
            }
            var touch = e.changedTouches[0];
            _this.handleMouseMove(e, getPositionInfoFromTouch(touch, e));
        };
        _this.touchEnd = function (e) {
            if (!e) {
                return;
            }
            if (e.touches.length > 1) {
                return;
            }
            var touch = e.changedTouches[0];
            _this.handleMouseUp(getPositionInfoFromTouch(touch, e));
        };
        return _this;
    }
    MouseWidget.prototype.init = function () {
        var element = this.$el.get(0);
        element.addEventListener("mousedown", this.mouseDown, {
            passive: false
        });
        element.addEventListener("touchstart", this.touchStart, {
            passive: false
        });
        this.isMouseStarted = false;
        this.mouseDelayTimer = null;
        this.isMouseDelayMet = false;
        this.mouseDownInfo = null;
    };
    MouseWidget.prototype.deinit = function () {
        var el = this.$el.get(0);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        el.removeEventListener("mousedown", this.mouseDown, {
            passive: false
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        el.removeEventListener("touchstart", this.touchStart, {
            passive: false
        });
        this.removeMouseMoveEventListeners();
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
        document.addEventListener("mousemove", this.mouseMove, {
            passive: false
        });
        document.addEventListener("touchmove", this.touchMove, {
            passive: false
        });
        document.addEventListener("mouseup", this.mouseUp, { passive: false });
        document.addEventListener("touchend", this.touchEnd, {
            passive: false
        });
        var mouseDelay = this.getMouseDelay();
        if (mouseDelay) {
            this.startMouseDelayTimer(mouseDelay);
        }
        else {
            this.isMouseDelayMet = true;
        }
    };
    MouseWidget.prototype.startMouseDelayTimer = function (mouseDelay) {
        var _this = this;
        if (this.mouseDelayTimer) {
            clearTimeout(this.mouseDelayTimer);
        }
        this.mouseDelayTimer = window.setTimeout(function () {
            if (_this.mouseDownInfo) {
                _this.isMouseDelayMet = true;
            }
        }, mouseDelay);
        this.isMouseDelayMet = false;
    };
    MouseWidget.prototype.handleMouseMove = function (e, positionInfo) {
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
        }
        else {
            this.handleMouseUp(positionInfo);
        }
    };
    MouseWidget.prototype.handleMouseUp = function (positionInfo) {
        this.removeMouseMoveEventListeners();
        this.isMouseDelayMet = false;
        this.mouseDownInfo = null;
        if (this.isMouseStarted) {
            this.isMouseStarted = false;
            this.mouseStop(positionInfo);
        }
    };
    MouseWidget.prototype.removeMouseMoveEventListeners = function () {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        document.removeEventListener("mousemove", this.mouseMove, {
            passive: false
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        document.removeEventListener("touchmove", this.touchMove, {
            passive: false
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        document.removeEventListener("mouseup", this.mouseUp, {
            passive: false
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        document.removeEventListener("touchend", this.touchEnd, {
            passive: false
        });
    };
    return MouseWidget;
}(simple_widget_1["default"]));
exports["default"] = MouseWidget;
