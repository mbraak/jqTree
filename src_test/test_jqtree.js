var mockjax = require('jquery-mockjax')(jQuery, window);

var utils_for_test = require('./utils_for_test');

var example_data = utils_for_test.example_data;
var example_data2 = utils_for_test.example_data2;
var formatNodes = utils_for_test.formatNodes;
var formatTitles = utils_for_test.formatTitles;
var isNodeOpen = utils_for_test.isNodeOpen;
var isNodeClosed = utils_for_test.isNodeClosed;

var tree_vars = utils_for_test.getTreeVariables();

var Position = tree_vars.Position;


QUnit.module("jqtree", {
    beforeEach: function() {
        $('body').append('<div id="tree1"></div>');
    },

    afterEach: function() {
        var $tree = $('#tree1');
        $tree.tree('destroy');
        $tree.remove();

        $.mockjax.clear();
    }
});

test("create jqtree from data", function(assert) {
    $('#tree1').tree({
        data: example_data
    });

    assert.equal(
        $('#tree1').children().length, 1,
        'number of children on level 0'
    );
    assert.ok(
        $('#tree1').children().is('ul.jqtree-tree'),
        'first element is ul.jqtree-tree'
    );
    assert.equal(
        $('#tree1 ul.jqtree-tree > li').length, 2,
        'number of children on level 1'
    );
    assert.ok(
        $('#tree1 ul.jqtree-tree li:eq(0)').is('li.jqtree-folder.jqtree-closed'),
        'first child is li.jqtree-folder.jqtree-closed'
    );
    assert.ok(
        $('#tree1 ul.jqtree-tree li:eq(0) > .jqtree-element > a.jqtree-toggler').is('a.jqtree-toggler.jqtree-closed'),
        'button in first folder'
    );
    assert.equal(
        $('#tree1 ul.jqtree-tree li:eq(0) > .jqtree-element span.jqtree-title').text(),
        'node1'
    );
});

test('toggle', function(assert) {
    // setup
    var done = assert.async();

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
            assert.ok(! isNodeClosed($node1), 'node1 is open');

            // 2. close node1
            $tree.tree('toggle', node1);
        }
    );

    $tree.bind(
        'tree.close',
        function(e) {
            assert.ok(isNodeClosed($node1), 'node1 is closed');

            done();
        }
    );

    var tree = $tree.tree('getTree');
    node1 = tree.children[0];
    $node1 = $tree.find('ul.jqtree-tree li:eq(0)');

    // node1 is initially closed
    assert.ok(isNodeClosed($node1), 'node1 is closed');

    // 1. open node1
    $tree.tree('toggle', node1);
});

test("click event", function(assert) {
    var select_count = 0;

    // create tree
    var $tree = $('#tree1');

    $tree.tree({
        data: example_data,
        selectable: true
    });

    var $node1 = $tree.find('ul.jqtree-tree li:first');
    var $text_span = $node1.find('span:first');

    $tree.bind('tree.click', function(e) {
        assert.equal(e.node.name, 'node1');
    });

    var done = assert.async();

    $tree.bind('tree.select', function(e) {
        select_count += 1;

        if (select_count == 1) {
            assert.equal(e.node.name, 'node1');

            assert.equal($tree.tree('getSelectedNode').name, 'node1');

            // deselect
            $text_span.click();
        }
        else {
            assert.equal(e.node, null);
            assert.equal(e.previous_node.name, 'node1');
            assert.equal($tree.tree('getSelectedNode'), false);

            done();
        }
    });

    // click on node1
    $text_span.click();
});

test('saveState', function(assert) {
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
        assert.ok(! node.is_open, 'jqtree-closed');
        return true;
    });

    // open node1
    $tree.tree('toggle', tree.children[0]);

    // node1 is open
    assert.ok(tree.children[0].is_open, 'node1 is_open');

    // select node2
    $tree.tree('selectNode', tree.children[1]);

    // node2 is selected
    assert.equal(
        $tree.tree('getSelectedNode').name,
        'node2',
        'getSelectedNode (1)'
    );

    // create tree again
    $tree.tree('destroy');
    createTree();

    tree = $tree.tree('getTree');
    assert.ok(tree.children[0].is_open, 'node1 is_open');
    assert.ok(! tree.children[1].is_open, 'node2 is closed');

    // node2 is selected
    assert.equal(
        $tree.tree('getSelectedNode').name,
        'node2',
        'getSelectedNode (2)'
    );
});

