---
title: onLoadFailed
name: options-onloadfailed
---

When loading the data by ajax fails, then the option **onLoadFailed** is called with either an error or a response.

* error: the error thrown by `fetch`, if the request failed with a network error.
* response: the response, if the request returned an error status.

{% highlight js %}
$('#tree1').tree({
    dataUrl: '/my/data/',
    onLoadFailed: function({ error, response}) {
        //
    }
});
{% endhighlight %}
