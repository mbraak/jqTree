---
title: tree.load_data
name: event-load-data
---

Called before data is loaded using ajax.

Attributes:

-   `node`
    -   null when loading the whole tree
    -   a node when loading data for a sub tree

{% highlight js %}
$('#tree1').on(
    'tree.load_data',
    function(e) {
        //
    }
);
{% endhighlight %}
