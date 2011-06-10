$(function() {

var Tree = _TestClasses.Tree;
var Node = _TestClasses.Node;
var Position = _TestClasses.Position;

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

var isNodeClosed = function($node) {
    return (
        ($node.is('li.folder.closed')) &&
        ($node.find('span:eq(0)').is('span.folder.closed')) &&
        ($node.find('ul:eq(0)').is('ul.folder.closed'))
    );
}

var isNodeOpen = function($node) {
    return (
        ($node.is('li.folder')) &&
        ($node.find('span:eq(0)').is('span.folder')) &&
        ($node.find('ul:eq(0)').is('ul.folder')) &&
        (! $node.is('li.folder.closed')) &&
        (! $node.find('span:eq(0)').is('span.folder.closed')) &&
        (! $node.find('ul:eq(0)').is('ul.folder.closed'))
    );
}

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
        $('#tree1 ul.tree li:eq(0) > span:first').is('span.folder.closed'),
        'span in first folder'
    );
    equal(
        $('#tree1 ul.tree li:eq(0) > span:eq(1)').text(),
        'node1'
    );
});

test('jqtree toggle', function() {
    // create tree
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var tree = $tree.tree('getTree');
    var node1 = tree.children[0];
    var $node1 = $tree.find('ul.tree li:eq(0)');

    // node1 is initially closed
    ok(isNodeClosed($node1));

    stop();

    // open node1
    $tree.tree(
        'toggle',
        node1,
        function() {
            start();

            ok(isNodeOpen($node1));

            stop();

            // close node1
            $tree.tree(
                'toggle',
                node1,
                function() {
                    start();

                    ok(isNodeClosed($node1));
                }
            );
        }
    );
});

// todo: test jqtree.getTree()
test("click event", function() {
    stop(2000);

    var $tree = $('#tree1');
    var tree = $tree.tree('getTree');

    // create tree
    $tree.tree({
        data: example_data,
        onClick: function(node) {
            start();
            equal(node.name, 'node1');
        }
    });

    // click on node1
    var $node1 = $tree.find('ul.tree li:eq(0)');
    var $text_span = $node1.find('span:eq(1)');
    $text_span.click();
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

test('tree moveNode', function() {
    var tree = Tree.createFromData(example_data);

    var node1 = tree.children[0];
    var node2 = tree.children[1];
    var child1 = node1.children[0];
    var child2 = node1.children[1];
    equal(node2.name, 'node2', 'node2 name');
    equal(child2.name, 'child2', 'child2 name');

    // move child2 after node2
    tree.moveNode(child2, node2, Position.AFTER);
    equal(
        format_nodes(tree.children),
        'node1 node2 child2',
        'tree nodes at first level'
    );
    equal(
        format_nodes(node1.children),
        'child1',
        'node1 children'
    );

    // move child1 inside node2
    tree.moveNode(child1, node2, Position.INSIDE);
    equal(
        format_nodes(node2.children),
        'child1',
        'node2 children'
    );
    equal(
        format_nodes(node1.children),
        '',
        'node2 children'
    );

    // move child2 before child1
    tree.moveNode(child2, child1, Position.BEFORE);
    equal(
        format_nodes(node2.children),
        'child2 child1',
        'node2 children'
    );
    equal(
        format_nodes(tree.children),
        'node1 node2',
        'tree nodes at first level'
    );
})

});
