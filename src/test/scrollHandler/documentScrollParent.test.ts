import { vi } from 'vitest'

import DocumentScrollParent from "../../scrollHandler/documentScrollParent";

describe("checkHorizontalScrolling", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("scrolls to the left when pageX is near the left edge", () => {
        vi.useFakeTimers();
        const scrollBy = vi.fn();
        document.documentElement.scrollBy = scrollBy;

        const refreshHitAreas = vi.fn();
        const treeElement = document.createElement("div");

        const documentScrollParent = new DocumentScrollParent({
            refreshHitAreas,
            treeElement,
        });

        documentScrollParent.checkHorizontalScrolling(10);

        expect(scrollBy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledExactlyOnceWith({
            behavior: "instant",
            left: -20,
            top: 0,
        });
    });

    it("stops scrolling when pageX is moved from the left edge", () => {
        vi.useFakeTimers();
        const scrollBy = vi.fn();
        document.documentElement.scrollBy = scrollBy;

        const refreshHitAreas = vi.fn();
        const treeElement = document.createElement("div");

        const documentScrollParent = new DocumentScrollParent({
            refreshHitAreas,
            treeElement,
        });

        documentScrollParent.checkHorizontalScrolling(10);

        expect(scrollBy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledExactlyOnceWith({
            behavior: "instant",
            left: -20,
            top: 0,
        });

        documentScrollParent.checkHorizontalScrolling(100);
        vi.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledOnce();
    });
});

describe("checkVerticalScrolling", () => {
    it("scrolls to the top when pageY is near the top edge", () => {
        vi.useFakeTimers();
        const scrollBy = vi.fn();
        document.documentElement.scrollBy = scrollBy;

        const refreshHitAreas = vi.fn();
        const treeElement = document.createElement("div");

        const documentScrollParent = new DocumentScrollParent({
            refreshHitAreas,
            treeElement,
        });

        documentScrollParent.checkVerticalScrolling(10);

        expect(scrollBy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledExactlyOnceWith({
            behavior: "instant",
            left: 0,
            top: -20,
        });
    });

    it("stops scrolling when pageX is moved from the top edge", () => {
        vi.useFakeTimers();
        const scrollBy = vi.fn();
        document.documentElement.scrollBy = scrollBy;

        const refreshHitAreas = vi.fn();
        const treeElement = document.createElement("div");

        const documentScrollParent = new DocumentScrollParent({
            refreshHitAreas,
            treeElement,
        });

        documentScrollParent.checkVerticalScrolling(10);

        expect(scrollBy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenNthCalledWith(
            1,
            {
                behavior: "instant",
                left: 0,
                top: -20,
            }
        );

        documentScrollParent.checkVerticalScrolling(100);
        vi.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledOnce();
    });
});
