$(function() {

var example_data = [
    {
        label: 'node1',
        id: 123,  // extra data
        children: [
            { label: 'child1' },
            { label: 'child2' }
        ]
    },
    {
        label: 'node2',
        id: 124,
        children: [
            { label: 'child3' }
        ]
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
        ($node.find('a:eq(0)').is('a.toggler.closed')) &&
        ($node.find('ul:eq(0)').is('ul'))
    );
}

var isNodeOpen = function($node) {
    return (
        ($node.is('li.folder')) &&
        ($node.find('a:eq(0)').is('a.toggler')) &&
        ($node.find('ul:eq(0)').is('ul')) &&
        (! $node.is('li.folder.closed')) &&
        (! $node.find('span:eq(0)').is('a.toggler.closed'))
    );
}

module("jqtree", {
    teardown: function() {
        $('#tree1').tree('destroy');
    }
});

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
        $('#tree1 ul.tree li:eq(0) > div > a.toggler').is('a.toggler.closed'),
        'button in first folder'
    );
    equal(
        $('#tree1 ul.tree li:eq(0) > div span.title').text(),
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
    ok(isNodeClosed($node1), 'node1 is open');

    stop();

    // open node1
    $tree.tree(
        'toggle',
        node1,
        function() {
            start();

            ok(isNodeOpen($node1), 'node1 is open');

            stop();

            // close node1
            $tree.tree(
                'toggle',
                node1,
                function() {
                    start();

                    ok(isNodeClosed($node1), 'node1 is closed');
                }
            );
        }
    );
});

// todo: test jqtree.getTree()

test("click event", function() {
    stop();

    // create tree
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    $tree.bind('tree.click', function(e) {
        start();
        equal(e.node.name, 'node1');
    });

    // click on node1
    var $node1 = $tree.find('ul.tree li:first');
    var $text_span = $node1.find('span:first');
    $text_span.click();
});

test('saveState', function() {
    var $tree = $('#tree1');

    var saved_state;

    function setState(state) {
        saved_state = state;
    }

    function getState() {
        return saved_state;
    }

    function createTree() {
        $tree.tree({
            data: example_data,
            saveState: true,
            onSetStateFromStorage: setState,
            onGetStateFromStorage: getState,
            selectable: true
        });
    }

    // create tree
    createTree();

    // nodes are initially closed
    var tree = $tree.tree('getTree');
    tree.iterate(function(node) {
        ok(! node.is_open, 'closed');
        return true;
    });

    // open node1
    $tree.tree('toggle', tree.children[0]);

    // node1 is open
    ok(tree.children[0].is_open, 'node1 is_open');

    // select node2
    $tree.tree('selectNode', tree.children[1]);

    // node2 is selected
    equal(
        $tree.tree('getSelectedNode').name,
        'node2',
        'getSelectedNode'
    );

    // create tree again
    $tree.tree('destroy');
    createTree();

    tree = $tree.tree('getTree');
    ok(tree.children[0].is_open, 'node1 is_open');
    ok(! tree.children[1].is_open, 'node2 is closed');

    // node2 is selected
    equal(
        $tree.tree('getSelectedNode').name,
        'node2',
        'getSelectedNode'
    );
});

test('getSelectedNode', function() {
    var $tree = $('#tree1');

    // create tree
    $tree.tree({
        data: example_data,
        selectable: true
    });

    // there is no node selected
    equal(
        $tree.tree('getSelectedNode'),
        false,
        'getSelectedNode'
    );

    // select node1
    var tree = $tree.tree('getTree');
    var node1 = tree.children[0];
    $tree.tree('selectNode', node1);

    // node1 is selected
    equal(
        $tree.tree('getSelectedNode').name,
        'node1',
        'getSelectedNode'
    );
});

test("tree toJson", function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    // 1. call toJson
    equal(
        $tree.tree('toJson'),
        '[{"name":"node1","children":'+
        '[{"name":"child1"},{"name":"child2"}],"id":123},'+
        '{"name":"node2","children":[{"name":"child3"}],"id":124}]'
    );

    // Check that properties 'children', 'parent' and 'element' still exist.
    var tree = $tree.tree('getTree');
    equal(tree.children.length, 2);
    ok(tree.children[0].parent != undefined, 'parent');
    ok($(tree.children[0].element).is('li'), 'element');
});

