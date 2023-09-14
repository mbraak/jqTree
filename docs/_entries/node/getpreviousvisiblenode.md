---
title: getPreviousVisibleNode
name: node-functions-getpreviousvisiblenode
---

-   Get the previous visible node in the tree. Does the same as using the _up_ key.
-   If the previous node is an open parent: return the last child of the node.
-   If the previous node is a closed parent: skip the child nodes of the previous parent, return the previous parent node.

Returns a node or null.

{% highlight js %}
var node = node.getPreviousVisibleNode();
{% endhighlight %}
