---
title: loadData
name: functions-loaddata
---

**function loadData(data);**

**function loadData(data, parentNode);**

Load data in the tree. The data is array of nodes.

You can **replace the whole tree** or you can **load a subtree**.

{% highlight js %}
// Assuming the tree exists
var newData = [
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
$('#tree1').tree('loadData', newData);
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
