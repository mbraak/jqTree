
###
Copyright 2013 Marco Braak

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

class JqTreeWidget extends MouseWidget
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
        closedIcon: '&#x25ba;'  # The symbol to use for a closed node - ► BLACK RIGHT-POINTING POINTER  http://www.fileformat.info/info/unicode/char/25ba/index.htm
        openedIcon: '&#x25bc;'  # The symbol to use for an open node - ▼ BLACK DOWN-POINTING TRIANGLE  http://www.fileformat.info/info/unicode/char/25bc/index.htm
        slide: true  # must display slide animation?
        nodeClass: Node

    toggle: (node, slide=true) ->
        if node.is_open
            @closeNode(node, slide)
        else
            @openNode(node, slide)
    
    getTree: ->
        return @tree

    selectNode: (node) ->
        @_selectNode(node, true)

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
            @_deselectCurrentNode()
            @addToSelection(node)
            @_triggerEvent('tree.select', node: node)
            openParents()

        saveState()

    getSelectedNode: ->
        return @select_node_handler.getSelectedNode()

    toJson: ->
        return JSON.stringify(
            @tree.getData()
        )

    loadData: (data, parent_node) ->
        @_loadData(data, parent_node)

    loadDataFromUrl: (url, parent_node, on_finished) ->
        if $.type(url) != 'string'
            # Url parameter is omitted
            on_finished = parent_node
            parent_node = url
            url = null

        @_loadDataFromUrl(url, parent_node, on_finished)

    _loadDataFromUrl: (url_info, parent_node, on_finished) ->
        $el = null

        addLoadingClass = =>
            if not parent_node
                $el = @element
            else
                folder_element = new FolderElement(parent_node, this)
                $el = folder_element.getLi()

            $el.addClass('jqtree-loading')

        removeLoadingClass = =>
            if $el
                $el.removeClass('jqtree-loading')

        parseUrlInfo = =>
            if $.type(url_info) == 'string'
                url_info = url: url_info

            if not url_info.method
                url_info.method = 'get'

        addLoadingClass()

        if not url_info
            # Generate url for node
            url_info = @_getDataUrlInfo(parent_node)

        parseUrlInfo()

        $.ajax(
            url: url_info.url
            data: url_info.data
            type: url_info.method.toUpperCase()
            cache: false
            dataType: 'json'
            success: (response) =>
                if $.isArray(response) or typeof response == 'object'
                    data = response
                else
                    data = $.parseJSON(response)

                removeLoadingClass()                
                @_loadData(data, parent_node)

                if on_finished and $.isFunction(on_finished)
                    on_finished()
            error: (response) =>
                removeLoadingClass()

                if @options.onLoadFailed
                    @options.onLoadFailed(response)
        )

    _loadData: (data, parent_node) ->
        @_triggerEvent('tree.load_data', tree_data: data)

        if not parent_node
            @_initTree(data)
        else
            selected_nodes_under_parent = @select_node_handler.getSelectedNodes(parent_node)
            for n in selected_nodes_under_parent
                @select_node_handler.removeFromSelection(n)

            parent_node.loadFromData(data)
            parent_node.load_on_demand = false
            @_refreshElements(parent_node.parent)

        if @is_dragging
            @dnd_handler.refreshHitAreas()

    getNodeById: (node_id) ->
        return @tree.getNodeById(node_id)

    getNodeByName: (name) ->
        return @tree.getNodeByName(name)

    openNode: (node, slide=true) ->
        @_openNode(node, slide)

    _openNode: (node, slide=true, on_finished) ->
        doOpenNode = (_node, _slide, _on_finished) =>
            folder_element = new FolderElement(_node, this)
            folder_element.open(_on_finished, _slide)

        if node.isFolder()
            if node.load_on_demand
                @_loadFolderOnDemand(node, slide, on_finished)
            else
                parent = node.parent

                while parent and not parent.is_open
                    # nb: do not open root element
                    if parent.parent
                        doOpenNode(parent, false, null)
                    parent = parent.parent

                doOpenNode(node, slide, on_finished)
                @_saveState()

    _loadFolderOnDemand: (node, slide=true, on_finished) ->
        @_loadDataFromUrl(
            null,
            node,
            =>
                @_openNode(node, slide, on_finished)
        )

    closeNode: (node, slide=true) ->
        if node.isFolder()
            new FolderElement(node, this).close(slide)

            @_saveState()

    isDragging: ->
        return @is_dragging

    refreshHitAreas: ->
        @dnd_handler.refreshHitAreas()

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
            @_refreshElements(parent.parent)

    appendNode: (new_node_info, parent_node) ->
        if not parent_node
            parent_node = @tree

        # Is the parent already a root node?
        is_already_root_node = parent_node.isFolder()

        node = parent_node.append(new_node_info)

        if is_already_root_node
            # Refresh the parent
            @_refreshElements(parent_node)
        else
            # Refresh the parent of the parent. This must be done so the parent gets a toggler button
            @_refreshElements(parent_node.parent)

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

        @_refreshElements(node.parent)
        @._selectCurrentNode()

    moveNode: (node, target_node, position) ->
        position_index = Position.nameToIndex(position)

        @tree.moveNode(node, target_node, position_index)
        @_refreshElements()

    getStateFromStorage: ->
        return @save_state_handler.getStateFromStorage()

    addToSelection: (node) ->
        @select_node_handler.addToSelection(node)

        @_getNodeElementForNode(node).select()

    getSelectedNodes: ->
        return @select_node_handler.getSelectedNodes()

    isNodeSelected: (node) ->
        return @select_node_handler.isNodeSelected(node)

    removeFromSelection: (node) ->
        @select_node_handler.removeFromSelection(node)

        @_getNodeElementForNode(node).deselect()

    scrollToNode: (node) ->
        $element = $(node.element)
        top = $element.offset().top - @$el.offset().top

        @scroll_handler.scrollTo(top)

    getState: ->
        return @save_state_handler.getState()

    setState: (state) ->
        @save_state_handler.setState(state)
        @_refreshElements()

    _init: ->
        super()

        @element = @$el
        @mouse_delay = 300
        @is_initialized = false

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
        if @options.useContextMenu
            @element.bind('contextmenu', $.proxy(@_contextmenu, this))


    _deinit: ->
        @element.empty()
        @element.unbind()
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

        if $.isFunction(data_url)
            return data_url(node)
        else if $.type(data_url) == 'string'
            url_info = url: data_url
            if node and node.id
                data = node: node.id
                url_info['data'] = data

            return url_info
        else
            return data_url

    _initTree: (data) ->
        @tree = new @options.nodeClass(null, true, @options.nodeClass)

        if @select_node_handler
            @select_node_handler.clear()

        @tree.loadFromData(data)

        @_openNodes()
        @_refreshElements()

        if not @is_initialized
            @is_initialized = true
            @_triggerEvent('tree.init')

    _openNodes: ->
        if @options.saveState
            if @save_state_handler.restoreState()
                return

        if @options.autoOpen is false
            return
        else if @options.autoOpen is true
            max_level = -1
        else
            max_level = parseInt(@options.autoOpen)

        @tree.iterate((node, level) ->
            if node.hasChildren()
                node.is_open = true
            return (level != max_level)
        )

    _refreshElements: (from_node=null) ->
        escapeIfNecessary = (value) =>
            if @options.autoEscape
                return html_escape(value)
            else
                return value

        createUl = (is_root_node) =>
            if is_root_node
                class_string = 'jqtree-tree'
            else
                class_string = ''

            return $("<ul class=\"jqtree_common #{ class_string }\"></ul>")

        createLi = (node) =>
            if node.isFolder()
                $li = createFolderLi(node)
            else
                $li = createNodeLi(node)

            if @options.onCreateLi
                @options.onCreateLi(node, $li)

            return $li

        createNodeLi = (node) =>
            li_classes = ['jqtree_common']

            if @select_node_handler and @select_node_handler.isNodeSelected(node)
                li_classes.push('jqtree-selected')

            class_string = li_classes.join(' ')

            escaped_name = escapeIfNecessary(node.name)
            return $(
                "<li class=\"#{ class_string }\"><div class=\"jqtree-element jqtree_common\"><span class=\"jqtree-title jqtree_common\">#{ escaped_name }</span></div></li>"
            )

        createFolderLi = (node) =>
            getButtonClasses = ->
                classes = ['jqtree-toggler']

                if not node.is_open
                    classes.push('jqtree-closed')

                return classes.join(' ')

            getFolderClasses = =>
                classes = ['jqtree-folder']

                if not node.is_open
                    classes.push('jqtree-closed')

                if @select_node_handler and @select_node_handler.isNodeSelected(node)
                    classes.push('jqtree-selected')

                return classes.join(' ')

            button_classes = getButtonClasses()
            folder_classes = getFolderClasses()

            escaped_name = escapeIfNecessary(node.name)

            if node.is_open
                button_char = @options.openedIcon
            else
                button_char = @options.closedIcon

            return $(
                "<li class=\"jqtree_common #{ folder_classes }\"><div class=\"jqtree-element jqtree_common\"><a class=\"jqtree_common #{ button_classes }\">#{ button_char }</a><span class=\"jqtree_common jqtree-title\">#{ escaped_name }</span></div></li>"
            )

        doCreateDomElements = ($element, children, is_root_node, is_open) ->
            $ul = createUl(is_root_node)
            $element.append($ul)

            for child in children
                $li = createLi(child)
                $ul.append($li)

                child.element = $li[0]
                $li.data('node', child)

                if child.hasChildren()
                    doCreateDomElements($li, child.children, false, child.is_open)

            return null

        if from_node and from_node.parent
            is_root_node = false
            node_element = @_getNodeElementForNode(from_node)
            node_element.getUl().remove()
            $element = node_element.$element
        else
            from_node = @tree
            $element = @element
            $element.empty()
            is_root_node = true

        doCreateDomElements($element, from_node.children, is_root_node, is_root_node)

        @_triggerEvent('tree.refresh')

    _click: (e) ->
        $target = $(e.target)

        $button = $target.closest('.jqtree-toggler')
        if $button.length
            node = @_getNode($button)

            if node
                @toggle(node, @options.slide)

                e.preventDefault()
                e.stopPropagation()
        else
            $el = $target.closest('.jqtree-element')
            if $el.length
                node = @_getNode($el)
                if node
                    event = @_triggerEvent('tree.click', node: node)

                    if not event.isDefaultPrevented()
                        @_selectNode(node, true)

    _getNode: ($element) ->
        $li = $element.closest('li')
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

