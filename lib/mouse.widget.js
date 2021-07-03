"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _simple = _interopRequireDefault(require("./simple.widget"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var getPositionInfoFromMouseEvent = function getPositionInfoFromMouseEvent(e) {
  return {
    pageX: e.pageX,
    pageY: e.pageY,
    target: e.target,
    originalEvent: e
  };
};

var getPositionInfoFromTouch = function getPositionInfoFromTouch(touch, e) {
  return {
    pageX: touch.pageX,
    pageY: touch.pageY,
    target: touch.target,
    originalEvent: e
  };
};

var MouseWidget = /*#__PURE__*/function (_SimpleWidget) {
  _inherits(MouseWidget, _SimpleWidget);

  var _super = _createSuper(MouseWidget);

  function MouseWidget() {
    var _this;

    _classCallCheck(this, MouseWidget);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "isMouseStarted", void 0);

    _defineProperty(_assertThisInitialized(_this), "mouseDownInfo", void 0);

    _defineProperty(_assertThisInitialized(_this), "mouseDelayTimer", void 0);

    _defineProperty(_assertThisInitialized(_this), "isMouseDelayMet", void 0);

    _defineProperty(_assertThisInitialized(_this), "mouseDown", function (e) {
      // Left mouse button?
      if (e.button !== 0) {
        return;
      }

      var result = _this.handleMouseDown(getPositionInfoFromMouseEvent(e));

      if (result && e.cancelable) {
        e.preventDefault();
      }
    });

    _defineProperty(_assertThisInitialized(_this), "mouseMove", function (e) {
      _this.handleMouseMove(e, getPositionInfoFromMouseEvent(e));
    });

    _defineProperty(_assertThisInitialized(_this), "mouseUp", function (e) {
      _this.handleMouseUp(getPositionInfoFromMouseEvent(e));
    });

    _defineProperty(_assertThisInitialized(_this), "touchStart", function (e) {
      if (!e) {
        return;
      }

      if (e.touches.length > 1) {
        return;
      }

      var touch = e.changedTouches[0];

      _this.handleMouseDown(getPositionInfoFromTouch(touch, e));
    });

    _defineProperty(_assertThisInitialized(_this), "touchMove", function (e) {
      if (!e) {
        return;
      }

      if (e.touches.length > 1) {
        return;
      }

      var touch = e.changedTouches[0];

      _this.handleMouseMove(e, getPositionInfoFromTouch(touch, e));
    });

    _defineProperty(_assertThisInitialized(_this), "touchEnd", function (e) {
      if (!e) {
        return;
      }

      if (e.touches.length > 1) {
        return;
      }

      var touch = e.changedTouches[0];

      _this.handleMouseUp(getPositionInfoFromTouch(touch, e));
    });

    return _this;
  }

  _createClass(MouseWidget, [{
    key: "init",
    value: function init() {
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
    }
  }, {
    key: "deinit",
    value: function deinit() {
      var el = this.$el.get(0); // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access

      el.removeEventListener("mousedown", this.mouseDown, {
        passive: false
      }); // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access

      el.removeEventListener("touchstart", this.touchStart, {
        passive: false
      });
      this.removeMouseMoveEventListeners();
    }
  }, {
    key: "handleMouseDown",
    value: function handleMouseDown(positionInfo) {
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
  }, {
    key: "handleStartMouse",
    value: function handleStartMouse() {
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
      var mouseDelay = this.getMouseDelay();

      if (mouseDelay) {
        this.startMouseDelayTimer(mouseDelay);
      } else {
        this.isMouseDelayMet = true;
      }
    }
  }, {
    key: "startMouseDelayTimer",
    value: function startMouseDelayTimer(mouseDelay) {
      var _this2 = this;

      if (this.mouseDelayTimer) {
        clearTimeout(this.mouseDelayTimer);
      }

      this.mouseDelayTimer = window.setTimeout(function () {
        if (_this2.mouseDownInfo) {
          _this2.isMouseDelayMet = true;
        }
      }, mouseDelay);
      this.isMouseDelayMet = false;
    }
  }, {
    key: "handleMouseMove",
    value: function handleMouseMove(e, positionInfo) {
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
  }, {
    key: "handleMouseUp",
    value: function handleMouseUp(positionInfo) {
      this.removeMouseMoveEventListeners();
      this.isMouseDelayMet = false;
      this.mouseDownInfo = null;

      if (this.isMouseStarted) {
        this.isMouseStarted = false;
        this.mouseStop(positionInfo);
      }
    }
  }, {
    key: "removeMouseMoveEventListeners",
    value: function removeMouseMoveEventListeners() {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      document.removeEventListener("mousemove", this.mouseMove, {
        passive: false
      }); // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access

      document.removeEventListener("touchmove", this.touchMove, {
        passive: false
      }); // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access

      document.removeEventListener("mouseup", this.mouseUp, {
        passive: false
      }); // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access

      document.removeEventListener("touchend", this.touchEnd, {
        passive: false
      });
    }
  }]);

  return MouseWidget;
}(_simple["default"]);

var _default = MouseWidget;
exports["default"] = _default;