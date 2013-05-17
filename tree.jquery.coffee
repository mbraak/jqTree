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

@Tree = {}
$ = @jQuery

# Standard javascript indexOf. Implemented here because not all browsers support it.
_indexOf = (array, item) ->
    for value, i in array
        if value == item
            return i
    return -1

indexOf = (array, item) ->
    if array.indexOf
        # The browser supports indexOf
        return array.indexOf(item)
    else
        # Do our own indexOf
        return _indexOf(array, item)

@Tree.indexOf = indexOf
@Tree._indexOf = _indexOf

# JSON.stringify function; copied from json2
if not (@JSON? and @JSON.stringify? and typeof @JSON.stringify == 'function')
    json_escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g
    json_meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    }

    json_quote = (string) ->
        json_escapable.lastIndex = 0

        if json_escapable.test(string)
            return '"' + string.replace(json_escapable, (a) ->
                c = json_meta[a]
                return (
                    if typeof c is 'string' then c
                    else '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4)
                )
            ) + '"'
        else
            return '"' + string + '"'

    json_str = (key, holder) ->
        value = holder[key]

        switch typeof value
            when 'string'
                return json_quote(value)

            when 'number'
                return if isFinite(value) then String(value) else 'null'

            when 'boolean', 'null'
                return String(value)

            when 'object'
                if not value
                    return 'null'

                partial = []
                if Object::toString.apply(value) is '[object Array]'
                    for v, i in value
                        partial[i] = json_str(i, value) or 'null'

                    return (
                        if partial.length is 0 then '[]'
                        else '[' + partial.join(',') + ']'
                    )

                for k of value
                    if Object::hasOwnProperty.call(value, k)
                        v = json_str(k, value)
                        if v
                            partial.push(json_quote(k) + ':' + v)

                return (
                    if partial.length is 0 then '{}'
                    else '{' + partial.join(',') + '}'
                )

    if not @JSON?
        @JSON = {}

    @JSON.stringify = (value) ->
        return json_str(
            '',
            {'': value}
        )

# Escape a string for HTML interpolation; copied from underscore js
html_escape = (string) ->
    return (''+string)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g,'&#x2F;')

Position =
    getName: (position) ->
        return Position.strings[position - 1]

    nameToIndex: (name) ->
        for i in [1..Position.strings.length]
            if Position.strings[i - 1] == name
                return i
        return 0

Position.BEFORE = 1
Position.AFTER = 2
Position.INSIDE = 3
Position.NONE = 4

Position.strings = ['before', 'after', 'inside', 'none']

@Tree.Position = Position

