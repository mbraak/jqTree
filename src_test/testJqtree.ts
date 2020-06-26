import "../src/tree.jquery";

import {
    exampleData,
    exampleData2,
    formatNodes,
    formatTitles,
    getSelectedNodeName,
    isNodeOpen,
    isNodeClosed,
} from "./utilsForTest";
import { getPositionName, Node, NodeId } from "../src/node";
import { HitArea } from "../src/types";

const { module, test } = QUnit; // eslint-disable-line @typescript-eslint/unbound-method

interface ClickNodeEvent {
    node: Node;
    click_event: JQuery.ClickEvent;
}

interface SelectNodeEvent {
    deselected_node?: Node;
    node: Node | null;
    previous_node?: Node;
}

interface FolderEvent {
    node: Node;
}

const getNodeByName = ($tree: JQuery, name: string): INode => {
    const node = $tree.tree("getNodeByName", name);

    /* istanbul ignore if */
    if (!node) {
        throw "Node is null";
    }

    return node;
};

const getNodeById = ($tree: JQuery, id: NodeId): INode => {
    const node = $tree.tree("getNodeById", id);

    /* istanbul ignore if */
    if (!node) {
        throw "Node is null";
    }

    return node;
};

module("jqtree", {
    beforeEach: () => {
        $("body").append('<div id="tree1"></div>');
    },

    afterEach: () => {
        const $tree = $("#tree1");
        $tree.tree("destroy");
        $tree.remove();

        $.mockjax.clear();
    },
});

test("create jqtree from data", (assert: Assert) => {
    $("#tree1").tree({
        data: exampleData,
    });

    assert.equal(
        $("#tree1").children().length,
        1,
        "number of children on level 0"
    );
    assert.ok(
        $("#tree1").children().is("ul.jqtree-tree"),
        "first element is ul.jqtree-tree"
    );
    assert.equal(
        $("#tree1 ul.jqtree-tree > li").length,
        2,
        "number of children on level 1"
    );
    assert.ok(
        $("#tree1 ul.jqtree-tree li:eq(0)").is(
            "li.jqtree-folder.jqtree-closed"
        ),
        "first child is li.jqtree-folder.jqtree-closed"
    );
    assert.ok(
        $(
            "#tree1 ul.jqtree-tree li:eq(0) > .jqtree-element > a.jqtree-toggler"
        ).is("a.jqtree-toggler.jqtree-closed"),
        "button in first folder"
    );
    assert.equal(
        $(
            "#tree1 ul.jqtree-tree li:eq(0) > .jqtree-element span.jqtree-title"
        ).text(),
        "node1"
    );
});

const nodeWithEmptyChildren = {
    id: 1,
    name: "abc",
    children: [],
};

test("node with empty children is not a folder (with showEmptyFolder false)", (assert: Assert) => {
    $("#tree1").tree({
        data: [nodeWithEmptyChildren],
        showEmptyFolder: false,
    });

    assert.equal($(".jqtree-title").text(), "abc");
    assert.equal($(".jqtree-folder").length, 0);
});

test("node with empty children is a folder (with showEmptyFolder true)", (assert: Assert) => {
    $("#tree1").tree({
        data: [nodeWithEmptyChildren],
        showEmptyFolder: true,
    });

    assert.equal($(".jqtree-title").text(), "abc");
    assert.equal($(".jqtree-folder").length, 1);
});

test("node without children property is not a folder (with showEmptyFolder true)", (assert: Assert) => {
    $("#tree1").tree({
        data: [{ id: 1, name: "abc" }],
        showEmptyFolder: true,
    });

    assert.equal($(".jqtree-title").text(), "abc");
    assert.equal($(".jqtree-folder").length, 0);
});

test("toggle", (assert: Assert) => {
    // setup
    const done = assert.async();

    // create tree
    const $tree = $("#tree1");
    let $node1: JQuery; // eslint-disable-line prefer-const
    let node1: INode; // eslint-disable-line prefer-const

    $tree.tree({
        data: exampleData,
    });

    $tree.on("tree.open", () => {
        assert.ok(!isNodeClosed($node1), "node1 is open");

        // 2. close node1
        $tree.tree("toggle", node1);
    });

    $tree.on("tree.close", () => {
        assert.ok(isNodeClosed($node1), "node1 is closed");

        done();
    });

    const tree = $tree.tree("getTree");
    node1 = tree.children[0];
    $node1 = $tree.find("ul.jqtree-tree li:eq(0)");

    // node1 is initially closed
    assert.ok(isNodeClosed($node1), "node1 is closed");

    // 1. open node1
    $tree.tree("toggle", node1);
});

