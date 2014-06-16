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

    printHitAreas: ->
        for hit_area in @hit_areas
            console.log(hit_area.top, hit_area.bottom, hit_area.node.name, @convertPosition(hit_area.position), hit_area.depth)

    convertPosition: (position) ->
        switch position
            when 1
                return "BEFORE"
            when 2
                return "AFTER"
            when 3
                return "INSIDE"
            when 4
                return "NONE"

    resetHorizontal: (current_x) ->
        @previousX = current_x
        @horizontal_options = null

    mouseStop: (position_info) ->
        if !@hovered_area || @hovered_area.position == Position.NONE
            @dragging_cursor.unSwapGhost()
            @tree_widget._refreshElements()
        else
            @moveItem(position_info)
        @clear()
        @removeHover()
        @removeDropHint()
        @removeHitAreas()

        if @current_item
            @current_item.$element.removeClass('jqtree-moving')
            @current_item = null

        @is_dragging = false
        return false

    mouseDrag: (position_info) ->
        current_y = position_info.page_y
        current_x = position_info.page_x
        [horizontal_direction, vertical_direction] = @getCurrentDirections(current_x, current_y)
        @drag_element.move(current_x, current_y)
        leaving = @leavingCursorVertically(current_y)
        #vertically leaving the cursor takes precedence over horizontal nesting
        if leaving && vertical_direction && leaving == vertical_direction
            @hovered_area = @findAreaWhenLeaving(vertical_direction)
            #we have to be on a hovered element so move and refresh everything
            if (@hovered_area)
                @dragging_cursor.moveTo(@hovered_area, @hit_areas.lastIndexOf(@hovered_area))
                @refresh()
                @resetHorizontal(current_x)

        else if horizontal_direction == DragAndDropBoxHandler.RIGHT
            @rightMove()

        else if horizontal_direction == DragAndDropBoxHandler.LEFT
            @leftMove()


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

    rightMove: (current_x) ->
        rightMoveArea = @getRightMoveArea()
        if rightMoveArea
            @hovered_area = rightMoveArea
            if rightMoveArea && rightMoveArea.position == Position.INSIDE
                @dragging_cursor.bump()
            else
                @dragging_cursor.moveTo(@hovered_area)

        return false

    getRightMoveArea: () ->
        if !@horizontal_options
            @horizontal_options = @generateHorizontalMoveOptions()
        #@horizontal_options.print()

        if @horizontal_options.hasRight()
            right = @horizontal_options.shiftRight()
            return right
        return null

    leftMove: () ->
        leftMoveArea = @getLeftMoveArea()
        if leftMoveArea
            @hovered_area = leftMoveArea
            @dragging_cursor.moveTo(@hovered_area)
            return true
        return false

    getLeftMoveArea: () ->
        if !@horizontal_options
            @horizontal_options = @generateHorizontalMoveOptions()
        #@horizontal_options.print()
        if @horizontal_options.hasLeft()
            left = @horizontal_options.shiftLeft()
            return left
        return null

    generateHorizontalMoveOptions: () ->
        @refresh()
        options = new HorizontalOptions()

        [area, index] = @findCursor()

        current = area
        options.setCurrent(current)

        #get to bottom of cursor so that we can capture any afters that would lie in the cursor
        while (@dragging_cursor.inCursor(this.hit_areas[index+1]))
            index++
            area = this.hit_areas[index]

        #skip over the first element that is an AFTER in the same area as the cursor
        index--
        previous = @hit_areas[index]
        previousIsFolder = previous.node.hasChildren()
        previousIsOpen =  previousIsFolder && !previous.node.element.classList.contains('jqtree-closed')

        #make sure we are not the first element in an open folder
        if previous && !(previousIsFolder && previousIsOpen && previous.position == Position.INSIDE)
            while previous && previous.position != Position.INSIDE
                options.rightPush(previous) unless previous.position == Position.NONE
                index--
                previous = @hit_areas[index]
            options.rightPush(previous)

       #get areas to left
        index = @hit_areas.lastIndexOf(current)
        index++
        next = @hit_areas[index]

        if next && @dragging_cursor.inCursor(next)
            #skip over element that is in the same area as the cursor
            index++
            next = @hit_areas[index]

        while next && next.position == Position.AFTER
            index++
            options.leftPush(next)
            next = @hit_areas[index++]

        return options

    generateHitAreas: ->
        hit_areas_generator = new BoxAreasGenerator(
            @tree_widget.tree,
            @current_item.node,
            @getTreeDimensions().bottom,
            @dragging_cursor
        )
        @hit_areas = hit_areas_generator.generate()

    findCursor: ->
        index = @dragging_cursor.index
        area = @hit_areas[index]
        [area, index]

    clear: ->
        @drag_element.remove()
        @drag_element = null
        @dragging_cursor.remove()
        @dragging_cursor = null
        @previousX = null
        @previousY = null
        @horizontal_options = null

    findAreaWhenLeaving: (direction) ->
        [cursor,index] = @findCursor()
        if direction == DragAndDropBoxHandler.UP
            decrement = (dnd, index) ->
                index--
                previous = dnd.hit_areas[index]
                [previous,index]

            [previous, index] = decrement(this, index)
            while index > 0
                if (previous.position == Position.INSIDE && @hit_areas[index-1].position == Position.INSIDE)
                    [previous, index] = decrement(this, index)
                    break;
                if (previous.position == Position.AFTER && previous.bottom < cursor.top)
                    break;
                [previous, index] = decrement(this, index)
            return previous

        if direction == DragAndDropBoxHandler.DOWN
            increment = (dnd, index) ->
                index++
                next = dnd.hit_areas[index]
                [next, index]
            [next, index] = increment(this, index)
            while (next && @dragging_cursor.inCursor(next))
                [next, index] = increment(this, index)
            while index < @hit_areas.length
                if (next.position == Position.INSIDE && @hit_areas[index+1].position == Position.INSIDE)
                    break
                if next.position == Position.AFTER
                    break
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
    constructor: (tree, current_node, tree_bottom, cursor, group_size_max) ->
        group_size_max ?= 12
        super(tree, current_node, tree_bottom, group_size_max)
        @cursor = cursor
        @current_node = current_node
        @tree_bottom = tree_bottom

    generate: ->
        @positions = []
        @last_top = 0

        @iterate()

        hit_areas = @generateHitAreas(@positions)
        @addCursor(hit_areas)
        return hit_areas

    addPosition: (node, position, top) ->
        area = {
            top: top
            node: node
            position: position
        }

        @positions.push(area)
        @last_top = top

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

    handleOpenFolder: (node, $element) ->
        if node == @current_node
            # Cannot move inside current item
            # Stop iterating
            return false

        @addPosition(node, Position.INSIDE, @getTop($element))

        # Continue iterating
        return true

    handleAfterOpenFolder: (node, next_node, $element) ->
        if node == @current_node.node
            # Cannot move after current item
            @addPosition(node, Position.NONE, @last_top)
        else
            @addPosition(node, Position.AFTER, @last_top)

    addCursor: (hit_areas) ->
        cursor_area = @cursor.area()
        if cursor_area
            i = 0
            while i < hit_areas.length
                position = hit_areas[i]
                if cursor_area.top < position.top
                    break
                i++
            @cursor.index = i
            hit_areas.splice(i, 0 , cursor_area)


