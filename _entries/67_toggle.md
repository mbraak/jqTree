---
title: toggle
name: functions-toggle
---

**function toggle(node);**

**function toggle(node, slide);**

* slide: true / false

Open or close the tree node.

Default: toggle with slide animation:

{% highlight js %}
var node = $tree.tree('getNodeById', 123);
$tree.tree('toggle', node);
{% endhighlight %}

Toggle without animation:

{% highlight js %}
$tree.tree('toggle', node, false);
{% endhighlight %}
