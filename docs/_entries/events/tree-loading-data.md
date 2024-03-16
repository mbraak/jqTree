---
title: tree.loading_data
name: event-loading-data
---

Called before and after data is loaded using ajax.

The event data looks like this:

* **isLoading**: true / false
* **node**:
  * null; when loading the whole tree
  * a node; when a node is loaded on demand
* **$el**: dom element
  * whole tree; when loading the whole tree
  * dom element of node; when a node is loaded on demand

Example code:

{% highlight js %}
$('#tree1').on(
    'tree.loading_data',
    function(e) {
        console.log(e.isLoading, e.node, e.$el);
    }
);
{% endhighlight %}
