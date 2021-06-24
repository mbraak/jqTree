---
title: refresh
name: functions-refresh
---

**function refresh();**

Refresh the rendered nodes. In most cases you will not use this, because tree functions will rerender automatically. E.g. The functions `openNode` and `updateNode` rerender automatically.

{% highlight js %}
$('#tree1').tree('refresh');
{% endhighlight %}
