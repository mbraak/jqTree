class DragAndDropHandler
    constructor: (tree_widget) ->
        @tree_widget = tree_widget

        @hovered_area = null
        @$ghost = null
        @hit_areas = []
        @is_dragging = false

    mouseCapture: (position_info) ->
        $element = $(position_info.target)

        if @tree_widget.options.onIsMoveHandle and not @tree_widget.options.onIsMoveHandle($element)
            return null

        node_element = @tree_widget._getNodeElement($element)

        if node_element and @tree_widget.options.onCanMove
            if not @tree_widget.options.onCanMove(node_element.node)
                node_element = null

        @current_item = node_element
        return (@current_item != null)

    mouseStart: (position_info) ->
        @refreshHitAreas()

        offset = $(position_info.target).offset()

        @drag_element = new DragElement(
            @current_item.node
            position_info.page_x - offset.left,
            position_info.page_y - offset.top,
            @tree_widget.element
        )

        @is_dragging = true
        @current_item.$element.addClass('jqtree-moving')
        return true

    mouseDrag: (position_info) ->
        @drag_element.move(position_info.page_x, position_info.page_y)

        area = @findHoveredArea(position_info.page_x, position_info.page_y)
        can_move_to = @canMoveToArea(area)

        if area
            if @hovered_area != area
                @hovered_area = area

                # If this is a closed folder, start timer to open it
                if @mustOpenFolderTimer(area)
                    @startOpenFolderTimer(area.node)

                if can_move_to
                    @updateDropHint()
        else
            @removeHover()
            @removeDropHint()
            @stopOpenFolderTimer()

        return true

    canMoveToArea: (area) ->
        if not area
            return false
        else if @tree_widget.options.onCanMoveTo
            position_name = Position.getName(area.position)

            return @tree_widget.options.onCanMoveTo(@current_item.node, area.node, position_name)
        else
            return true

    mouseStop: (position_info) ->
        @moveItem(position_info)
        @clear()
        @removeHover()
        @removeDropHint()
        @removeHitAreas()

        if @current_item
            @current_item.$element.removeClass('jqtree-moving')

        @is_dragging = false
        return false

    refreshHitAreas: ->
        @removeHitAreas()
        @generateHitAreas()

    removeHitAreas: ->
        @hit_areas = []

    clear: ->
        @drag_element.remove()
        @drag_element = null

    removeDropHint: ->
        if @previous_ghost
            @previous_ghost.remove()

    removeHover: ->
        @hovered_area = null

    generateHitAreas: ->
        positions = []
        last_top = 0

        getTop = ($element) =>
            return $element.offset().top

        addPosition = (node, position, top) =>
            positions.push(
                top: top,
                node: node,
                position: position
            )
            last_top = top

        groupPositions = (handle_group) =>
            previous_top = -1
            group = []

            for position in positions
                if position.top != previous_top
                    if group.length
                        handle_group(group, previous_top, position.top)

                    previous_top = position.top
                    group = []

                group.push(position)

            handle_group(
                group,
                previous_top,
                @tree_widget.element.offset().top + @tree_widget.element.height()
            )

        handleNode = (node, next_node, $element) =>
            top = getTop($element)

            if node == @current_item.node
                # Cannot move inside current item
                addPosition(node, Position.NONE, top)
            else
                addPosition(node, Position.INSIDE, top)

            if (
                next_node == @current_item.node or
                node == @current_item.node
            )
                # Cannot move before or after current item
                addPosition(node, Position.NONE, top)
            else
                addPosition(node, Position.AFTER, top)

        handleOpenFolder = (node, $element) =>
            if node == @current_item.node
                # Cannot move inside current item
                # Stop iterating
                return false

            # Cannot move before current item
            if node.children[0] != @current_item.node
                addPosition(node, Position.INSIDE, getTop($element))

            # Continue iterating
            return true

        handleAfterOpenFolder = (node, next_node, $element) =>
            if (
                node == @current_item.node or
                next_node == @current_item.node
            )
                # Cannot move before or after current item
                addPosition(node, Position.NONE, last_top)
            else
                addPosition(node, Position.AFTER, last_top)

        handleClosedFolder = (node, next_node, $element) =>
            top = getTop($element)

            if node == @current_item.node
                # Cannot move after current item
                addPosition(node, Position.NONE, top)
            else
                addPosition(node, Position.INSIDE, top)

                # Cannot move before current item
                if next_node != @current_item.node
                    addPosition(node, Position.AFTER, top)

        handleFirstNode = (node, $element) =>
            if node != @current_item.node
                addPosition(node, Position.BEFORE, getTop($(node.element)))

        @iterateVisibleNodes(
            handleNode, handleOpenFolder, handleClosedFolder, handleAfterOpenFolder, handleFirstNode
        )

        hit_areas = []

        groupPositions((positions_in_group, top, bottom) ->
            area_height = (bottom - top) / positions_in_group.length
            area_top = top

            for position in positions_in_group
                hit_areas.push(
                    top: area_top,
                    bottom: area_top + area_height,
                    node: position.node,
                    position: position.position
                )

                area_top += area_height
            return null
        )

        @hit_areas = hit_areas

    iterateVisibleNodes: (handle_node, handle_open_folder, handle_closed_folder, handle_after_open_folder, handle_first_node) ->
        is_first_node = true

        iterate = (node, next_node) =>
            must_iterate_inside = (
                (node.is_open or not node.element) and node.hasChildren()
            )

            if node.element                
                $element = $(node.element)

                if not $element.is(':visible')
                    return

                if is_first_node
                    handle_first_node(node, $element)
                    is_first_node = false

                if not node.hasChildren()
                    handle_node(node, next_node, $element)
                else if node.is_open
                    if not handle_open_folder(node, $element)
                        must_iterate_inside = false
                else
                    handle_closed_folder(node, next_node, $element)

            if must_iterate_inside
                children_length = node.children.length
                for child, i in node.children
                    if i == (children_length-1)
                        iterate(node.children[i], null)
                    else
                        iterate(node.children[i], node.children[i+1])

                if node.is_open
                    handle_after_open_folder(node, next_node, $element)

        iterate(@tree_widget.tree)

    findHoveredArea: (x, y) ->
        tree_offset = @tree_widget.element.offset()
        if (
            x < tree_offset.left or
            y < tree_offset.top or
            x > (tree_offset.left + @tree_widget.element.width()) or
            y > (tree_offset.top + @tree_widget.element.height())
        )
            return null

        low = 0
        high = @hit_areas.length
        while (low < high)
            mid = (low + high) >> 1
            area = @hit_areas[mid]

            if y < area.top
                high = mid
            else if y > area.bottom
                low = mid + 1
            else
                return area

        return null

    mustOpenFolderTimer: (area) ->
        node = area.node

        return (
            node.isFolder() and
            not node.is_open and
            area.position == Position.INSIDE
        )

    updateDropHint: ->
        if not @hovered_area
            return

        # remove previous drop hint
        @removeDropHint()

        # add new drop hint
        node_element = @tree_widget._getNodeElementForNode(@hovered_area.node)
        @previous_ghost = node_element.addDropHint(@hovered_area.position)

    startOpenFolderTimer: (folder) ->
        openFolder = =>
            @tree_widget._openNode(
                folder,
                @tree_widget.options.slide,
                =>
                    @refreshHitAreas()
                    @updateDropHint()
            )

        @open_folder_timer = setTimeout(openFolder, 500)

    stopOpenFolderTimer: ->
        if @open_folder_timer
            clearTimeout(@open_folder_timer)
            @open_folder_timer = null

    moveItem: (position_info) ->
        if (
            @hovered_area and
            @hovered_area.position != Position.NONE and
            @canMoveToArea(@hovered_area)
        )
            moved_node = @current_item.node
            target_node = @hovered_area.node
            position = @hovered_area.position
            previous_parent = moved_node.parent

            if position == Position.INSIDE
                @hovered_area.node.is_open = true

            doMove = =>
                @tree_widget.tree.moveNode(moved_node, target_node, position)
                @tree_widget.element.empty()
                @tree_widget._refreshElements()

            event = @tree_widget._triggerEvent(
                'tree.move',
                move_info:
                    moved_node: moved_node
                    target_node: target_node
                    position: Position.getName(position)
                    previous_parent: previous_parent
                    do_move: doMove
                    original_event: position_info.original_event
            )

            doMove() unless event.isDefaultPrevented()


