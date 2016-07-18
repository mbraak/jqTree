/*
example data:

node1
---child1
---child2
-node2
---child3
*/

var example_data = [
    {
        label: 'node1',
        id: 123,  // extra data
        int_property: 1,
        str_property: '1',
        children: [
            { label: 'child1', id: 125, int_property: 2 },
            { label: 'child2', id: 126 }
        ]
    },
    {
        label: 'node2',
        id: 124,
        int_property: 3,
        str_property: '3',
        children: [
            { label: 'child3', id: 127 }
        ]
    }
];

/*
example data 2:

-main
---c1
---c2
*/

var example_data2 = [
    {
        label: 'main',
        children: [
            { label: 'c1' },
            { label: 'c2' }
        ]
    }
];

function formatNodes(nodes) {
    var strings = $.map(nodes, function(node) {
        return node.name;
    });
    return strings.join(' ');
};

function isNodeClosed($node) {
    return (
        ($node.is('li.jqtree-folder.jqtree-closed')) &&
        ($node.find('a:eq(0)').is('a.jqtree-toggler.jqtree-closed')) &&
        ($node.find('ul:eq(0)').is('ul'))
    );
}

function isNodeOpen($node) {
    return (
        ($node.is('li.jqtree-folder')) &&
        ($node.find('a:eq(0)').is('a.jqtree-toggler')) &&
        ($node.find('ul:eq(0)').is('ul')) &&
        (! $node.is('li.jqtree-folder.jqtree-closed')) &&
        (! $node.find('span:eq(0)').is('a.jqtree-toggler.jqtree-closed'))
    );
}

function formatTitles($node) {
    var titles = $node.find('.jqtree-title').map(
        function(i, el) {
            return $(el).text();
        }
    );
    return titles.toArray().join(' ');
}

function getTreeVariables() {
    var JqTreeWidget = $('').tree('get_widget_class');

    var node = JqTreeWidget.getModule('node');
    var util = JqTreeWidget.getModule('util');

    return {
        Node: node.Node,
        Position: node.Position,
        util: util
    };
}


module.exports = {
    example_data: example_data,
    example_data2: example_data2,
    formatNodes: formatNodes,
    formatTitles: formatTitles,
    getTreeVariables: getTreeVariables,
    isNodeClosed: isNodeClosed,
    isNodeOpen: isNodeOpen
};
