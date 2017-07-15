---
title: getNodeByHtmlElement
name: functions-getnodebyhtmlelement
---

**function getNodeByHtmlElement(html_element);**

Get a tree node by an html element. The html element should be:

* The `li` element for the node
* Or, an element inside the `li`. For example the `span` for the title.

{% highlight js %}
var element = document.querySelector('#tree1 .jqtree-title');

var node = $('#tree1').tree('getNodeByHtmlElement', element);

console.log(node);
{% endhighlight %}

The element can also be a jquery element:

{% highlight js %}
var $element = $('#tree1 .jqtree-title');

var node = $('#tree1').tree('getNodeByHtmlElement', $element);

console.log(node);
{% endhighlight %}
