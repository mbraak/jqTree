node_element = require './node_element'
NodeElement = node_element.NodeElement

util = require './util'
html_escape = util.html_escape


$ = jQuery


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

    renderFromRoot: ->
        $element = @tree_widget.element
        $element.empty()

        @createDomElements($element[0], @tree_widget.tree.children, true, true, 1)

    renderFromNode: (node) ->
        # remember current li
        $previous_li = $(node.element)

        # create element
        li = @createLi(node, node.getLevel())
        @attachNodeData(node, li)

        # add element to dom
        $previous_li.after(li)

        # remove previous li
        $previous_li.remove()

        # create children
        if node.children
            @createDomElements(li, node.children, false, false, node.getLevel() + 1)

    createDomElements: (element, children, is_root_node, is_open, level) ->
        ul = @createUl(is_root_node)
        element.appendChild(ul)

        for child in children
            li = @createLi(child, level)
            ul.appendChild(li)

            @attachNodeData(child, li)

            if child.hasChildren()
                @createDomElements(li, child.children, false, child.is_open, level + 1)

        return null

    attachNodeData: (node, li) ->
        node.element = li
        $(li).data('node', node)

    createUl: (is_root_node) ->
        if !is_root_node
            class_string = ''
            role = 'group'
        else
            class_string = 'jqtree-tree'
            role = 'tree'

            if @tree_widget.options.rtl
                class_string += ' jqtree-rtl'

        ul = document.createElement('ul')
        ul.className = "jqtree_common #{ class_string }"

        ul.setAttribute('role', role)

        return ul

    createLi: (node, level) ->
        is_selected = @tree_widget.select_node_handler and @tree_widget.select_node_handler.isNodeSelected(node)

        if node.isFolder()
            li = @createFolderLi(node, level, is_selected)
        else
            li = @createNodeLi(node, level, is_selected)

        if @tree_widget.options.onCreateLi
            @tree_widget.options.onCreateLi(node, $(li))

        return li

    createFolderLi: (node, level, is_selected) ->
        button_classes = @getButtonClasses(node)
        folder_classes = @getFolderClasses(node, is_selected)

        if node.is_open
            icon_element = @opened_icon_element
        else
            icon_element = @closed_icon_element

        # li
        li = document.createElement('li')
        li.className = "jqtree_common #{ folder_classes }"
        li.setAttribute('role', 'presentation')

        # div
        div = document.createElement('div')
        div.className = "jqtree-element jqtree_common"
        div.setAttribute('role', 'presentation')

        li.appendChild(div)

        # button link
        button_link = document.createElement('a')
        button_link.className = button_classes

        button_link.appendChild(
            icon_element.cloneNode(false)
        )

        button_link.setAttribute('role', 'presentation')
        button_link.setAttribute('aria-hidden', 'true')

        if @tree_widget.options.buttonLeft
            div.appendChild(button_link)

        # title span
        div.appendChild(
            @createTitleSpan(node.name, level, is_selected, node.is_open, is_folder=true)
        )

        if not @tree_widget.options.buttonLeft
            div.appendChild(button_link)

        return li

    createNodeLi: (node, level, is_selected) ->
        li_classes = ['jqtree_common']

        if is_selected
            li_classes.push('jqtree-selected')

        class_string = li_classes.join(' ')

        # li
        li = document.createElement('li')
        li.className = class_string
        li.setAttribute('role', 'presentation')

        # div
        div = document.createElement('div')
        div.className = "jqtree-element jqtree_common"
        div.setAttribute('role', 'presentation')

        li.appendChild(div)

        # title span
        div.appendChild(
            @createTitleSpan(node.name, level, is_selected, node.is_open, is_folder=false)
        )

        return li

    createTitleSpan: (node_name, level, is_selected, is_open, is_folder) ->
        title_span = document.createElement('span')

        classes = "jqtree-title jqtree_common"

        if is_folder
            classes += " jqtree-title-folder"

        title_span.className = classes

        title_span.setAttribute('role', 'treeitem')
        title_span.setAttribute('aria-level', level)

        title_span.setAttribute('aria-selected', util.getBoolString(is_selected))
        title_span.setAttribute('aria-expanded', util.getBoolString(is_open))

        if is_selected
            title_span.setAttribute('tabindex', 0)

        title_span.innerHTML = @escapeIfNecessary(node_name)

        return title_span

    getButtonClasses: (node) ->
        classes = ['jqtree-toggler', 'jqtree_common']

        if not node.is_open
            classes.push('jqtree-closed')

        if @tree_widget.options.buttonLeft
            classes.push('jqtree-toggler-left')
        else
            classes.push('jqtree-toggler-right')

        return classes.join(' ')

    getFolderClasses: (node, is_selected) ->
        classes = ['jqtree-folder']

        if not node.is_open
            classes.push('jqtree-closed')

        if is_selected
            classes.push('jqtree-selected')

        if node.is_loading
            classes.push('jqtree-loading')

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


module.exports = ElementsRenderer
