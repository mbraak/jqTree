import { Node } from "../../node";
import NodeElement from "../../nodeElement";

it("sets the element to the element of the node", () => {
    const treeElement = document.createElement("div");
    document.body.append(treeElement);

    const $treeElement = jQuery(treeElement);

    const element = document.createElement("div");
    document.body.append(element);

    const node = new Node();
    node.element = element;

    const getScrollLeft = () => 0;

    const nodeElement = new NodeElement({ $treeElement, getScrollLeft, node });
    expect(nodeElement.element).toEqual(element);
});

it("sets the element to the tree element when the node doesn't have an element", () => {
    const treeElement = document.createElement("div");
    document.body.append(treeElement);

    const $treeElement = jQuery(treeElement);

    const node = new Node();
    const getScrollLeft = () => 0;

    const nodeElement = new NodeElement({ $treeElement, getScrollLeft, node });
    expect(nodeElement.element).toEqual(treeElement);
});
