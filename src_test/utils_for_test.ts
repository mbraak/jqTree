/*
example data:

node1
---child1
---child2
-node2
---child3
*/
import * as $ from "jquery";

import { Node } from "../src/node";

export const example_data = [
    {
        label: "node1",
        id: 123,  // extra data
        int_property: 1,
        str_property: "1",
        children: [
            { label: "child1", id: 125, int_property: 2 },
            { label: "child2", id: 126 }
        ]
    },
    {
        label: "node2",
        id: 124,
        int_property: 3,
        str_property: "3",
        children: [
            { label: "child3", id: 127 }
        ]
    }
];

/*
example data 2:

-main
---c1
---c2
*/

export const example_data2 = [
    {
        label: "main",
        children: [
            { label: "c1" },
            { label: "c2" }
        ]
    }
];

export function formatNodes(nodes: Node[]) {
    let strings = $.map(nodes, node => node.name);

    return strings.join(" ");
};

export function isNodeClosed($node: JQuery) {
    return (
        ($node.is("li.jqtree-folder.jqtree-closed")) &&
        ($node.find("a:eq(0)").is("a.jqtree-toggler.jqtree-closed")) &&
        ($node.find("ul:eq(0)").is("ul"))
    );
}

export function isNodeOpen($node: JQuery) {
    return (
        ($node.is("li.jqtree-folder")) &&
        ($node.find("a:eq(0)").is("a.jqtree-toggler")) &&
        ($node.find("ul:eq(0)").is("ul")) &&
        (! $node.is("li.jqtree-folder.jqtree-closed")) &&
        (! $node.find("span:eq(0)").is("a.jqtree-toggler.jqtree-closed"))
    );
}

export function formatTitles($node: JQuery) {
    let titles = $node.find(".jqtree-title").map(
        (i, el) => $(el).text()
    );
    return titles.toArray().join(" ");
}
