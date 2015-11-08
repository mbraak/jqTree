$ = jQuery


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

    moveDown: ->
        node = @tree_widget.getSelectedNode()

        if node
            return @selectNode(node.getNextNode())
        else
            return false

    moveUp: ->
        node = @tree_widget.getSelectedNode()

        if node
            return @selectNode(node.getPreviousNode())
        else
            return false

    moveRight: ->
        node = @tree_widget.getSelectedNode()

        if not node
            return true
        else if not node.isFolder()
            return true
        else
            # folder node
            if node.is_open
                # Right moves to the first child of an open node
                return @selectNode(node.getNextNode())
            else
                # Right expands a closed node
                @tree_widget.openNode(node)
                return false

    moveLeft: ->
        node = @tree_widget.getSelectedNode()

        if not node
            return true
        else if node.isFolder() and node.is_open
            # Left on an open node closes the node
            @tree_widget.closeNode(node)
            return false
        else
            # Left on a closed or end node moves focus to the node's parent
            return @selectNode(node.getParent())

    handleKeyDown: (e) ->
        if not @tree_widget.options.keyboardSupport
            return true

        if $(document.activeElement).is('textarea,input,select')
            return true

        if not @tree_widget.getSelectedNode()
            return true

        key = e.which

        switch key
            when DOWN
                return @moveDown()

            when UP
                return @moveUp()

            when RIGHT
                return @moveRight()

            when LEFT
                return @moveLeft()

        return true

    selectNode: (node) =>
        if not node
            return true
        else
            @tree_widget.selectNode(node)

            if (
                @tree_widget.scroll_handler and
                (not @tree_widget.scroll_handler.isScrolledIntoView($(node.element).find('.jqtree-element')))
            )
                @tree_widget.scrollToNode(node)

            return false


module.exports = KeyHandler
