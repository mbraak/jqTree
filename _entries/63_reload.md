---
title: reload
name: functions-reload
---

**function reload();**

**function reload(onFinished);**

Reload data from the server.

* Call `onFinished` when the data is loaded.

{% highlight js %}
$('#tree1').tree('reload');
{% endhighlight %}

{% highlight js %}
$('#tree1').tree('reload', function() {
    console.log('data is loaded');
});
{% endhighlight %}
