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

test("tree addChild", function() {
    var tree = new Tree('tree1');
    tree.addChild(
        new Node('abc')
    );
    tree.addChild(
        new Node('def')
    );

    equal(
        format_nodes(tree.children),
        'abc def',
        'children'
    );

    var node = tree.children[0];
    equal(
        node.parent.name,
        'tree1',
        'parent of node'
    );
});

test('tree addChildAtPosition', function() {
    var tree = new Tree();
    tree.addChildAtPosition(new Node('abc'), 0);  // first
    tree.addChildAtPosition(new Node('ghi'), 2);  // index 2 does not exist
    tree.addChildAtPosition(new Node('def'), 1);
    tree.addChildAtPosition(new Node('123'), 0);

    equal(
        format_nodes(tree.children),
        '123 abc def ghi',
        'children'
    );
});

test('tree removeChild', function() {
    var tree = new Tree();

    var abc = new Node('abc');
    var def = new Node('def');
    var ghi = new Node('ghi');
    tree.addChild(abc);
    tree.addChild(def);
    tree.addChild(ghi);

    equal(
        format_nodes(tree.children),
        'abc def ghi',
        'children'
    );

    // remove 'def'
    tree.removeChild(def);
    equal(
        format_nodes(tree.children),
        'abc ghi',
        'children'
    );

    // remove 'ghi'
    tree.removeChild(ghi);
    equal(
        format_nodes(tree.children),
        'abc',
        'children'
    );

    // remove 'abc'
    tree.removeChild(abc);
    equal(
        format_nodes(tree.children),
        '',
        'children'
    );
});

test('tree getChildIndex', function() {
    var tree = new Tree();

    var abc = new Node('abc');
    var def = new Node('def');
    var ghi = new Node('ghi');
    tree.addChild(abc);
    tree.addChild(def);
    tree.addChild(ghi);

    equal(
        tree.getChildIndex(def),
        1,
        'indef of def'
    );
});

test('tree hasChildren', function() {
    var tree = new Tree();
    equal(
        tree.hasChildren(),
        false,
        'tree without children'
    );

    tree.addChild(new Node('abc'));
    equal(
        tree.hasChildren(),
        true,
        'tree has children'
    );
});

test('tree iterate', function() {
    var tree = new Tree();
    tree.loadFromData(example_data);

    // iterate over all the nodes
    var nodes = [];
    tree.iterate(
        function(node, level) {
            nodes.push(node);
            return true;
        }
    );

    equal(
        format_nodes(nodes),
        'node1 child1 child2 node2',
        'all nodes'
    );

    // iterate over nodes on first level
    nodes = [];
    tree.iterate(
        function(node, level) {
            nodes.push(node);
            return false;
        }
    );

    equal(
        format_nodes(nodes),
        'node1 node2',
        'nodes on first level'
    );
});

});
