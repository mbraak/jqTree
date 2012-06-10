###
This widget does the same a the mouse widget in jqueryui.
###

class MouseWidget extends SimpleWidget
    @is_mouse_handled = false

    _init: ->
        @$el.bind('mousedown.mousewidget', $.proxy(@_mouseDown, this))

        @is_mouse_started = false

    _deinit: ->
        @$el.unbind('mousedown.mousewidget')

        $document = $(document)
        $document.unbind('mousemove.mousewidget')
        $document.unbind('mouseup.mousewidget')

    _mouseDown: (e) ->
        # Don't let more than one widget handle mouseStart
        if MouseWidget.is_mouse_handled
            return

        # We may have missed mouseup (out of window)
        if not @is_mouse_started
            @_mouseUp(e)

        # Is left mouse button?
        if e.which != 1
            return

        if not @_mouseCapture(e)
            return

        @mouse_down_event = e

        $document = $(document)
        $document.bind('mousemove.mousewidget', $.proxy(@_mouseMove, this))
        $document.bind('mouseup.mousewidget', $.proxy(@_mouseUp, this))

        e.preventDefault();
        @is_mouse_handled = true
        return true

    _mouseMove: (e) ->
        if @is_mouse_started
            @_mouseDrag(e)
            return e.preventDefault()

        @is_mouse_started = @_mouseStart(@mouse_down_event) != false

        if @is_mouse_started
            @_mouseDrag(e)
        else
            @_mouseUp(e)

        return not @is_mouse_started

    _mouseUp: (e) ->
        $document = $(document)
        $document.unbind('mousemove.mousewidget')
        $document.unbind('mouseup.mousewidget')

        if @is_mouse_started
            @is_mouse_started = false
            @_mouseStop(e)

        return false

    _mouseCapture: (e) ->
        return true

    _mouseStart: (e) ->
        null

    _mouseDrag: (e) ->
        null

    _mouseStop: (e) ->
        null
