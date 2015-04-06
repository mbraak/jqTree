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

isInt = (n) ->
    return typeof n is 'number' and n % 1 == 0


# Escape a string for HTML interpolation; copied from underscore js
html_escape = (string) ->
    return (''+string)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g,'&#x2F;')


module.exports =
    _indexOf:_indexOf
    html_escape: html_escape
    indexOf: indexOf
    isInt: isInt
