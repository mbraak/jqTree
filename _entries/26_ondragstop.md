---
title: onDragStop
name: options-ondragstop
---

Function that is called when a node is dragged **outside** the tree. This function is called when user stops dragging.

* Also see the ``onDragMove`` option.
* The function signature is function(node, event);

{% highlight js %}
function handleStop(node: Node, e: JQueryEventObject) {
    //
}

$tree.tree({
    dragAndDrop: true,
    onDragStop: handleMove,
});
{% endhighlight %}
