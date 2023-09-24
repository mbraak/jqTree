---
title: addToSelection
name: multiple-selection-add-to-selection
---

Add this node to the selection. Also set the focus to the node.

**function addToSelection(node, mustSetFocus = true);**

Parameter **mustSetFocus**: set the focus to the node (default true).

{% highlight js %}
var node = $('#tree1').tree('getNodeById', 123);
$('#tree1').tree('addToSelection', node);
{% endhighlight %}

Without setting the focus:

{% highlight js %}
$('#tree1').tree('addToSelection', node, false);
{% endhighlight %}