test("click event", (assert: Assert) => {
    let selectCount = 0;

    // create tree
    const $tree = $("#tree1");

    $tree.tree({
        data: exampleData,
        selectable: true,
    });

    const $node1 = $tree.find("ul.jqtree-tree li:first");
    const $textSpan = $node1.find("span:first");

    $tree.on("tree.click", (e: unknown) => {
        const treeClickEvent = e as ClickNodeEvent;
        assert.equal(treeClickEvent.node.name, "node1");
    });

    const done = assert.async();

    $tree.on("tree.select", (e: unknown) => {
        const selectNodeEvent = e as SelectNodeEvent;
        selectCount += 1;

        if (selectCount === 1) {
            assert.equal(selectNodeEvent.node?.name, "node1");

            const selectedNode = $tree.tree("getSelectedNode");
            assert.ok(selectedNode);

            if (selectedNode) {
                assert.equal(selectedNode.name, "node1");
            }

            // deselect
            $textSpan.click();
        } else {
            assert.equal(selectNodeEvent.node, null);
            assert.equal(selectNodeEvent.previous_node?.name, "node1");
            assert.equal($tree.tree("getSelectedNode"), false);

            done();
        }
    });

    // click on node1
    $textSpan.click();
});

test("saveState", (assert: Assert) => {
    const $tree = $("#tree1");

    let savedState: string;

    function setState(state: string): void {
        savedState = state;
    }

    function getState(): string {
        return savedState;
    }

    function createTree(): void {
        $tree.tree({
            data: exampleData,
            saveState: true,
            onSetStateFromStorage: setState,
            onGetStateFromStorage: getState,
            selectable: true,
        });
    }

    // create tree
    createTree();

    // nodes are initially closed
    const tree = $tree.tree("getTree");
    tree.iterate((node) => {
        assert.ok(!node.is_open, "jqtree-closed");
        return true;
    });

    // open node1
    $tree.tree("toggle", tree.children[0]);

    // node1 is open
    assert.ok(tree.children[0].is_open, "node1 is_open");

    // select node2
    $tree.tree("selectNode", tree.children[1]);

    // node2 is selected
    assert.equal(getSelectedNodeName($tree), "node2", "getSelectedNode (1)");

    // create tree again
    $tree.tree("destroy");
    createTree();

    const tree2 = $tree.tree("getTree");
    assert.ok(tree2.children[0].is_open, "node1 is_open");
    assert.ok(!tree2.children[1].is_open, "node2 is closed");

    // node2 is selected
    assert.equal(getSelectedNodeName($tree), "node2", "getSelectedNode (2)");
});

test("getSelectedNode", (assert: Assert) => {
    const $tree = $("#tree1");

    // create tree
    $tree.tree({
        data: exampleData,
        selectable: true,
    });

    // there is no node selected
    assert.equal($tree.tree("getSelectedNode"), false, "getSelectedNode");

    // select node1
    const tree = $tree.tree("getTree");
    const node1 = tree.children[0];
    $tree.tree("selectNode", node1);

    // node1 is selected
    assert.equal(getSelectedNodeName($tree), "node1", "getSelectedNode");
});

test("toJson", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
    });

    // 1. call toJson
    assert.equal(
        $tree.tree("toJson"),
        '[{"name":"node1","id":123,"intProperty":1,"strProperty":"1",' +
            '"children":[{"name":"child1","id":125,"intProperty":2},{"name":' +
            '"child2","id":126}]},{"name":"node2","id":124,"intProperty":3,' +
            '"strProperty":"3","children":[{"name":"child3","id":127}]}]'
    );

    // Check that properties 'children', 'parent' and 'element' still exist.
    const tree = $tree.tree("getTree");
    assert.equal(tree.children.length, 2);
    assert.ok(tree.children[0].parent !== undefined, "parent");
    assert.ok($(tree.children[0].element).is("li"), "element");
});

