---
title: closedIcon
name: options-closedicon
---

A character or symbol to display on closed nodes. The default is '&amp;#x25ba;' (&#x25ba;)

The value can be a:

-   string. E.g. a unicode character or a text.
    -   The text will be escaped.
-   html element. E.g. for an icon
-   JQuery element. Also for an icon

{% highlight js %}
// String
$('#tree1').tree({ closedIcon: '+' });

// Html element
const icon = document.createElement("span");
icon.className = "icon test";
$('#tree1').tree({ closedIcon: icon });

// JQuery element
$('#tree1').tree({ closedIcon: $('<span class="icon test" />') });
{% endhighlight %}
