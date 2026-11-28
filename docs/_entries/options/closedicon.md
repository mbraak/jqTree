---
title: closedIcon
name: options-closedicon
---

A character, symbol or icon to display on closed nodes. The default is an svg triangle that points right, or left when the `rtl` option is true.

The value can be a:

-   **string**. E.g. a unicode character, a text or html.
    -   The string is rendered as html, so escape text that can contain `<` or `&`. Don't use input from users.
-   **html element**. E.g. for an icon
-   **JQuery element**. Also for an icon

{% highlight js %}
// String
$('#tree1').tree({ closedIcon: '+' });

// Html string
$('#tree1').tree({ closedIcon: '<i class="icon"></i>' });

// Html element
const icon = document.createElement("span");
icon.className = "icon test";
$('#tree1').tree({ closedIcon: icon });

// JQuery element
$('#tree1').tree({ closedIcon: $('<span class="icon test" />') });
{% endhighlight %}
