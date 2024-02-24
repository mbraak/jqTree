---
title: getPreviousVisibleNode
name: node-functions-getpreviousvisiblenode
---

Get the previous visible node in the tree. Does the same as using the _up_ key.

This is the previous sibling, if there is one. Or, if there is no previous sibling, a node further up in the tree that is visible.

-   Returns a node or null.
-   A node is visible if all its parents are open.

{% highlight js %}
const previousNode = node.getPreviousVisibleNode();
{% endhighlight %}
