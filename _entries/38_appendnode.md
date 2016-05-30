---
title: appendNode
name: functions-appendnode
---

**function appendNode(new_node_info, parent_node);**

Add a node to this parent node. If **parent_node** is empty, then the new node becomes a root node.

{% highlight js %}
var parent_node = $tree.tree('getNodeById', 123);

$tree.tree(
    'appendNode',
    {
        name: 'new_node',
        id: 456
    },
    parent_node
);
{% endhighlight %}

To add a root node, leave *parent_node* empty:

{% highlight js %}
$tree.tree(
    'appendNode',
    {
        name: 'new_node',
        id: 456
    }
);
{% endhighlight %}

It's also possible to append a subtree:

{% highlight js %}
$tree.tree(
    'appendNode',
    {
        name: 'new_node',
        id: 456,
        children: [
            { name: 'child1', id: 457 },
            { name: 'child2', id: 458 }
        ]
    },
    parent_node
);
{% endhighlight %}
