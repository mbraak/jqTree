---
title: addNodeAfter
name: functions-addnodeafter
---

**function addNodeAfter(new_node_info, existing_node);**

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
