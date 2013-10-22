$(function() {

QUnit.config.testTimeout = 5000;

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
        children: [
            { label: 'child1', id: 125 },
            { label: 'child2', id: 126 }
        ]
    },
    {
        label: 'node2',
        id: 124,
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
        $('#tree1').children().is('ul.jqtree-tree'),
        'first element is ul.jqtree-tree'
    );
    equal(
        $('#tree1 ul.jqtree-tree > li').length, 2,
        'number of children on level 1'
    );
    ok(
        $('#tree1 ul.jqtree-tree li:eq(0)').is('li.jqtree-folder.jqtree-closed'),
        'first child is li.jqtree-folder.jqtree-closed'
    );
    ok(
        $('#tree1 ul.jqtree-tree li:eq(0) > .jqtree-element > a.jqtree-toggler').is('a.jqtree-toggler.jqtree-closed'),
        'button in first folder'
    );
    equal(
        $('#tree1 ul.jqtree-tree li:eq(0) > .jqtree-element span.jqtree-title').text(),
        'node1'
    );
});

test('toggle', function() {
    // create tree
    var $tree = $('#tree1');
    var $node1;
    var node1;

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
    node1 = tree.children[0];
    $node1 = $tree.find('ul.jqtree-tree li:eq(0)');

    // node1 is initially closed
    ok(isNodeClosed($node1), 'node1 is closed');

    // 1. open node1
    $tree.tree('toggle', node1);

    stop();
});

test("click event", function() {
    stop();

    // create tree
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    $tree.bind('tree.click', function(e) {
        equal(e.node.name, 'node1');
    });

    $tree.bind('tree.select', function(e) {
        start();
        equal(e.node.name, 'node1');
    });

    // click on node1
    var $node1 = $tree.find('ul.jqtree-tree li:first');
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
        ok(! node.is_open, 'jqtree-closed');
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
        '[{"name":"child1","id":125},{"name":"child2","id":126}]},'+
        '{"name":"node2","id":124,"children":[{"name":"child3","id":127}]}]'
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
        $tree.find('> ul > li:first .jqtree-element:first > span').text(),
        'node1'
    );

    // 1. load new data
    $tree.tree('loadData', example_data2);

    // first node is 'main'
    equal(
        $tree.find('> ul > li:first .jqtree-element:first > span').text(),
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
        $tree.find('li:eq(0)').find('.jqtree-element:eq(0) span.jqtree-title').text(),
        'node1'
    );

    // Node 'child3' now has a children 'c4' and 'c5'
    var $child3 = $tree.find('span:contains(child3)');
    var $li = $child3.closest('li');
    equal(
        $li.children('ul').children('li:eq(0)').find('.jqtree-element span.jqtree-title').text(),
        'c4'
    );

    // Node 'child3' must have toggler button
    ok($child3.prev().is('a.jqtree-toggler'));
});

test('openNode and closeNode', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var node2 = $tree.tree('getNodeByName', 'node2');
    equal(node2.name, 'node2');
    equal(node2.is_open, undefined);

    // 1. open node2
    $tree.tree('openNode', node2, false);
    equal(node2.is_open, true);
    equal(isNodeOpen($(node2.element)), true);

    // 2. close node2
    $tree.tree('closeNode', node2, false);
    equal(node2.is_open, false);
    equal(isNodeClosed($(node2.element)), true);

    // 3. open child1
    var node1 = $tree.tree('getNodeByName', 'node1');
    var child1 = $tree.tree('getNodeByName', 'child1');

    // add a child to child1 so it is a folder
    $tree.tree('appendNode', 'child1a', child1);

    // node1 is initialy closed
    equal(node1.is_open, undefined);

    // open child1
    $tree.tree('openNode', child1, false);

    // node1 and child1 are now open1
    equal(node1.is_open, true);
    equal(child1.is_open, true);
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

    // -- select node 'child3', which is a child of 'node2'; must_open_parents = true
    $tree.tree('selectNode', child3, true);
    equal($tree.tree('getSelectedNode').name, 'child3');

    equal(node1.is_open, undefined);
    equal(node2.is_open, true);
    equal(child3.is_open, undefined);

    // -- select node 'node1'
    $tree.tree('selectNode', node1);
    equal($tree.tree('getSelectedNode').name, 'node1');

    // -- is 'node1' selected?
    ok($tree.tree('isNodeSelected', node1));
});

