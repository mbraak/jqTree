---
title: data
name: options-data
---

Define the contents of the tree. The data is a nested array of objects. This option is required.

It looks like this:

{% highlight js %}
var data = [
    {
        name: 'node1',
        children: [
            { name: 'child1' },
            { name: 'child2' }
        ]
    },
    {
        name: 'node2',
        children: [
            { name: 'child3' }
        ]
    }
];
$('#tree1').tree({data: data});
{% endhighlight %}

* **name**: name of a node (required)
    * Note that you can also use `label` instead of `name`
* **children**: array of child nodes (optional)
* **id**: int or string (optional)
    * Must be an int or a string
    * Must be unique in the tree
    * The `id` property is required if you use the multiple selection feature

You can also include other data in the objects. You can later access this data.

For example, to add an id:

{% highlight js %}
{
    name: 'node1',
    id: 1
}
{% endhighlight %}
