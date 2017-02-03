###
This widget does the same a the mouse widget in jqueryui.
###

SimpleWidget = require './simple.widget'


$ = jQuery


class MouseWidget extends SimpleWidget
    @is_mouse_handled = false

    _init: ->
        @$el.on('mousedown.mousewidget', $.proxy(@_mouseDown, this))
        @$el.on('touchstart.mousewidget', $.proxy(@_touchStart, this))

        @is_mouse_started = false
        @mouse_delay = 0
        @_mouse_delay_timer = null
        @_is_mouse_delay_met = true
        @mouse_down_info = null

    _deinit: ->
        @$el.off('mousedown.mousewidget')
        @$el.off('touchstart.mousewidget')

        $document = $(document)
        $document.off('mousemove.mousewidget')
        $document.off('mouseup.mousewidget')

    _mouseDown: (e) ->
        # Is left mouse button?
        if e.which != 1
            return

        result = @_handleMouseDown(
            e,
            @_getPositionInfo(e)
        )

        if result
            e.preventDefault()

        return result

    _handleMouseDown: (e, position_info) ->
        # Don't let more than one widget handle mouseStart
        if MouseWidget.is_mouse_handled
            return

        # We may have missed mouseup (out of window)
        if @is_mouse_started
            @_handleMouseUp(position_info)

        @mouse_down_info = position_info

        if not @_mouseCapture(position_info)
            return

        @_handleStartMouse()

        @is_mouse_handled = true
        return true

    _handleStartMouse: ->
        $document = $(document)
        $document.on('mousemove.mousewidget', $.proxy(@_mouseMove, this))
        $document.on('touchmove.mousewidget', $.proxy(@_touchMove, this))
        $document.on('mouseup.mousewidget', $.proxy(@_mouseUp, this))
        $document.on('touchend.mousewidget', $.proxy(@_touchEnd, this))

        if @mouse_delay
            @_startMouseDelayTimer()

    _startMouseDelayTimer: ->
        if @_mouse_delay_timer
            clearTimeout(@_mouse_delay_timer)

        @_mouse_delay_timer = setTimeout(
            =>
                @_is_mouse_delay_met = true
            , @mouse_delay
        )

        @_is_mouse_delay_met = false

    _mouseMove: (e) ->
        return @_handleMouseMove(
            e,
            @_getPositionInfo(e)
        )

    _handleMouseMove: (e, position_info) ->
        if @is_mouse_started
            @_mouseDrag(position_info)
            return e.preventDefault()

        if @mouse_delay and not @_is_mouse_delay_met
            return true

        @is_mouse_started = @_mouseStart(@mouse_down_info) != false

        if @is_mouse_started
            @_mouseDrag(position_info)
        else
            @_handleMouseUp(position_info)

        return not @is_mouse_started

    _getPositionInfo: (e) ->
        return {
            page_x: e.pageX,
            page_y: e.pageY,
            target: e.target,
            original_event: e
        }

    _mouseUp: (e) ->
        return @_handleMouseUp(
            @_getPositionInfo(e)
        )

    _handleMouseUp: (position_info) ->
        $document = $(document)
        $document.off('mousemove.mousewidget')
        $document.off('touchmove.mousewidget')
        $document.off('mouseup.mousewidget')
        $document.off('touchend.mousewidget')

        if @is_mouse_started
            @is_mouse_started = false
            @_mouseStop(position_info)

        return

    _mouseCapture: (position_info) ->
        return true

    _mouseStart: (position_info) ->
        null

    _mouseDrag: (position_info) ->
        null

    _mouseStop: (position_info) ->
        null

    setMouseDelay: (mouse_delay) ->
        @mouse_delay = mouse_delay

    _touchStart: (e) ->
        if e.originalEvent.touches.length > 1
            return

        touch = e.originalEvent.changedTouches[0]

        return @_handleMouseDown(
            e,
            @_getPositionInfo(touch)
        )

    _touchMove: (e) ->
        if e.originalEvent.touches.length > 1
            return

        touch = e.originalEvent.changedTouches[0]

        return @_handleMouseMove(
            e,
            @_getPositionInfo(touch)
        )

    _touchEnd: (e) ->
        if e.originalEvent.touches.length > 1
            return

        touch = e.originalEvent.changedTouches[0]

        return @_handleMouseUp(
            @_getPositionInfo(touch)
        )

module.exports = MouseWidget
