import { Node } from "../../node";
import GhostDropHint from "../../nodeElement/ghostDropHint";

beforeEach(() => {
    document.body.innerHTML = "";
});

it("creates a hint element after the node element when the position is After", () => {
    const nodeElement = document.createElement("div");
    document.body.append(nodeElement);

    const node = new Node();
    new GhostDropHint(node, nodeElement, "after");

    expect(nodeElement.nextSibling).toHaveClass("jqtree-ghost");
    expect(nodeElement.previousSibling).toBeNull();
    expect(nodeElement.children).toBeEmpty();
});

it("creates a hint element after the node element when the position is Before", () => {
    const nodeElement = document.createElement("div");
    document.body.append(nodeElement);

    const node = new Node();
    new GhostDropHint(node, nodeElement, "before");

    expect(nodeElement.previousSibling).toHaveClass("jqtree-ghost");
    expect(nodeElement.nextSibling).toBeNull();
    expect(nodeElement.children).toBeEmpty();
});

it("creates a hint element after the node element when the position is Inside and the node is an open folder", () => {
    const nodeElement = document.createElement("div");
    document.body.append(nodeElement);

    const childElement = document.createElement("div");
    nodeElement.append(childElement);

    const node = new Node({ is_open: true });
    const childNode = new Node();
    childNode.element = childElement;
    node.addChild(childNode);

    new GhostDropHint(node, nodeElement, "inside");

    expect(nodeElement.previousSibling).toBeNull();
    expect(nodeElement.nextSibling).toBeNull();
    expect(nodeElement.children.length).toBe(2);
    expect(nodeElement.children[0]).toHaveClass("jqtree-ghost");
});

it("creates a hint element after the node element when the position is Inside and the node is a closed folder", () => {
    const nodeElement = document.createElement("div");
    document.body.append(nodeElement);

    const node = new Node();
    node.addChild(new Node());

    new GhostDropHint(node, nodeElement, "inside");

    expect(nodeElement.nextSibling).toHaveClass("jqtree-ghost");
    expect(nodeElement.previousSibling).toBeNull();
    expect(nodeElement.children).toBeEmpty();
});
