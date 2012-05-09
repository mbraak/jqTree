###
Copyright 2012 Marco Braak

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
###

@Tree = {}
$ = @jQuery

# Standard javascript indexOf. Implemented here because not all browsers support it.
indexOf = (array, item) ->
    if array.indexOf
        # The browser supports indexOf
        return array.indexOf(item)
    else
        # Do our own indexOf
        for value, i in array
            if value == item
                return i
        return -1

@Tree.indexOf = indexOf

# toJson function; copied from jsons2
Json = {}
Json.escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g
Json.meta = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"' : '\\"',
    '\\': '\\\\'
}

Json.quote = (string) ->
    Json.escapable.lastIndex = 0

    if Json.escapable.test(string)
        return '"' + string.replace(Json.escapable, (a) ->
            c = Json.meta[a]
            return (
                if typeof c is 'string' then c
                else '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4)
            )
        ) + '"'
    else
        return '"' + string + '"'

Json.str = (key, holder) ->
    value = holder[key]

    switch typeof value
        when 'string'
            return Json.quote(value)

        when 'number'
            return if isFinite(value) then String(value) else 'null'

        when 'boolean', 'null'
            return String(value)

        when 'object'
            if not value
                return 'null'

            partial = []
            if Object.prototype.toString.apply(value) is '[object Array]'
                for v, i in value
                    partial[i] = Json.str(i, value) or 'null'

                return (
                    if partial.length is 0 then '[]'
                    else '[' + partial.join(',') + ']'
                )

            for k of value
                if Object.prototype.hasOwnProperty.call(value, k)
                    v = Json.str(k, value)
                    if v
                        partial.push(Json.quote(k) + ':' + v)

            return (
                if partial.length is 0 then '{}'
                else '{' + partial.join(',') + '}'
            )

toJson = (value) ->
    return Json.str(
        '',
        {'': value}
    )

@Tree.toJson = toJson

Position =
    getName: (position) ->
        if position == Position.BEFORE
            return 'before'
        else if position == Position.AFTER
            return 'after'
        else if position == Position.INSIDE
            return 'inside'
        else
            return 'none'

Position.BEFORE = 1
Position.AFTER = 2
Position.INSIDE = 3
Position.NONE = 4

@Tree.Position = Position

class Node
    constructor: (name) ->
        @init(name)

    init: (name) ->
        @name = name
        @children = []
        @parent = null

    # Init Node from data without making it the root of the tree
    initFromData: (data) ->
        addNode = (node_data) =>
            if typeof node_data != 'object'
                @['name'] = node_data
            else
                $.each(node_data, (key, value) =>
                    if key == 'children'
                        addChildren(value)
                    else if key == 'label'
                        @['name'] = value
                    else
                        @[key] = value

                    return true
                )

        addChildren = (children_data) =>
            for child in children_data
                node = new Node()
                node.initFromData(child)
                @addChild(node)
            return null

        addNode(data)
        return null

    ###
    Create tree from data.

    Structure of data is:
    [
        {
            label: 'node1',
            children: [
                { label: 'child1' },
                { label: 'child2' }
            ]
        },
        {
            label: 'node2'
        }
    ]
    ###
    loadFromData: (data) ->
        @children = []

        for o in data
            if typeof o != 'object'
                node = new Node(o)
                @addChild(node)
            else
                # todo: node property is 'name', but we use 'label' here
                node = new Node(o.label)

                $.each(o, (key, value) =>
                    if key != 'label'
                        node[key] = value
                    return true
                )

                @addChild(node)

                if o.children
                    node.loadFromData(o.children)

        return null

    ###
    Add child.

    tree.addChild(
        new Node('child1')
    );
    ###
    addChild: (node) ->
        @children.push(node)
        node.parent = this

    ###
    Add child at position. Index starts at 0.

    tree.addChildAtPosition(
        new Node('abc'),
        1
    );
    ###
    addChildAtPosition: (node, index) ->
        @children.splice(index, 0, node)
        node.parent = this

    ###
    Remove child.

    tree.removeChile(tree.children[0]);
    ###
    removeChild: (node) ->
        @children.splice(
            @getChildIndex(node),
            1
        )

    ###
    Get child index.

    var index = getChildIndex(node);
    ###
    getChildIndex: (node) ->
        return $.inArray(node, @children)

    ###
    Does the tree have children?

    if (tree.hasChildren()) {
        //
    }
    ###
    hasChildren: ->
        return @children.length != 0

    ###
    Iterate over all the nodes in the tree.

    Calls callback with (node, level).

    The callback must return true to continue the iteration on current node.

    tree.iterate(
        function(node, level) {
           console.log(node.name);

           // stop iteration after level 2
           return (level <= 2);
        }
    );

    ###
    iterate: (callback) ->
        _iterate = (node, level) =>
            for child in node.children
                result = callback(child, level)

                if @hasChildren() and result
                    _iterate(child, level + 1)
            return null

        _iterate(this, 0)
        return null

    ###
    Move node relative to another node.

    Argument position: Position.BEFORE, Position.AFTER or Position.Inside

    // move node1 after node2
    tree.moveNode(node1, node2, Position.AFTER);
    ###
    moveNode: (moved_node, target_node, position) ->
        # todo: check for illegal move
        moved_node.parent.removeChild(moved_node)
        if position == Position.AFTER
            target_node.parent.addChildAtPosition(
                moved_node,
                target_node.parent.getChildIndex(target_node) + 1
            )
        else if position == Position.BEFORE
            target_node.parent.addChildAtPosition(
                moved_node,
                target_node.parent.getChildIndex(target_node)
            )
        else if position == Position.INSIDE
            # move inside as first child
            target_node.addChildAtPosition(moved_node, 0)

    ###
    Get the tree as data.
    ###
    getData: ->
        getDataFromNodes = (nodes) =>
            data = []

            for node in nodes
                tmp_node = {}

                for k, v of node
                    if (
                        k not in ['parent', 'children', 'element'] and
                        Object.prototype.hasOwnProperty.call(node, k)
                    )
                        tmp_node[k] = v

                if node.hasChildren()
                    tmp_node.children = getDataFromNodes(node.children)

                data.push(tmp_node)

            return data

        return getDataFromNodes(@children)

