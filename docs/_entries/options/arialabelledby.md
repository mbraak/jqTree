---
title: ariaLabelledBy
name: options-arialabelledby
---

The id of the element that names the tree, for example a heading. It is set as `aria-labelledby` on the tree element, so screen readers announce the text of that element. Use [ariaLabel](#options-arialabel) when the name is not visible on the page.

{% highlight html %}
<h2 id="categories-heading">Categories</h2>
<div id="tree1"></div>
{% endhighlight %}

{% highlight js %}
$('#tree1').tree({
    ariaLabelledBy: 'categories-heading',
    data: data
});
{% endhighlight %}