test('getSelectedNode', function(assert) {
    var $tree = $('#tree1');

    // create tree
    $tree.tree({
        data: example_data,
        selectable: true
    });

    // there is no node selected
    assert.equal(
        $tree.tree('getSelectedNode'),
        false,
        'getSelectedNode'
    );

    // select node1
    var tree = $tree.tree('getTree');
    var node1 = tree.children[0];
    $tree.tree('selectNode', node1);

    // node1 is selected
    assert.equal(
        $tree.tree('getSelectedNode').name,
        'node1',
        'getSelectedNode'
    );
});

test("toJson", function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    // 1. call toJson
    assert.equal(
        $tree.tree('toJson'),
        '[{"name":"node1","id":123,"int_property":1,"str_property":"1",'+
        '"children":[{"name":"child1","id":125,"int_property":2},{"name":'+
        '"child2","id":126}]},{"name":"node2","id":124,"int_property":3,'+
        '"str_property":"3","children":[{"name":"child3","id":127}]}]'
    );

    // Check that properties 'children', 'parent' and 'element' still exist.
    var tree = $tree.tree('getTree');
    assert.equal(tree.children.length, 2);
    assert.ok(tree.children[0].parent != undefined, 'parent');
    assert.ok($(tree.children[0].element).is('li'), 'element');
});

test('loadData', function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        autoOpen: true
    });

    // first node is 'node1'
    assert.equal(
        $tree.find('> ul > li:first .jqtree-element:first > span').text(),
        'node1'
    );

    // - load new data
    $tree.tree('loadData', example_data2);

    // first node is 'main'
    assert.equal(
        $tree.find('> ul > li:first .jqtree-element:first > span').text(),
        'main'
    );

    // - load new data under node 'child3'
    $tree.tree('loadData', example_data);

    var child3 = $tree.tree('getNodeByName', 'child3');

    var data = [
        { label: 'c4', id: 200 },
        {
            label: 'c5', id: 201,
            children: [
                { label: 'c6', id: 202 }
            ]
        }
    ];
    $tree.tree('loadData', data, child3);

    // first node in html is still 'node1'
    assert.equal(
        $tree.find('li:eq(0)').find('.jqtree-element:eq(0) span.jqtree-title').text(),
        'node1'
    );

    // Node 'child3' now has a children 'c4' and 'c5'
    var $child3 = $tree.find('span:contains(child3)');
    var $li = $child3.closest('li');
    assert.equal(
        $li.children('ul').children('li:eq(0)').find('.jqtree-element span.jqtree-title').text(),
        'c4'
    );

    // Node 'child3' must have toggler button
    assert.ok(
        $child3.prev().is('a.jqtree-toggler'),
        "node 'child3' must have toggler button"
    );

    // - select node 'c5' and load new data under 'child3'
    var c5 = $tree.tree('getNodeByName', 'c5');
    $tree.tree('selectNode', c5);

    assert.equal($tree.tree('getSelectedNode').name, 'c5');

    var data2 = [
        { label: 'c7' },
        { label: 'c8' }
    ];
    $tree.tree('loadData', data2, child3);

    // c5 must be deselected
    assert.equal($tree.tree('getSelectedNode'), false);

    // - select c7; load new data under child3; note that c7 has no id
    $tree.tree('selectNode', $tree.tree('getNodeByName', 'c7'));

    assert.equal($tree.tree('getSelectedNode').name, 'c7');

    $tree.tree('loadData', [ 'c9' ], child3);

    assert.equal($tree.tree('getSelectedNode'), false);

    // - select c9 (which has no id); load new nodes under child2
    $tree.tree('selectNode', $tree.tree('getNodeByName', 'c9'));

    var child2 = $tree.tree('getNodeByName', 'child2');
    $tree.tree('loadData', [ 'c10' ], child2);

    assert.equal($tree.tree('getSelectedNode').name, 'c9');
});

test('openNode and closeNode', function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var node2 = $tree.tree('getNodeByName', 'node2');
    assert.equal(node2.name, 'node2');
    assert.equal(node2.is_open, undefined);

    // 1. open node2
    $tree.tree('openNode', node2, false);
    assert.equal(node2.is_open, true);
    assert.equal(isNodeOpen($(node2.element)), true);

    // 2. close node2
    $tree.tree('closeNode', node2, false);
    assert.equal(node2.is_open, false);
    assert.equal(isNodeClosed($(node2.element)), true);

    // 3. open child1
    var node1 = $tree.tree('getNodeByName', 'node1');
    var child1 = $tree.tree('getNodeByName', 'child1');

    // add a child to child1 so it is a folder
    $tree.tree('appendNode', 'child1a', child1);

    // node1 is initialy closed
    assert.equal(node1.is_open, undefined);

    // open child1
    $tree.tree('openNode', child1, false);

    // node1 and child1 are now open1
    assert.equal(node1.is_open, true);
    assert.equal(child1.is_open, true);
});

