---
title: openedIcon
name: options-openedicon
---

A character or symbol to display on opened nodes. The default is '&amp;#x25bc;' (&#x25bc;)

The value can be a:

-   string. E.g. a unicode character or a text.
    -   The text will be escaped.
-   html element. E.g. for an icon
-   JQuery element. Also for an icon

{% highlight js %}
// String
$('#tree1').tree({ openedIcon: '-' });

// Html element
const icon = document.createElement("span");
icon.className = "icon test";
$('#tree1').tree({ openedIcon: icon });

// JQuery element
$('#tree1').tree({ openedIcon: $('<span class="icon test" />') });
{% endhighlight %}
