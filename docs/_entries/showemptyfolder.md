---
title: showEmptyFolder
name: options-showemptyfolder
---

* **true**: A node with empty children is considered a folder. Meaning: the node has a 'children' attribute, but it's an empty array.
    * Show folder icon
    * Folder can be opened and closed
* **false (default)**: A node with empty children is considered a child node

Example with option true:

{% highlight js %}
const data = [
    {
        name: 'node1',
        id: 123,
        children: []
    }
];

$('#tree1').tree({
    data: data,
    showEmptyFolder: true
});
{% endhighlight %}