test('selectNode', function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    var node1 = $tree.tree('getTree').children[0];
    var node2 = $tree.tree('getTree').children[1];
    var child3 = node2.children[0];

    assert.equal(child3.name, 'child3');
    assert.equal(node1.is_open, undefined);
    assert.equal(node2.is_open, undefined);
    assert.equal(child3.is_open, undefined);

    // -- select node 'child3', which is a child of 'node2'; must_open_parents = true
    $tree.tree('selectNode', child3, true);
    assert.equal($tree.tree('getSelectedNode').name, 'child3');

    assert.equal(node1.is_open, undefined);
    assert.equal(node2.is_open, true);
    assert.equal(child3.is_open, undefined);

    // -- select node 'node1'
    $tree.tree('selectNode', node1);
    assert.equal($tree.tree('getSelectedNode').name, 'node1');

    // -- is 'node1' selected?
    assert.ok($tree.tree('isNodeSelected', node1));

    // -- deselect
    $tree.tree('selectNode', null);
    assert.equal($tree.tree('getSelectedNode'), false);
});

test('selectNode when another node is selected', function(assert) {
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
    assert.equal($tree.tree('getSelectedNode').name, 'node2');

    // -- setting event
    // -- is node 'node2' named 'deselected_node' in object's attributes?
    var is_select_event_fired = false;

    $tree.bind('tree.select', function(e) {
        assert.equal(e.deselected_node, node2);
        is_select_event_fired = true;
    });

    // -- select node 'node1'; node 'node2' is selected before it
    $tree.tree('selectNode', node1);
    assert.equal($tree.tree('getSelectedNode').name, 'node1');

    assert.ok($tree.tree('isNodeSelected', node1));

    // event was fired
    assert.ok(is_select_event_fired);
});

test('click toggler', function(assert) {
    // setup
    var done = assert.async();

    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    var $title = $tree.find('li:eq(0)').find('> .jqtree-element > span.jqtree-title');
    assert.equal($title.text(), 'node1');
    var $toggler = $title.prev();
    assert.ok($toggler.is('a.jqtree-toggler.jqtree-closed'));

    $tree.bind('tree.open', function(e) {
        // 2. handle 'open' event
        assert.equal(e.node.name, 'node1');

        // 3. click toggler again
        $toggler.click();
    });

    $tree.bind('tree.close', function(e) {
        assert.equal(e.node.name, 'node1');
        done();
    });

    // 1. click toggler of 'node1'
    $toggler.click();
});

test('getNodeById', function(assert) {
	// setup
	var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });
    var node2 = $tree.tree('getNodeByName', 'node2');

    // 1. get 'node2' by id
    assert.equal(
        $tree.tree('getNodeById', 124).name,
        'node2'
    );

    // 2. get id that does not exist
    assert.equal($tree.tree('getNodeById', 333), null);

    // 3. get id by string
    assert.equal(
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

    assert.equal(
        $tree.tree('getNodeById', 234).name,
        'abc'
    );
    assert.equal(
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

    assert.equal(
        $tree.tree('getNodeById', 200).name,
        'sub1'
    );
    assert.equal(
        $tree.tree('getNodeById', 201).name,
        'sub2'
    );
});

test('autoOpen', function(assert) {
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
    assert.equal(formatOpenFolders(), '');

    $tree.tree('destroy');

    // 2. autoOpen is true
    $tree.tree({
        data: data,
        autoOpen: true
    });
    assert.equal(formatOpenFolders(), 'l1n1;l2n2;l3n1');

    $tree.tree('destroy');

    // 3. autoOpen level 1
    $tree.tree({
        data: data,
        autoOpen: 1
    });
    assert.equal(formatOpenFolders(), 'l1n1;l2n2');
});

test('onCreateLi', function(assert) {
    // 1. init tree with onCreateLi
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        onCreateLi: function(node, $li) {
            var $span = $li.children('.jqtree-element').find('span');
            $span.html('_' + node.name + '_');
        }
    });

    assert.equal(
        $tree.find('span:eq(0)').text(),
        '_node1_'
    );
});

