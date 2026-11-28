---
title: onSetStateFromStorage
name: options-onsetstatefromstorage
---

Save the state to somewhere other than localStorage, for example on the server. Use it together with [onGetStateFromStorage](#options-ongetstatefromstorage) and [saveState](#options-savestate).

The function is called with the state as a JSON string each time the state changes, for example when a node is opened or selected.

{% highlight js %}
$('#tree1').tree({
    data: data,
    saveState: true,
    onGetStateFromStorage: function() {
        return initialTreeState; // e.g. rendered into the page by the server
    },
    onSetStateFromStorage: function(state) {
        fetch('/tree-state/', { method: 'POST', body: state });
    }
});
{% endhighlight %}