class Node
    constructor: (o, is_root=false, node_class=Node) ->
        @setData(o)

        @children = []
        @parent = null

        if is_root
            @id_mapping = {}
            @tree = this
            @node_class = node_class

    setData: (o) ->
        if typeof o != 'object'
            @name = o
        else
            for key, value of o
                if key == 'label'
                    # todo: node property is 'name', but we use 'label' here
                    @name = value
                else
                    @[key] = value

    # Init Node from data without making it the root of the tree
    initFromData: (data) ->
        addNode = (node_data) =>
            @setData(node_data)

            if node_data.children
                addChildren(node_data.children)

        addChildren = (children_data) =>
            for child in children_data
                node = new @tree.node_class('')
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
        @removeChildren()

        for o in data
            node = new @tree.node_class(o)
            @addChild(node)

            if typeof o == 'object' and o.children
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
        node._setParent(this)

    ###
    Add child at position. Index starts at 0.

    tree.addChildAtPosition(
        new Node('abc'),
        1
    );
    ###
    addChildAtPosition: (node, index) ->
        @children.splice(index, 0, node)
        node._setParent(this)

    _setParent: (parent) ->
        @parent = parent
        @tree = parent.tree
        @tree.addNodeToIndex(this)

    ###
    Remove child. This also removes the children of the node.

    tree.removeChild(tree.children[0]);
    ###
    removeChild: (node) ->
        # remove children from the index
        node.removeChildren()

        @_removeChild(node)

    _removeChild: (node) ->
        @children.splice(
            @getChildIndex(node),
            1
        )
        @tree.removeNodeFromIndex(node)        

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

    isFolder: ->
        return @hasChildren() or @load_on_demand

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
            if node.children
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
        if moved_node.isParentOf(target_node)
            # Node is parent of target node. This is an illegal move
            return

        moved_node.parent._removeChild(moved_node)
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
                        k not in ['parent', 'children', 'element', 'tree'] and
                        Object.prototype.hasOwnProperty.call(node, k)
                    )
                        tmp_node[k] = v

                if node.hasChildren()
                    tmp_node.children = getDataFromNodes(node.children)

                data.push(tmp_node)

            return data

        return getDataFromNodes(@children)

    getNodeByName: (name) ->
        result = null

        @iterate(
            (node) ->
                if node.name == name
                    result = node
                    return false
                else
                    return true
        )

        return result

    addAfter: (node_info) ->
        if not @parent
            return null
        else
            node = new @tree.node_class(node_info)

            child_index = @parent.getChildIndex(this)
            @parent.addChildAtPosition(node, child_index + 1)
            return node

    addBefore: (node_info) ->
        if not @parent
            return null
        else
            node = new @tree.node_class(node_info)

            child_index = @parent.getChildIndex(this)
            @parent.addChildAtPosition(node, child_index)
            return node

    addParent: (node_info) ->
        if not @parent
            return null
        else
            new_parent = new @tree.node_class(node_info)
            new_parent._setParent(@tree)
            original_parent = @parent

            for child in original_parent.children
                new_parent.addChild(child)

            original_parent.children = []
            original_parent.addChild(new_parent)
            return new_parent

    remove: ->
        if @parent
            @parent.removeChild(this)
            @parent = null

    append: (node_info) ->
        node = new @tree.node_class(node_info)
        @addChild(node)
        return node

    prepend: (node_info) ->
        node = new @tree.node_class(node_info)
        @addChildAtPosition(node, 0)
        return node

    isParentOf: (node) ->
        parent = node.parent

        while parent
            if parent == this
                return true

            parent = parent.parent

        return false

    getLevel: ->
        level = 0
        node = this

        while node.parent
            level += 1
            node = node.parent

        return level

    getNodeById: (node_id) ->
        return @id_mapping[node_id]

    addNodeToIndex: (node) ->
        if node.id
            @id_mapping[node.id] = node

    removeNodeFromIndex: (node) ->
        if node.id
            delete @id_mapping[node.id]

    removeChildren: ->
        @iterate(
            (child) =>
                @tree.removeNodeFromIndex(child)
                return true
        )

        @children = []


@Tree.Node = Node

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
        canSelect = =>
            if not @options.onCanSelectNode
                return @options.selectable

            return @options.selectable and @options.onCanSelectNode(node)

        openParents = =>
            parent = node.parent

            if not parent.is_open and parent.parent
                @openNode(parent, false)

        saveState = =>
            if @options.saveState
                @save_state_handler.saveState()            

        if not node
            # Called with empty node -> deselect current node
            @_deselectCurrentNode()
            saveState
            return

        if not canSelect()
            return

        if @select_node_handler.isNodeSelected(node)
            if must_toggle
                # Toggle current node -> is now deselected 
                @_deselectCurrentNode()
                @_triggerEvent('tree.select', node: null)
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
            @_initTree(data, false, @options.nodeClass)
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
        node.setData(data)

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

    _init: ->
        super()

        @element = @$el
        @mouse_delay = 300

        @save_state_handler = new SaveStateHandler(this)
        @select_node_handler = new SelectNodeHandler(this)
        @dnd_handler = new DragAndDropHandler(this)
        @scroll_handler = new ScrollHandler(this)

        @_initData()

        @element.click($.proxy(@_click, this))
        if @options.useContextMenu
            @element.bind('contextmenu', $.proxy(@_contextmenu, this))

    _deinit: ->
        @element.empty()
        @element.unbind()
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
        @select_node_handler.clear()
        @tree.loadFromData(data)

        @_openNodes()
        @_refreshElements()

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

            if @select_node_handler.isNodeSelected(node)
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

                if @select_node_handler.isNodeSelected(node)
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
        if e.ctrlKey
            return

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

    _mouseCapture: (event) ->
        if @options.dragAndDrop
            return @dnd_handler.mouseCapture(event)
        else
            return false

    _mouseStart: (event) ->
        if @options.dragAndDrop
            return @dnd_handler.mouseStart(event)
        else
            return false

    _mouseDrag: (event) ->
        if @options.dragAndDrop
            result = @dnd_handler.mouseDrag(event)
            @scroll_handler.checkScrolling()
            return result
        else
            return false

    _mouseStop: (e) ->
        if @options.dragAndDrop
            return @dnd_handler.mouseStop(e)
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


