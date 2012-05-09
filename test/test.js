$(function() {

QUnit.config.testTimeout = 5000;

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

var example_data2 = [
    {
        label: 'main',
        children: [
            { label: 'c1' },
            { label: 'c2' }
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
    setup: function() {
        $('body').append('<div id="tree1"></div>');
    },

    teardown: function() {
        var $tree = $('#tree1');
        $tree.tree('destroy');
        $tree.remove();
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

test('toggle', function() {
    // create tree
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    $tree.bind(
        'tree.open',
        function(e) {
            start();

            ok(! isNodeClosed($node1), 'node1 is open');

            // 2. close node1
            $tree.tree('toggle', node1);

            stop();
        }
    );

    $tree.bind(
        'tree.close',
        function(e) {
            start();

            ok(isNodeClosed($node1), 'node1 is closed');
        }
    );

    var tree = $tree.tree('getTree');
    var node1 = tree.children[0];
    var $node1 = $tree.find('ul.tree li:eq(0)');

    // node1 is initially closed
    ok(isNodeClosed($node1), 'node1 is open');

    // 1. open node1
    $tree.tree('toggle', node1);

    stop();
});

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

test("toJson", function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    // 1. call toJson
    equal(
        $tree.tree('toJson'),
        '[{"name":"node1","id":123,"children":'+
        '[{"name":"child1"},{"name":"child2"}]},'+
        '{"name":"node2","id":124,"children":[{"name":"child3"}]}]'
    );

    // Check that properties 'children', 'parent' and 'element' still exist.
    var tree = $tree.tree('getTree');
    equal(tree.children.length, 2);
    ok(tree.children[0].parent != undefined, 'parent');
    ok($(tree.children[0].element).is('li'), 'element');
});

test('loadData', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        autoOpen: true
    });

    // first node is 'node1'
    equal(
        $tree.find('> ul > li:first div:first > span').text(),
        'node1'
    );

    // 1. load new data
    $tree.tree('loadData', example_data2);

    // first node is 'main'
    equal(
        $tree.find('> ul > li:first div:first > span').text(),
        'main'
    );

    // 2. add new nodes to child3
    $tree.tree('loadData', example_data);

    var node2 = $tree.tree('getNodeById', 124);
    var child3 = node2.children[0];
    equal(child3.name, 'child3');

    var data = [
        { label: 'c4' },
        {
            label: 'c5',
            children: [
                { label: 'c6' }
            ]
        }
    ];
    $tree.tree('loadData', data, child3);

    // first node in html is still 'node1'
    equal(
        $tree.find('li:eq(0)').find('div:eq(0) span.title').text(),
        'node1'
    );

    // Node 'child3' now has a children 'c4' and 'c5'
    var $child3 = $tree.find('span:contains(child3)');
    var $li = $child3.closest('li');
    equal(
        $li.children('ul').children('li:eq(0)').find('div span.title').text(),
        'c4'
    );

    // Node 'child3' must have toggler button
    ok($child3.prev().is('a.toggler'));
});

test('openNode', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var node2 = $tree.tree('getTree').children[1];
    equal(node2.is_open, undefined);

    // 1. open node
    equal(node2.name, 'node2');
    $tree.tree('openNode', node2, null, true);

    equal(node2.is_open, true);
});

test('selectNode', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    var node1 = $tree.tree('getTree').children[0];
    var node2 = $tree.tree('getTree').children[1];
    var child3 = node2.children[0];

    equal(child3.name, 'child3');
    equal(node1.is_open, undefined);
    equal(node2.is_open, undefined);
    equal(child3.is_open, undefined);

    // 1. select node 'child3', which is a child of 'node2'; must_open_parents = true
    $tree.tree('selectNode', child3, true);
    equal($tree.tree('getSelectedNode').name, 'child3');

    equal(node1.is_open, undefined);
    equal(node2.is_open, true);
    equal(child3.is_open, undefined);

    // 2. select node 'node1'
    $tree.tree('selectNode', node1);
    equal($tree.tree('getSelectedNode').name, 'node1');
});

test('click toggler', function() {
    // setup
    stop();

    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    var $title = $tree.find('li:eq(0)').find('> div > span.title');
    equal($title.text(), 'node1');
    var $toggler = $title.prev();
    ok($toggler.is('a.toggler.closed'));

    $tree.bind('tree.open', function(e) {
        // 2. handle 'open' event
        start();
        equal(e.node.name, 'node1');
        stop();

        // 3. click toggler again
        $toggler.click();
    });

    $tree.bind('tree.close', function(e) {
        start();
        equal(e.node.name, 'node1');
    });

    // 1. click toggler of 'node1'
    $toggler.click();
});

test('getNodeById', function() {
	// setup
	var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    // 1. get 'node2' by id
    equal(
        $tree.tree('getNodeById', 124).name,
        'node2'
    );

    // 2. get id that does not exist
    equal($tree.tree('getNodeById', 333), null);
});