test("loadData", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
        autoOpen: true,
    });

    // first node is 'node1'
    assert.equal(
        $tree.find("> ul > li:first .jqtree-element:first > span").text(),
        "node1"
    );

    // - load new data
    $tree.tree("loadData", exampleData2);

    // first node is 'main'
    assert.equal(
        $tree.find("> ul > li:first .jqtree-element:first > span").text(),
        "main"
    );

    // - load new data under node 'child3'
    $tree.tree("loadData", exampleData);

    const child3 = getNodeByName($tree, "child3");

    const data = [
        { name: "c4", id: 200 },
        {
            name: "c5",
            id: 201,
            children: [{ name: "c6", id: 202 }],
        },
    ];
    $tree.tree("loadData", data, child3);

    // first node in html is still 'node1'
    assert.equal(
        $tree
            .find("li:eq(0)")
            .find(".jqtree-element:eq(0) span.jqtree-title")
            .text(),
        "node1"
    );

    // Node 'child3' now has a children 'c4' and 'c5'
    const $child3 = $tree.find("span:contains(child3)");
    const $li = $child3.closest("li");
    assert.equal(
        $li
            .children("ul")
            .children("li:eq(0)")
            .find(".jqtree-element span.jqtree-title")
            .text(),
        "c4"
    );

    // Node 'child3' must have toggler button
    assert.ok(
        $child3.prev().is("a.jqtree-toggler"),
        "node 'child3' must have toggler button"
    );

    // - select node 'c5' and load new data under 'child3'
    const c5 = getNodeByName($tree, "c5");
    $tree.tree("selectNode", c5);

    assert.equal(getSelectedNodeName($tree), "c5");

    const data2 = [{ name: "c7" }, { name: "c8" }];
    $tree.tree("loadData", data2, child3);

    // c5 must be deselected
    assert.equal($tree.tree("getSelectedNode"), false);

    // - select c7; load new data under child3; note that c7 has no id
    $tree.tree("selectNode", getNodeByName($tree, "c7"));

    assert.equal(getSelectedNodeName($tree), "c7");

    $tree.tree("loadData", ["c9"], child3);

    assert.equal($tree.tree("getSelectedNode"), false);

    // - select c9 (which has no id); load new nodes under child2
    $tree.tree("selectNode", $tree.tree("getNodeByName", "c9"));

    const child2 = getNodeByName($tree, "child2");
    $tree.tree("loadData", ["c10"], child2);

    assert.equal(getSelectedNodeName($tree), "c9");
});

test("openNode and closeNode", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
    });

    const node2 = getNodeByName($tree, "node2");
    assert.equal(node2.name, "node2");
    assert.equal(node2.is_open, undefined);

    // 1. open node2
    $tree.tree("openNode", node2, false);
    assert.equal(node2.is_open, true);
    assert.equal(isNodeOpen($(node2.element)), true);

    // 2. close node2
    $tree.tree("closeNode", node2, false);
    assert.equal(node2.is_open, false);
    assert.equal(isNodeClosed($(node2.element)), true);

    // 3. open child1
    const node1 = getNodeByName($tree, "node1");
    const child1 = getNodeByName($tree, "child1");

    // add a child to child1 so it is a folder
    $tree.tree("appendNode", "child1a", child1);

    // node1 is initialy closed
    assert.equal(node1.is_open, undefined);

    // open child1
    $tree.tree("openNode", child1, false);

    // node1 and child1 are now open1
    assert.equal(node1.is_open, true);
    assert.equal(child1.is_open, true);
});

function testOpenNodeWithCallback(
    slide: boolean,
    includeSlideParam: boolean,
    assert: Assert
): void {
    // setup
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
    });

    const node2 = getNodeByName($tree, "node2");

    // open node2
    const done = assert.async();

    function handleOpenNode(node: INode): void {
        assert.equal(node.name, "node2");
        assert.ok(node.is_open);

        done();
    }

    if (includeSlideParam) {
        $tree.tree("openNode", node2, slide, handleOpenNode);
    } else {
        $tree.tree("openNode", node2, handleOpenNode);
    }
}

test("openNode with callback with slide true", (assert: Assert) => {
    testOpenNodeWithCallback(true, true, assert);
});

test("openNode with callback with slide false", (assert: Assert) => {
    testOpenNodeWithCallback(false, true, assert);
});

test("openNode with callback without slide param", (assert: Assert) => {
    testOpenNodeWithCallback(false, false, assert);
});

