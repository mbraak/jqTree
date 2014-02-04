class ElementsRenderer
    constructor: (tree_widget) ->
        @tree_widget = tree_widget

    render: (from_node) ->
        if from_node and from_node.parent
            @renderFromNode(from_node)
        else
            @renderFromRoot()

    renderNode: (node) ->
        # remove element
        $(node.element).remove()

        # create element
        parent_node_element = new NodeElement(node.parent, @tree_widget)
        $parent_ul = parent_node_element.getUl()

        $li = @createLi(node)
        @attachNodeData(node, $li)

        # add element to dom
        previous_node = node.getPreviousSibling()
        if previous_node
            $(previous_node.element).after($li)
        else
            parent_node_element.getUl().prepend($li)

        # render children
        if node.children
            @renderFromNode(node)

    renderFromRoot: ->
        $element = @tree_widget.element
        $element.empty()

        @createDomElements($element, @tree_widget.tree.children, true, true)

    renderFromNode: (from_node) ->
        node_element = @tree_widget._getNodeElementForNode(from_node)
        node_element.getUl().remove()

        @createDomElements(node_element.$element, from_node.children, false, false)

    createDomElements: ($element, children, is_root_node, is_open) ->
        $ul = @createUl(is_root_node)
        $element.append($ul)

        for child in children
            $li = @createLi(child)
            $ul.append($li)

            @attachNodeData(child, $li)

            if child.hasChildren()
                @createDomElements($li, child.children, false, child.is_open)

        return null

    attachNodeData: (node, $li) ->
        node.element = $li[0]
        $li.data('node', node)

    createUl: (is_root_node) ->
        if is_root_node
            class_string = 'jqtree-tree'
        else
            class_string = ''

        return $($.el.ul('class': "jqtree_common #{ class_string }"))

    createLi: (node) ->
        if node.isFolder()
            $li = @createFolderLi(node)
        else
            $li = @createNodeLi(node)

        if @tree_widget.options.onCreateLi
            @tree_widget.options.onCreateLi(node, $li)

        return $li

    createFolderLi: (node) ->
        button_classes = @getButtonClasses(node)
        folder_classes = @getFolderClasses(node)

        if node.is_open
            button_char = @tree_widget.options.openedIcon
        else
            button_char = @tree_widget.options.closedIcon

        return $($.el.li('class': "jqtree_common #{ folder_classes }", $.el.div('class': 'jqtree-element jqtree_common', $.el.a('class': "jqtree_common #{ button_classes }", button_char), $.el.span('class': "jqtree_common jqtree-title", node.name))))

    createNodeLi: (node) ->
        li_classes = ['jqtree_common']

        if @tree_widget.select_node_handler and @tree_widget.select_node_handler.isNodeSelected(node)
            li_classes.push('jqtree-selected')

        class_string = li_classes.join(' ')

        return $($.el.li('class': class_string, $.el.div('class': 'jqtree-element jqtree_common', $.el.span('class': 'jqtree-title jqtree_common', node.name))))

    getButtonClasses: (node) ->
        classes = ['jqtree-toggler']

        if not node.is_open
            classes.push('jqtree-closed')

        return classes.join(' ')

    getFolderClasses: (node) ->
        classes = ['jqtree-folder']

        if not node.is_open
            classes.push('jqtree-closed')

        if @tree_widget.select_node_handler and @tree_widget.select_node_handler.isNodeSelected(node)
            classes.push('jqtree-selected')

        return classes.join(' ')

    escapeIfNecessary: (value) ->
        if @tree_widget.options.autoEscape
            return html_escape(value)
        else
            return value