test('selectNode when another node is selected', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    var node1 = $tree.tree('getTree').children[0];
    var node2 = $tree.tree('getTree').children[1];
    

    // -- select node 'node2'
    $tree.tree('selectNode', node2);
    equal($tree.tree('getSelectedNode').name, 'node2');

    // -- setting event
    // -- is node 'node2' named 'deselected_node' in object's attributes?
    stop();
    $tree.bind('tree.select', function(e) {
        start();
        equal(e.deselected_node, node2);
    });

    // -- select node 'node1'; node 'node2' is selected before it
    $tree.tree('selectNode', node1);
    equal($tree.tree('getSelectedNode').name, 'node1');

    ok($tree.tree('isNodeSelected', node1));
});

test('click toggler', function() {
    // setup
    stop();

    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    var $title = $tree.find('li:eq(0)').find('> .jqtree-element > span.jqtree-title');
    equal($title.text(), 'node1');
    var $toggler = $title.prev();
    ok($toggler.is('a.jqtree-toggler.jqtree-closed'));

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
    var node2 = $tree.tree('getNodeByName', 'node2');

    // 1. get 'node2' by id
    equal(
        $tree.tree('getNodeById', 124).name,
        'node2'
    );

    // 2. get id that does not exist
    equal($tree.tree('getNodeById', 333), null);

    // 3. get id by string
    equal(
        $tree.tree('getNodeById', '124').name,
        'node2'
    );

    // 4. add node with string id; search by int
    $tree.tree(
        'appendNode',
        {
            label: 'abc',
            id: '234'
        }
    );

    equal(
        $tree.tree('getNodeById', 234).name,
        'abc'
    );
    equal(
        $tree.tree('getNodeById', '234').name,
        'abc'
    );

    // 5. load subtree in node2
    var subtree_data = [
        {
            label: 'sub1',
            id: 200,
            children: [
                {label: 'sub2', id: 201}
            ]
        }
    ];
    $tree.tree('loadData',  subtree_data, node2);
    var t = $tree.tree('getTree');

    equal(
        $tree.tree('getNodeById', 200).name,
        'sub1'
    );
    equal(
        $tree.tree('getNodeById', 201).name,
        'sub2'
    );
});