test("selectNode", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
        selectable: true,
    });

    const node1 = $tree.tree("getTree").children[0];
    const node2 = $tree.tree("getTree").children[1];
    const child3 = node2.children[0];

    assert.equal(child3.name, "child3");
    assert.equal(node1.is_open, undefined);
    assert.equal(node2.is_open, undefined);
    assert.equal(child3.is_open, undefined);

    // -- select node 'child3', which is a child of 'node2'; must_open_parents = true
    $tree.tree("selectNode", child3);

    assert.equal(getSelectedNodeName($tree), "child3");

    assert.equal(node1.is_open, undefined);
    assert.equal(node2.is_open, true);
    assert.equal(child3.is_open, undefined);

    // -- select node 'node1'
    $tree.tree("selectNode", node1);
    assert.equal(getSelectedNodeName($tree), "node1");

    // -- is 'node1' selected?
    assert.equal($tree.tree("isNodeSelected", node1), true);

    // -- deselect
    $tree.tree("selectNode", null);
    assert.equal($tree.tree("getSelectedNode"), false);

    // -- is 'node1' selected?
    assert.equal($tree.tree("isNodeSelected", node1), false);
});

test("selectNode when another node is selected", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
        selectable: true,
    });

    const node1 = $tree.tree("getTree").children[0];
    const node2 = $tree.tree("getTree").children[1];

    // -- select node 'node2'
    $tree.tree("selectNode", node2);
    assert.equal(getSelectedNodeName($tree), "node2");

    // -- setting event
    // -- is node 'node2' named 'deselected_node' in object's attributes?
    let isSelectEventFired = false;

    $tree.on("tree.select", (e: unknown) => {
        const selectNodeEvent = e as SelectNodeEvent;
        assert.equal(selectNodeEvent.deselected_node, node2);
        isSelectEventFired = true;
    });

    // -- select node 'node1'; node 'node2' is selected before it
    $tree.tree("selectNode", node1);
    assert.equal(getSelectedNodeName($tree), "node1");

    assert.equal($tree.tree("isNodeSelected", node1), true);

    // event was fired
    assert.ok(isSelectEventFired);
});

test("click toggler", (assert: Assert) => {
    // setup
    const done = assert.async();

    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
        selectable: true,
    });

    const $title = $tree
        .find("li:eq(0)")
        .find("> .jqtree-element > span.jqtree-title");
    assert.equal($title.text(), "node1");
    const $toggler = $title.prev();
    assert.ok($toggler.is("a.jqtree-toggler.jqtree-closed"));

    $tree.on("tree.open", (e: unknown) => {
        const folderEvent = e as FolderEvent;
        // 2. handle 'open' event
        assert.equal(folderEvent.node.name, "node1");

        // 3. click toggler again
        $toggler.click();
    });

    $tree.on("tree.close", (e: unknown) => {
        const folderEvent = e as FolderEvent;
        assert.equal(folderEvent.node.name, "node1");
        done();
    });

    // 1. click toggler of 'node1'
    $toggler.click();
});

test("getNodeById", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
    });
    const node2 = getNodeByName($tree, "node2");

    // 1. get 'node2' by id
    assert.equal(getNodeById($tree, 124).name, "node2");

    // 2. get id that does not exist
    assert.equal($tree.tree("getNodeById", 333), null);

    // 3. get id by string
    assert.equal(getNodeById($tree, "124").name, "node2");

    // 4. add node with string id; search by int
    $tree.tree("appendNode", {
        name: "abc",
        id: "234",
    });

    assert.equal(getNodeById($tree, 234).name, "abc");
    assert.equal(getNodeById($tree, "234").name, "abc");

    // 5. load subtree in node2
    const subtreeData = [
        {
            name: "sub1",
            id: 200,
            children: [{ name: "sub2", id: 201 }],
        },
    ];
    $tree.tree("loadData", subtreeData, node2);
    const t = $tree.tree("getTree");
    assert.notEqual(t, null);

    assert.equal(getNodeById($tree, 200).name, "sub1");
    assert.equal(getNodeById($tree, 201).name, "sub2");
});

