"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _simple = _interopRequireDefault(require("./simple.widget"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/*
This widget does the same a the mouse widget in jqueryui.
*/

const getPositionInfoFromMouseEvent = e => ({
  pageX: e.pageX,
  pageY: e.pageY,
  target: e.target,
  originalEvent: e
});
const getPositionInfoFromTouch = (touch, e) => ({
  pageX: touch.pageX,
  pageY: touch.pageY,
  target: touch.target,
  originalEvent: e
});
class MouseWidget extends _simple.default {
  init() {
    const element = this.$el.get(0);
    if (element) {
      element.addEventListener("mousedown", this.mouseDown, {
        passive: false
      });
      element.addEventListener("touchstart", this.touchStart, {
        passive: false
      });
    }
    this.isMouseStarted = false;
    this.mouseDelayTimer = null;
    this.isMouseDelayMet = false;
    this.mouseDownInfo = null;
  }
  deinit() {
    const el = this.$el.get(0);
    if (el) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      el.removeEventListener("mousedown", this.mouseDown, {
        passive: false
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      el.removeEventListener("touchstart", this.touchStart, {
        passive: false
      });
    }
    this.removeMouseMoveEventListeners();
  }
  mouseDown = e => {
    // Left mouse button?
    if (e.button !== 0) {
      return;
    }
    const result = this.handleMouseDown(getPositionInfoFromMouseEvent(e));
    if (result && e.cancelable) {
      e.preventDefault();
    }
  };
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
      passive: false
    });
    document.addEventListener("touchmove", this.touchMove, {
      passive: false
    });
    document.addEventListener("mouseup", this.mouseUp, {
      passive: false
    });
    document.addEventListener("touchend", this.touchEnd, {
      passive: false
    });
    const mouseDelay = this.getMouseDelay();
    if (mouseDelay) {
      this.startMouseDelayTimer(mouseDelay);
    } else {
      this.isMouseDelayMet = true;
    }
  }
  startMouseDelayTimer(mouseDelay) {
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
  mouseMove = e => {
    this.handleMouseMove(e, getPositionInfoFromMouseEvent(e));
  };
  handleMouseMove(e, positionInfo) {
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
  mouseUp = e => {
    this.handleMouseUp(getPositionInfoFromMouseEvent(e));
  };
  handleMouseUp(positionInfo) {
    this.removeMouseMoveEventListeners();
    this.isMouseDelayMet = false;
    this.mouseDownInfo = null;
    if (this.isMouseStarted) {
      this.isMouseStarted = false;
      this.mouseStop(positionInfo);
    }
  }
  removeMouseMoveEventListeners() {
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
  }
  touchStart = e => {
    if (!e) {
      return;
    }
    if (e.touches.length > 1) {
      return;
    }
    const touch = e.changedTouches[0];
    if (!touch) {
      return;
    }
    this.handleMouseDown(getPositionInfoFromTouch(touch, e));
  };
  touchMove = e => {
    if (!e) {
      return;
    }
    if (e.touches.length > 1) {
      return;
    }
    const touch = e.changedTouches[0];
    if (!touch) {
      return;
    }
    this.handleMouseMove(e, getPositionInfoFromTouch(touch, e));
  };
  touchEnd = e => {
    if (!e) {
      return;
    }
    if (e.touches.length > 1) {
      return;
    }
    const touch = e.changedTouches[0];
    if (!touch) {
      return;
    }
    this.handleMouseUp(getPositionInfoFromTouch(touch, e));
  };
}
var _default = MouseWidget;
exports.default = _default;