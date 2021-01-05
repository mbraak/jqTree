---
title: addParentNode
name: functions-addparentnode
---

**function addParentNode(new_node_info, existing_node);**

Add a new node as parent of this existing node.

{% highlight js %}
var node1 = $('#tree1').tree('getNodeByName', 'node1');
$('#tree1').tree(
    'addParentNode',
    {
        name: 'new_parent',
        id: 456
    },
    node1
);
{% endhighlight %}
