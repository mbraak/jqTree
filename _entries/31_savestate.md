---
title: saveState
name: options-savestate
---

Save and restore the state of the tree automatically. The state is saved in localstorage.

For this to work, you should give each node in the tree data an id field:

{% highlight js %}
{
    name: 'node1',
    id: 123,
    childen: [
        name: 'child1',
        id: 124
    ]
}
{% endhighlight %}

* **true**: save and restore state in localstorage
* **false (default)**: do nothing
* **string**: save state and use this name to store

{% highlight js %}
$('#tree1').tree({
    data: data,
    saveState: true
});
{% endhighlight %}

Example: save state in key 'tree1':

{% highlight js %}
$('#tree1').tree({
    data: data,
    saveState: 'tree1'
});
{% endhighlight %}
