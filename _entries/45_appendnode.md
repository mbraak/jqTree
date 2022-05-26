---
title: appendNode
name: functions-appendnode
---

**function appendNode(newNodeInfo, parentNode);**

Add a node to this parent node. If **parentNode** is empty, then the new node becomes a root node.

{% highlight js %}
var parentNode = $tree.tree('getNodeById', 123);

$tree.tree(
    'appendNode',
    {
        name: 'new_node',
        id: 456
    },
    parentNode
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
    parentNode
);
{% endhighlight %}
