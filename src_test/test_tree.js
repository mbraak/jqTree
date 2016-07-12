var utils_for_test = require('./utils_for_test');

var example_data = utils_for_test.example_data;
var formatNodes = utils_for_test.formatNodes;

var tree_vars = utils_for_test.getTreeVariables();

var Node = tree_vars.Node;
var Position = tree_vars.Position;


QUnit.module("Tree");
test('constructor', function(assert) {
    // 1. Create node from string
    var node = new Node('n1');

    assert.equal(node.name, 'n1');
    assert.equal(node.children.length, 0);
    assert.equal(node.parent, null);

    // 2. Create node from object
    node = new Node({
        label: 'n2',
        id: 123,
        parent: 'abc',  // parent must be ignored
        children: ['c'], // children must be ignored
        url: '/'
    });

    assert.equal(node.name, 'n2');
    assert.equal(node.id, 123);
    assert.equal(node.url, '/');
    assert.equal(node.label, undefined);
    assert.equal(node.children.length, 0);
    assert.equal(node.parent, null);
});

test("create tree from data", function(assert) {
    function checkData(tree) {
        assert.equal(
            formatNodes(tree.children),
            'node1 node2',
            'nodes on level 1'
        );
        assert.equal(
            formatNodes(tree.children[0].children),
            'child1 child2',
            'children of node1'
        );
        assert.equal(
            formatNodes(tree.children[1].children),
            'child3',
            'children of node2'
        );
        assert.equal(
            tree.children[0].id,
            123,
            'id'
        );
    }

    // - create tree from example data
    var tree = new Node(null, true);
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
    var tree = new Node(null, true);
    tree.loadFromData(data);
    checkData(tree);
});

test("addChild", function(assert) {
    var tree = new Node('tree1', true);
    tree.addChild(
        new Node('abc')
    );
    tree.addChild(
        new Node('def')
    );

    assert.equal(
        formatNodes(tree.children),
        'abc def',
        'children'
    );

    var node = tree.children[0];
    assert.equal(
        node.parent.name,
        'tree1',
        'parent of node'
    );
});

test('addChildAtPosition', function(assert) {
    var tree = new Node(null, true);
    tree.addChildAtPosition(new Node('abc'), 0);  // first
    tree.addChildAtPosition(new Node('ghi'), 2);  // index 2 does not exist
    tree.addChildAtPosition(new Node('def'), 1);
    tree.addChildAtPosition(new Node('123'), 0);

    assert.equal(
        formatNodes(tree.children),
        '123 abc def ghi',
        'children'
    );
});

test('removeChild', function(assert) {
    var tree = new Node(null, true);

    var abc = new Node({'label': 'abc', 'id': 1});
    var def = new Node({'label': 'def', 'id': 2});
    var ghi = new Node({'label': 'ghi', 'id': 3});

    tree.addChild(abc);
    tree.addChild(def);
    tree.addChild(ghi);

    var jkl = new Node({'label': 'jkl', 'id': 4});
    def.addChild(jkl);

    assert.equal(
        formatNodes(tree.children),
        'abc def ghi',
        'children'
    );

    assert.equal(tree.id_mapping[2].name, 'def');
    assert.equal(tree.id_mapping[4].name, 'jkl');

    // remove 'def'
    tree.removeChild(def);
    assert.equal(
        formatNodes(tree.children),
        'abc ghi',
        'children'
    );

    assert.equal(tree.id_mapping[2], null);
    assert.equal(tree.id_mapping[4], null);

    // remove 'ghi'
    tree.removeChild(ghi);
    assert.equal(
        formatNodes(tree.children),
        'abc',
        'children'
    );

    // remove 'abc'
    tree.removeChild(abc);
    assert.equal(
        formatNodes(tree.children),
        '',
        'children'
    );
});

test('getChildIndex', function(assert) {
    // setup
    var tree = new Node(null, true);

    var abc = new Node('abc');
    var def = new Node('def');
    var ghi = new Node('ghi');
    tree.addChild(abc);
    tree.addChild(def);
    tree.addChild(ghi);

    // 1. Get child index of 'def'
    assert.equal(tree.getChildIndex(def), 1);

    // 2. Get child index of non-existing node
    assert.equal(tree.getChildIndex(new Node('xyz')), -1);
});

test('hasChildren', function(assert) {
    var tree = new Node(null, true);
    assert.equal(
        tree.hasChildren(),
        false,
        'tree without children'
    );

    tree.addChild(new Node('abc'));
    assert.equal(
        tree.hasChildren(),
        true,
        'tree has children'
    );
});

