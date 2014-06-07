class ElementsRenderer
    constructor: (tree_widget) ->
        @tree_widget = tree_widget

        @opened_icon_element = @createButtonElement(tree_widget.options.openedIcon)
        @closed_icon_element = @createButtonElement(tree_widget.options.closedIcon)

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

        li = @createLi(node)
        @attachNodeData(node, li)

        # add element to dom
        previous_node = node.getPreviousSibling()
        if previous_node
            # Add node after previous node
            $(previous_node.element).after(li)
        else
            # There is no previous node; add node as first child of parent
            parent_node_element.getUl().prepend(li)

        # render children
        if node.children
            @renderFromNode(node)

    renderFromRoot: ->
        $element = @tree_widget.element
        $element.empty()

        @createDomElements($element[0], @tree_widget.tree.children, true, true)

    renderFromNode: (from_node) ->
        node_element = @tree_widget._getNodeElementForNode(from_node)
        node_element.getUl().remove()

        @createDomElements(node_element.$element[0], from_node.children, false, false)

    createDomElements: (element, children, is_root_node, is_open) ->
        ul = @createUl(is_root_node)
        element.appendChild(ul)

        for child in children
            li = @createLi(child)
            ul.appendChild(li)

            @attachNodeData(child, li)

            if child.hasChildren()
                @createDomElements(li, child.children, false, child.is_open)

        return null

    attachNodeData: (node, li) ->
        node.element = li
        $(li).data('node', node)

    createUl: (is_root_node) ->
        if is_root_node
            class_string = 'jqtree-tree'
        else
            class_string = ''

        ul = document.createElement('ul')
        ul.className = "jqtree_common #{ class_string }"

        return ul

    createLi: (node) ->
        if node.isFolder()
            li = @createFolderLi(node)
        else
            li = @createNodeLi(node)

        if @tree_widget.options.onCreateLi
            @tree_widget.options.onCreateLi(node, $(li))

        return li

    createFolderLi: (node) ->
        button_classes = @getButtonClasses(node)
        folder_classes = @getFolderClasses(node)

        escaped_name = @escapeIfNecessary(node.name)

        if node.is_open
            icon_element = @opened_icon_element
        else
            icon_element = @closed_icon_element

        # li
        li = document.createElement('li')
        li.className = "jqtree_common #{ folder_classes }"

        # div
        div = document.createElement('div')
        div.className = "jqtree-element jqtree_common"

        li.appendChild(div)

        # button link
        button_link = document.createElement('a')
        button_link.className = "jqtree_common #{ button_classes }"

        button_link.appendChild(
            icon_element.cloneNode()
        )

        div.appendChild(button_link)

        # title span
        title_span = document.createElement('span')
        title_span.className = "jqtree_common jqtree-title jqtree-title-folder"

        div.appendChild(title_span)

        title_span.innerHTML = escaped_name

        return li

    createNodeLi: (node) ->
        li_classes = ['jqtree_common']

        if @tree_widget.select_node_handler and @tree_widget.select_node_handler.isNodeSelected(node)
            li_classes.push('jqtree-selected')

        class_string = li_classes.join(' ')

        escaped_name = @escapeIfNecessary(node.name)

        # li
        li = document.createElement('li')
        li.className = class_string

        # div
        div = document.createElement('div')
        div.className = "jqtree-element jqtree_common"

        li.appendChild(div)

        # title span
        title_span = document.createElement('span')
        title_span.className = "jqtree-title jqtree_common"

        title_span.innerHTML = escaped_name

        div.appendChild(title_span)

        return li

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

    createButtonElement: (value) ->
        if typeof value == 'string'
            # convert value to html
            div = document.createElement('div')
            div.innerHTML = value

            return document.createTextNode(div.innerHTML)
        else
            return $(value)[0]
