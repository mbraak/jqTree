import { Node } from "../../node";
import GhostDropHint from "../../nodeElement/ghostDropHint";
import { Position } from "../../position";

it("creates a hint element after the node element when the position is After", () => {
    const nodeElement = document.createElement("div");
    document.body.append(nodeElement);

    const node = new Node();
    new GhostDropHint(node, nodeElement, Position.After);

    expect(nodeElement.nextSibling).toHaveClass("jqtree-ghost");
});
