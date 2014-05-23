class DragAndDropBoxHandler extends DragAndDropHandler
    constructor: (tree_widget) ->
        @tree_widget = tree_widget
        @hovered_area = null
        @$ghost = null
        @hit_areas = []
        @is_dragging = false
        @current_item = null
        @dragging_cursor = null
        @previousY = null
        @previousX = null

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

    mouseDrag: (position_info) ->
        current_y = position_info.page_y
        current_x = position_info.page_x
        [horizontal_direction, vertical_direction] = @getCurrentDirections(current_x, current_y)
        @drag_element.move(current_x, current_y)
        leaving = @leavingCursorVertically(current_y)
        if leaving && vertical_direction && leaving == vertical_direction

            @hovered_area = @findAreaWhenLeaving(vertical_direction)
            if (@hovered_area)
                @dragging_cursor.moveTo(@hovered_area)
                @refresh()

    getCurrentDirections: (current_x, current_y) ->
        if (@previousY == null)
            vertical_direction = DragAndDropBoxHandler.NEUTRAL
        else if (@previousY > current_y)
            vertical_direction = DragAndDropBoxHandler.UP
        else if (@previousY < current_y)
            vertical_direction = DragAndDropBoxHandler.DOWN

        @previousY = current_y

        if (@previousX == null)
            horizontal_direction = DragAndDropBoxHandler.NEUTRAL
            @previousX = current_x
        else if (current_x > (@previousX + 20))
            @previousX = current_x
            horizontal_direction = DragAndDropBoxHandler.RIGHT
        else if (current_x < (@previousX - 20))
            @previousX = current_x
            horizontal_direction = DragAndDropBoxHandler.LEFT
        else
            horizontal_direction = DragAndDropBoxHandler.NEUTRAL
        [horizontal_direction, vertical_direction]

    generateHitAreas: ->
        hit_areas_generator = new BoxAreasGenerator(
            @tree_widget.tree,
            @current_item.node,
            @getTreeDimensions().bottom,
            @dragging_cursor
        )
        @hit_areas = hit_areas_generator.generate()

    findAreaWhenLeaving: (direction) ->
        cursor_area = @findHoveredArea(@getTreeDimensions.left, @dragging_cursor.area().top)
        index = @hit_areas.lastIndexOf(cursor_area)

        if direction == DragAndDropBoxHandler.UP
            decrement = (dnd, index) ->
                index--
                previous = dnd.hit_areas[index]
                [previous,index]

            [previous, index] = decrement(this, index)
            while index > 0 && (previous.position != Position.AFTER || previous.bottom > cursor_area.top)
                [previous, index] = decrement(this, index)
            return previous

        if direction == DragAndDropBoxHandler.DOWN
            increment = (dnd, index) ->
                index++
                next = dnd.hit_areas[index]
                [next, index]
            [next, index] = increment(this, index)
            while index < @hit_areas.length && next.position != Position.AFTER
                [next, index] = increment(this, index)
            return next

    leavingCursorVertically: (y) ->
        return false unless @dragging_cursor
        buffer = 15
        cursor = @dragging_cursor.$ghost
        top =  cursor.offset().top
        bottom = cursor.offset().top + cursor.height()
        return DragAndDropBoxHandler.DOWN  if y > bottom + buffer
        return DragAndDropBoxHandler.UP  if y < top - buffer
        return false

    refresh: ->
        @removeHitAreas()
        @generateHitAreas()

DragAndDropBoxHandler.UP = 1
DragAndDropBoxHandler.DOWN = -1
DragAndDropBoxHandler.RIGHT = 1
DragAndDropBoxHandler.LEFT = -1
DragAndDropBoxHandler.NEUTRAL = 0

class DragBoxElement extends DragElement
    constructor: (element, offset_x, offset_y, $tree) ->
        @offset_x = offset_x
        @offset_y = offset_y

        @$element = $("<div class=\"jqtree-title jqtree-dragging\"></div>")
        @$element.append($(element).clone())

        @$element.css("position", "absolute")
        $tree.append(@$element)


class BoxAreasGenerator extends HitAreasGenerator
    constructor: (tree, current_node, tree_bottom, cursor) ->
        super(tree)
        @cursor = cursor
        @current_node = current_node
        @tree_bottom = tree_bottom

    generate: ->
        @positions = []
        @last_top = 0

        @iterate()
        @addCursor()
        return @generateHitAreas(@positions)

    handleNode: (node, next_node, $element) ->
        top = @getTop($element)

        if node == @current_node
            # Cannot move inside current item
            @addPosition(node, Position.NONE, top)
        else
            @addPosition(node, Position.INSIDE, top)
            @addPosition(node, Position.AFTER, top)

    handleClosedFolder: (node, next_node, $element) ->
        top = @getTop($element)

        if node == @current_node
            # Cannot move after current item
            @addPosition(node, Position.NONE, top)
        else
            @addPosition(node, Position.INSIDE, top)

        @addPosition(node, Position.AFTER, top)

    handleAfterOpenFolder: (node, next_node, $element) ->
        if node == @current_node.node
            # Cannot move after current item
            @addPosition(node, Position.NONE, @last_top)
        else
            @addPosition(node, Position.AFTER, @last_top)

    addCursor: () ->
        cursor_area = @cursor.area()
        if cursor_area
            for i in [0..@positions.length - 1] by 1
                position = @positions[i]
                if cursor_area.top < position.top
                    @positions.splice(i, 0 , @cursor.area())
                    break

class DraggingCursor
    constructor: (element, position) ->
        @$element = element.$element
        @node = element.node
        height = @$element.height()
        @$ghost = $('<li style = "height:'+height+'px;" class="jqtree_common jqtree-ghost"></li>')

    swapGhost: ->
        @$element.replaceWith(@$ghost)

    area: ->
        area = {
            top: @$ghost.offset().top
            node: @node
            position: Position.NONE
        }

    moveTo: (area) ->
        element = $(area.node.element)
        if area.position is Position.AFTER
            element.after(@$ghost)
        else if area.position is Position.BEFORE
            element.before(@$ghost)


