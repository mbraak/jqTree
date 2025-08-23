import { afterEach, describe, expect, it, jest } from "@jest/globals";

import DocumentScrollParent from "../../scrollHandler/documentScrollParent";

describe("checkHorizontalScrolling", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it("scrolls to the left when pageX is near the left edge", () => {
        jest.useFakeTimers();
        const scrollBy = jest.fn();
        document.documentElement.scrollBy = scrollBy;

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
        document.documentElement.scrollBy = scrollBy;

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

describe("checkVerticalScrolling", () => {
    it("scrolls to the top when pageY is near the top edge", () => {
        jest.useFakeTimers();
        const scrollBy = jest.fn();
        document.documentElement.scrollBy = scrollBy;

        const refreshHitAreas = jest.fn();
        const treeElement = document.createElement("div");

        const documentScrollParent = new DocumentScrollParent({
            refreshHitAreas,
            treeElement,
        });

        documentScrollParent.checkVerticalScrolling(10);

        expect(scrollBy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledWith({
            behavior: "instant",
            left: 0,
            top: -20,
        });
    });

    it("stops scrolling when pageX is moved from the top edge", () => {
        jest.useFakeTimers();
        const scrollBy = jest.fn();
        document.documentElement.scrollBy = scrollBy;

        const refreshHitAreas = jest.fn();
        const treeElement = document.createElement("div");

        const documentScrollParent = new DocumentScrollParent({
            refreshHitAreas,
            treeElement,
        });

        documentScrollParent.checkVerticalScrolling(10);

        expect(scrollBy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledWith({
            behavior: "instant",
            left: 0,
            top: -20,
        });

        documentScrollParent.checkVerticalScrolling(100);
        jest.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledTimes(1);
    });
});
