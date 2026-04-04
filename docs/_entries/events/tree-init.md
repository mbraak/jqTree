---
title: tree.init
name: event-tree-init
---

Called when the tree is initialized. This is particularly useful when the data is loaded from the server.

{% highlight js %}
$('#tree1').on(
    'tree.init',
    function() {
        // initializing code
    }
);
{% endhighlight %}

Is the event not triggered? Then bind it before initializing the tree.

{% highlight js %}
const $tree = $('#tree1')

$tree.on('tree.init', function() { });

$tree.tree({
    data: [
        { name: 'node1', id: 1,}
    ]
});
{% endhighlight %}

The `tree.init` event is triggered immediately when initializing the tree with data. That's why the event must be bound before initializing.

The event is not triggered immediately when the data is loaded from a server.