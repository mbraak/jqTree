class DragAndDropBoxHandler extends DragAndDropHandler
    constructor: (tree_widget) ->
        @tree_widget = tree_widget

        @hovered_area = null
        @$ghost = null
        @hit_areas = []
        @is_dragging = false
        @current_item = null
        @dragging_cursor = null

    mouseStart: (position_info) ->

        offset = $(position_info.target).offset()

        @dragging_cursor = new DraggingCursor(@current_item, Position.NONE)

         #create a drag box element from the element being dragged
        @drag_element = new DragBoxElement(
            @current_item.$element
            position_info.page_x - offset.left,
            position_info.page_y - offset.top,
            @tree_widget.element
        )

        @dragging_cursor.swapGhost()

        @refresh()

        @is_dragging = true
        return true

class DragBoxElement extends DragElement
    constructor: (element, offset_x, offset_y, $tree) ->
        @offset_x = offset_x
        @offset_y = offset_y

        @$element = $("<div class=\"jqtree-title jqtree-dragging\"></div>")
        @$element.append($(element).clone())

        @$element.css("position", "absolute")
        $tree.append(@$element)

class DraggingCursor
	constructor: (element, position) ->
        @$element = element.$element
        height = @$element.height()
        @$ghost = $('<li style = "height:'+height+'px;" class="jqtree_common jqtree-ghost"></li>')

	swapGhost: ->
		@$element.replaceWith(@$ghost)
