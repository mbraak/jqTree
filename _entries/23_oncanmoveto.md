---
title: onCanMoveTo
name: options-oncanmoveto
---

You can override this function to determine if a node can be moved to a certain position.

{% highlight js %}
$('#tree1').tree({
    data: data,
    dragAndDrop: true,
    onCanMoveTo: function(movedNode, targetNode, position) {
        if (targetNode.isMenu) {
            // Example: can move inside menu, not before or after
            return (position == 'inside');
        }
        else {
            return true;
        }
    }
});
{% endhighlight %}