test('autoOpen', function() {
    var $tree = $('#tree1');

    function formatOpenFolders() {
        var open_nodes = [];
        $tree.find('li').each(function() {
            var $li = $(this);
            if ($li.is('.jqtree-folder') && ! $li.is('.jqtree-closed')) {
                var label = $li.children('.jqtree-element').find('span').text();
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
            var $span = $li.children('.jqtree-element').find('span');
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
    if (typeof localStorage != 'undefined') {
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

test('removeNode', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    // 1. Remove selected node; node is 'child1'
    var child1 = $tree.tree('getNodeByName', 'child1');
    $tree.tree('selectNode', child1);

    equal($tree.tree('getSelectedNode').name, 'child1');

    $tree.tree('removeNode', child1);

    equal(
        formatTitles($tree),
        'node1 child2 node2 child3'
    );

    // getSelectedNode must now return false
    equal($tree.tree('getSelectedNode'), false);

    // 2. No node is selected; remove child3
    $tree.tree('loadData', example_data);

    var child3 = $tree.tree('getNodeByName', 'child3');
    $tree.tree('removeNode', child3);

    equal(
        formatTitles($tree),
        'node1 child1 child2 node2'
    );

    equal($tree.tree('getSelectedNode'), false);

    // 3. Remove parent of selected node
    $tree.tree('loadData', example_data);

    child1 = $tree.tree('getNodeByName', 'child1');
    var node1 = $tree.tree('getNodeByName', 'node1');

    $tree.tree('selectNode', child1);

    $tree.tree('removeNode', node1);

    // node is unselected
    equal($tree.tree('getSelectedNode'), false);

    // 4. Remove unselected node without an id
    $tree.tree('loadData', example_data2);

    var c1 = $tree.tree('getNodeByName', 'c1');
    
    $tree.tree('removeNode', c1);

    equal(
        formatTitles($tree),
        'main c2'
    )
});

test('appendNode', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var node1 = $tree.tree('getNodeByName', 'node1');

    // 1. Add child3 to node1
    $tree.tree('appendNode', 'child3', node1);

    equal(
        formatTitles($(node1.element)),
        'node1 child1 child2 child3'
    );

    // 2. Add child4 to child1
    var child1 = $tree.tree('getNodeByName', 'child1');

    // Node 'child1' does not have a toggler button
    equal(
        $(child1.element).find('> .jqtree-element > .jqtree-toggler').length,
        0
    );

    $tree.tree('appendNode', 'child4', child1);

    equal(formatTitles($(child1.element)), 'child1 child4');

    // Node 'child1' must get a toggler button
    equal(
        $(child1.element).find('> .jqtree-element > .jqtree-toggler').length,
        1
    );
});

test('prependNode', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var node1 = $tree.tree('getNodeByName', 'node1');

    // 1. Prepend child0 to node1
    $tree.tree('prependNode', 'child0', node1);

    equal(
        formatTitles($(node1.element)),
        'node1 child0 child1 child2'
    );
});
test('init event', function() {
    // setup
    var $tree = $('#tree1');

    $tree.bind('tree.init', function() {
        start();

        // Check that we can call functions in 'tree.init' event
        equal($tree.tree('getNodeByName', 'node2').name, 'node2');
    });
    stop();

    $tree.tree({
        data: example_data
    });
});

test('updateNode', function() {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });

    equal(formatTitles($tree), 'node1 child1 child2 node2 child3');

    // -- update label
    var node2 = $tree.tree('getNodeByName', 'node2');
    $tree.tree('updateNode', node2, 'CHANGED');

    equal(formatTitles($tree), 'node1 child1 child2 CHANGED child3');
    equal(node2.name, 'CHANGED');

    // -- update data
    $tree.tree(
        'updateNode',
        node2,
        {
            name: 'xyz',
            tag1: 'abc'
        }
    );

    equal(formatTitles($tree), 'node1 child1 child2 xyz child3');
    equal(node2.name, 'xyz');
    equal(node2.tag1, 'abc');

    // - update id
    equal(node2.id, 124);

    $tree.tree('updateNode', node2, {id: 555});

    equal(node2.id, 555);
    equal(node2.name, 'xyz');

    // get node by id
    var node_555 = $tree.tree('getNodeById', 555);
    equal(node_555.name, 'xyz');

    var node_124 = $tree.tree('getNodeById', 124);
    equal(node_124, undefined);
});

test('moveNode', function() {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });

    var child1 = $tree.tree('getNodeByName', 'child1');
    var child2 = $tree.tree('getNodeByName', 'child2');
    var node1 = $tree.tree('getNodeByName', 'node1');
    var node2 = $tree.tree('getNodeByName', 'node2');

    // -- Move child1 after node2
    $tree.tree('moveNode', child1, node2, 'after');

    equal(formatTitles($tree), 'node1 child2 node2 child3 child1');

    // -- Check that illegal moves are skipped
    $tree.tree('moveNode', node1, child2, 'inside');
});

