import { Node } from "../node";
import SaveStateHandler from "../saveStateHandler";

const createSaveStateHandler = ({
    addToSelection = jest.fn(),
    getNodeById = jest.fn(),
    getSelectedNodes = jest.fn(),
    openNode = jest.fn(),
    refreshElements = jest.fn(),
    removeFromSelection = jest.fn(),
}) => {
    const getTree = jest.fn();

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
        expect(saveStateHandler.getStateFromStorage()).toEqual({
            selected_node: [123],
        });
    });
});

describe("setInitialState", () => {
    it("deselects nodes that are currently selected", () => {
        const node = new Node({ id: 123 });

        const getSelectedNodes = jest.fn(() => [node]);
        const removeFromSelection = jest.fn();

        const saveStateHandler = createSaveStateHandler({
            getSelectedNodes,
            removeFromSelection,
        });
        saveStateHandler.setInitialState({});

        expect(removeFromSelection).toHaveBeenCalledWith(node);
    });
});

describe("setInitialStateOnDemand", () => {
    it("doesn't open a node when open_nodes in the state is empty", () => {
        const openNode = jest.fn();

        const saveStateHandler = createSaveStateHandler({ openNode });
        saveStateHandler.setInitialStateOnDemand({}, jest.fn());

        expect(openNode).not.toHaveBeenCalled();
    });

    it("opens a node when the node id is in open_nodes in the state", () => {
        const node = new Node({ id: 123 });
        const getNodeById = jest.fn((nodeId) => {
            if (nodeId === 123) {
                return node;
            } else {
                return null;
            }
        });
        const openNode = jest.fn();

        const saveStateHandler = createSaveStateHandler({
            getNodeById,
            openNode,
        });
        saveStateHandler.setInitialStateOnDemand(
            { open_nodes: [123] },
            jest.fn(),
        );

        expect(openNode).toHaveBeenCalledWith(node, false);
    });

    it("selects a node and redraws the tree when the node id is in selected_node in the state", () => {
        const node = new Node({ id: 123 });
        const getNodeById = jest.fn((nodeId) => {
            if (nodeId === 123) {
                return node;
            } else {
                return null;
            }
        });
        const addToSelection = jest.fn();
        const refreshElements = jest.fn();

        const saveStateHandler = createSaveStateHandler({
            addToSelection,
            getNodeById,
            refreshElements,
        });

        saveStateHandler.setInitialStateOnDemand(
            { open_nodes: [123], selected_node: [123] },
            jest.fn(),
        );

        expect(addToSelection).toHaveBeenCalledWith(node);
        expect(refreshElements).toHaveBeenCalledWith(null);
    });
});
