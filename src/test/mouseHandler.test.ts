import MouseHandler from "../mouseHandler";
import { Node } from "../node";

interface CreateMouseHandlerParams {
    element: HTMLElement;
    getNode?: jest.Mock;
    onClickButton?: jest.Mock;
}

const createMouseHandler = ({
    element,
    getNode = jest.fn(),
    onClickButton = jest.fn(),
}: CreateMouseHandlerParams) => {
    const getMouseDelay = jest.fn();
    const onClickTitle = jest.fn();
    const onMouseCapture = jest.fn();
    const onMouseDrag = jest.fn();
    const onMouseStart = jest.fn();
    const onMouseStop = jest.fn();
    const triggerEvent = jest.fn();

    return new MouseHandler({
        element,
        getMouseDelay,
        getNode,
        onClickButton,
        onClickTitle,
        onMouseCapture,
        onMouseDrag,
        onMouseStart,
        onMouseStop,
        triggerEvent,
        useContextMenu: false,
    });
};

describe("handleClick", () => {
    it("handles a button click", () => {
        const element = document.createElement("div");

        const button = document.createElement("button");
        button.classList.add("jqtree-toggler");
        element.appendChild(button);

        document.body.append(element);

        const node = new Node();

        const getNode = jest.fn((element: HTMLElement) => {
            if (element === button) {
                return node;
            } else {
                return null;
            }
        });

        const onClickButton = jest.fn();

        createMouseHandler({ element, getNode, onClickButton });

        const event = new MouseEvent("click", { bubbles: true });
        button.dispatchEvent(event);

        expect(onClickButton).toHaveBeenCalledWith(node);
    });

    // eslint-disable-next-line jest/expect-expect
    it("handles a click with an empty target", () => {
        const element = document.createElement("div");
        createMouseHandler({ element });

        const event = new MouseEvent("click");
        jest.spyOn(event, "target", "get").mockReturnValue(null);

        element.dispatchEvent(event);
    });
});
