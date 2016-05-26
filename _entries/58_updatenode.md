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
        id: 1,
        other_property: 'abc'
    }
);
{% endhighlight %}

It is also possible to update the children. Note that this removes the existing children:

{% highlight js %}
$tree.tree(
    'updateNode',
    node,
    {
        name: 'new name',
        id: 1,
        children: [
            { name: 'child1', id: 2 }
        ]
    }
);
{% endhighlight %}
