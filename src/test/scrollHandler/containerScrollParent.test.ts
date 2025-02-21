import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { mockElementBoundingClientRect } from "jsdom-testing-mocks";

import ContainerScrollParent from "../../scrollHandler/containerScrollParent";

describe("checkHorizontalScrolling", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it("scrolls to the left when pageX is near the left edge", () => {
        jest.useFakeTimers();

        const refreshHitAreas = jest.fn();
        const container = document.createElement("div");

        const scrollBy = jest.fn();
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

        jest.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledWith({
            behavior: "instant",
            left: -20,
            top: 0,
        });
    });

    it("stops scrolling when pageX is moved from the left edge", () => {
        jest.useFakeTimers();

        const refreshHitAreas = jest.fn();
        const container = document.createElement("div");

        const scrollBy = jest.fn();
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

        jest.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledWith({
            behavior: "instant",
            left: -20,
            top: 0,
        });

        containerScrollParent.checkHorizontalScrolling(50);
        jest.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledTimes(1);
    });
});

describe("checkVerticalScrolling", () => {
    it("scrolls to the top when pageY is near the top edge", () => {
        jest.useFakeTimers();

        const refreshHitAreas = jest.fn();
        const container = document.createElement("div");

        const scrollBy = jest.fn();
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

        jest.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledWith({
            behavior: "instant",
            left: 0,
            top: -20,
        });
    });

    it("stops scrolling when pageX is moved from the left edge", () => {
        jest.useFakeTimers();

        const refreshHitAreas = jest.fn();
        const container = document.createElement("div");

        const scrollBy = jest.fn();
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

        jest.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledWith({
            behavior: "instant",
            left: 0,
            top: -20,
        });

        containerScrollParent.checkVerticalScrolling(50);
        jest.advanceTimersByTime(50);

        expect(scrollBy).toHaveBeenCalledTimes(1);
    });
});