test('save state', function(assert) {
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
    assert.equal($tree.tree('getSelectedNode'), false);

    // 2. select node -> state is saved
    $tree.tree('selectNode', tree.children[0]);
    assert.equal($tree.tree('getSelectedNode').name, 'node1');

    // 3. init tree again
    $tree.tree('destroy');

    $tree.tree({
        data: example_data,
        selectable: true,
        saveState: 'my_tree'
    });

    assert.equal($tree.tree('getSelectedNode').name, 'node1');

    $.cookie = null;
});

test('generate hit areas', function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    // 1. get hit areas
	var node = $tree.tree('getNodeById', 123);
    var hit_areas = $tree.tree('testGenerateHitAreas', node);

    var strings = $.map(hit_areas, function(hit_area) {
        return hit_area.node.name + ' ' + Position.getName(hit_area.position);
    });
    assert.equal(strings.join(';'), 'node1 none;node2 inside;node2 after');
});

test('removeNode', function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    // 1. Remove selected node; node is 'child1'
    var child1 = $tree.tree('getNodeByName', 'child1');
    $tree.tree('selectNode', child1);

    assert.equal($tree.tree('getSelectedNode').name, 'child1');

    $tree.tree('removeNode', child1);

    assert.equal(
        formatTitles($tree),
        'node1 child2 node2 child3'
    );

    // getSelectedNode must now return false
    assert.equal($tree.tree('getSelectedNode'), false);

    // 2. No node is selected; remove child3
    $tree.tree('loadData', example_data);

    var child3 = $tree.tree('getNodeByName', 'child3');
    $tree.tree('removeNode', child3);

    assert.equal(
        formatTitles($tree),
        'node1 child1 child2 node2'
    );

    assert.equal($tree.tree('getSelectedNode'), false);

    // 3. Remove parent of selected node
    $tree.tree('loadData', example_data);

    child1 = $tree.tree('getNodeByName', 'child1');
    var node1 = $tree.tree('getNodeByName', 'node1');

    $tree.tree('selectNode', child1);

    $tree.tree('removeNode', node1);

    // node is unselected
    assert.equal($tree.tree('getSelectedNode'), false);

    // 4. Remove unselected node without an id
    $tree.tree('loadData', example_data2);

    var c1 = $tree.tree('getNodeByName', 'c1');

    $tree.tree('removeNode', c1);

    assert.equal(
        formatTitles($tree),
        'main c2'
    );
});

test('appendNode', function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var node1 = $tree.tree('getNodeByName', 'node1');

    // 1. Add child3 to node1
    $tree.tree('appendNode', 'child3', node1);

    assert.equal(
        formatTitles($(node1.element)),
        'node1 child1 child2 child3'
    );

    // 2. Add child4 to child1
    var child1 = $tree.tree('getNodeByName', 'child1');

    // Node 'child1' does not have a toggler button
    assert.equal(
        $(child1.element).find('> .jqtree-element > .jqtree-toggler').length,
        0
    );

    $tree.tree('appendNode', 'child4', child1);

    assert.equal(formatTitles($(child1.element)), 'child1 child4');

    // Node 'child1' must get a toggler button
    assert.equal(
        $(child1.element).find('> .jqtree-element > .jqtree-toggler').length,
        1
    );
});

test('prependNode', function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var node1 = $tree.tree('getNodeByName', 'node1');

    // 1. Prepend child0 to node1
    $tree.tree('prependNode', 'child0', node1);

    assert.equal(
        formatTitles($(node1.element)),
        'node1 child0 child1 child2'
    );
});
test('init event', function(assert) {
    // setup
    var done = assert.async();

    var $tree = $('#tree1');

    $tree.bind('tree.init', function() {
        // Check that we can call functions in 'tree.init' event
        assert.equal($tree.tree('getNodeByName', 'node2').name, 'node2');

        done();
    });

    $tree.tree({
        data: example_data
    });
});