SimpleWidget.register(JqTreeWidget, 'tree')


class NodeElement
    constructor: (node, tree_widget) ->
        @init(node, tree_widget)

    init: (node, tree_widget) ->
        @node = node
        @tree_widget = tree_widget
        @$element = $(node.element)

    getUl: ->
        return @$element.children('ul:first')

    getSpan: ->
        return @$element.children('.jqtree-element').find('span.jqtree-title')

    getLi: ->
        return @$element

    addDropHint: (position) ->
        if position == Position.INSIDE
            return new BorderDropHint(@$element)
        else
            return new GhostDropHint(@node, @$element, position)

    select: ->
        @getLi().addClass('jqtree-selected')

    deselect: ->
        @getLi().removeClass('jqtree-selected')


class FolderElement extends NodeElement
    open: (on_finished, slide=true) ->
        if not @node.is_open
            @node.is_open = true
            $button = @getButton()
            $button.removeClass('jqtree-closed')
            $button.html(@tree_widget.options.openedIcon)

            doOpen = =>
                @getLi().removeClass('jqtree-closed')
                if on_finished
                    on_finished()

                @tree_widget._triggerEvent('tree.open', node: @node)

            if slide
                @getUl().slideDown('fast', doOpen)
            else
                @getUl().show()
                doOpen()                

    close: (slide=true) ->
        if @node.is_open
            @node.is_open = false
            $button = @getButton()
            $button.addClass('jqtree-closed')
            $button.html(@tree_widget.options.closedIcon)

            doClose = =>
                @getLi().addClass('jqtree-closed')

                @tree_widget._triggerEvent('tree.close', node: @node)

            if slide
                @getUl().slideUp('fast', doClose)
            else
                @getUl().hide()
                doClose()
                
    getButton: ->
        return @$element.children('.jqtree-element').find('a.jqtree-toggler')

    addDropHint: (position) ->
        if not @node.is_open and position == Position.INSIDE
            return new BorderDropHint(@$element)
        else
            return new GhostDropHint(@node, @$element, position)


# Escape a string for HTML interpolation; copied from underscore js
html_escape = (string) ->
    return (''+string)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g,'&#x2F;')