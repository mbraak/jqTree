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


class SaveStateHandler
    constructor: (tree_widget) ->
        @tree_widget = tree_widget

    saveState: ->
        state = JSON.stringify(@getState())

        if @tree_widget.options.onSetStateFromStorage
            @tree_widget.options.onSetStateFromStorage(state)
        else if localStorage?
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
            @setState($.parseJSON(state))
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

        return {
            open_nodes: open_nodes,
            selected_node: selected_node_id
        }

    setState: (state) ->
        if state
            open_nodes = state.open_nodes
            selected_node_id = state.selected_node

            @tree_widget.tree.iterate((node) =>
                node.is_open = (
                    node.id and
                    node.hasChildren() and
                    (indexOf(open_nodes, node.id) >= 0)
                )
                return true
            )

            if selected_node_id and @tree_widget.select_node_handler
                @tree_widget.select_node_handler.clear()
                selected_node = @tree_widget.getNodeById(selected_node_id)

                if selected_node
                    @tree_widget.select_node_handler.addToSelection(selected_node)

    getCookieName: ->
        if typeof @tree_widget.options.saveState is 'string'
            return @tree_widget.options.saveState
        else
            return 'tree'