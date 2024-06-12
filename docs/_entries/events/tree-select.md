---
title: tree.select
name: event-tree-select
---

Triggered when a tree node is selected or deselected.

If a node is selected, then **event.node** contains the selected node.

If a node is deselected, then the **event.node** property is null.

{% highlight js %}
$('#tree1').on(
    'tree.select',
    function(event) {
        if (event.node) {
            // node was selected
            const node = event.node;
            alert(node.name);
        }
        else {
            // event.node is null
            // event a node was deselected
            // event.previous_node contains the deselected node
        }
    }
);
{% endhighlight %}
