---
title: refreshHitAreas
name: functions-refreshhitareas
---

**function refreshHitAreas();**

Recompute the places where a dragged node can be dropped. Call this if the layout of the tree changes during a drag, for example when an element above the tree changes size.

{% highlight js %}
$('#tree1').tree('refreshHitAreas');
{% endhighlight %}