test('load on demand', function() {
    // setup
    var $tree = $('#tree1');

    $tree.tree({
        data: [
            {
                id: 1,
                label: 'node1',
                load_on_demand: true
            }
        ],
        dataUrl: '/tree/'
    });

    $.mockjax({
        url: '*',
        response: function(options) {
            equal(options.url, '/tree/', '2');
            deepEqual(options.data, { 'node' : 1 }, '3')

            this.responseText = [
                {
                    id: 2,
                    label: 'child1'
                }
            ];
        }
    });

    // -- open node
    $tree.bind('tree.refresh', function(e) {
        start();

        equal(formatTitles($tree), 'node1 child1', '4');
    });

    var node1 = $tree.tree('getNodeByName', 'node1');
    equal(formatTitles($tree), 'node1', '1');

    $tree.tree('openNode', node1, true);

    stop();
});

test('addNodeAfter', function() {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });
    var node1 = $tree.tree('getNodeByName', 'node1');

    // -- add node after node1
    $tree.tree('addNodeAfter', 'node3', node1);

    equal(formatTitles($tree), 'node1 child1 child2 node3 node2 child3');
});

test('addNodeBefore', function() {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });
    var node1 = $tree.tree('getNodeByName', 'node1');

    // -- add node before node1
    var new_node = $tree.tree('addNodeBefore', 'node3', node1);

    equal(formatTitles($tree), 'node3 node1 child1 child2 node2 child3');
});

test('addParentNode', function() {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });
    var child3 = $tree.tree('getNodeByName', 'child3');

    // -- add parent to child3
    $tree.tree('addParentNode', 'node3', child3);

    equal(formatTitles($tree), 'node1 child1 child2 node2 node3 child3');
});

test('mouse events', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        dragAndDrop: true,
        autoOpen: true
    });
    $tree.tree('setMouseDelay', 0);

    function getTitleElement(node_name) {
        var node = $tree.tree('getNodeByName', node_name);
        var $el = $(node.element);
        return $($el.find('.jqtree-title'));
    }

    var $node1 = getTitleElement('node1');
    var $child3 = getTitleElement('child3');

    // Move node1 inside child3
    // trigger mousedown event on node1
    $node1.trigger(
        $.Event('mousedown', { which: 1 })
    );

    // trigger mouse move to child3
    var child3_offset = $child3.offset();
    $tree.trigger(
        $.Event('mousemove', { pageX: child3_offset.left, pageY: child3_offset.top })
    );
    $tree.trigger('mouseup');

    equal(
        formatTitles($tree),
        'node2 child3 node1 child1 child2'
    );
});

test('multiple select', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({ data: example_data });

    var child1 = $tree.tree('getNodeByName', 'child1');
    var child2 = $tree.tree('getNodeByName', 'child2');

    // -- add nodes to selection
    // todo: more nodes as parameters?
    // todo: rename to 'selection.add' or 'selection' 'add'?
    $tree.tree('addToSelection', child1);
    $tree.tree('addToSelection', child2);

    // -- get selected nodes
    var selected_nodes = $tree.tree('getSelectedNodes');
    equal(
        formatNodes(selected_nodes),
        'child1 child2'
    );
});

module("Tree");
test('constructor', function() {
    // 1. Create node from string
    var node = new Tree.Node('n1');

    equal(node.name, 'n1');
    equal(node.children.length, 0);
    equal(node.parent, null);

    // 2. Create node from object
    node = new Tree.Node({
        label: 'n2',
        id: 123,
        parent: 'abc',  // parent must be ignored
        children: ['c'], // children must be ignored
        url: '/'
    });

    equal(node.name, 'n2');
    equal(node.id, 123);
    equal(node.url, '/');
    equal(node.label, undefined);
    equal(node.children.length, 0);
    equal(node.parent, null);
}); 

