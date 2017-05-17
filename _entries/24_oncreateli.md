---
title: onCreateLi
name: options-oncreateli
---

The function is called for each created node. You can use this to define extra html.

The function is called with the following parameters:

* **node**: Node element
* **$li**: Jquery li element
* **is_selected**: is the node selected (true/false) 

{% highlight js %}
$('#tree1').tree({
    data: data,
    onCreateLi: function(node, $li, is_selected) {
        // Add 'icon' span before title
        $li.find('.jqtree-title').before('<span class="icon"></span>');
    }
});
{% endhighlight %}