test('updateNode', function(assert) {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });

    assert.equal(formatTitles($tree), 'node1 child1 child2 node2 child3');

    // -- update label
    var node2 = $tree.tree('getNodeByName', 'node2');
    $tree.tree('updateNode', node2, 'CHANGED');

    assert.equal(formatTitles($tree), 'node1 child1 child2 CHANGED child3');
    assert.equal(node2.name, 'CHANGED');

    // -- update data
    $tree.tree(
        'updateNode',
        node2,
        {
            name: 'xyz',
            tag1: 'abc'
        }
    );

    assert.equal(formatTitles($tree), 'node1 child1 child2 xyz child3');
    assert.equal(node2.name, 'xyz');
    assert.equal(node2.tag1, 'abc');

    // - update id
    assert.equal(node2.id, 124);

    $tree.tree('updateNode', node2, {id: 555});

    assert.equal(node2.id, 555);
    assert.equal(node2.name, 'xyz');

    // get node by id
    var node_555 = $tree.tree('getNodeById', 555);
    assert.equal(node_555.name, 'xyz');

    var node_124 = $tree.tree('getNodeById', 124);
    assert.equal(node_124, undefined);

    // update child1
    var child1 = $tree.tree('getNodeByName', 'child1');

    $tree.tree('updateNode', child1, 'child1a');

    assert.equal(formatTitles($tree), 'node1 child1a child2 xyz child3');

    // select child1
    $tree.tree('selectNode', child1);
    $tree.tree('updateNode', child1, 'child1b');

    assert.ok($(child1.element).hasClass('jqtree-selected'));
});

test('moveNode', function(assert) {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });

    var child1 = $tree.tree('getNodeByName', 'child1');
    var child2 = $tree.tree('getNodeByName', 'child2');
    var node1 = $tree.tree('getNodeByName', 'node1');
    var node2 = $tree.tree('getNodeByName', 'node2');

    // -- Move child1 after node2
    $tree.tree('moveNode', child1, node2, 'after');

    assert.equal(formatTitles($tree), 'node1 child2 node2 child3 child1');

    // -- Check that illegal moves are skipped
    $tree.tree('moveNode', node1, child2, 'inside');
});

test('load on demand', function(assert) {
    // setup
    var done = assert.async();

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

    mockjax({
        url: '*',
        response: function(options) {
            assert.equal(options.url, '/tree/', '2');
            assert.deepEqual(options.data, { 'node' : 1 }, '3');

            this.responseText = [
                {
                    id: 2,
                    label: 'child1'
                }
            ];
        },
        logging: false
    });

    // -- open node
    $tree.bind('tree.refresh', function(e) {
        assert.equal(formatTitles($tree), 'node1 child1', '4');

        done();
    });

    var node1 = $tree.tree('getNodeByName', 'node1');
    assert.equal(formatTitles($tree), 'node1', '1');

    $tree.tree('openNode', node1, true);
});

test('addNodeAfter', function(assert) {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });
    var node1 = $tree.tree('getNodeByName', 'node1');

    // -- add node after node1
    $tree.tree('addNodeAfter', 'node3', node1);

    assert.equal(formatTitles($tree), 'node1 child1 child2 node3 node2 child3');
});

test('addNodeBefore', function(assert) {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });
    var node1 = $tree.tree('getNodeByName', 'node1');

    // -- add node before node1
    var new_node = $tree.tree('addNodeBefore', 'node3', node1);

    assert.equal(formatTitles($tree), 'node3 node1 child1 child2 node2 child3');
});

test('addParentNode', function(assert) {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });
    var child3 = $tree.tree('getNodeByName', 'child3');

    // -- add parent to child3
    $tree.tree('addParentNode', 'node3', child3);

    assert.equal(formatTitles($tree), 'node1 child1 child2 node2 node3 child3');
});

test('mouse events', function(assert) {
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

    assert.equal(
        formatTitles($tree),
        'node2 child3 node1 child1 child2'
    );
});

test('multiple select', function(assert) {
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
    assert.equal(
        formatNodes(selected_nodes),
        'child1 child2'
    );
});

test('keyboard', function(assert) {
    // setup
    var $tree = $('#tree1');

    function keyDown(key) {
        $tree.trigger(
            $.Event('keydown', { which: key })
        );
    }

    $tree.tree({ data: example_data });

    var node1 = $tree.tree('getNodeByName', 'node1');

    // select node1
    $tree.tree('selectNode', node1);
    assert.equal(node1.is_open, undefined);

    // - move down; -> node2
    keyDown(40);
    assert.equal($tree.tree('getSelectedNode').name, 'node2');

    // - move up; -> back to node1
    keyDown(38);
    assert.equal($tree.tree('getSelectedNode').name, 'node1');

    // - move right; open node1
    keyDown(39);
    assert.equal(node1.is_open, true);
    assert.equal($tree.tree('getSelectedNode').name, 'node1');

    // - select child3 and move up -> node2
    $tree.tree('selectNode', $tree.tree('getNodeByName', 'child3'));
    keyDown(38);
    assert.equal($tree.tree('getSelectedNode').name, 'node2');

    // - move up -> child2
    keyDown(38);
    assert.equal($tree.tree('getSelectedNode').name, 'child2');

    // - select node1 and move left ->  close
    $tree.tree('selectNode', node1);
    keyDown(37);
    assert.equal(node1.is_open, false);
    assert.equal($tree.tree('getSelectedNode').name, 'node1');
});