test("autoOpen", (assert: Assert) => {
    const $tree = $("#tree1");

    function formatOpenFolders(): string {
        const openNodes: string[] = [];
        $tree.find("li").each(function (this: Element) {
            const $li = $(this);
            if ($li.is(".jqtree-folder") && !$li.is(".jqtree-closed")) {
                const name = $li
                    .children(".jqtree-element")
                    .find("span")
                    .text();
                openNodes.push(name);
            }
        });

        return openNodes.join(";");
    }

    /*
    -l1n1 (level 0)
    ----l2n1 (1)
    ----l2n2 (1)
    -------l3n1 (2)
    ----------l4n1 (3)
    -l1n2
    */
    const data = [
        {
            name: "l1n1",
            children: [
                "l2n1",
                {
                    name: "l2n2",
                    children: [
                        {
                            name: "l3n1",
                            children: ["l4n1"],
                        },
                    ],
                },
            ],
        },
        "l1n2",
    ];

    // 1. autoOpen is false
    $tree.tree({
        data,
        autoOpen: false,
    });
    assert.equal(formatOpenFolders(), "");

    $tree.tree("destroy");

    // 2. autoOpen is true
    $tree.tree({
        data,
        autoOpen: true,
    });
    assert.equal(formatOpenFolders(), "l1n1;l2n2;l3n1");

    $tree.tree("destroy");

    // 3. autoOpen level 1
    $tree.tree({
        data,
        autoOpen: 1,
    });
    assert.equal(formatOpenFolders(), "l1n1;l2n2");
});

test("onCreateLi", (assert: Assert) => {
    // 1. init tree with onCreateLi
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
        onCreateLi: (node: INode, $li: JQuery) => {
            const $span = $li.children(".jqtree-element").find("span");
            $span.html(`_${node.name}_`);
        },
    });

    assert.equal($tree.find("span:eq(0)").text(), "_node1_");
});

test("save state", (assert: Assert) => {
    // Remove state from localstorage
    if (typeof localStorage !== "undefined") {
        localStorage.setItem("my_tree", "");
    }

    // 1. init tree
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
        selectable: true,
        saveState: "my_tree",
    });

    const tree = $tree.tree("getTree");
    assert.equal($tree.tree("getSelectedNode"), false);

    // 2. select node -> state is saved
    $tree.tree("selectNode", tree.children[0]);
    assert.equal(getSelectedNodeName($tree), "node1");

    // 3. init tree again
    $tree.tree("destroy");

    $tree.tree({
        data: exampleData,
        selectable: true,
        saveState: "my_tree",
    });

    assert.equal(getSelectedNodeName($tree), "node1");
});

test("generate hit areas", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
    });

    // 1. get hit areas
    const node = getNodeById($tree, 123);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const hitAreas = ($tree as any).tree(
        "testGenerateHitAreas",
        node
    ) as HitArea[];

    const strings = $.map(hitAreas, (hitArea) => {
        const positionName = getPositionName(hitArea.position);
        return `${hitArea.node.name} ${positionName}`;
    });
    assert.equal(strings.join(";"), "node1 none;node2 inside;node2 after");
});

test("removeNode", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
        selectable: true,
    });

    // 1. Remove selected node; node is 'child1'
    const child1 = getNodeByName($tree, "child1");
    $tree.tree("selectNode", child1);

    assert.equal(getSelectedNodeName($tree), "child1");

    $tree.tree("removeNode", child1);

    assert.equal(formatTitles($tree), "node1 child2 node2 child3");

    // getSelectedNode must now return false
    assert.equal($tree.tree("getSelectedNode"), false);

    // 2. No node is selected; remove child3
    $tree.tree("loadData", exampleData);

    const child3 = getNodeByName($tree, "child3");
    $tree.tree("removeNode", child3);

    assert.equal(formatTitles($tree), "node1 child1 child2 node2");

    assert.equal($tree.tree("getSelectedNode"), false);

    // 3. Remove parent of selected node
    $tree.tree("loadData", exampleData);

    const child1a = getNodeByName($tree, "child1");
    const node1 = getNodeByName($tree, "node1");

    $tree.tree("selectNode", child1a);

    $tree.tree("removeNode", node1);

    // node is unselected
    assert.equal($tree.tree("getSelectedNode"), false);

    // 4. Remove unselected node without an id
    $tree.tree("loadData", exampleData2);

    const c1 = getNodeByName($tree, "c1");

    $tree.tree("removeNode", c1);

    assert.equal(formatTitles($tree), "main c2");
});

