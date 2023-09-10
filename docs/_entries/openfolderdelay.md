---
title: openFolderDelay
name: options-openfolderdelay
---

Set the delay for opening a folder during drag-and-drop. The delay is in milliseconds. The default is 500 ms.

* Setting the option to `false` disables opening folders during drag-and-drop. 

{% highlight js %}
$('#tree1').tree({
    dataUrl: '/my/data/',
    openFolderDelay: 1000
});
{% endhighlight %}
