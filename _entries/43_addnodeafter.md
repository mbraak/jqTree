---
title: addNodeAfter
name: functions-addnodeafter
---

**function addNodeAfter(newNodeInfo, existingNode);**

Add a new node after this existing node.

{% highlight js %}
var node1 = $('#tree1').tree('getNodeByName', 'node1');
$('#tree1').tree(
    'addNodeAfter',
    {
        name: 'new_node',
        id: 456
    },
    node1
);
{% endhighlight %}
