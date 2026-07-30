import { getElementPosition, getOffsetTop } from "htmlTree/positionUtils";

const mockHtmlElement = (x: number, y: number) =>
    ({
        getBoundingClientRect: () => ({ x, y }),
    }) as HTMLElement;

const mockWindowScroll = (scrollX: number, scrollY: number) => {
    vi.spyOn(window, "scrollX", "get").mockReturnValue(scrollX);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(scrollY);
};

describe("getElementPosition", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns the top left position including the window scroll", () => {
        const element = mockHtmlElement(10, 20);
        mockWindowScroll(30, 40);

        expect(getElementPosition(element)).toStrictEqual({
            left: 40,
            top: 60,
        });
    });

    it("returns the position when the window is not scrolled", () => {
        const element = mockHtmlElement(10, 20);
        mockWindowScroll(0, 0);

        expect(getElementPosition(element)).toStrictEqual({
            left: 10,
            top: 20,
        });
    });
});

describe("getOffsetTop", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns the top position including the window scroll", () => {
        const element = mockHtmlElement(10, 20);
        mockWindowScroll(30, 40);

        expect(getOffsetTop(element)).toBe(60);
    });
});
