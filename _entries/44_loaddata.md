---
title: loadData
name: functions-loaddata
---

**function loadData(data);**

**function loadData(data, parent_node);**

Load data in the tree. The data is array of nodes.

You can **replace the whole tree** or you can **load a subtree**.

{% highlight js %}
// Assuming the tree exists
var new_data = [
    {
        name: 'node1',
        children: [
            { name: 'child1' },
            { name: 'child2' }
        ]
    },
    {
        name: 'node2',
        children: [
            { name: 'child3' }
        ]
    }
];
$('#tree1').tree('loadData', new_data);
{% endhighlight %}

Load a subtree:

{% highlight js %}
// Get node by id (this assumes that the nodes have an id)
var node = $('#tree1').tree('getNodeById', 100);

// Add new nodes
var data = [
    { name: 'new node' },
    { name: 'another new node' }
];
$('#tree1').tree('loadData', data, node);
{% endhighlight %}
