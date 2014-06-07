class KeyHandler
    LEFT = 37
    UP = 38
    RIGHT = 39
    DOWN = 40

    constructor: (tree_widget) ->
        @tree_widget = tree_widget

        if tree_widget.options.keyboardSupport
            $(document).bind('keydown.jqtree', $.proxy(@handleKeyDown, this))

    deinit: ->
        $(document).unbind('keydown.jqtree')

    handleKeyDown: (e) ->
        if not @tree_widget.options.keyboardSupport
            return

        if $(document.activeElement).is('textarea,input,select')
            return true

        current_node = @tree_widget.getSelectedNode()

        selectNode = (node) =>
            if node
                @tree_widget.selectNode(node)

                if (
                    @tree_widget.scroll_handler and
                    (not @tree_widget.scroll_handler.isScrolledIntoView($(node.element).find('.jqtree-element')))
                )
                    @tree_widget.scrollToNode(node)

                return false
            else
                return true

        moveDown = =>
            return selectNode(@getNextNode(current_node))

        moveUp = =>
            return selectNode(@getPreviousNode(current_node))

        moveRight = =>
            if current_node.isFolder() and not current_node.is_open
                @tree_widget.openNode(current_node)
                return false
            else
                return true

        moveLeft = =>
            if current_node.isFolder() and current_node.is_open
                @tree_widget.closeNode(current_node)
                return false
            else
                return true

        if not current_node
            return true
        else
            key = e.which

            switch key
                when DOWN
                    return moveDown()

                when UP
                    return moveUp()

                when RIGHT
                    return moveRight()

                when LEFT
                    return moveLeft()

    getNextNode: (node, include_children=true) ->
        if include_children and node.hasChildren() and node.is_open
            # First child
            return node.children[0]
        else
            if not node.parent
                return null
            else
                next_sibling = node.getNextSibling()
                if next_sibling
                    # Next sibling
                    return next_sibling
                else
                    # Next node of parent
                    return @getNextNode(node.parent, false)

    getPreviousNode: (node) ->
        if not node.parent
            return null
        else
            previous_sibling = node.getPreviousSibling()
            if previous_sibling
                if not previous_sibling.hasChildren() or not previous_sibling.is_open
                    # Previous sibling
                    return previous_sibling
                else
                    # Last child of previous sibling
                    return @getLastChild(previous_sibling)
            else
                # Parent
                if node.parent.parent
                    return node.parent
                else
                    return null

    getLastChild: (node) ->
        if not node.hasChildren()
            return null
        else
            last_child = node.children[node.children.length - 1]
            if not last_child.hasChildren() or not last_child.is_open
                return last_child
            else
                return @getLastChild(last_child)