test('getNodesByProperty', function(assert) {
  // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });
    var node2 = $tree.tree('getNodeByName', 'node2');

    // 1. get 'node1' by property
    assert.equal(
        $tree.tree('getNodesByProperty', 'int_property', 1)[0].name,
        'node1'
    );

    // 2. get property that does not exist in any node
    assert.equal($tree.tree('getNodesByProperty', 'int_property', 123).length, 0);

    // 3. get string property
    assert.equal(
        $tree.tree('getNodesByProperty', 'str_property', '1')[0].name,
        'node1'
    );

    // 4. add node with string id; search by int
    $tree.tree(
        'appendNode',
        {
            label: 'abc',
            id: '234',
            str_property: '111',
            int_property: 111
        }
    );

    assert.equal(
        $tree.tree('getNodesByProperty', 'int_property', 111)[0].name,
        'abc'
    );
    assert.equal(
        $tree.tree('getNodesByProperty', 'str_property', '111')[0].name,
        'abc'
    );

    // 5. load subtree in node2
    var subtree_data = [
        {
            label: 'sub1',
            id: 200,
            int_property: 222,
            children: [
                {label: 'sub2', id: 201, int_property: 444}
            ]
        }
    ];
    $tree.tree('loadData',  subtree_data, node2);
    var t = $tree.tree('getTree');

    assert.equal(
        $tree.tree('getNodesByProperty', 'int_property', 222)[0].name,
        'sub1'
    );
    assert.equal(
        $tree.tree('getNodesByProperty', 'int_property', 444)[0].name,
        'sub2'
    );
});

test('dataUrl extra options', function(assert) {
    var done = assert.async();

    var $tree = $('#tree1');

    mockjax({
        url: '*',
        response: function(options) {
            // 2. handle ajax request
            // expect 'headers' option
            assert.equal(options.url, '/tree2/');
            assert.deepEqual(options.headers, {'abc': 'def'});

            done();
        },
        logging: false
    });

    // 1. init tree
    // dataUrl contains 'headers' option
    $tree.tree({
        dataUrl: {
            'url': '/tree2/',
            'headers': {'abc': 'def'}
        }
    });
});

test('dataUrl is function', function(assert) {
    var done = assert.async();

    var $tree = $('#tree1');

    mockjax({
        url: '*',
        response: function(options) {
            // 2. handle ajax request
            // expect 'headers' option
            assert.equal(options.url, '/tree3/');
            assert.deepEqual(options.headers, {'abc': 'def'});

            done();
        },
        logging: false
    });

    // 1. init tree
    // dataUrl is a function
    $tree.tree({
        dataUrl: function(node) {
            return {
                'url': '/tree3/',
                'headers': {'abc': 'def'}
            };
        }
    });
});

test('getNodeByHtmlElement', function(assert) {
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var $el = $('.jqtree-title');

    // Get node for jquery element
    var node = $tree.tree('getNodeByHtmlElement', $el);
    assert.equal(node.name, 'node1');

    // Same for html element
    node = $tree.tree('getNodeByHtmlElement', $el[0]);
    assert.equal(node.name, 'node1');
});

test('DragElement', function(assert) {
    // Create drag element for node with html. Expect the text in the drag element to be html encoded.
    var $tree = $('#tree1');

    $tree.tree({
        data: [
            {name: '<img src=x onerror=alert()>child1',id: 1}
        ]
    });

    var JqTreeWidget = $tree.tree('get_widget_class');
    var DragElement = JqTreeWidget.getModule('drag_and_drop_handler').DragElement;

    var DragElement = new DragElement(
        $tree.tree('getNodeById', 1),
        0, 0,
        $tree
    );

    var span = $tree.find('.jqtree-dragging');
    assert.equal(span.html(), '&lt;img src=x onerror=alert()&gt;child1');
});
