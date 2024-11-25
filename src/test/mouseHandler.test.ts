import MouseHandler from "../mouseHandler";
import { Node } from "../node";

interface CreateMouseHandlerParams {
    element: HTMLElement;
    getNode?: jest.Mock;
    onClickButton?: jest.Mock;
    triggerEvent?: jest.Mock;
}

const createMouseHandler = ({
    element,
    getNode = jest.fn(),
    onClickButton = jest.fn(),
    triggerEvent = jest.fn(),
}: CreateMouseHandlerParams) => {
    const getMouseDelay = jest.fn();
    const onClickTitle = jest.fn();
    const onMouseCapture = jest.fn();
    const onMouseDrag = jest.fn();
    const onMouseStart = jest.fn();
    const onMouseStop = jest.fn();

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
        useContextMenu: true,
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

    it("handles a click with an empty target", () => {
        const element = document.createElement("div");
        const onClickButton = jest.fn();
        createMouseHandler({ element, onClickButton });

        const event = new MouseEvent("click");
        jest.spyOn(event, "target", "get").mockReturnValue(null);

        element.dispatchEvent(event);

        expect(onClickButton).not.toHaveBeenCalled();
    });
});

describe("handleContextmenu", () => {
    it("handles a context menu event on a node", () => {
        const treeElement = document.createElement("ul");
        treeElement.classList.add("jqtree-tree");
        document.body.appendChild(treeElement);

        const nodeElement = document.createElement("div");
        nodeElement.className = "jqtree-element";
        treeElement.appendChild(nodeElement);

        const node = new Node();

        const getNode = jest.fn((element: HTMLElement) => {
            if (element === nodeElement) {
                return node;
            } else {
                return null;
            }
        });

        const triggerEvent = jest.fn();

        createMouseHandler({ element: nodeElement, getNode, triggerEvent });

        const event = new MouseEvent("contextmenu", { bubbles: true });
        nodeElement.dispatchEvent(event);

        expect(triggerEvent).toHaveBeenCalledWith("tree.contextmenu", {
            click_event: event,
            node,
        });
    });

    it("handles a context menu event that's not on a node", () => {
        const element = document.createElement("div");
        document.body.appendChild(element);

        const getNode = jest.fn(() => null);
        const triggerEvent = jest.fn();

        createMouseHandler({ element, getNode, triggerEvent });

        const event = new MouseEvent("contextmenu", { bubbles: true });
        element.dispatchEvent(event);

        expect(triggerEvent).not.toHaveBeenCalled();
    });

    it("handles a context menu event without a target", () => {
        const element = document.createElement("div");
        document.body.appendChild(element);

        const triggerEvent = jest.fn();

        createMouseHandler({ element, triggerEvent });

        const event = new MouseEvent("contextmenu", { bubbles: true });
        jest.spyOn(event, "target", "get").mockReturnValue(null);

        element.dispatchEvent(event);

        expect(triggerEvent).not.toHaveBeenCalled();
    });
});
