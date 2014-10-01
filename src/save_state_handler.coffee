util = require './util'

indexOf = util.indexOf
isInt = util.isInt


class SaveStateHandler
    constructor: (tree_widget) ->
        @tree_widget = tree_widget

    saveState: ->
        state = JSON.stringify(@getState())

        if @tree_widget.options.onSetStateFromStorage
            @tree_widget.options.onSetStateFromStorage(state)
        else if @supportsLocalStorage()
            localStorage.setItem(
                @getCookieName(),
                state
            )
        else if $.cookie
            $.cookie.raw = true
            $.cookie(
                @getCookieName(),
                state,
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
        json_data = @_loadFromStorage()

        if json_data
            return @_parseState(json_data)
        else
            return null

    _parseState: (json_data) ->
        state = $.parseJSON(json_data)

        # Check if selected_node is an int (instead of an array)
        if state and state.selected_node and isInt(state.selected_node)
            # Convert to array
            state.selected_node = [state.selected_node]

        return state

    _loadFromStorage: ->
        if @tree_widget.options.onGetStateFromStorage
            return @tree_widget.options.onGetStateFromStorage()
        else if @supportsLocalStorage()
            return localStorage.getItem(
                @getCookieName()
            )
        else if $.cookie
            $.cookie.raw = true
            return $.cookie(@getCookieName())
        else
            return null

    getState: ->
        getOpenNodeIds = =>
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

            return open_nodes

        getSelectedNodeIds = =>
            return (n.id for n in @tree_widget.getSelectedNodes())

        return {
            open_nodes: getOpenNodeIds(),
            selected_node: getSelectedNodeIds()
        }

    setState: (state) ->
        if state
            open_nodes = state.open_nodes
            selected_node_ids = state.selected_node

            @tree_widget.tree.iterate((node) =>
                node.is_open = (
                    node.id and
                    node.hasChildren() and
                    (indexOf(open_nodes, node.id) >= 0)
                )
                return true
            )

            if selected_node_ids and @tree_widget.select_node_handler
                @tree_widget.select_node_handler.clear()
                for node_id in selected_node_ids
                    selected_node = @tree_widget.getNodeById(node_id)

                    if selected_node
                        @tree_widget.select_node_handler.addToSelection(selected_node)

    getCookieName: ->
        if typeof @tree_widget.options.saveState is 'string'
            return @tree_widget.options.saveState
        else
            return 'tree'

    supportsLocalStorage: ->
        testSupport = ->
            # Is local storage supported?
            if not localStorage?
                return false
            else
                # Check if it's possible to store an item. Safari does not allow this in private browsing mode.
                try
                    key = '_storage_test'
                    sessionStorage.setItem(key, true);
                    sessionStorage.removeItem(key)
                catch error
                    return false

                return true

        if not @_supportsLocalStorage?
            @_supportsLocalStorage = testSupport()

        return @_supportsLocalStorage

    getNodeIdToBeSelected: ->
        state = @getStateFromStorage()

        if state and state.selected_node
            return state.selected_node[0]
        else
            return null


module.exports = SaveStateHandler
