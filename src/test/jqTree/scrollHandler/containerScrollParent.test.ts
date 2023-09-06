import ContainerScrollParent from "../../../scrollHandler/containerScrollParent";

const mock$Container = ({ scrollLeft } = { scrollLeft: 0 }) => {
    const container = {} as HTMLElement;

    const $container = {
        get: (_i: number) => container,
        innerHeight: () => 0,
        offset: () => ({ top: 0 }),
        scrollLeft: () => scrollLeft,
    } as JQuery<HTMLElement>;

    return $container;
};

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
        const $container = mock$Container({
            scrollLeft: 10,
        });
        const containerScrollParent = mockContainerScrollParent($container);

        expect(containerScrollParent.getScrollLeft()).toBe(10);
    });
});

describe("scrollToY", () => {
    it("sets scrollTop of the container", () => {
        const $container = mock$Container({
            scrollLeft: 10,
        });
        const containerScrollParent = mockContainerScrollParent($container);
        containerScrollParent.scrollToY(10);

        expect($container.get(0)!.scrollTop).toBe(10);
    });
});
