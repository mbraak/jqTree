import SaveStateHandler from "../saveStateHandler";

const createSaveStateHandler = () => {
    const addToSelection = jest.fn();
    const getNodeById = jest.fn();
    const getSelectedNodes = jest.fn();
    const getTree = jest.fn();
    const openNode = jest.fn();
    const refreshElements = jest.fn();
    const removeFromSelection = jest.fn();

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

        const saveStateHandler = createSaveStateHandler();
        expect(saveStateHandler.getStateFromStorage()).toBeNull();
    });

    it("returns an array of selected nodes when 'selected_node' in the states is a number", () => {
        localStorage.setItem("tree", JSON.stringify({ selected_node: 123 }));

        const saveStateHandler = createSaveStateHandler();
        expect(saveStateHandler.getStateFromStorage()).toEqual({
            selected_node: [123],
        });
    });
});
