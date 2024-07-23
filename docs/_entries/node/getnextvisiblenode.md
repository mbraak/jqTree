---
title: getNextVisibleNode
name: node-functions-getnextvisiblenode
---

Get the next visible node in the tree. Does the same as using the _down_ key.

This is the previous sibling, if there is one. Or, if there is no previous sibling, a node further up in the tree that is visible.

-   Returns a node or null.
-   A node is visible if all its parents are open.

{% highlight js %}
const nextNode = node.getNextVisibleNode();
{% endhighlight %}