test("appendNode", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
    });

    const node1 = getNodeByName($tree, "node1");

    // 1. Add child3 to node1
    $tree.tree("appendNode", "child3", node1);

    assert.equal(formatTitles($(node1.element)), "node1 child1 child2 child3");

    // 2. Add child4 to child1
    const child1 = getNodeByName($tree, "child1");

    // Node 'child1' does not have a toggler button
    assert.equal(
        $(child1.element).find("> .jqtree-element > .jqtree-toggler").length,
        0
    );

    $tree.tree("appendNode", "child4", child1);

    assert.equal(formatTitles($(child1.element)), "child1 child4");

    // Node 'child1' must get a toggler button
    assert.equal(
        $(child1.element).find("> .jqtree-element > .jqtree-toggler").length,
        1
    );
});

test("prependNode", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
    });

    const node1 = getNodeByName($tree, "node1");

    // 1. Prepend child0 to node1
    $tree.tree("prependNode", "child0", node1);

    assert.equal(formatTitles($(node1.element)), "node1 child0 child1 child2");
});

test("init event for local data", (assert: Assert) => {
    // setup
    const done = assert.async();

    const $tree = $("#tree1");

    $tree.on("tree.init", () => {
        // Check that we can call functions in 'tree.init' event
        assert.equal(getNodeByName($tree, "node2").name, "node2");

        done();
    });

    // init tree
    $tree.tree({
        data: exampleData,
    });
});

test("init event for ajax", (assert: Assert) => {
    // setup
    const done = assert.async();

    const $tree = $("#tree1");

    $.mockjax({
        url: "/tree/",
        responseText: exampleData,
        logging: false,
    });

    $tree.on("tree.init", () => {
        assert.equal(getNodeByName($tree, "node2").name, "node2");

        done();
    });

    // init tree
    $tree.tree({
        dataUrl: "/tree/",
    });
});

test("updateNode", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");

    $tree.tree({ data: exampleData });

    assert.equal(formatTitles($tree), "node1 child1 child2 node2 child3");

    // -- update name
    const node2 = getNodeByName($tree, "node2");
    $tree.tree("updateNode", node2, "CHANGED");

    assert.equal(formatTitles($tree), "node1 child1 child2 CHANGED child3");
    assert.equal(node2.name, "CHANGED");

    // -- update data
    $tree.tree("updateNode", node2, {
        name: "xyz",
        tag1: "abc",
    });

    assert.equal(formatTitles($tree), "node1 child1 child2 xyz child3");
    assert.equal(node2.name, "xyz");
    assert.equal(node2.tag1, "abc");

    // - update id
    assert.equal(node2.id, 124);

    $tree.tree("updateNode", node2, { id: 555 });

    assert.equal(node2.id, 555);
    assert.equal(node2.name, "xyz");

    // get node by id
    const node555 = getNodeById($tree, 555);
    assert.equal(node555.name, "xyz");

    const node124 = $tree.tree("getNodeById", 124);
    assert.equal(node124, undefined);

    // update child1
    const child1 = getNodeByName($tree, "child1");

    $tree.tree("updateNode", child1, "child1a");

    assert.equal(formatTitles($tree), "node1 child1a child2 xyz child3");

    // select child1
    $tree.tree("selectNode", child1);
    $tree.tree("updateNode", child1, "child1b");

    assert.ok($(child1.element).hasClass("jqtree-selected"));

    // add children to child1
    $tree.tree("updateNode", child1, {
        id: child1.id,
        name: "child1",
        children: [{ id: 5, name: "child1-1" }],
    });

    assert.equal(
        formatTitles($tree),
        "node1 child1 child1-1 child2 xyz child3"
    );

    // remove children
    $tree.tree("updateNode", child1, {
        id: child1.id,
        name: "child1",
        children: [],
    });

    assert.equal(formatTitles($tree), "node1 child1 child2 xyz child3");
});

test("moveNode", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");

    $tree.tree({ data: exampleData });

    const child1 = getNodeByName($tree, "child1");
    const child2 = getNodeByName($tree, "child2");
    const node1 = getNodeByName($tree, "node1");
    const node2 = getNodeByName($tree, "node2");

    // -- Move child1 after node2
    $tree.tree("moveNode", child1, node2, "after");

    assert.equal(formatTitles($tree), "node1 child2 node2 child3 child1");

    // -- Check that illegal moves are skipped
    $tree.tree("moveNode", node1, child2, "inside");
});

