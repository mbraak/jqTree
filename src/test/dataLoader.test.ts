import DataLoader from "../dataLoader";

describe("loadFromUrl", () => {
    it("does nothing when urlInfo is empty", () => {
        const loadData = () => null;
        const treeElement = document.createElement("div");
        const triggerEvent = jest.fn();

        const dataLoader = new DataLoader({
            loadData,
            treeElement,
            triggerEvent,
        });

        dataLoader.loadFromUrl(null, null, null);
        expect(triggerEvent).not.toHaveBeenCalled();
    });
});
