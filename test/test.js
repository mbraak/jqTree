$(function() {

var Tree = _TestClasses.Tree;
var Node = _TestClasses.Node;

var example_data = [
    {
        label: 'node1',
        children: [
            { label: 'child1' },
            { label: 'child2' }
        ]
    },
    {
        label: 'node2'
    }
];

var format_nodes = function(nodes) {
    var strings = $.map(nodes, function(node) {
        return node.name;
    });
    return strings.join(' ');
};

module("jqtree");
test("create jqtree from data", function() {
    $('#tree1').tree({
        data: example_data
    });

    equal(
        $('#tree1').children().length, 1,
        'number of children on level 0'
    );
    ok(
        $('#tree1').children().is('ul.tree'),
        'first element is ul.tree'
    );
    equal(
        $('#tree1 ul.tree > li').length, 2,
        'number of children on level 1'
    );
    ok(
        $('#tree1 ul.tree li:eq(0)').is('li.folder.closed'),
        'first child is li.folder.closed'
    );
    ok(
        $('#tree1 ul.tree li:eq(0) > span').is('span.folder.closed'),
        'span in first folder'
    );
    equal(
        $('#tree1 ul.tree li:eq(0) > span').text(),
        'node1'
    );

    $('#tree1').empty();
});

module("Tree");
test("Create tree from data", function() {
    var tree = new Tree();
    tree.loadFromData(example_data);

    equal(
        format_nodes(tree.children),
        'node1 node2',
        'nodes on level 1'
    );
    equal(
        format_nodes(tree.children[0].children),
        'child1 child2',
        'children of node1'
    );
    equal(
        format_nodes(tree.children[1].children),
        '',
        'children of node2'
    );
});

});