class SaveStateHandler
    constructor: (tree_widget) ->
        @tree_widget = tree_widget

    saveState: ->
        if @tree_widget.options.onSetStateFromStorage
            @tree_widget.options.onSetStateFromStorage(@getState())
        else if localStorage?
            localStorage.setItem(
                @getCookieName(),
                @getState()
            )
        else if $.cookie
            $.cookie.raw = true
            $.cookie(
                @getCookieName(),
                @getState(),
                {path: '/'}
            )

    restoreState: ->
        state = @getStateFromStorage()

        if state
            @setState(state)
            return true
        else
            return false

    getStateFromStorage: ->
        if @tree_widget.options.onGetStateFromStorage
            return @tree_widget.options.onGetStateFromStorage()
        else if localStorage?
            return localStorage.getItem(
                @getCookieName()
            )
        else if $.cookie
            $.cookie.raw = true
            return $.cookie(@getCookieName())
        else
            return null

    getState: ->
        open_nodes = []

        @tree_widget.tree.iterate((node) =>
            if (
                node.is_open and
                node.id and
                node.hasChildren()
            )
                open_nodes.push(node.id)
            return true
        )

        # todo : multiple nodes
        selected_node = @tree_widget.getSelectedNode()
        if selected_node
            selected_node_id = selected_node.id
        else
            selected_node_id = ''

        return JSON.stringify(
            open_nodes: open_nodes,
            selected_node: selected_node_id
        )

    setState: (state) ->
        data = $.parseJSON(state)
        if data
            open_nodes = data.open_nodes
            selected_node_id = data.selected_node

            @tree_widget.tree.iterate((node) =>
                if (
                    node.id and
                    node.hasChildren() and
                    (indexOf(open_nodes, node.id) >= 0)
                )
                    node.is_open = true

                return true
            )

            if selected_node_id
                selected_node = @tree_widget.getNodeById(selected_node_id)

                if selected_node
                    @tree_widget.select_node_handler.addToSelection(selected_node)

    getCookieName: ->
        if typeof @tree_widget.options.saveState is 'string'
            return @tree_widget.options.saveState
        else
            return 'tree'


class SelectNodeHandler
    constructor: (tree_widget) ->
        @tree_widget = tree_widget
        @clear()

    getSelectedNode: ->
        selected_nodes = @getSelectedNodes()

        if selected_nodes.length
            return selected_nodes[0]
        else
            return  false

    getSelectedNodes: ->
        if @selected_single_node
            return [@selected_single_node]
        else
            selected_nodes = []

            for id of @selected_nodes
                node = @tree_widget.getNodeById(id)
                if node
                    selected_nodes.push(node)

            return selected_nodes

    isNodeSelected: (node) ->
        if node.id
            return @selected_nodes[node.id]
        else if @selected_single_node
            return @selected_single_node.element == node.element
        else
            return false

    clear: ->
        @selected_nodes = {}
        @selected_single_node = null

    removeFromSelection: (node, include_children=false) ->
        if not node.id
            if node.element == @selected_single_node
                @selected_single_node = null
        else
            delete @selected_nodes[node.id]

            if include_children
                node.iterate(
                    (n) =>
                        delete @selected_nodes[node.id]
                        return true
                )

    addToSelection: (node) ->
        if node.id
            @selected_nodes[node.id] = true
        else
            @selected_single_node = node


