import { mockElementBoundingClientRect } from "jsdom-testing-mocks";
import { vi } from 'vitest'

import ContainerScrollParent from "../../scrollHandler/containerScrollParent";

describe("checkHorizontalScrolling", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("scrolls to the left when pageX is near the left edge", () => {
        vi.useFakeTimers();

        const refreshHitAreas = vi.fn();
        const container = document.createElement("div");

        const scrollBy = vi.fn();
        container.scrollBy = scrollBy;

        mockElementBoundingClientRect(container, {
            height: 100,
            width: 100,
            x: 10,
            y: 10,
        });

        const containerScrollParent = new ContainerScrollParent({
            container,
            refreshHitAreas,
        });

        containerScrollParent.checkHorizontalScrolling(20);

        expect(scrollBy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledWith({
            behavior: "instant",
            left: -20,
            top: 0,
        });
    });

    it("stops scrolling when pageX is moved from the left edge", () => {
        vi.useFakeTimers();

        const refreshHitAreas = vi.fn();
        const container = document.createElement("div");

        const scrollBy = vi.fn();
        container.scrollBy = scrollBy;

        mockElementBoundingClientRect(container, {
            height: 100,
            width: 100,
            x: 10,
            y: 10,
        });

        const containerScrollParent = new ContainerScrollParent({
            container,
            refreshHitAreas,
        });

        containerScrollParent.checkHorizontalScrolling(20);

        expect(scrollBy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledWith({
            behavior: "instant",
            left: -20,
            top: 0,
        });

        containerScrollParent.checkHorizontalScrolling(50);
        vi.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledTimes(1);
    });
});

describe("checkVerticalScrolling", () => {
    it("scrolls to the top when pageY is near the top edge", () => {
        vi.useFakeTimers();

        const refreshHitAreas = vi.fn();
        const container = document.createElement("div");

        const scrollBy = vi.fn();
        container.scrollBy = scrollBy;

        mockElementBoundingClientRect(container, {
            height: 100,
            width: 100,
            x: 10,
            y: 10,
        });

        const containerScrollParent = new ContainerScrollParent({
            container,
            refreshHitAreas,
        });

        containerScrollParent.checkVerticalScrolling(9);

        expect(scrollBy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledWith({
            behavior: "instant",
            left: 0,
            top: -20,
        });
    });

    it("stops scrolling when pageX is moved from the left edge", () => {
        vi.useFakeTimers();

        const refreshHitAreas = vi.fn();
        const container = document.createElement("div");

        const scrollBy = vi.fn();
        container.scrollBy = scrollBy;

        mockElementBoundingClientRect(container, {
            height: 100,
            width: 100,
            x: 10,
            y: 10,
        });

        const containerScrollParent = new ContainerScrollParent({
            container,
            refreshHitAreas,
        });

        containerScrollParent.checkVerticalScrolling(9);

        expect(scrollBy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledWith({
            behavior: "instant",
            left: 0,
            top: -20,
        });

        containerScrollParent.checkVerticalScrolling(50);
        vi.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledTimes(1);
    });
});
