---
title: prependNode
name: functions-prependnode
---

**function prependNode(newNodeInfo, parentNode);**

Add a node to this parent node as the first child. If **parentNode** is empty, then the new node becomes a root node.

{% highlight js %}
var parentNode = $tree.tree('getNodeById', 123);

$tree.tree(
    'prependNode',
    {
        name: 'new_node',
        id: 456
    },
    parentNode
);
{% endhighlight %}
