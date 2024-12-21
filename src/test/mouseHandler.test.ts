import MouseHandler from "../mouseHandler";
import { Node } from "../node";

interface CreateMouseHandlerParams {
    element: HTMLElement;
    getNode?: jest.Mock;
    onClickButton?: jest.Mock;
    onMouseCapture?: jest.Mock;
    onMouseDrag?: jest.Mock;
    onMouseStart?: jest.Mock;
    onMouseStop?: jest.Mock;
    triggerEvent?: jest.Mock;
}

const createMouseHandler = ({
    element,
    getNode = jest.fn(),
    onClickButton = jest.fn(),
    onMouseCapture = jest.fn(),
    onMouseDrag = jest.fn(),
    onMouseStart = jest.fn(),
    onMouseStop = jest.fn(),
    triggerEvent = jest.fn(),
}: CreateMouseHandlerParams) => {
    const getMouseDelay = jest.fn();
    const onClickTitle = jest.fn();

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

describe("handleDblclick", () => {
    it("handles a double click on a label", () => {
        const element = document.createElement("div");

        const label = document.createElement("div");
        label.classList.add("jqtree-element");
        element.appendChild(label);

        document.body.append(element);

        const node = new Node();

        const getNode = jest.fn((element: HTMLElement) => {
            if (element === label) {
                return node;
            } else {
                return null;
            }
        });

        const triggerEvent = jest.fn();

        createMouseHandler({ element, getNode, triggerEvent });

        const event = new MouseEvent("dblclick", { bubbles: true });
        label.dispatchEvent(event);

        expect(triggerEvent).toHaveBeenCalledWith("tree.dblclick", {
            click_event: event,
            node,
        });
    });

    it("handles a double click event without a target", () => {
        const element = document.createElement("div");
        document.body.appendChild(element);

        const triggerEvent = jest.fn();

        createMouseHandler({ element, triggerEvent });

        const event = new MouseEvent("dblclick", { bubbles: true });
        jest.spyOn(event, "target", "get").mockReturnValue(null);

        element.dispatchEvent(event);

        expect(triggerEvent).not.toHaveBeenCalled();
    });
});

describe("touchStart", () => {
    it("handles a touchstart event", () => {
        const element = document.createElement("div");
        document.body.append(element);

        const onMouseCapture = jest.fn();

        createMouseHandler({ element, onMouseCapture });

        const touch = {
            pageX: 0,
            pageY: 0,
        };

        const event = new TouchEvent("touchstart", {
            bubbles: true,
            touches: [touch as Touch],
        });
        element.dispatchEvent(event);

        expect(onMouseCapture).toHaveBeenCalledWith({
            originalEvent: event,
            pageX: 0,
            pageY: 0,
            target: undefined,
        });
    });

    it("handles a touchstart event with multiple touches", () => {
        const element = document.createElement("div");
        document.body.append(element);

        const onMouseCapture = jest.fn();

        createMouseHandler({ element, onMouseCapture });

        const touch = {
            pageX: 0,
            pageY: 0,
        } as Touch;

        const event = new TouchEvent("touchstart", {
            bubbles: true,
            touches: [touch, touch],
        });
        element.dispatchEvent(event);

        expect(onMouseCapture).not.toHaveBeenCalled();
    });

    it("handles a touchstart event without touches", () => {
        const element = document.createElement("div");
        document.body.append(element);

        const onMouseCapture = jest.fn();

        createMouseHandler({ element, onMouseCapture });

        const event = new TouchEvent("touchstart", {
            bubbles: true,
            touches: [],
        });
        element.dispatchEvent(event);

        expect(onMouseCapture).not.toHaveBeenCalled();
    });
});

describe("touchEnd", () => {
    it("handles a touchend event after a touchstart and a touchmove event", () => {
        const element = document.createElement("div");
        document.body.append(element);

        const onMouseCapture = jest.fn(() => true);
        const onMouseStart = jest.fn(() => true);
        const onMouseStop = jest.fn();

        createMouseHandler({
            element,
            onMouseCapture,
            onMouseStart,
            onMouseStop,
        });

        const touch = {
            pageX: 0,
            pageY: 0,
        };

        const touchStartEvent = new TouchEvent("touchstart", {
            bubbles: true,
            touches: [touch as Touch],
        });
        element.dispatchEvent(touchStartEvent);

        const touchMoveEvent = new TouchEvent("touchmove", {
            bubbles: true,
            touches: [touch as Touch],
        });
        element.dispatchEvent(touchMoveEvent);

        const touchEndEvent = new TouchEvent("touchend", {
            bubbles: true,
            touches: [touch as Touch],
        });
        element.dispatchEvent(touchEndEvent);

        expect(onMouseStop).toHaveBeenCalledWith({
            originalEvent: touchEndEvent,
            pageX: 0,
            pageY: 0,
        });
    });

    it("handles a touchend with multiple touches", () => {
        const element = document.createElement("div");
        document.body.append(element);

        const onMouseCapture = jest.fn(() => true);
        const onMouseStart = jest.fn(() => true);
        const onMouseStop = jest.fn();

        createMouseHandler({
            element,
            onMouseCapture,
            onMouseStart,
            onMouseStop,
        });

        const touch = {
            pageX: 0,
            pageY: 0,
        } as Touch;

        const touchStartEvent = new TouchEvent("touchstart", {
            bubbles: true,
            touches: [touch],
        });
        element.dispatchEvent(touchStartEvent);

        const touchMoveEvent = new TouchEvent("touchmove", {
            bubbles: true,
            touches: [touch],
        });
        element.dispatchEvent(touchMoveEvent);

        const touchEndEvent = new TouchEvent("touchend", {
            bubbles: true,
            touches: [touch, touch],
        });
        element.dispatchEvent(touchEndEvent);

        expect(onMouseStop).not.toHaveBeenCalled();
    });
});

describe("touchMove", () => {
    it("handles a touchmove event without touches", () => {
        const element = document.createElement("div");
        document.body.append(element);

        const onMouseCapture = jest.fn(() => true);
        const onMouseDrag = jest.fn();

        createMouseHandler({
            element,
            onMouseCapture,
            onMouseDrag,
        });

        const touch = {
            pageX: 0,
            pageY: 0,
        } as Touch;

        const touchStartEvent = new TouchEvent("touchstart", {
            bubbles: true,
            touches: [touch],
        });
        element.dispatchEvent(touchStartEvent);

        const touchMoveEvent = new TouchEvent("touchmove", {
            bubbles: true,
            touches: [],
        });
        element.dispatchEvent(touchMoveEvent);

        expect(onMouseDrag).not.toHaveBeenCalled();
    });

    it("handles a touchmove event with multiple touches", () => {
        const element = document.createElement("div");
        document.body.append(element);

        const onMouseCapture = jest.fn(() => true);
        const onMouseDrag = jest.fn();

        createMouseHandler({
            element,
            onMouseCapture,
            onMouseDrag,
        });

        const touch = {
            pageX: 0,
            pageY: 0,
        } as Touch;

        const touchStartEvent = new TouchEvent("touchstart", {
            bubbles: true,
            touches: [touch],
        });
        element.dispatchEvent(touchStartEvent);

        const touchMoveEvent = new TouchEvent("touchmove", {
            bubbles: true,
            touches: [touch, touch],
        });
        element.dispatchEvent(touchMoveEvent);

        expect(onMouseDrag).not.toHaveBeenCalled();
    });
});
