---
title: onDragMove
name: options-ondragmove
---

Function that is called when a node is dragged **outside** the tree. This function is called while the node is being dragged.

* Also see the ``onDragStop`` option.
* The function signature is function(node, event);

{% highlight js %}
function handleMove(node: Node, e: JQueryEventObject) {
    //
}

$tree.tree({
    dragAndDrop: true,
    onDragMove: handleMove,
});
{% endhighlight %}