class DragElement
    constructor: (node, offset_x, offset_y, $tree) ->
        @offset_x = offset_x
        @offset_y = offset_y

        @$element = $("<span class=\"jqtree-title jqtree-dragging\">#{ node.name }</span>")
        @$element.css("position", "absolute")
        $tree.append(@$element)

    move: (page_x, page_y) ->
        @$element.offset(
            left: page_x - @offset_x,
            top: page_y - @offset_y
        )

    remove: ->
        @$element.remove()


class GhostDropHint
    constructor: (node, $element, position) ->
        @$element = $element

        @node = node
        @$ghost = $('<li class="jqtree_common jqtree-ghost"><span class="jqtree_common jqtree-circle"></span><span class="jqtree_common jqtree-line"></span></li>')

        if position == Position.AFTER
            @moveAfter()
        else if position == Position.BEFORE
            @moveBefore()
        else if position == Position.INSIDE
            if node.isFolder() and node.is_open
                @moveInsideOpenFolder()
            else
                @moveInside()

    remove: ->
        @$ghost.remove()

    moveAfter: ->
        @$element.after(@$ghost)

    moveBefore: ->
        @$element.before(@$ghost)

    moveInsideOpenFolder: ->
        $(@node.children[0].element).before(@$ghost)

    moveInside: ->
        @$element.after(@$ghost)
        @$ghost.addClass('jqtree-inside')


class BorderDropHint
    constructor: ($element) ->
        $div = $element.children('.jqtree-element')
        width = $element.width() - 4

        @$hint = $('<span class="jqtree-border"></span>')
        $div.append(@$hint)

        @$hint.css({
            width: width,
            height: $div.height() - 4
        })

    remove: ->
        @$hint.remove()