test("create tree from data", function() {
    function checkData(tree) {
        equal(
            formatNodes(tree.children),
            'node1 node2',
            'nodes on level 1'
        );
        equal(
            formatNodes(tree.children[0].children),
            'child1 child2',
            'children of node1'
        );
        equal(
            formatNodes(tree.children[1].children),
            'child3',
            'children of node2'
        );
        equal(
            tree.children[0].id,
            123,
            'id'
        );
    }

    // - create tree from example data
    var tree = new Tree.Node(null, true);
    tree.loadFromData(example_data);
    checkData(tree);

    // - create tree from new data format
    var data = [
        {
            label: 'node1',
            id: 123,
            children: ['child1', 'child2']  // nodes are only defined by a string
        },
        {
            label: 'node2',
            id: 124,
            children: ['child3']
        }
    ];
    var tree = new Tree.Node(null, true);
    tree.loadFromData(data);
    checkData(tree);
});

test("addChild", function() {
    var tree = new Tree.Node('tree1', true);
    tree.addChild(
        new Tree.Node('abc')
    );
    tree.addChild(
        new Tree.Node('def')
    );

    equal(
        formatNodes(tree.children),
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
    var tree = new Tree.Node(null, true);
    tree.addChildAtPosition(new Tree.Node('abc'), 0);  // first
    tree.addChildAtPosition(new Tree.Node('ghi'), 2);  // index 2 does not exist
    tree.addChildAtPosition(new Tree.Node('def'), 1);
    tree.addChildAtPosition(new Tree.Node('123'), 0);

    equal(
        formatNodes(tree.children),
        '123 abc def ghi',
        'children'
    );
});

test('removeChild', function() {
    var tree = new Tree.Node(null, true);

    var abc = new Tree.Node({'label': 'abc', 'id': 1});
    var def = new Tree.Node({'label': 'def', 'id': 2});
    var ghi = new Tree.Node({'label': 'ghi', 'id': 3});

    tree.addChild(abc);
    tree.addChild(def);
    tree.addChild(ghi);

    var jkl = new Tree.Node({'label': 'jkl', 'id': 4});
    def.addChild(jkl);

    equal(
        formatNodes(tree.children),
        'abc def ghi',
        'children'
    );

    equal(tree.id_mapping[2].name, 'def');
    equal(tree.id_mapping[4].name, 'jkl');

    // remove 'def'
    tree.removeChild(def);
    equal(
        formatNodes(tree.children),
        'abc ghi',
        'children'
    );

    equal(tree.id_mapping[2], null);
    equal(tree.id_mapping[4], null);

    // remove 'ghi'
    tree.removeChild(ghi);
    equal(
        formatNodes(tree.children),
        'abc',
        'children'
    );

    // remove 'abc'
    tree.removeChild(abc);
    equal(
        formatNodes(tree.children),
        '',
        'children'
    );
});

test('getChildIndex', function() {
    // setup
    var tree = new Tree.Node(null, true);

    var abc = new Tree.Node('abc');
    var def = new Tree.Node('def');
    var ghi = new Tree.Node('ghi');
    tree.addChild(abc);
    tree.addChild(def);
    tree.addChild(ghi);

    // 1. Get child index of 'def'
    equal(tree.getChildIndex(def), 1);

    // 2. Get child index of non-existing node
    equal(tree.getChildIndex(new Tree.Node('xyz')), -1);
});

test('hasChildren', function() {
    var tree = new Tree.Node(null, true);
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
    var tree = new Tree.Node(null, true);
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
        formatNodes(nodes),
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
        formatNodes(nodes),
        'node1 node2',
        'nodes on first level'
    );

    // add child 4
    var node3 = tree.getNodeById(124).children[0];
    node3.addChild(
        new Tree.Node('child4')
    );

    // test level parameter
    nodes = [];
    tree.iterate(
        function(node, level) {
            nodes.push(node.name + ' ' + level);
            return true;
        }
    );

    equal(
        nodes.join(','),
        'node1 0,child1 1,child2 1,node2 0,child3 1,child4 2'
    );
});

