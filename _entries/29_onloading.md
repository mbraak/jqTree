---
title: onLoading
name: options-onloading
---

The onLoading parameter is called when the tree data is loading. This gives us the opportunity to display a loading signal.

Callback looks like this:

```js
function (is_loading, node, $el)
```

* **is_loading**: boolean
  * true: data is loading
  * false: data is loaded
* **node**:
  * Node: if a node is loading
  * null: if the tree is loading
* **$el**:
  * if a node is loading this is the `li` element
  * if the tree is loading is the `ul` element of the whole tree
