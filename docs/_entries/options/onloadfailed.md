---
title: onLoadFailed
name: options-onloadfailed
---

When loading the data by ajax fails, then the option **onLoadFailed** is called.

{% highlight js %}
$('#tree1').tree({
    dataUrl: '/my/data/',
    onLoadFailed: function(response) {
        //
    }
});
{% endhighlight %}
