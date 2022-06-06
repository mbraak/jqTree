---
title: tree.load_data
name: event-load-data
---

Called after data is loaded using ajax.

{% highlight js %}
$('#tree1').on(
    'tree.load_data',
    function(e) {
        console.log(e.tree_data);
    }
);
{% endhighlight %}
