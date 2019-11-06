/*
example data:

node1
---child1
---child2
-node2
---child3
*/
import { Node } from "../src/node";

export const exampleData = [
    {
        label: "node1",
        id: 123, // extra data
        intProperty: 1,
        strProperty: "1",
        children: [{ label: "child1", id: 125, intProperty: 2 }, { label: "child2", id: 126 }]
    },
    {
        label: "node2",
        id: 124,
        intProperty: 3,
        strProperty: "3",
        children: [{ label: "child3", id: 127 }]
    }
];

/*
example data 2:

-main
---c1
---c2
*/

export const exampleData2 = [
    {
        label: "main",
        children: [{ label: "c1" }, { label: "c2" }]
    }
];

export function formatNodes(nodes: INode[]): string {
    const strings = nodes.map(node => node.name);

    return strings.join(" ");
}

export function isNodeClosed($node: JQuery<Element>): boolean {
    return (
        $node.is("li.jqtree-folder.jqtree-closed") &&
        $node.find("a:eq(0)").is("a.jqtree-toggler.jqtree-closed") &&
        $node.find("ul:eq(0)").is("ul")
    );
}

export function isNodeOpen($node: JQuery<Element>): boolean {
    return (
        $node.is("li.jqtree-folder") &&
        $node.find("a:eq(0)").is("a.jqtree-toggler") &&
        $node.find("ul:eq(0)").is("ul") &&
        !$node.is("li.jqtree-folder.jqtree-closed") &&
        !$node.find("span:eq(0)").is("a.jqtree-toggler.jqtree-closed")
    );
}

export function formatTitles($node: JQuery<Element>): string {
    const titles = $node.find(".jqtree-title").map((_, el) => $(el).text());
    return titles.toArray().join(" ");
}

export function doGetNodeByName(tree: Node, name: string): Node {
    const result = tree.getNodeByName(name);

    if (!result) {
        throw Error(`Node with name '${name}' not found`);
    }

    return result;
}

export function doGetNodeById(tree: Node, id: string | number): Node {
    const result = tree.getNodeById(id);

    if (!result) {
        throw Error(`Node with id '${id}' not found`);
    }

    return result;
}