test('iterate', function(assert) {
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // iterate over all the nodes
    var nodes = [];
    tree.iterate(
        function(node, level) {
            nodes.push(node);
            return true;
        }
    );

    assert.equal(
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

    assert.equal(
        formatNodes(nodes),
        'node1 node2',
        'nodes on first level'
    );

    // add child 4
    var node3 = tree.getNodeById(124).children[0];
    node3.addChild(
        new Node('child4')
    );

    // test level parameter
    nodes = [];
    tree.iterate(
        function(node, level) {
            nodes.push(node.name + ' ' + level);
            return true;
        }
    );

    assert.equal(
        nodes.join(','),
        'node1 0,child1 1,child2 1,node2 0,child3 1,child4 2'
    );
});

test('moveNode', function(assert) {
    var tree = new Node(null, true);
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
    assert.equal(node2.name, 'node2', 'node2 name');
    assert.equal(child2.name, 'child2', 'child2 name');

    // move child2 after node2
    tree.moveNode(child2, node2, Position.AFTER);

    /*
      node1
      ---child1
      node2
      ---child3
      child2
    */
    assert.equal(
        formatNodes(tree.children),
        'node1 node2 child2',
        'tree nodes at first level'
    );
    assert.equal(
        formatNodes(node1.children),
        'child1',
        'node1 children'
    );

    // move child1 inside node2
    // this means it's the first child
    tree.moveNode(child1, node2, Position.INSIDE);

    /*
      node1
      node2
      ---child1
      ---child3
      child2
    */
    assert.equal(
        formatNodes(node2.children),
        'child1 child3',
        'node2 children'
    );
    assert.equal(
        formatNodes(node1.children),
        '',
        'node1 has no children'
    );

    // move child2 before child1
    tree.moveNode(child2, child1, Position.BEFORE);

    /*
      node1
      node2
      ---child2
      ---child1
      ---child3
    */
    assert.equal(
        formatNodes(node2.children),
        'child2 child1 child3',
        'node2 children'
    );
    assert.equal(
        formatNodes(tree.children),
        'node1 node2',
        'tree nodes at first level'
    );
});

test('initFromData', function(assert) {
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
    var node = new Node(null, true);
    node.initFromData(data);

    assert.equal(node.name, 'main')
    assert.equal(
        formatNodes(node.children),
        'c1 c2',
        'children'
    );
    assert.equal(node.children[1].id, 201);
});

test('getData', function(assert) {
    // 1. empty node
    var node = new Node(null, true);
    assert.deepEqual(node.getData(), []);

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
    assert.deepEqual(
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

    // 3. get data including parent
    var n1 = node.getNodeByName('n1');

    assert.deepEqual(
        n1.getData(true),
        [
            {
                name: 'n1',
                children: [
                    { name: 'c1'}
                ]
            }
        ]
    );
});

test('addAfter', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    /*
    -node1
    ---c1
    ---c2
    -node2
    ---c3
    */

    assert.equal(formatNodes(tree.children), 'node1 node2');

    // - Add 'node_b' after node2
    var node2 = tree.getNodeByName('node2');
    node2.addAfter('node_b');

    assert.equal(formatNodes(tree.children), 'node1 node2 node_b');

    var node_b = tree.getNodeByName('node_b');
    assert.equal(node_b.name, 'node_b');

    // - Add 'node_a' after node1
    var node1 = tree.getNodeByName('node1');
    node1.addAfter('node_a');

    assert.equal(formatNodes(tree.children), 'node1 node_a node2 node_b');

    // - Add 'node_c' after node_b; new node is an object
    node_b.addAfter({
        label: 'node_c',
        id: 789
    });

    var node_c = tree.getNodeByName('node_c');
    assert.equal(node_c.id, 789);

    assert.equal(formatNodes(tree.children), 'node1 node_a node2 node_b node_c');

    // - Add after root node; this is not possible
    assert.equal(tree.addAfter('node_x'), null);
});

test('addBefore', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // - Add 'node_0' before node1
    var node1 = tree.getNodeByName('node1');
    node1.addBefore('node0');
    assert.equal(formatNodes(tree.children), 'node0 node1 node2');

    // - Add before root node; this is not possile
    assert.equal(tree.addBefore('x'), null);
});

test('addParent', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // - Add node 'root' as parent of node1
    // Note that node also becomes a child of 'root'
    var node1 = tree.getNodeByName('node1');
    node1.addParent('root');

    var root = tree.getNodeByName('root');
    assert.equal(formatNodes(root.children), 'node1 node2');

    // - Add parent to root node; not possible
    assert.equal(tree.addParent('x'), null);
});

