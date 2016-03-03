
/*
This widget does the same a the mouse widget in jqueryui.
 */
var $, MouseWidget, SimpleWidget,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SimpleWidget = require('./simple.widget');

$ = jQuery;

MouseWidget = (function(superClass) {
  extend(MouseWidget, superClass);

  function MouseWidget() {
    return MouseWidget.__super__.constructor.apply(this, arguments);
  }

  MouseWidget.is_mouse_handled = false;

  MouseWidget.prototype._init = function() {
    this.$el.bind('mousedown.mousewidget', $.proxy(this._mouseDown, this));
    this.$el.bind('touchstart.mousewidget', $.proxy(this._touchStart, this));
    this.is_mouse_started = false;
    this.mouse_delay = 0;
    this._mouse_delay_timer = null;
    this._is_mouse_delay_met = true;
    return this.mouse_down_info = null;
  };

  MouseWidget.prototype._deinit = function() {
    var $document;
    this.$el.unbind('mousedown.mousewidget');
    this.$el.unbind('touchstart.mousewidget');
    $document = $(document);
    $document.unbind('mousemove.mousewidget');
    return $document.unbind('mouseup.mousewidget');
  };

  MouseWidget.prototype._mouseDown = function(e) {
    var result;
    if (e.which !== 1) {
      return;
    }
    result = this._handleMouseDown(e, this._getPositionInfo(e));
    if (result) {
      e.preventDefault();
    }
    return result;
  };

  MouseWidget.prototype._handleMouseDown = function(e, position_info) {
    if (MouseWidget.is_mouse_handled) {
      return;
    }
    if (this.is_mouse_started) {
      this._handleMouseUp(position_info);
    }
    this.mouse_down_info = position_info;
    if (!this._mouseCapture(position_info)) {
      return;
    }
    this._handleStartMouse();
    this.is_mouse_handled = true;
    return true;
  };

  MouseWidget.prototype._handleStartMouse = function() {
    var $document;
    $document = $(document);
    $document.bind('mousemove.mousewidget', $.proxy(this._mouseMove, this));
    $document.bind('touchmove.mousewidget', $.proxy(this._touchMove, this));
    $document.bind('mouseup.mousewidget', $.proxy(this._mouseUp, this));
    $document.bind('touchend.mousewidget', $.proxy(this._touchEnd, this));
    if (this.mouse_delay) {
      return this._startMouseDelayTimer();
    }
  };

  MouseWidget.prototype._startMouseDelayTimer = function() {
    if (this._mouse_delay_timer) {
      clearTimeout(this._mouse_delay_timer);
    }
    this._mouse_delay_timer = setTimeout((function(_this) {
      return function() {
        return _this._is_mouse_delay_met = true;
      };
    })(this), this.mouse_delay);
    return this._is_mouse_delay_met = false;
  };

  MouseWidget.prototype._mouseMove = function(e) {
    return this._handleMouseMove(e, this._getPositionInfo(e));
  };

  MouseWidget.prototype._handleMouseMove = function(e, position_info) {
    if (this.is_mouse_started) {
      this._mouseDrag(position_info);
      return e.preventDefault();
    }
    if (this.mouse_delay && !this._is_mouse_delay_met) {
      return true;
    }
    this.is_mouse_started = this._mouseStart(this.mouse_down_info) !== false;
    if (this.is_mouse_started) {
      this._mouseDrag(position_info);
    } else {
      this._handleMouseUp(position_info);
    }
    return !this.is_mouse_started;
  };

  MouseWidget.prototype._getPositionInfo = function(e) {
    return {
      page_x: e.pageX,
      page_y: e.pageY,
      target: e.target,
      original_event: e
    };
  };

  MouseWidget.prototype._mouseUp = function(e) {
    return this._handleMouseUp(this._getPositionInfo(e));
  };

  MouseWidget.prototype._handleMouseUp = function(position_info) {
    var $document;
    $document = $(document);
    $document.unbind('mousemove.mousewidget');
    $document.unbind('touchmove.mousewidget');
    $document.unbind('mouseup.mousewidget');
    $document.unbind('touchend.mousewidget');
    if (this.is_mouse_started) {
      this.is_mouse_started = false;
      this._mouseStop(position_info);
    }
  };

  MouseWidget.prototype._mouseCapture = function(position_info) {
    return true;
  };

  MouseWidget.prototype._mouseStart = function(position_info) {
    return null;
  };

  MouseWidget.prototype._mouseDrag = function(position_info) {
    return null;
  };

  MouseWidget.prototype._mouseStop = function(position_info) {
    return null;
  };

  MouseWidget.prototype.setMouseDelay = function(mouse_delay) {
    return this.mouse_delay = mouse_delay;
  };

  MouseWidget.prototype._touchStart = function(e) {
    var touch;
    if (e.originalEvent.touches.length > 1) {
      return;
    }
    touch = e.originalEvent.changedTouches[0];
    return this._handleMouseDown(e, this._getPositionInfo(touch));
  };

  MouseWidget.prototype._touchMove = function(e) {
    var touch;
    if (e.originalEvent.touches.length > 1) {
      return;
    }
    touch = e.originalEvent.changedTouches[0];
    return this._handleMouseMove(e, this._getPositionInfo(touch));
  };

  MouseWidget.prototype._touchEnd = function(e) {
    var touch;
    if (e.originalEvent.touches.length > 1) {
      return;
    }
    touch = e.originalEvent.changedTouches[0];
    return this._handleMouseUp(this._getPositionInfo(touch));
  };

  return MouseWidget;

})(SimpleWidget);

module.exports = MouseWidget;
