__version__ = require './version'
drag_and_drop_handler = require './drag_and_drop_handler'
ElementsRenderer = require './elements_renderer'
KeyHandler = require './key_handler'
MouseWidget = require './mouse.widget'
SaveStateHandler = require './save_state_handler'
ScrollHandler = require './scroll_handler'
SelectNodeHandler = require './select_node_handler'
SimpleWidget = require './simple.widget'

node_module = require './node'
Node = node_module.Node
Position = node_module.Position

util_module = require './util'

{BorderDropHint,FolderElement,GhostDropHint,NodeElement} = require './node_element'

{DragAndDropHandler, DragElement, HitAreasGenerator} = drag_and_drop_handler


$ = jQuery


class JqTreeWidget extends MouseWidget
    BorderDropHint: BorderDropHint
    DragElement: DragElement
    DragAndDropHandler: DragAndDropHandler
    ElementsRenderer: ElementsRenderer
    GhostDropHint: GhostDropHint
    HitAreasGenerator: HitAreasGenerator
    Node: Node
    SaveStateHandler: SaveStateHandler
    ScrollHandler: ScrollHandler
    SelectNodeHandler: SelectNodeHandler

    defaults:
        autoOpen: false  # true / false / int (open n levels starting at 0)
        saveState: false  # true / false / string (cookie name)
        dragAndDrop: false
        selectable: true
        useContextMenu: true
        onCanSelectNode: null
        onSetStateFromStorage: null
        onGetStateFromStorage: null
        onCreateLi: null
        onIsMoveHandle: null
        onCanMove: null  # Can this node be moved? function(node)
        onCanMoveTo: null  # Can this node be moved to this position? function(moved_node, target_node, position)
        onLoadFailed: null
        autoEscape: true
        dataUrl: null
        closedIcon: null  # The symbol to use for a closed node - ► BLACK RIGHT-POINTING POINTER  http://www.fileformat.info/info/unicode/char/25ba/index.htm
        openedIcon: '&#x25bc;'  # The symbol to use for an open node - ▼ BLACK DOWN-POINTING TRIANGLE  http://www.fileformat.info/info/unicode/char/25bc/index.htm
        slide: true  # must display slide animation?
        nodeClass: Node
        dataFilter: null
        keyboardSupport: true
        openFolderDelay: 500  # The delay for opening a folder during drag and drop; the value is in milliseconds
        rtl: null  # right-to-left support; true / false (default)
        onDragMove: null
        onDragStop: null
        buttonLeft: true
        onLoading: null

    toggle: (node, slide=null) ->
        if slide == null
            slide = @options.slide

        if node.is_open
            @closeNode(node, slide)
        else
            @openNode(node, slide)

        return @element

    getTree: ->
        return @tree

    selectNode: (node) ->
        @_selectNode(node, false)
        return @element

    _selectNode: (node, must_toggle=false) ->
        if not @select_node_handler
            return

        canSelect = =>
            if @options.onCanSelectNode
                return @options.selectable and @options.onCanSelectNode(node)
            else
                return @options.selectable

        openParents = =>
            parent = node.parent

            if parent and parent.parent and not parent.is_open
                @openNode(parent, false)

        saveState = =>
            if @options.saveState
                @save_state_handler.saveState()

        if not node
            # Called with empty node -> deselect current node
            @_deselectCurrentNode()
            saveState()
            return

        if not canSelect()
            return

        if @select_node_handler.isNodeSelected(node)
            if must_toggle
                @_deselectCurrentNode()
                @_triggerEvent(
                    'tree.select',
                    node: null,
                    previous_node: node
                )
        else
            deselected_node = @getSelectedNode()
            @_deselectCurrentNode()
            @addToSelection(node)
            @_triggerEvent('tree.select', node: node, deselected_node: deselected_node)
            openParents()

        saveState()

    getSelectedNode: ->
        if @select_node_handler
            return @select_node_handler.getSelectedNode()
        else
            return null

    toJson: ->
        return JSON.stringify(
            @tree.getData()
        )

    loadData: (data, parent_node) ->
        @_loadData(data, parent_node)
        return @element

    ###
    signatures:
    - loadDataFromUrl(url, parent_node=null, on_finished=null)
        loadDataFromUrl('/my_data');
        loadDataFromUrl('/my_data', node1);
        loadDataFromUrl('/my_data', node1, function() { console.log('finished'); });
        loadDataFromUrl('/my_data', null, function() { console.log('finished'); });

    - loadDataFromUrl(parent_node=null, on_finished=null)
        loadDataFromUrl();
        loadDataFromUrl(node1);
        loadDataFromUrl(null, function() { console.log('finished'); });
        loadDataFromUrl(node1, function() { console.log('finished'); });
    ###
    loadDataFromUrl: (param1, param2, param3) ->
        if $.type(param1) == 'string'
            # first parameter is url
            @_loadDataFromUrl(param1, param2, param3)
        else
            # first parameter is not url
            @_loadDataFromUrl(null, param1, param2)

        return @element

    reload: (on_finished) ->
        @_loadDataFromUrl(null, null, on_finished)
        return @element

    _loadDataFromUrl: (url_info, parent_node, on_finished) ->
        $el = null

        addLoadingClass = =>
            if parent_node
                $el = $(parent_node.element)
            else
                $el = @element

            $el.addClass('jqtree-loading')
            @_notifyLoading(true, parent_node, $el)

        removeLoadingClass = =>
            if $el
                $el.removeClass('jqtree-loading')

                @_notifyLoading(false, parent_node, $el)

        parseUrlInfo = ->
            if $.type(url_info) == 'string'
                return url: url_info

            if not url_info.method
                url_info.method = 'get'

            return url_info

        handeLoadData = (data) =>
            removeLoadingClass()
            @_loadData(data, parent_node)

            if on_finished and $.isFunction(on_finished)
                on_finished()

        handleSuccess = (response) =>
            if $.isArray(response) or typeof response == 'object'
                data = response
            else if data?
                data = $.parseJSON(response)
            else
                data = []

            if @options.dataFilter
                data = @options.dataFilter(data)

            handeLoadData(data)

        handleError = (response) =>
            removeLoadingClass()

            if @options.onLoadFailed
                @options.onLoadFailed(response)

        loadDataFromUrlInfo = ->
            url_info = parseUrlInfo()

            $.ajax(
                $.extend(
                    {},
                    url_info,
                    {
                        method: if url_info.method? then url_info.method.toUpperCase() else 'GET',
                        cache: false,
                        dataType: 'json',
                        success: handleSuccess,
                        error: handleError
                    }
                )
            )

        if not url_info
            # Generate url for node
            url_info = @_getDataUrlInfo(parent_node)

        addLoadingClass()

        if not url_info
            removeLoadingClass()
            return
        else if $.isArray(url_info)
            handeLoadData(url_info)
            return
        else
            loadDataFromUrlInfo()
            return

    _loadData: (data, parent_node=null) ->
        deselectNodes = =>
            if @select_node_handler
                selected_nodes_under_parent = @select_node_handler.getSelectedNodesUnder(parent_node)
                for n in selected_nodes_under_parent
                    @select_node_handler.removeFromSelection(n)

            return null

        loadSubtree = =>
            parent_node.loadFromData(data)

            parent_node.load_on_demand = false
            parent_node.is_loading = false

            @_refreshElements(parent_node)

        if not data
            return

        @_triggerEvent('tree.load_data', tree_data: data)

        if not parent_node
            @_initTree(data)
        else
            deselectNodes()
            loadSubtree()

        if @isDragging()
            @dnd_handler.refresh()

    getNodeById: (node_id) ->
        return @tree.getNodeById(node_id)

    getNodeByName: (name) ->
        return @tree.getNodeByName(name)

    getNodesByProperty: (key, value) ->
        return @tree.getNodesByProperty(key, value)

    getNodeByHtmlElement: (element) ->
        return @_getNode($(element))

    getNodeByCallback: (callback) ->
        return @tree.getNodeByCallback(callback)

    openNode: (node, slide=null) ->
        if slide == null
            slide = @options.slide

        @_openNode(node, slide)
        return @element

    _openNode: (node, slide=true, on_finished) ->
        doOpenNode = (_node, _slide, _on_finished) =>
            folder_element = new FolderElement(_node, this)
            folder_element.open(_on_finished, _slide)

        if node.isFolder()
            if node.load_on_demand
                @_loadFolderOnDemand(node, slide, on_finished)
            else
                parent = node.parent

                while parent
                    # nb: do not open root element
                    if parent.parent
                        doOpenNode(parent, false, null)
                    parent = parent.parent

                doOpenNode(node, slide, on_finished)
                @_saveState()

    _loadFolderOnDemand: (node, slide=true, on_finished) ->
        node.is_loading = true

        @_loadDataFromUrl(
            null,
            node,
            =>
                @_openNode(node, slide, on_finished)
        )

    closeNode: (node, slide=null) ->
        if slide == null
            slide = @options.slide

        if node.isFolder()
            new FolderElement(node, this).close(slide)

            @_saveState()

        return @element

    isDragging: ->
        if @dnd_handler
            return @dnd_handler.is_dragging
        else
            return false

    refreshHitAreas: ->
        @dnd_handler.refresh()
        return @element

    addNodeAfter: (new_node_info, existing_node) ->
        new_node = existing_node.addAfter(new_node_info)
        @_refreshElements(existing_node.parent)
        return new_node

    addNodeBefore: (new_node_info, existing_node) ->
        new_node = existing_node.addBefore(new_node_info)
        @_refreshElements(existing_node.parent)
        return new_node

    addParentNode: (new_node_info, existing_node) ->
        new_node = existing_node.addParent(new_node_info)
        @_refreshElements(new_node.parent)
        return new_node

    removeNode: (node) ->
        parent = node.parent
        if parent
            @select_node_handler.removeFromSelection(node, true)  # including children

            node.remove()
            @_refreshElements(parent)

        return @element

    appendNode: (new_node_info, parent_node) ->
        parent_node = parent_node or @tree

        node = parent_node.append(new_node_info)

        @_refreshElements(parent_node)

        return node

    prependNode: (new_node_info, parent_node) ->
        if not parent_node
            parent_node = @tree

        node = parent_node.prepend(new_node_info)

        @_refreshElements(parent_node)

        return node

    updateNode: (node, data) ->
        id_is_changed = data.id and data.id != node.id

        if id_is_changed
            @tree.removeNodeFromIndex(node)

        node.setData(data)

        if id_is_changed
            @tree.addNodeToIndex(node)

        if typeof data == 'object' and data.children and data.children.length
            node.removeChildren()
            node.loadFromData(data.children)

        @renderer.renderFromNode(node)
        @_selectCurrentNode()

        return @element

    moveNode: (node, target_node, position) ->
        position_index = Position.nameToIndex(position)

        @tree.moveNode(node, target_node, position_index)
        @_refreshElements()
        return @element

    getStateFromStorage: ->
        return @save_state_handler.getStateFromStorage()

    addToSelection: (node) ->
        if node
            @select_node_handler.addToSelection(node)

            @_getNodeElementForNode(node).select()
            @_saveState()

        return @element

    getSelectedNodes: ->
        return @select_node_handler.getSelectedNodes()

    isNodeSelected: (node) ->
        return @select_node_handler.isNodeSelected(node)

    removeFromSelection: (node) ->
        @select_node_handler.removeFromSelection(node)

        @_getNodeElementForNode(node).deselect()
        @_saveState()
        return @element

    scrollToNode: (node) ->
        $element = $(node.element)
        top = $element.offset().top - @$el.offset().top

        @scroll_handler.scrollTo(top)
        return @element

    getState: ->
        return @save_state_handler.getState()

    setState: (state) ->
        @save_state_handler.setInitialState(state)
        @_refreshElements()
        return @element

    setOption: (option, value) ->
        @options[option] = value
        return @element

    moveDown: ->
        if @key_handler
            @key_handler.moveDown()

        return @element

    moveUp: ->
        if @key_handler
            @key_handler.moveUp()

        return @element

    getVersion: ->
        return __version__

    _init: ->
        super()

        @element = @$el
        @mouse_delay = 300
        @is_initialized = false

        @options.rtl = @_getRtlOption()

        if !@options.closedIcon
            @options.closedIcon = @_getDefaultClosedIcon()

        @renderer = new ElementsRenderer(this)

        if SaveStateHandler?
            @save_state_handler = new SaveStateHandler(this)
        else
            @options.saveState = false

        if SelectNodeHandler?
            @select_node_handler = new SelectNodeHandler(this)

        if DragAndDropHandler?
            @dnd_handler = new DragAndDropHandler(this)
        else
            @options.dragAndDrop = false

        if ScrollHandler?
            @scroll_handler = new ScrollHandler(this)

        if KeyHandler? and SelectNodeHandler?
            @key_handler = new KeyHandler(this)

        @_initData()

        @element.click($.proxy(@_click, this))
        @element.dblclick($.proxy(@_dblclick, this))

        if @options.useContextMenu
            @element.bind('contextmenu', $.proxy(@_contextmenu, this))

    _deinit: ->
        @element.empty()
        @element.unbind()

        if @key_handler
            @key_handler.deinit()

        @tree = null

        super()

    _initData: ->
        if @options.data
            @_loadData(@options.data)
        else
            @_loadDataFromUrl(@_getDataUrlInfo())

    _getDataUrlInfo: (node) ->
        data_url = @options.dataUrl or @element.data('url')

        getUrlFromString = =>
            url_info = url: data_url

            if node and node.id
                # Load on demand of a subtree; add node parameter
                data = node: node.id
                url_info['data'] = data
            else
                # Add selected_node parameter
                selected_node_id = @_getNodeIdToBeSelected()
                if selected_node_id
                    data = selected_node: selected_node_id
                    url_info['data'] = data

            return url_info

        if $.isFunction(data_url)
            return data_url(node)
        else if $.type(data_url) == 'string'
            return getUrlFromString()
        else
            return data_url

    _getNodeIdToBeSelected: ->
        if @options.saveState
            return @save_state_handler.getNodeIdToBeSelected()
        else
            return null

    _initTree: (data) ->
        doInit = =>
            if not @is_initialized
                @is_initialized = true
                @_triggerEvent('tree.init')

        @tree = new @options.nodeClass(null, true, @options.nodeClass)

        if @select_node_handler
            @select_node_handler.clear()

        @tree.loadFromData(data)

        must_load_on_demand = @_setInitialState()

        @_refreshElements()

        if not must_load_on_demand
            doInit()
        else
            # Load data on demand and then init the tree
            @_setInitialStateOnDemand(doInit)

    # Set initial state, either by restoring the state or auto-opening nodes
    # result: must load nodes on demand?
    _setInitialState: ->
        restoreState = =>
            # result: is state restored, must load on demand?
            if not (@options.saveState and @save_state_handler)
                return [false, false]
            else
                state = @save_state_handler.getStateFromStorage()

                if not state
                    return [false, false]
                else
                    must_load_on_demand = @save_state_handler.setInitialState(state)

                    # return true: the state is restored
                    return [true, must_load_on_demand]

        autoOpenNodes = =>
            # result: must load on demand?
            if @options.autoOpen is false
                return false

            max_level = @_getAutoOpenMaxLevel()
            must_load_on_demand = false

            @tree.iterate (node, level) ->
                if node.load_on_demand
                    must_load_on_demand = true
                    return false
                else if not node.hasChildren()
                    return false
                else
                    node.is_open = true
                    return (level != max_level)

            return must_load_on_demand

        [is_restored, must_load_on_demand] = restoreState()

        if not is_restored
            must_load_on_demand = autoOpenNodes()

        return must_load_on_demand

    # Set the initial state for nodes that are loaded on demand
    # Call cb_finished when done
    _setInitialStateOnDemand: (cb_finished) ->
        restoreState = =>
            if not (@options.saveState and @save_state_handler)
                return false
            else
                state = @save_state_handler.getStateFromStorage()

                if not state
                    return false
                else
                    @save_state_handler.setInitialStateOnDemand(state, cb_finished)

                    return true

        autoOpenNodes = =>
            max_level = @_getAutoOpenMaxLevel()
            loading_count = 0

            loadAndOpenNode = (node) =>
                loading_count += 1
                @_openNode(
                    node,
                    false,
                    ->
                        loading_count -= 1
                        openNodes()
                )

            openNodes = =>
                @tree.iterate (node, level) =>
                    if node.load_on_demand
                        if not node.is_loading
                            loadAndOpenNode(node)

                        return false
                    else
                        @_openNode(node, false)

                        return (level != max_level)

                if loading_count == 0
                    cb_finished()

            openNodes()

        if not restoreState()
            autoOpenNodes()

    _getAutoOpenMaxLevel: ->
        if @options.autoOpen is true
            return -1
        else
            return parseInt(@options.autoOpen)

    ###
    Redraw the tree or part of the tree.
    # from_node: redraw this subtree
    ###
    _refreshElements: (from_node=null) ->
        @renderer.render(from_node)

        @_triggerEvent('tree.refresh')

    _click: (e) ->
        click_target = @_getClickTarget(e.target)

        if click_target
            if click_target.type == 'button'
                @toggle(click_target.node, @options.slide)

                e.preventDefault()
                e.stopPropagation()
            else if click_target.type == 'label'
                node = click_target.node
                event = @_triggerEvent(
                    'tree.click',
                        node: node
                        click_event: e
                )

                if not event.isDefaultPrevented()
                    @_selectNode(node, true)

    _dblclick: (e) ->
        click_target = @_getClickTarget(e.target)

        if click_target and click_target.type == 'label'
            @_triggerEvent(
                'tree.dblclick',
                    node: click_target.node
                    click_event: e
            )

    _getClickTarget: (element) ->
        $target = $(element)

        $button = $target.closest('.jqtree-toggler')

        if $button.length
            node = @_getNode($button)

            if node
                return {
                    type: 'button',
                    node: node
                }
        else
            $el = $target.closest('.jqtree-element')
            if $el.length
                node = @_getNode($el)
                if node
                    return {
                        type: 'label',
                        node: node
                    }

        return null

    _getNode: ($element) ->
        $li = $element.closest('li.jqtree_common')
        if $li.length == 0
            return null
        else
            return $li.data('node')

    _getNodeElementForNode: (node) ->
        if node.isFolder()
            return new FolderElement(node, this)
        else
            return new NodeElement(node, this)

    _getNodeElement: ($element) ->
        node = @_getNode($element)
        if node
            return @_getNodeElementForNode(node)
        else
            return null

    _contextmenu: (e) ->
        $div = $(e.target).closest('ul.jqtree-tree .jqtree-element')
        if $div.length
            node = @_getNode($div)
            if node
                e.preventDefault()
                e.stopPropagation()

                @_triggerEvent(
                    'tree.contextmenu',
                        node: node
                        click_event: e
                )
                return false

    _saveState: ->
        if @options.saveState
            @save_state_handler.saveState()

    _mouseCapture: (position_info) ->
        if @options.dragAndDrop
            return @dnd_handler.mouseCapture(position_info)
        else
            return false

    _mouseStart: (position_info) ->
        if @options.dragAndDrop
            return @dnd_handler.mouseStart(position_info)
        else
            return false

    _mouseDrag: (position_info) ->
        if @options.dragAndDrop
            result = @dnd_handler.mouseDrag(position_info)

            if @scroll_handler
                @scroll_handler.checkScrolling()
            return result
        else
            return false

    _mouseStop: (position_info) ->
        if @options.dragAndDrop
            return @dnd_handler.mouseStop(position_info)
        else
            return false

    _triggerEvent: (event_name, values) ->
        event = $.Event(event_name)
        $.extend(event, values)

        @element.trigger(event)
        return event

    testGenerateHitAreas: (moving_node) ->
        @dnd_handler.current_item = @_getNodeElementForNode(moving_node)
        @dnd_handler.generateHitAreas()
        return @dnd_handler.hit_areas

    _selectCurrentNode: ->
        node = @getSelectedNode()
        if node
            node_element = @_getNodeElementForNode(node)
            if node_element
                node_element.select()

    _deselectCurrentNode: ->
        node = @getSelectedNode()
        if node
            @removeFromSelection(node)

    _getDefaultClosedIcon: ->
        if @options.rtl
            # triangle to the left
            return '&#x25c0;'
        else
            # triangle to the right
            return '&#x25ba;'

    _getRtlOption: ->
        if @options.rtl != null
            return @options.rtl
        else
            data_rtl = @element.data('rtl')

            if data_rtl? and data_rtl != false
                return true
            else
                return false

    _notifyLoading: (is_loading, node, $el) ->
        if @options.onLoading
            @options.onLoading(is_loading, node, $el)


JqTreeWidget.getModule = (name) ->
    modules =
        'node': node_module
        'util': util_module
        'drag_and_drop_handler': drag_and_drop_handler

    return modules[name]


SimpleWidget.register(JqTreeWidget, 'tree')
