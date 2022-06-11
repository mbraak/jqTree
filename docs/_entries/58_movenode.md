---
title: moveNode
name: functions-movenode
---

**function moveNode(node, targetNode, position);**

Move a node. Position can be 'before', 'after' or 'inside'.

{% highlight js %}
var node = $tree.tree('getNodeById', 1);
var targetNode = $tree.tree('getNodeById', 2);

$tree.tree('moveNode', node, targetNode, 'after');
{% endhighlight %}
