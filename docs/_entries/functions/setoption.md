---
title: setOption
name: functions-setoption
---

**function setOption(option, value);**

Change a tree option after the tree is created. Only these options can be changed:

* [animationSpeed](#options-animationspeed)
* [dataUrl](#options-data-url)
* [dragAndDrop](#options-draganddrop)
* [keyboardSupport](#options-keyboardsupport)
* [multiSelect](#options-multiselect)
* [onCanSelectNode](#options-oncanselectnode)
* [selectable](#options-selectable)
* [slide](#options-slide)
* [startDndDelay](#options-start-dnd-delay)
* [tabIndex](#tab-index)

The other options can only be set when creating the tree. Setting one of them throws an error.

{% highlight js %}
$('#tree1').tree('setOption', 'keyboardSupport', false);
{% endhighlight %}