test('moveNode', function() {
    var tree = new Tree.Node(null, true);
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
        formatNodes(tree.children),
        'node1 node2 child2',
        'tree nodes at first level'
    );
    equal(
        formatNodes(node1.children),
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
        formatNodes(node2.children),
        'child1 child3',
        'node2 children'
    );
    equal(
        formatNodes(node1.children),
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
        formatNodes(node2.children),
        'child2 child1 child3',
        'node2 children'
    );
    equal(
        formatNodes(tree.children),
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
    var node = new Tree.Node(null, true);
    node.initFromData(data);

    equal(node.name, 'main')
    equal(
        formatNodes(node.children),
        'c1 c2',
        'children'
    );
    equal(node.children[1].id, 201);
});

test('getData', function() {
    // 1. empty node
    var node = new Tree.Node(null, true);
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

test('addAfter', function() {
    // setup
    var tree = new Tree.Node(null, true);
    tree.loadFromData(example_data);

    /*
    -node1
    ---c1
    ---c2
    -node2
    ---c3
    */

    equal(formatNodes(tree.children), 'node1 node2');

    // 1. Add 'node_b' after node2
    var node2 = tree.getNodeByName('node2');
    node2.addAfter('node_b');

    equal(formatNodes(tree.children), 'node1 node2 node_b');

    var node_b = tree.getNodeByName('node_b');
    equal(node_b.name, 'node_b');

    // 2. Add 'node_a' after node1
    var node1 = tree.getNodeByName('node1');
    node1.addAfter('node_a');

    equal(formatNodes(tree.children), 'node1 node_a node2 node_b');

    // 3. Add 'node_c' after node_b; new node is an object
    node_b.addAfter({
        label: 'node_c',
        id: 789
    });

    var node_c = tree.getNodeByName('node_c');
    equal(node_c.id, 789);

    equal(formatNodes(tree.children), 'node1 node_a node2 node_b node_c');
});

test('addBefore', function() {
    // setup
    var tree = new Tree.Node(null, true);
    tree.loadFromData(example_data);

    // 1. Add 'node_0' before node1
    var node1 = tree.getNodeByName('node1');
    node1.addBefore('node0');
    equal(formatNodes(tree.children), 'node0 node1 node2');
});

test('addParent', function() {
    // setup
    var tree = new Tree.Node(null, true);
    tree.loadFromData(example_data);

    // 1. Add node 'root' as parent of node1
    // Note that node also becomes a child of 'root'
    var node1 = tree.getNodeByName('node1');
    node1.addParent('root');

    var root = tree.getNodeByName('root');
    equal(formatNodes(root.children), 'node1 node2');
});

test('remove', function() {
    // setup
    var tree = new Tree.Node(null, true);
    tree.loadFromData(example_data);

    var child1 = tree.getNodeByName('child1');
    var node1 = tree.getNodeByName('node1');

    equal(formatNodes(node1.children), 'child1 child2');
    equal(child1.parent, node1);

    // 1. Remove child1
    child1.remove();

    equal(formatNodes(node1.children), 'child2');
    equal(child1.parent, null);
});

test('append', function() {
    // setup
    var tree = new Tree.Node(null, true);
    tree.loadFromData(example_data);

    var node1 = tree.getNodeByName('node1');

    // 1. Add child3 to node1
    node1.append('child3');

    equal(formatNodes(node1.children), 'child1 child2 child3');
});

test('prepend', function() {
    // setup
    var tree = new Tree.Node(null, true);
    tree.loadFromData(example_data);

    var node1 = tree.getNodeByName('node1');

    // 1. Prepend child0 to node1
    node1.prepend('child0');

    equal(formatNodes(node1.children), 'child0 child1 child2');
});

test('getNodeById', function() {
    // setup
    var tree = new Tree.Node(null, true);
    tree.loadFromData(example_data);

    // 1. Get node with id 124
    var node = tree.getNodeById(124);
    equal(node.name, 'node2');

    // 2. Delete node with id 124 and search again
    node.remove();

    equal(tree.getNodeById(124), null);

    // 3. Add node with id 456 and search for it
    var child3 = tree.getNodeByName('child2');
    child3.append({
        id: 456,
        label: 'new node'
    });

    node = tree.getNodeById(456);
    equal(node.name, 'new node');
});

test('getLevel', function() {
    // setup
    var tree = new Tree.Node(null, true);
    tree.loadFromData(example_data);

    // 1. get level for node1 and child1
    equal(tree.getNodeByName('node1').getLevel(), 1);
    equal(tree.getNodeByName('child1').getLevel(), 2);
});

test('loadFromData and id mapping', function() {
    // - get node from empty tree
    var tree = new Tree.Node(null, true);
    equal(tree.getNodeById(999), null);

    // - load example data in tree
    tree.loadFromData(example_data);
    equal(tree.getNodeById(124).name, 'node2');

    var child2 = tree.getNodeById(126);
    child2.addChild(
        new Tree.Node({label: 'child4', id: 128})
    );
    child2.addChild(
        new Tree.Node({label: 'child5', id: 129})
    );

    // - load data in node child2
    child2.loadFromData(['abc', 'def']);

    equal(tree.getNodeById(128), null);
    equal(child2.children.length, 2);
    equal(child2.children[0].name, 'abc');
});

test('removeChildren', function() {
    // - load example data
    var tree = new Tree.Node(null, true);
    tree.loadFromData(example_data);

    // add child4 and child5
    var child2 = tree.getNodeById(126);
    equal(child2.name, 'child2');

    child2.addChild(
        new Tree.Node({label: 'child4', id: 128})
    );
    child2.addChild(
        new Tree.Node({label: 'child5', id: 129})
    );
    equal(tree.getNodeById(128).name, 'child4');

    // - remove children from child2
    child2.removeChildren();
    equal(tree.getNodeById(128), null);
    equal(child2.children.length, 0);
});

test('node with id 0', function() {
    // - load node with id 0
    var tree = new Tree.Node(null, true);
    tree.loadFromData([
        {
            id: 0,
            label: 'mynode'
        }
    ]);

    // - get node by id
    var node = tree.getNodeById(0);
    equal(node.name, 'mynode');

    // -- remove the node
    node.remove();

    equal(tree.getNodeById(0), undefined);
});

module('util');

test('JSON.stringify', function() {
    equal(JSON.stringify('abc'), '"abc"');
    equal(JSON.stringify(123), '123');
    equal(JSON.stringify(true), 'true');
    equal(JSON.stringify({abc: 'def'}), '{"abc":"def"}');
    equal(JSON.stringify({}), '{}');
    equal(JSON.stringify([1, 2, 3]), '[1,2,3]');
    equal(JSON.stringify(null), 'null');
    equal(JSON.stringify(Number.NEGATIVE_INFINITY), 'null');

    // test escapable
    JSON.stringify("\u200c");
});

test('indexOf', function() {
    equal(Tree.indexOf([3, 2, 1], 1), 2);
    equal(Tree._indexOf([3, 2, 1], 1), 2);
    equal(Tree.indexOf([4, 5, 6], 1), -1);
    equal(Tree._indexOf([4, 5, 6], 1), -1);
});

test('Position.getName', function() {
    equal(Tree.Position.getName(Tree.Position.BEFORE), 'before');
    equal(Tree.Position.getName(Tree.Position.AFTER), 'after');
    equal(Tree.Position.getName(Tree.Position.INSIDE), 'inside');
    equal(Tree.Position.getName(Tree.Position.NONE), 'none');
});

test('Position.nameToIndex', function() {
    equal(Tree.Position.nameToIndex('before'), Tree.Position.BEFORE);
    equal(Tree.Position.nameToIndex('after'), Tree.Position.AFTER);
    equal(Tree.Position.nameToIndex(''), 0);
});

});
