import { Node } from "../node";
import SelectNodeHandler from "../selectNodeHandler";

describe("getSelectedNodesUnder", () => {
    it("returns the nodes when the nodes have an id", () => {
        const node = new Node({ id: 1 });

        const child = new Node({ id: 2 });
        node.addChild(child);

        const nodeMap = new Map<NodeId, Node>();
        nodeMap.set(1, node);
        nodeMap.set(2, child);

        const getNodeById = (id: NodeId) => nodeMap.get(id) ?? null;

        const selectNodeHandler = new SelectNodeHandler({ getNodeById });
        selectNodeHandler.addToSelection(child);

        expect(
            selectNodeHandler.getSelectedNodesUnder(node),
        ).toIncludeAllMembers([child]);
    });
});
