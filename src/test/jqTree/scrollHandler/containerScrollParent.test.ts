import ContainerScrollParent from "../../../scrollHandler/containerScrollParent";

const mockContainerScrollParent = ({ scrollLeft } = { scrollLeft: 0 }) => {
    const $container = {
        innerHeight: () => 0,
        offset: () => ({ top: 0 }),
        scrollLeft: () => scrollLeft,
    } as JQuery<HTMLElement>;
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
        const containerScrollParent = mockContainerScrollParent({
            scrollLeft: 10,
        });

        expect(containerScrollParent.getScrollLeft()).toBe(10);
    });
});