test('autoOpen', function() {
    var $tree = $('#tree1');

    function formatOpenFolders() {
        var open_nodes = [];
        $tree.find('li').each(function() {
            var $li = $(this);
            if ($li.is('.folder') && ! $li.is('.closed')) {
                var label = $li.children('div').find('span').text();
                open_nodes.push(label);
            };
        });

        return open_nodes.join(';');
    }

    /*
    -l1n1 (level 0)
    ----l2n1 (1)
    ----l2n2 (1)
    -------l3n1 (2)
    ----------l4n1 (3)
    -l1n2
    */
    var data = [
        {
            label: 'l1n1',
            children: [
                'l2n1',
                {
                    label: 'l2n2',
                    children: [
                        {
                            label: 'l3n1',
                            children: [
                                'l4n1'
                            ]
                        }
                    ]
                }
            ]
        },
        'l1n2'
    ];

    // 1. autoOpen is false
    $tree.tree({
        data: data,
        autoOpen: false
    });
    equal(formatOpenFolders(), '');

    $tree.tree('destroy');

    // 2. autoOpen is true
    $tree.tree({
        data: data,
        autoOpen: true
    });
    equal(formatOpenFolders(), 'l1n1;l2n2;l3n1');

    $tree.tree('destroy');

    // 3. autoOpen level 1
    $tree.tree({
        data: data,
        autoOpen: 1
    });
    equal(formatOpenFolders(), 'l1n1;l2n2');
});

test('onCreateLi', function() {
    // 1. init tree with onCreateLi
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        onCreateLi: function(node, $li) {
            var $span = $li.children('div').find('span');
            $span.html('_' + node.name + '_');
        }
    });

    equal(
        $tree.find('span:eq(0)').text(),
        '_node1_'
    );
});

test('save state', function() {
    // setup
    var state = null;

    // Fake $.cookie plugin for browsers that do not support localstorage
    $.cookie = function(key, param2, param3) {
        if (typeof param3 == 'object') {
            // set
            state = param2;
        }
        else {
            // get
            return state;
        }
    }

    // Remove state from localstorage
    if (localStorage) {
        localStorage.setItem('my_tree', null);
    }

    // 1. init tree
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true,
        saveState: 'my_tree'
    });

    var tree = $tree.tree('getTree');
    equal($tree.tree('getSelectedNode'), false);

    // 2. select node -> state is saved
    $tree.tree('selectNode', tree.children[0]);
    equal($tree.tree('getSelectedNode').name, 'node1');

    // 3. init tree again
    $tree.tree('destroy');

    $tree.tree({
        data: example_data,
        selectable: true,
        saveState: 'my_tree'
    });

    equal($tree.tree('getSelectedNode').name, 'node1');

    $.cookie = null;
});

test('generate hit areas', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    // 1. get hit areas
	var node = $tree.tree('getNodeById', 123);
    var hit_areas = $tree.tree('testGenerateHitAreas', node);

    var strings = $.map(hit_areas, function(hit_area) {
        return hit_area.node.name + ' ' + Tree.Position.getName(hit_area.position);
    });
    equal(strings.join(';'), 'node1 none;node2 inside;node2 after');
});

module("Tree");
test("create tree from data", function() {
    function checkData(tree) {
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
    }

    // 1. create tree from example data
    var tree = new Tree.Tree();
    tree.loadFromData(example_data);
    checkData(tree);

    // 2. create tree from new data format
    var data = [
        {
            label: 'node1',
            id: 123,  // extra data
            children: ['child1', 'child2']
        },
        {
            label: 'node2',
            id: 124,
            children: ['child3']
        }
    ];
    var tree = new Tree.Tree();
    tree.loadFromData(data);
    checkData(tree);
});

test("addChild", function() {
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

test('addChildAtPosition', function() {
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

test('removeChild', function() {
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

test('getChildIndex', function() {
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

test('hasChildren', function() {
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

test('iterate', function() {
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

test('moveNode', function() {
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

test('initFromData', function() {
    var data = 
        {
            label: 'main',
            children: [
                'c1',
                {
                    label: 'c2',
                    id: 201
                }
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
    equal(node.children[1].id, 201);
});

test('getData', function() {
    // 1. empty node
    var node = new Tree.Node();
    deepEqual(node.getData(), []);

    // 2.node with data
    node.loadFromData(
        [
            {
                label: 'n1',
                children: [
                    {
                        label: 'c1'
                    }
                ]
            }
        ]
    );
    deepEqual(
        node.getData(),
        [
            {
                name: 'n1',
                children: [
                    {
                        name: 'c1'
                    }
                ]
            }
        ]
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
    equal(Tree.toJson(Number.NEGATIVE_INFINITY), 'null');

    // test escapable
    Tree.toJson("\u200c");
});

test('indexOf', function() {
    equal(Tree.indexOf([3, 2, 1], 1), 2);
    equal(Tree.indexOf([4, 5, 6], 1), -1);
});

test('Position.getName', function() {
    equal(Tree.Position.getName(Tree.Position.BEFORE), 'before');
    equal(Tree.Position.getName(Tree.Position.AFTER), 'after');
    equal(Tree.Position.getName(Tree.Position.INSIDE), 'inside');
    equal(Tree.Position.getName(Tree.Position.NONE), 'none');
});

});
