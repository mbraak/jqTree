---
title: prependNode
name: functions-prependnode
---

**function prependNode(new_node_info, parent_node);**

Add a node to this parent node as the first child. If **parent_node** is empty, then the new node becomes a root node.

{% highlight js %}
var parent_node = $tree.tree('getNodeById', 123);

$tree.tree(
    'prependNode',
    {
        name: 'new_node',
        id: 456
    },
    parent_node
);
{% endhighlight %}
