---
title: ariaLabel
name: options-arialabel
---

The accessible name of the tree. It is set as `aria-label` on the tree element, so screen readers announce it. Use [ariaLabelledBy](#options-arialabelledby) instead when the name is visible on the page.

{% highlight js %}
$('#tree1').tree({
    ariaLabel: 'Categories',
    data: data
});
{% endhighlight %}
