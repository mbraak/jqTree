---
title: multiSelect
name: options-multiselect
---

Let the user select multiple nodes.

* **true**: a click adds a node to the selection, or removes it when it is selected. The arrow keys move the focus instead of the selection, and **Space** adds the focused node to the selection or removes it.
* **false (default)**: a click selects one node.

The nodes must have an id. Use [getSelectedNodes](#multiple-selection-get-selected-nodes) to get the selected nodes.

{% highlight js %}
$('#tree1').tree({
    data: data,
    multiSelect: true
});

const selectedNodes = $('#tree1').tree('getSelectedNodes');
{% endhighlight %}

You can change the option later with [setOption](#functions-setoption).

{% highlight js %}
$('#tree1').tree('setOption', 'multiSelect', true);
{% endhighlight %}
