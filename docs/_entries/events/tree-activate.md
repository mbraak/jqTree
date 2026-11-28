---
title: tree.activate
name: event-tree-activate
---

Triggered when the user presses **Enter** on the selected node, or on the focused node when no node is selected. With [multiSelect](#options-multiselect) it is the focused node. Use it for what clicking a link would do, like opening the edit page of the node.

* **e.node**: the node
* **e.click_event**: the keyboard event

{% highlight js %}
$('#tree1').on(
    'tree.activate',
    function(e) {
        window.location.href = e.node.url;
    }
);
{% endhighlight %}