test('remove', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    var child1 = tree.getNodeByName('child1');
    var node1 = tree.getNodeByName('node1');

    assert.equal(formatNodes(node1.children), 'child1 child2');
    assert.equal(child1.parent, node1);

    // 1. Remove child1
    child1.remove();

    assert.equal(formatNodes(node1.children), 'child2');
    assert.equal(child1.parent, null);
});

test('append', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    var node1 = tree.getNodeByName('node1');

    // 1. Append child3 to node1
    node1.append('child3');

    assert.equal(formatNodes(node1.children), 'child1 child2 child3');

    // 2. Append subtree
    node1.append(
        {
            name: 'child4',
            children: [
                { name: 'child5' }
            ]
        }
    );

    assert.equal(formatNodes(node1.children), 'child1 child2 child3 child4');

    var child4 = node1.getNodeByName('child4');
    assert.equal(formatNodes(child4.children), 'child5');
});

test('prepend', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    var node1 = tree.getNodeByName('node1');

    // 1. Prepend child0 to node1
    node1.prepend('child0');

    assert.equal(formatNodes(node1.children), 'child0 child1 child2');

    // 2. Prepend subtree
    node1.prepend({
        name: 'child3',
        children: [
            { name: 'child4' }
        ]
    });

    assert.equal(formatNodes(node1.children), 'child3 child0 child1 child2');

    var child3 = node1.getNodeByName('child3');
    assert.equal(formatNodes(child3.children), 'child4');
});

test('getNodeById', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // 1. Get node with id 124
    var node = tree.getNodeById(124);
    assert.equal(node.name, 'node2');

    // 2. Delete node with id 124 and search again
    node.remove();

    assert.equal(tree.getNodeById(124), null);

    // 3. Add node with id 456 and search for it
    var child3 = tree.getNodeByName('child2');
    child3.append({
        id: 456,
        label: 'new node'
    });

    node = tree.getNodeById(456);
    assert.equal(node.name, 'new node');
});

test('getLevel', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // 1. get level for node1 and child1
    assert.equal(tree.getNodeByName('node1').getLevel(), 1);
    assert.equal(tree.getNodeByName('child1').getLevel(), 2);
});

test('loadFromData and id mapping', function(assert) {
    // - get node from empty tree
    var tree = new Node(null, true);
    assert.equal(tree.getNodeById(999), null);

    // - load example data in tree
    tree.loadFromData(example_data);
    assert.equal(tree.getNodeById(124).name, 'node2');

    var child2 = tree.getNodeById(126);
    child2.addChild(
        new Node({label: 'child4', id: 128})
    );
    child2.addChild(
        new Node({label: 'child5', id: 129})
    );

    // - load data in node child2
    child2.loadFromData(['abc', 'def']);

    assert.equal(tree.getNodeById(128), null);
    assert.equal(child2.children.length, 2);
    assert.equal(child2.children[0].name, 'abc');
});

test('removeChildren', function(assert) {
    // - load example data
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // add child4 and child5
    var child2 = tree.getNodeById(126);
    assert.equal(child2.name, 'child2');

    child2.addChild(
        new Node({label: 'child4', id: 128})
    );
    child2.addChild(
        new Node({label: 'child5', id: 129})
    );
    assert.equal(tree.getNodeById(128).name, 'child4');

    // - remove children from child2
    child2.removeChildren();
    assert.equal(tree.getNodeById(128), null);
    assert.equal(child2.children.length, 0);
});

test('node with id 0', function(assert) {
    // - load node with id 0
    var tree = new Node(null, true);
    tree.loadFromData([
        {
            id: 0,
            label: 'mynode'
        }
    ]);

    // - get node by id
    var node = tree.getNodeById(0);
    assert.equal(node.name, 'mynode');

    // -- remove the node
    node.remove();

    assert.equal(tree.getNodeById(0), undefined);
});

test('getPreviousSibling', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // - getPreviousSibling
    assert.equal(
        tree.getNodeByName('child2').getPreviousSibling().name,
        'child1'
    );
    assert.equal(tree.getPreviousSibling(), null);
    assert.equal(
        tree.getNodeByName('child1').getPreviousSibling(),
        null
    );
});

test('getNextSibling', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // - getNextSibling
    assert.equal(
        tree.getNodeByName('node1').getNextSibling().name,
        'node2'
    );
    assert.equal(
        tree.getNodeByName('node2').getNextSibling(),
        null
    );
    assert.equal(tree.getNextSibling(), null);
});

test('getNodesByProperty', function(assert) {
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    nodes = tree.getNodesByProperty('name', 'child1');

    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].name, 'child1');
});

test('getNodeByCallback', function(assert) {
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    node = tree.getNodeByCallback(
        function(node) {
            return node.name == 'child1';
        }
    );

    assert.equal(node.name, 'child1');
});