test("load on demand", (assert: Assert) => {
    // setup
    const done = assert.async();

    const $tree = $("#tree1");

    $tree.tree({
        data: [
            {
                id: 1,
                name: "node1",
                load_on_demand: true,
            },
        ],
        dataUrl: "/tree/",
    });

    function handleResponse(
        this: MockJaxSettings,
        options: MockJaxSettings
    ): void {
        assert.equal(options.url, "/tree/", "2");
        assert.deepEqual(options.data, { node: 1 }, "3");

        this.responseText = [
            {
                id: 2,
                name: "child1",
            },
        ];
    }

    $.mockjax({
        url: "*",
        response: handleResponse,
        logging: false,
    });

    // -- open node
    function handleOpenNode(node: INode): void {
        assert.equal(node.name, "node1");
        assert.equal(formatTitles($tree), "node1 child1", "4");

        done();
    }

    const node1 = getNodeByName($tree, "node1");
    assert.equal(formatTitles($tree), "node1", "1");

    $tree.tree("openNode", node1, handleOpenNode);
});

test("addNodeAfter", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");

    $tree.tree({ data: exampleData });
    const node1 = getNodeByName($tree, "node1");

    // -- add node after node1
    $tree.tree("addNodeAfter", "node3", node1);

    assert.equal(formatTitles($tree), "node1 child1 child2 node3 node2 child3");
});

test("addNodeBefore", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");

    $tree.tree({ data: exampleData });
    const node1 = getNodeByName($tree, "node1");

    // -- add node before node1
    $tree.tree("addNodeBefore", "node3", node1);

    assert.equal(formatTitles($tree), "node3 node1 child1 child2 node2 child3");
});

test("addParentNode", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");

    $tree.tree({ data: exampleData });
    const child3 = getNodeByName($tree, "child3");

    // -- add parent to child3
    $tree.tree("addParentNode", "node3", child3);

    assert.equal(formatTitles($tree), "node1 child1 child2 node2 node3 child3");
});

test("mouse events", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
        dragAndDrop: true,
        autoOpen: true,
    });
    $tree.tree("setMouseDelay", 0);

    function getTitleElement(nodeName: string): JQuery<Element> {
        const node = getNodeByName($tree, nodeName);
        const $el = $(node.element);
        return $($el.find(".jqtree-title"));
    }

    const $node1 = getTitleElement("node1");
    const $child3 = getTitleElement("child3");

    // -- Move node1 inside child3
    // 1: trigger mousedown event on node1
    const node1Offset = $node1.offset() || { left: 0, top: 0 };

    $node1.trigger(
        $.Event("mousedown", {
            which: 1,
            pageX: node1Offset.left,
            pageY: node1Offset.top,
        })
    );

    // 2: trigger mouse move to child3
    const child3Offset = $child3.offset() || { left: 0, top: 0 };
    $tree.trigger(
        $.Event("mousemove", {
            pageX: child3Offset.left,
            pageY: child3Offset.top,
        })
    );
    $tree.trigger("mouseup");

    assert.equal(formatTitles($tree), "node2 child3 node1 child1 child2");
});

test("multiple select", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");
    $tree.tree({ data: exampleData });

    const child1 = getNodeByName($tree, "child1");
    const child2 = getNodeByName($tree, "child2");

    // -- add nodes to selection
    // todo: more nodes as parameters?
    // todo: rename to 'selection.add' or 'selection' 'add'?
    $tree.tree("addToSelection", child1);
    $tree.tree("addToSelection", child2);

    // -- get selected nodes
    const selectedNodes = $tree.tree("getSelectedNodes");
    assert.equal(formatNodes(selectedNodes), "child1 child2");
});

test("keyboard", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");

    function keyDown(key: number): void {
        $tree.trigger($.Event("keydown", { which: key }));
    }

    $tree.tree({ data: exampleData });

    const node1 = getNodeByName($tree, "node1");

    // select node1
    $tree.tree("selectNode", node1);
    assert.equal(node1.is_open, undefined);

    // - move down; -> node2
    keyDown(40);
    assert.equal(getSelectedNodeName($tree), "node2");

    // - move up; -> back to node1
    keyDown(38);
    assert.equal(getSelectedNodeName($tree), "node1");

    // - move right; open node1
    keyDown(39);
    assert.equal(node1.is_open, true);
    assert.equal(getSelectedNodeName($tree), "node1");

    // - down -> child1
    keyDown(40);
    assert.equal(getSelectedNodeName($tree), "child1");

    // - up -> node1
    keyDown(38);
    assert.equal(getSelectedNodeName($tree), "node1");

    // - left ->  close
    keyDown(37);
    assert.equal(node1.is_open, false);
    assert.equal(getSelectedNodeName($tree), "node1");
});

