---
title: tree.open
name: event-tree-open
---

Called when a node is opened.

{% highlight js %}
$('#tree1').on(
    'tree.open',
    function(e) {
        console.log(e.node);
    }
);
{% endhighlight %}
