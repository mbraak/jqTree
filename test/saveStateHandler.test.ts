import { vi } from "vitest";

import type {
    AddToSelection,
    GetNodeById,
    GetSelectedNodes,
    GetTree,
    OnFinishOpenNode,
    OpenNode,
    RefreshElements,
    RemoveFromSelection,
} from "app/jqtreeMethodTypes";

import { Node } from "app/node";
import SaveStateHandler from "app/saveStateHandler";

const createSaveStateHandler = ({
    addToSelection = vi.fn<AddToSelection>(),
    getNodeById = vi.fn<GetNodeById>(),
    getSelectedNodes = vi.fn<GetSelectedNodes>(),
    openNode = vi.fn<OpenNode>(),
    refreshElements = vi.fn<RefreshElements>(),
    removeFromSelection = vi.fn<RemoveFromSelection>(),
}) => {
    const getTree = vi.fn<GetTree>();

    return new SaveStateHandler({
        addToSelection,
        getNodeById,
        getSelectedNodes,
        getTree,
        openNode,
        refreshElements,
        removeFromSelection,
        saveState: true,
    });
};

describe("getStateFromStorage", () => {
    afterEach(() => {
        localStorage.clear();
    });

    it("returns null when the state is not in local storage", () => {
        localStorage.clear();

        const saveStateHandler = createSaveStateHandler({});

        expect(saveStateHandler.getStateFromStorage()).toBeNull();
    });

    it("returns an array of selected nodes when 'selected_node' in the states is a number", () => {
        localStorage.setItem("tree", JSON.stringify({ selected_node: 123 }));

        const saveStateHandler = createSaveStateHandler({});

        expect(saveStateHandler.getStateFromStorage()).toStrictEqual({
            selected_node: [123],
        });
    });
});

describe("setInitialState", () => {
    it("deselects nodes that are currently selected", () => {
        const node = new Node({ id: 123 });

        const getSelectedNodes = vi.fn(() => [node]);
        const removeFromSelection = vi.fn();

        const saveStateHandler = createSaveStateHandler({
            getSelectedNodes,
            removeFromSelection,
        });
        saveStateHandler.setInitialState({});

        expect(removeFromSelection).toHaveBeenCalledExactlyOnceWith(node);
    });
});

describe("setInitialStateOnDemand", () => {
    it("doesn't open a node when open_nodes in the state is empty", () => {
        const openNode = vi.fn();

        const saveStateHandler = createSaveStateHandler({ openNode });
        saveStateHandler.setInitialStateOnDemand({}, vi.fn());

        expect(openNode).not.toHaveBeenCalled();
    });

    it("opens a node when the node id is in open_nodes in the state", () => {
        const node = new Node({ id: 123 });
        const getNodeById = vi.fn((nodeId) => {
            if (nodeId === 123) {
                return node;
            } else {
                return null;
            }
        });
        const openNode = vi.fn();

        const saveStateHandler = createSaveStateHandler({
            getNodeById,
            openNode,
        });
        saveStateHandler.setInitialStateOnDemand(
            { open_nodes: [123] },
            vi.fn(),
        );

        expect(openNode).toHaveBeenCalledExactlyOnceWith(node, false);
    });

    it("selects a node and redraws the tree when the node id is in selected_node in the state", () => {
        const node = new Node({ id: 123 });
        const getNodeById = vi.fn((nodeId) => {
            if (nodeId === 123) {
                return node;
            } else {
                return null;
            }
        });
        const addToSelection = vi.fn();
        const refreshElements = vi.fn();

        const saveStateHandler = createSaveStateHandler({
            addToSelection,
            getNodeById,
            refreshElements,
        });

        saveStateHandler.setInitialStateOnDemand(
            { open_nodes: [123], selected_node: [123] },
            vi.fn(),
        );

        expect(addToSelection).toHaveBeenCalledExactlyOnceWith(node);
        expect(refreshElements).toHaveBeenCalledExactlyOnceWith(null);
    });

    it("opens nodes recursively", () => {
        const node1 = new Node({ id: 1, load_on_demand: true });
        const node2 = new Node({ id: 2 });
        let calledGetNodeByIdForNode2 = false;

        const getNodeById = vi.fn((nodeId) => {
            switch (nodeId) {
                case 1:
                    return node1;
                case 2: {
                    // Return the node the second time.
                    if (calledGetNodeByIdForNode2) {
                        return node2;
                    } else {
                        calledGetNodeByIdForNode2 = true;
                        return null;
                    }
                }
                default:
                    return null;
            }
        });

        const openNode = vi.fn<OpenNode>(
            (node: Node, _slide?: boolean, onFinished?: OnFinishOpenNode) => {
                node.load_on_demand = false;

                if (onFinished) {
                    onFinished(node);
                }
            },
        );

        const saveStateHandler = createSaveStateHandler({
            getNodeById,
            openNode,
        });

        saveStateHandler.setInitialStateOnDemand(
            { open_nodes: [1, 2] },
            vi.fn(),
        );

        expect(openNode).toHaveBeenNthCalledWith(
            1,
            node1,
            false,
            expect.any(Function),
        );
        expect(openNode).toHaveBeenNthCalledWith(2, node1, false);
        expect(openNode).toHaveBeenNthCalledWith(3, node2, false);
    });
});