class DraggingCursor
    constructor: (element, position) ->
        @$element = element.$element
        @node = element.node
        height = @$element.height()
        @$ghost = $('<li style = "height:'+height+'px;" class="jqtree_common jqtree-ghost"></li>')

    swapGhost: ->
        @$element.replaceWith(@$ghost)

    unSwapGhost: ->
        @$ghost.replaceWith(@$element)

    setIndex: (index) ->
        @index = index

    area: ->
        area = {
            top: @$ghost.offset().top
            node: @node
            position: Position.NONE
            bottom: @$ghost.offset().top + @$ghost.height()
        }

    moveTo: (area, index) ->
        element = $(area.node.element)
        @setIndex(index) if index
        if (@bumped)
            @deBump()
        if area.position is Position.AFTER
            element.after(@$ghost)
        else if area.position is Position.BEFORE
            element.before(@$ghost)
        else if area.position is Position.INSIDE
            element.find('.jqtree-element').first().after(@$ghost)
            @bump()

    bump: ->
        @bumped = true
        @$ghost.addClass('bumped')

    deBump: ->
        @bumped = false
        @$ghost.removeClass('bumped')

    remove: ->
        @$ghost.remove()

    inCursor: (area) ->
        return false unless area
        offset = @$ghost.offset()
        top = offset.top
        bottom = @$ghost.height() + top
        left = offset.left
        area.top >= top && area.top < bottom && (left <= $(area.node.element).offset().left)



class HorizontalOptions
    constructor: () ->
        @right_arr = []
        @left_arr = []
        @current = null

    setCurrent: (area) ->
        @current = area

    shiftLeft: () ->
        if @hasLeft
            new_current_item = @left_arr.shift()
            @right_arr.unshift(@current)
            @setCurrent(new_current_item)
            return new_current_item
        else
            return false

    shiftRight: () ->
        if @hasRight
            new_current_item = @right_arr.shift()
            @left_arr.unshift(@current)
            @setCurrent(new_current_item)
            return new_current_item
        else
            return false

    rightPush: (area) ->
        @right_arr.push(area)

    leftPush: (area) ->
        @left_arr.push(area)

    hasLeft: () ->
        return if (@left_arr.length == 0) then false else true

    hasRight: () ->
        return if (@right_arr.length == 0) then false else true

    print: () ->
        for i in [@left_arr.length - 1..0] by -1
            if i == 0
                console.log("-1", @left_arr[i]);
            else
                console.log("-" + (i-1), @left_arr[i]);

        console.log('Current', @current)

        for i in [0..@right_arr.length] by 1
            if @right_arr[i]
                console.log("+"+ (i + 1), @right_arr[i])