test("tree addNode", function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: {}
    });

    // 1. add node with children
    $tree.tree(
        'addNode',
        {
            label: 'abc',
            id: 1,
            children: [
                { label: 'c1' },
                { label: 'c2' }
            ]
        }
    );
});

module("Tree");
test("create tree from data", function() {
    var tree = new Tree.Tree();
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
        'child3',
        'children of node2'
    );
    equal(
        tree.children[0].id,
        123,
        'id'
    );
});

test("tree addChild", function() {
    var tree = new Tree.Tree('tree1');
    tree.addChild(
        new Tree.Node('abc')
    );
    tree.addChild(
        new Tree.Node('def')
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
    var tree = new Tree.Tree();
    tree.addChildAtPosition(new Tree.Node('abc'), 0);  // first
    tree.addChildAtPosition(new Tree.Node('ghi'), 2);  // index 2 does not exist
    tree.addChildAtPosition(new Tree.Node('def'), 1);
    tree.addChildAtPosition(new Tree.Node('123'), 0);

    equal(
        format_nodes(tree.children),
        '123 abc def ghi',
        'children'
    );
});

test('tree removeChild', function() {
    var tree = new Tree.Tree();

    var abc = new Tree.Node('abc');
    var def = new Tree.Node('def');
    var ghi = new Tree.Node('ghi');
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
    var tree = new Tree.Tree();

    var abc = new Tree.Node('abc');
    var def = new Tree.Node('def');
    var ghi = new Tree.Node('ghi');
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
    var tree = new Tree.Tree();
    equal(
        tree.hasChildren(),
        false,
        'tree without children'
    );

    tree.addChild(new Tree.Node('abc'));
    equal(
        tree.hasChildren(),
        true,
        'tree has children'
    );
});

test('tree iterate', function() {
    var tree = new Tree.Tree();
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
        'node1 child1 child2 node2 child3',
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
    var tree = new Tree.Tree()
    tree.loadFromData(example_data);

    /*
      node1
      ---child1
      ---child2
      node2
      ---child3
    */

    var node1 = tree.children[0];
    var node2 = tree.children[1];
    var child1 = node1.children[0];
    var child2 = node1.children[1];
    equal(node2.name, 'node2', 'node2 name');
    equal(child2.name, 'child2', 'child2 name');

    // move child2 after node2
    tree.moveNode(child2, node2, Tree.Position.AFTER);

    /*
      node1
      ---child1
      node2
      ---child3
      child2
    */
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
    // this means it's the first child
    tree.moveNode(child1, node2, Tree.Position.INSIDE);

    /*
      node1
      node2
      ---child1
      ---child3
      child2
    */
    equal(
        format_nodes(node2.children),
        'child1 child3',
        'node2 children'
    );
    equal(
        format_nodes(node1.children),
        '',
        'node1 has no children'
    );

    // move child2 before child1
    tree.moveNode(child2, child1, Tree.Position.BEFORE);

    /*
      node1
      node2
      ---child2
      ---child1
      ---child3
    */
    equal(
        format_nodes(node2.children),
        'child2 child1 child3',
        'node2 children'
    );
    equal(
        format_nodes(tree.children),
        'node1 node2',
        'tree nodes at first level'
    );
});

test('tree initFromData', function() {
    var data = 
        {
            label: 'main',
            children: [
                { label: 'c1' },
                { label: 'c2' }
            ]
        };
    var node = new Tree.Node();
    node.initFromData(data);

    equal(node.name, 'main')
    equal(
        format_nodes(node.children),
        'c1 c2',
        'children'
    );
});

module('util');

test('toJson', function() {
    equal(Tree.toJson('abc'), '"abc"');
    equal(Tree.toJson(123), '123');
    equal(Tree.toJson(true), 'true');
    equal(Tree.toJson({abc: 'def'}), '{"abc":"def"}');
    equal(Tree.toJson({}), '{}');
    equal(Tree.toJson([1, 2, 3]), '[1,2,3]');
    equal(Tree.toJson(null), 'null');
});

test('indexOf', function() {
    equal(Tree.indexOf([3, 2, 1], 1), 2);
    equal(Tree.indexOf([4, 5, 6], 1), -1);
});

test('Position.getName', function() {
    equal(
        Tree.Position.getName(Tree.Position.BEFORE),
        'before'
    );
});

});
