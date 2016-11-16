---
title: openNode
name: functions-opennode
---

**function openNode(node);**

**function openNode(node, slide);**

**function openNode(node, on_finished);**

**function openNode(node, slide, on_finished);**

Open this node. The node must have child nodes.

Parameter **slide (optional)**: open the node using a slide animation (default is true).
Parameter **on_finished (optional)**: callback when the node is opened; this also works for nodes that are loaded lazily

{% highlight js %}
// create tree
var $tree = $('#tree1');
$tree.tree({
    data: data
});

var node = $tree.tree('getNodeById', 123);
$tree.tree('openNode', node);
{% endhighlight %}

To open the node without the slide animation, call with **slide** parameter is false.

{% highlight js %}
$tree.tree('openNode', node, false);
{% endhighlight %}

Example with `on_finished` callback:

{% highlight js %}
function handleOpened(node) {
    console.log('openende node', node.name);
}

$tree.tree('openNode', node, handleOpened);
{% endhighlight %}
