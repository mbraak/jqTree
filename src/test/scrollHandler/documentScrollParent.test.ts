import DocumentScrollParent from "../../scrollHandler/documentScrollParent";

afterEach(() => {
    jest.useRealTimers();
});

describe("checkHorizontalScrolling", () => {
    it("scrolls to the left when pageX is near the left edge", () => {
        jest.useFakeTimers();
        const scrollBy = jest.fn();
        window.scrollBy = scrollBy;

        const refreshHitAreas = jest.fn();
        const treeElement = document.createElement("div");

        const documentScrollParent = new DocumentScrollParent({
            refreshHitAreas,
            treeElement,
        });

        documentScrollParent.checkHorizontalScrolling(10);

        expect(scrollBy).not.toHaveBeenCalled();
        jest.advanceTimersByTime(50);
        expect(scrollBy).toHaveBeenCalledWith({
            behavior: "instant",
            left: -20,
            top: 0,
        });
    });

    it("stops scrolling when pageX is moved from the left edge", () => {
        jest.useFakeTimers();
        const scrollBy = jest.fn();
        window.scrollBy = scrollBy;

        const refreshHitAreas = jest.fn();
        const treeElement = document.createElement("div");

        const documentScrollParent = new DocumentScrollParent({
            refreshHitAreas,
            treeElement,
        });

        documentScrollParent.checkHorizontalScrolling(10);

        expect(scrollBy).not.toHaveBeenCalled();
        jest.advanceTimersByTime(50);
        expect(scrollBy).toHaveBeenCalledWith({
            behavior: "instant",
            left: -20,
            top: 0,
        });

        documentScrollParent.checkHorizontalScrolling(100);
        jest.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledTimes(1);
    });
});
