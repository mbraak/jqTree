import ContainerScrollParent from "../../../scrollHandler/containerScrollParent";
import mock$JQueryElement from "../mock$JQueryElement";

const mockContainerScrollParent = ($container: JQuery<HTMLElement>) => {
    const refreshHitAreas = jest.fn();
    const $treeElement = {} as JQuery<HTMLElement>;

    return new ContainerScrollParent({
        $container,
        refreshHitAreas,
        $treeElement,
    });
};

describe("getScrollLeft", () => {
    it("returns the scrollLeft of the container", () => {
        const $container = mock$JQueryElement({
            scrollLeft: 10,
        });
        const containerScrollParent = mockContainerScrollParent($container);

        expect(containerScrollParent.getScrollLeft()).toBe(10);
    });
});

describe("isScrolledIntoView", () => {
    it("returns true when the element is visible", () => {
        const $container = mock$JQueryElement({
            height: 100,
            offsetTop: 0,
        });
        const containerScrollParent = mockContainerScrollParent($container);

        const $element = mock$JQueryElement({
            height: 10,
            offsetTop: 0,
        });

        expect(containerScrollParent.isScrolledIntoView($element)).toBe(true);
    });

    it("returns false when the element is not visible", () => {
        const $container = mock$JQueryElement({
            height: 100,
            offsetTop: 0,
        });
        const containerScrollParent = mockContainerScrollParent($container);

        const $element = mock$JQueryElement({
            height: 10,
            offsetTop: 150,
        });

        expect(containerScrollParent.isScrolledIntoView($element)).toBe(false);
    });
});

describe("scrollToY", () => {
    it("sets scrollTop of the container", () => {
        const $container = mock$JQueryElement({
            scrollLeft: 10,
        });
        const containerScrollParent = mockContainerScrollParent($container);
        containerScrollParent.scrollToY(10);

        expect($container.get(0)!.scrollTop).toBe(10);
    });
});
