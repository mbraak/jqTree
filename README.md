[![Travis Status](https://api.travis-ci.org/mbraak/jqTree.svg)](http://travis-ci.org/mbraak/jqTree) [![Coverage Status](https://img.shields.io/coveralls/mbraak/jqTree.svg)](https://coveralls.io/r/mbraak/jqTree)

[![Bower version](https://img.shields.io/bower/v/jqtree.svg)](https://mbraak.github.io/jqTree/) [![NPM version](https://img.shields.io/npm/v/jqtree.svg)](https://www.npmjs.com/package/jqtree)

# jqTree

JqTree is a tree widget. Read more in the [documentation](https://mbraak.github.io/jqTree/).

![screenshot](https://raw.github.com/mbraak/jqTree/master/screenshot.png)

## Features

* Create a tree from JSON data
* Drag and drop
* Works on ie9+, firefox, chrome and safari
* Written in Typescript

The project is hosted on [github](https://github.com/mbraak/jqTree), has a [test suite](http://mbraak.github.io/jqTree/test/test.html).

## Examples

Example with ajax data:

```html
<div id="tree1" data-url="/example_data/"></div>
```

```js
$('#tree1').tree();
```

Example with static data:

```js
var data = [
    {
        label: 'node1', id: 1,
        children: [
            { label: 'child1', id: 2 },
            { label: 'child2', id: 3 }
        ]
    },
    {
        label: 'node2', id: 4,
        children: [
            { label: 'child3', id: 5 }
        ]
    }
];
$('#tree1').tree({
    data: data,
    autoOpen: true,
    dragAndDrop: true
});
```

## Documentation

The documentation is on http://mbraak.github.io/jqTree/.

## Thanks

The code for the mouse widget is heavily inspired by the mouse widget from jquery ui.