class DragAndDropHandler
    constructor: (tree_widget) ->
        @tree_widget = tree_widget

        @hovered_area = null
        @$ghost = null
        @hit_areas = []
        @is_dragging = false

    mouseCapture: (event) ->
        $element = $(event.target)

        if @tree_widget.options.onIsMoveHandle and not @tree_widget.options.onIsMoveHandle($element)
            return null

        node_element = @tree_widget._getNodeElement($element)

        if node_element and @tree_widget.options.onCanMove
            if not @tree_widget.options.onCanMove(node_element.node)
                node_element = null

        @current_item = node_element
        return (@current_item != null)

    mouseStart: (event) ->
        @refreshHitAreas()

        [offsetX, offsetY] = @getOffsetFromEvent(event)

        @drag_element = new DragElement(
            @current_item.node
            offsetX,
            offsetY,
            @tree_widget.element
        )

        @is_dragging = true
        @current_item.$element.addClass('jqtree-moving')
        return true

    mouseDrag: (event) ->
        @drag_element.move(event.pageX, event.pageY)

        area = @findHoveredArea(event.pageX, event.pageY)
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

    mouseStop: (e) ->
        @moveItem(e)
        @clear()
        @removeHover()
        @removeDropHint()
        @removeHitAreas()

        @current_item.$element.removeClass('jqtree-moving')
        @is_dragging = false

        return false

    getOffsetFromEvent: (event) ->
        element_offset = $(event.target).offset()
        return [
            event.pageX - element_offset.left,
            event.pageY - element_offset.top
        ]

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

    moveItem: (original_event) ->
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
                    original_event: original_event
            )

            doMove() unless event.isDefaultPrevented()


class ScrollHandler
    constructor: (tree_widget) ->
        @tree_widget = tree_widget
        @previous_top = -1

        @_initScrollParent()

    _initScrollParent: ->
        getParentWithOverflow = =>
            css_values = ['overflow', 'overflow-y']
            scroll_parent = null

            for parent in @tree_widget.$el.parents()
                for css_value in css_values
                    if $.css(parent, css_value) in ['auto', 'scroll']
                        return $(parent)
            return null

        setDocumentAsScrollParent = =>
            @scroll_parent_top = 0
            @$scroll_parent = null

        if @tree_widget.$el.css('position') == 'fixed'
            setDocumentAsScrollParent()

        $scroll_parent = getParentWithOverflow()

        if $scroll_parent and $scroll_parent.length and $scroll_parent[0].tagName != 'HTML'
            @$scroll_parent = $scroll_parent
            @scroll_parent_top = @$scroll_parent.offset().top
        else
            setDocumentAsScrollParent()

    checkScrolling: ->
        hovered_area = @tree_widget.dnd_handler.hovered_area

        if hovered_area and hovered_area.top != @previous_top
            @previous_top = hovered_area.top

            if @$scroll_parent
                @_handleScrollingWithScrollParent(hovered_area)
            else
                @_handleScrollingWithDocument(hovered_area)

    _handleScrollingWithScrollParent: (area) ->
        distance_bottom = @scroll_parent_top + @$scroll_parent[0].offsetHeight - area.bottom

        if distance_bottom < 20
            @$scroll_parent[0].scrollTop += 20
            @tree_widget.refreshHitAreas()
            @previous_top = -1
        else if (area.top - @scroll_parent_top) < 20
            @$scroll_parent[0].scrollTop -= 20
            @tree_widget.refreshHitAreas()
            @previous_top = -1

    _handleScrollingWithDocument: (area) ->
        distance_top = area.top - $(document).scrollTop()

        if distance_top < 20
            $(document).scrollTop($(document).scrollTop() - 20)
        else if $(window).height() - (area.bottom - $(document).scrollTop()) < 20
            $(document).scrollTop($(document).scrollTop() + 20)

    scrollTo: (top) ->
        if @$scroll_parent
            @$scroll_parent[0].scrollTop = top
        else
            tree_top = @tree_widget.$el.offset().top
            $(document).scrollTop(top + tree_top)