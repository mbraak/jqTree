---
title: getNodeByCallback
name: functions-getnodebycallback
---

**function getNodeByCallback(callback);**

Get a tree node using a callback. The callback should return true if the node is found.

{% highlight js %}
var node = $('#tree1').tree(
  'getNodeByCallback',
  function(node) {
      if (node.name == 'abc') {
          // Node is found; return true
          return true;
      }
      else {
          // Node not found; continue searching
          return false;
      }
  }
);
{% endhighlight %}
