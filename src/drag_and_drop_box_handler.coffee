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

    getCurrentDirections: (current_x, current_y) ->
        if (@previousY == null)
            vertical_direction = DragAndDropBoxHandler.NEUTRAL
        else if (@previousY > current_y)
            vertical_direction = DragAndDropBoxHandler.UP
        else if (@previousY < current_y)
            vertical_direction = DragAndDropBoxHandler.DOWN
        else
            horizontal_direction = DragAndDropBoxHandler.NEUTRAL
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