@Tree.Tree = Node


class JqTreeWidget extends MouseWidget
    defaults:
        autoOpen: false  # true / false / int (open n levels starting at 0)
        saveState: false  # true / false / string (cookie name)
        dragAndDrop: false
        selectable: false
        onCanSelectNode: null
        onSetStateFromStorage: null
        onGetStateFromStorage: null
        onCreateLi: null
        onIsMoveHandle: null
        onCanMove: null  # Can this node be moved? function(node)
        onCanMoveTo: null  # Can this node be moved to this position? function(moved_node, target_node, position)

    toggle: (node) ->
        if node.hasChildren()
            new FolderElement(node, @element).toggle()

        if @options.saveState
            @_saveState()

    getTree: ->
        return @tree

    selectNode: (node, must_open_parents) ->
        if @options.selectable
            if @selected_node
                @_getNodeElementForNode(@selected_node).deselect()

            @_getNodeElementForNode(node).select()
            @selected_node = node

            if must_open_parents
                parent = @selected_node.parent

                while parent
                    if not parent.is_open
                        this.openNode(parent, true)

                    parent = parent.parent

            if @options.saveState
                @_saveState()

    getSelectedNode: ->
        return @selected_node or false

    toJson: ->
        return toJson(
            @tree.getData()
        )

    loadData: (data, parent_node) ->
        if not parent_node
            @_initTree(data)
        else
            subtree = new Node()
            subtree.loadFromData(data)

            for child in subtree.children
                parent_node.addChild(child)

            $element = $(parent_node.element)
            $element.children('ul').detach()
            @_createDomElements(parent_node, $element)

            $div = $element.children('div')

            if not $div.find('.toggler').length
                $div.prepend('<a class="toggler">&raquo;</a>')

        if @is_dragging
            @_refreshHitAreas()

    getNodeById: (node_id) ->
        result = null

        @tree.iterate(
            (node) ->
                if node.id == node_id
                    result = node
                    return false  # stop iterating
                else
                    return true
        )

        return result

    openNode: (node, skip_slide) ->
        if node.hasChildren()
            new FolderElement(node, @element).open(null, skip_slide)

            if @options.saveState
                @_saveState()

    closeNode: (node, skip_slide) ->
        if node.hasChildren()
            new FolderElement(node, @element).close(skip_slide)

            if @options.saveState
                @_saveState()

    isDragging: ->
        return @is_dragging

    refreshHitAreas: ->
        @_refreshHitAreas()

    _init: ->
        super

        @element = @$el
        @_initTree(@options.data)

        @element.click($.proxy(@_click, this))
        @element.bind('contextmenu', $.proxy(@_contextmenu, this))

        @hovered_area = null
        @$ghost = null
        @hit_areas = []
        @is_dragging = false

    _deinit: ->
        @element.empty()
        @element.unbind()
        @tree = null

        super

    _initTree: (data) ->
        @tree = new Node()
        @tree.loadFromData(data)

        @selected_node = null
        @_openNodes()

        @_createDomElements(@tree)

        if @selected_node
            node_element = @_getNodeElementForNode(@selected_node)
            if node_element
                node_element.select()

    _openNodes: ->
        if @options.saveState
            if @_restoreState()
                return

        if @options.autoOpen is false
            return
        else if @options.autoOpen is true
            max_level = -1
        else
            max_level = parseInt(@options.autoOpen)

        @tree.iterate((node, level) ->
            node.is_open = true
            return (level != max_level)
        )

    _createDomElements: (tree, $element) ->
        createUl = (depth, is_open) =>
            if depth
                class_string = ''
            else
                class_string = ' class="tree"'

            return $("<ul#{ class_string }></ul>")

        createLi = (node) =>
            if node.hasChildren()
                $li = createFolderLi(node)
            else
                $li = createNodeLi(node)

            if @options.onCreateLi
                @options.onCreateLi(node, $li)

            return $li

        createNodeLi = (node) =>
            return $("<li><div><span class=\"title\">#{ node.name }</span></div></li>")

        createFolderLi = (node) =>
            getButtonClass = ->
                classes = ['toggler']

                if not node.is_open
                    classes.push('closed')

                return classes.join(' ')

            getFolderClass = ->
                classes = ['folder']

                if not node.is_open
                    classes.push('closed')

                return classes.join(' ')

            button_class = getButtonClass()
            folder_class = getFolderClass()

            return $(
                "<li class=\"#{ folder_class }\"><div><a class=\"#{ button_class }\">&raquo;</a><span class=\"title\">#{ node.name }</span></div></li>"
            )

        doCreateDomElements = ($element, children, depth, is_open) ->
            $ul = createUl(depth, is_open)
            $element.append($ul)

            for child in children
                $li = createLi(child)
                $ul.append($li)

                child.element = $li[0]
                $li.data('node', child)

                if child.hasChildren()
                    doCreateDomElements($li, child.children, depth + 1, child.is_open)
            return null

        if $element
            depth = 1
        else
            $element = @element
            $element.empty()
            depth = 0

        doCreateDomElements($element, tree.children, depth, true)

    _click: (e) ->
        if e.ctrlKey
            return

        $target = $(e.target)

        if $target.is('.toggler')
            node_element = @_getNodeElement($target)
            if node_element and node_element.node.hasChildren()
                node_element.toggle()

                if @options.saveState
                    @_saveState()

                e.preventDefault()
                e.stopPropagation()
        else if $target.is('div') or $target.is('span')
            node = @_getNode($target)
            if node
                if (
                    (not @options.onCanSelectNode) or
                    @options.onCanSelectNode(node)
                )
                    @selectNode(node)

                    event = $.Event('tree.click')
                    event.node = node
                    @element.trigger(event)

    _getNode: ($element) ->
        $li = $element.closest('li')
        if $li.length == 0
            return null
        else
            return $li.data('node')

    _restoreState: ->
        if @options.onGetStateFromStorage
            state = @options.onGetStateFromStorage()
        else if localStorage
            state = localStorage.getItem(
                @_getCookieName()
            )
        else if $.cookie
            state = $.cookie(
                @_getCookieName(),
                {path: '/'}
            )
        else
            state = null

        if not state
            return false
        else
            @_setState(state)
            return true

    _saveState: ->
        if @options.onSetStateFromStorage
            @options.onSetStateFromStorage(@_getState())
        else if localStorage
            localStorage.setItem(
                @_getCookieName(),
                @_getState()
            )
        else if $.cookie
            $.cookie(
                @_getCookieName(),
                @_getState(),
                {path: '/'}
            )

    _getState: ->
        open_nodes = []

        @tree.iterate((node) =>
            if (
                node.is_open and
                node.id and
                node.hasChildren()
            )
                open_nodes.push(node.id)
            return true
        )

        selected_node = ''
        if @selected_node
            selected_node = @selected_node.id

        return toJson(
            open_nodes: open_nodes,
            selected_node: selected_node
        )

    _setState: (state) ->
        data = $.parseJSON(state)
        if data
            open_nodes = data.open_nodes
            selected_node_id = data.selected_node

            @tree.iterate((node) =>
                if (
                    node.id and
                    node.hasChildren() and
                    (indexOf(open_nodes, node.id) >= 0)
                )
                    node.is_open = true

                if selected_node_id and (node.id == selected_node_id)
                    @selected_node = node

                return true
            )

    _getCookieName: ->
        if typeof @options.saveState is 'string'
            return @options.saveState
        else
            return 'tree'

    _getNodeElementForNode: (node) ->
        if node.hasChildren()
            return new FolderElement(node, @element)
        else
            return new NodeElement(node, @element)

    _getNodeElement: ($element) ->
        node = @_getNode($element)
        if node
            return @_getNodeElementForNode(node)
        else
            return null

    _contextmenu: (e) ->
        $div = $(e.target).closest('ul.tree div')
        if $div.length
            node = @_getNode($div)
            if node
                e.preventDefault()
                e.stopPropagation()

                event = $.Event('tree.contextmenu')
                event.node = node
                event.click_event = e
                @element.trigger(event)
                return false

    _mouseCapture: (event) ->
        if not @options.dragAndDrop
            return

        $element = $(event.target)
        if @options.onIsMoveHandle and not @options.onIsMoveHandle($element)
            return null

        node_element = @_getNodeElement($(event.target))

        if node_element and @options.onCanMove
            if not @options.onCanMove(node_element.node)
                node_element = null

        @current_item = node_element
        return (@current_item != null)

    _mouseStart: (event) ->
        if not @options.dragAndDrop
            return

        @_refreshHitAreas()

        [offsetX, offsetY] = @_getOffsetFromEvent(event)

        @drag_element = new DragElement(
            @current_item.node
            offsetX,
            offsetY,
            @element
        )

        @is_dragging = true
        @current_item.$element.addClass('moving')
        return true

    _mouseDrag: (event) ->
        if not @options.dragAndDrop
            return

        @drag_element.move(event.pageX, event.pageY)

        area = @_findHoveredArea(event.pageX, event.pageY)

        if area and @options.onCanMoveTo
            position_name = Position.getName(area.position)

            if not @options.onCanMoveTo(@current_item.node, area.node, position_name)
                area = null

        if not area
            @_removeDropHint()
            @_removeHover()
            @_stopOpenFolderTimer()
        else
            if @hovered_area != area
                @hovered_area = area

                @_updateDropHint()

        return true

    _mouseStop: ->
        if not @options.dragAndDrop
            return

        @_moveItem()
        @_clear()
        @_removeHover()
        @_removeDropHint()
        @_removeHitAreas()

        @current_item.$element.removeClass('moving')
        @is_dragging = false

        return false

    _refreshHitAreas: ->
        @_removeHitAreas()
        @_generateHitAreas()

    _generateHitAreas: ->
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
                @element.offset().top + @element.height()
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

        @_iterateVisibleNodes(
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

    testGenerateHitAreas: (moving_node) ->
        @current_item = @_getNodeElementForNode(moving_node)
        @_generateHitAreas()
        return @hit_areas

    _removeHitAreas: ->
        @hit_areas = []

    _iterateVisibleNodes: (handle_node, handle_open_folder, handle_closed_folder, handle_after_open_folder, handle_first_node) ->
        is_first_node = true

        iterate = (node, next_node) =>
            must_iterate_inside = (
                (node.is_open or  not node.element) and node.hasChildren()
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

        iterate(@tree)

    _getOffsetFromEvent: (event) ->
        element_offset = $(event.target).offset()
        return [
            event.pageX - element_offset.left,
            event.pageY - element_offset.top
        ]

    _findHoveredArea: (x, y) ->
        tree_offset = @element.offset()
        if (
            x < tree_offset.left or
            y < tree_offset.top or
            x > (tree_offset.left + @element.width()) or
            y > (tree_offset.top + @element.height())
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

    _updateDropHint: ->
        # stop open folder timer
        @_stopOpenFolderTimer()

        if not @hovered_area
            return

        # if this is a closed folder, start timer to open it
        node = @hovered_area.node
        if (
            node.hasChildren() and
            not node.is_open and
            @hovered_area.position == Position.INSIDE
        )
            @_startOpenFolderTimer(node)

        # remove previous drop hint
        @_removeDropHint()

        # add new drop hint
        node_element = @_getNodeElementForNode(@hovered_area.node)
        @previous_ghost = node_element.addDropHint(@hovered_area.position)

    _startOpenFolderTimer: (folder) ->
        openFolder = =>
            @_getNodeElementForNode(folder).open(
                =>
                    @_refreshHitAreas()
                    @_updateDropHint()
            )

        @open_folder_timer = setTimeout(openFolder, 500)

    _stopOpenFolderTimer: ->
        if @open_folder_timer
            clearTimeout(@open_folder_timer)
            @open_folder_timer = null

    _removeDropHint: ->
        if @previous_ghost
            @previous_ghost.remove()

    _removeHover: ->
        @hovered_area = null

    _moveItem: ->
        if (
            @hovered_area and
            @hovered_area.position != Position.NONE
        )
            moved_node = @current_item.node
            target_node = @hovered_area.node
            position = @hovered_area.position
            previous_parent = moved_node.parent

            if position == Position.INSIDE
                @hovered_area.node.is_open = true

            doMove = =>
              @tree.moveNode(moved_node, target_node, position)
              @element.empty()
              @_createDomElements(@tree)

            event = $.Event('tree.move')
            event.move_info =
                moved_node: moved_node
                target_node: target_node
                position: Position.getName(position)
                previous_parent: previous_parent
                do_move: doMove

            @element.trigger(event)
            doMove() unless event.isDefaultPrevented()

    _clear: ->
        @drag_element.remove()
        @drag_element = null

SimpleWidget.register(JqTreeWidget, 'tree')


class GhostDropHint
    constructor: (node, $element, position) ->
        @$element = $element

        @node = node
        @$ghost = $('<li class="ghost"><span class="circle"></span><span class="line"></span></li>')

        if position == Position.AFTER
            @moveAfter()
        else if position == Position.BEFORE
            @moveBefore()
        else if position == Position.INSIDE
            if node.hasChildren() and node.is_open
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
        @$ghost.addClass('inside')


class BorderDropHint
    constructor: ($element) ->
        $div = $element.children('div')
        width = $element.width() - 4

        @$hint = $('<span class="border"></span>')
        $div.append(@$hint)

        @$hint.css({
            width: width,
            height: $div.height() - 4
        })

    remove: ->
        @$hint.remove()


class NodeElement
    constructor: (node, tree_element) ->
        @init(node, tree_element)

    init: (node, tree_element) ->
        @node = node
        @tree_element = tree_element
        @$element = $(node.element)

    getUl: ->
        return @$element.children('ul:first')

    getSpan: ->
        return @$element.children('div').find('span.title')

    getLi: ->
        return @$element

    addDropHint: (position) ->
        if position == Position.INSIDE
            return new BorderDropHint(@$element)
        else
            return new GhostDropHint(@node, @$element, position)

    select: ->
        @getLi().addClass('selected')

    deselect: ->
        @getLi().removeClass('selected')


class FolderElement extends NodeElement
    toggle: ->
        if @node.is_open
            @close()
        else
            @open()

    open: (on_finished, skip_slide) ->
        if not @node.is_open
            @node.is_open = true
            @getButton().removeClass('closed')

            doOpen = =>
                @getLi().removeClass('closed')
                if on_finished
                    on_finished()

                event = $.Event('tree.open')
                event.node = @node
                @tree_element.trigger(event)

            if skip_slide
                @getUl().show()
                doOpen()
            else
                @getUl().slideDown('fast', doOpen)

    close: (skip_slide) ->
        if @node.is_open
            @node.is_open = false
            @getButton().addClass('closed')

            doClose = =>
                @getLi().addClass('closed')

                event = $.Event('tree.close')
                event.node = @node
                @tree_element.trigger(event)

            if skip_slide
                @getUl().hide()
                doClose()
            else
                @getUl().slideUp('fast', doClose)

    getButton: ->
        return @$element.children('div').find('a.toggler')

    addDropHint: (position) ->
        if not this.node.is_open and position == Position.INSIDE
            return new BorderDropHint(@$element)
        else
            return new GhostDropHint(@node, @$element, position)


class DragElement
    constructor: (node, offset_x, offset_y, $tree) ->
        @offset_x = offset_x
        @offset_y = offset_y

        @$element = $("<span class=\"title tree-dragging\">#{ node.name }</span>")
        @$element.css("position", "absolute")
        $tree.append(@$element)

    move: (page_x, page_y) ->
        @$element.offset(
            left: page_x - @offset_x,
            top: page_y - @offset_y
        )

    remove: ->
        @$element.remove()


@Tree.Node = Node
