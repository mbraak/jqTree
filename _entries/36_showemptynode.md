---
title: showEmptyNode
name: options-showemptynode
---

* **true**: A node with empty children is considered a folder
    * Show folder icon
    * Folder can be opened and closed
* **false (default)**: A node with empty children is considered a child node

Example with option true:

{% highlight js %}
const data = [
    {
        name: 'node1',
        id: 123,
        childen: []
    }
];

$('#tree1').tree({
    data: data,
    showEmptyNode: true
});
{% endhighlight %}
