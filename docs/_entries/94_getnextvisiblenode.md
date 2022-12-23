---
title: getNextVisibleNode
name: node-functions-getnextvisiblenode
---

Get the next visible node in the tree.

-   Does the same as using the _down_ key.
-   If a parent node is open: return the first child of the node.
-   If a parent node is closed: skip the child nodes, return the next parent node.

Returns a node or null.

{% highlight js %}
var node = node.getNextVisibleNode();
{% endhighlight %}
