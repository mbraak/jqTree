---
title: updateNode
name: functions-updatenode
---

**function updateNode(node, name);**

**function updateNode(node, data);**

Update the title of a node. You can also update the data.

Update the name:

{% highlight js %}
var node = $tree.tree('getNodeById', 123);

$tree.tree('updateNode', node, 'new name');
{% endhighlight %}

Update the data (including the name)

{% highlight js %}
var node = $tree.tree('getNodeById', 123);

$tree.tree(
    'updateNode',
    node,
    {
        name: 'new name',
        other_property: 'abc'
    }
);
{% endhighlight %}