test("getNodesByProperty", (assert: Assert) => {
    // setup
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
    });
    const node2 = getNodeByName($tree, "node2");

    // 1. get 'node1' by property
    assert.equal(
        $tree.tree("getNodesByProperty", "intProperty", 1)[0].name,
        "node1"
    );

    // 2. get property that does not exist in any node
    assert.equal(
        $tree.tree("getNodesByProperty", "intProperty", 123).length,
        0
    );

    // 3. get string property
    assert.equal(
        $tree.tree("getNodesByProperty", "strProperty", "1")[0].name,
        "node1"
    );

    // 4. add node with string id; search by int
    $tree.tree("appendNode", {
        name: "abc",
        id: "234",
        strProperty: "111",
        intProperty: 111,
    });

    assert.equal(
        $tree.tree("getNodesByProperty", "intProperty", 111)[0].name,
        "abc"
    );
    assert.equal(
        $tree.tree("getNodesByProperty", "strProperty", "111")[0].name,
        "abc"
    );

    // 5. load subtree in node2
    const subtreeData = [
        {
            name: "sub1",
            id: 200,
            intProperty: 222,
            children: [{ name: "sub2", id: 201, intProperty: 444 }],
        },
    ];
    $tree.tree("loadData", subtreeData, node2);
    const t = $tree.tree("getTree");
    assert.notEqual(t, null);

    assert.equal(
        $tree.tree("getNodesByProperty", "intProperty", 222)[0].name,
        "sub1"
    );
    assert.equal(
        $tree.tree("getNodesByProperty", "intProperty", 444)[0].name,
        "sub2"
    );
});

test("dataUrl extra options", (assert: Assert) => {
    const done = assert.async();

    const $tree = $("#tree1");

    $.mockjax({
        url: "*",
        response: (options: MockJaxSettings) => {
            // 2. handle ajax request
            // expect 'headers' option
            assert.equal(options.url, "/tree2/");
            assert.deepEqual(options.headers, { abc: "def" });

            done();
        },
        logging: false,
    });

    // 1. init tree
    // dataUrl contains 'headers' option
    $tree.tree({
        dataUrl: {
            url: "/tree2/",
            headers: { abc: "def" },
        },
    });
});

test("dataUrl is function", (assert: Assert) => {
    const done = assert.async();

    const $tree = $("#tree1");

    $.mockjax({
        url: "*",
        response: (options: MockJaxSettings) => {
            // 2. handle ajax request
            // expect 'headers' option
            assert.equal(options.url, "/tree3/");
            assert.deepEqual(options.headers, { abc: "def" });

            done();
        },
        logging: false,
    });

    // 1. init tree
    // dataUrl is a function
    $tree.tree({
        dataUrl: () => {
            return {
                url: "/tree3/",
                headers: { abc: "def" },
            };
        },
    });
});

test("getNodeByHtmlElement", (assert: Assert) => {
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
    });

    const $el = $(".jqtree-title");

    // Get node for jquery element
    const node = $tree.tree("getNodeByHtmlElement", $el);
    assert.ok(node);

    if (node) {
        assert.equal(node.name, "node1");
    }

    // Same for html element
    const node2 = $tree.tree("getNodeByHtmlElement", $el[0]);
    assert.ok(node2);

    if (node2) {
        assert.equal(node2.name, "node1");
    }
});

test("onLoadFailed", (assert: Assert) => {
    $.mockjax({
        url: "/tree/",
        status: 500,
        responseText: "test error",
        logging: false,
    });

    const done = assert.async();

    function handleLoadFailed(e: JQuery.jqXHR): void {
        assert.equal(e.responseText, "test error");

        done();
    }

    const $tree = $("#tree1");
    $tree.tree({
        dataUrl: "/tree/",
        onLoadFailed: handleLoadFailed,
    });
});
