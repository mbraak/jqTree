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