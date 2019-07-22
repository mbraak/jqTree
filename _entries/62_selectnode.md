---
title: selectNode
name: functions-selectnode
---

**function selectNode(node);**

**function selectNode(null);**

**function selectNode(node, { mustToggle, mustSetFocus });**

Select this node.

You can deselect the current node by calling **selectNode(null)**.

{% highlight js %}
// create tree
const $tree = $('#tree1');
$tree.tree({
    data: data,
    selectable: true
});

const node = $tree.tree('getNodeById', 123);
$tree.tree('selectNode', node);
{% endhighlight %}

**Options**

* **mustSetFocus**:
  * **true (default)**: set the focus to the node; only do this on selection, not deselection
  * **false**: do not set the focus
* **mustToggle**:
  * **true (default)**: toggle; deselected if selected and vice versa
  * **false**: select the node, never deselect

 {% highlight js %}
 const node = $tree.tree('getNodeById', 123);
 $tree.tree('selectNode', { mustSetFocus: false });
 {% endhighlight %}

 {% highlight js %}
 const node = $tree.tree('getNodeById', 123);
 $tree.tree('selectNode', { mustToggle: false });
 {% endhighlight %}
