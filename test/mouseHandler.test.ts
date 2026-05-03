import { vi } from "vitest";

import { TriggerEvent } from "app/jqtreeMethodTypes";
import MouseHandler, {
    GetMouseDelay,
    GetNode,
    MouseCapture,
    MouseStart,
} from "app/mouseHandler";
import { PositionInfo } from "app/mouseUtils";
import { Node } from "app/node";

interface CreateMouseHandlerParams {
    element: HTMLElement;
    getMouseDelay?: GetMouseDelay;
    getNode?: GetNode;
    onClickButton?: (node: Node) => void;
    onMouseCapture?: MouseCapture;
    onMouseDrag?: (positionInfo: PositionInfo) => void;
    onMouseStart?: MouseStart;
    onMouseStop?: (positionInfo: PositionInfo) => void;
    triggerEvent?: TriggerEvent;
}

const createMouseHandler = ({
    element,
    getMouseDelay = vi.fn(() => 0),
    getNode = vi.fn(),
    onClickButton = vi.fn(),
    onMouseCapture = vi.fn(),
    onMouseDrag = vi.fn(),
    onMouseStart = vi.fn(),
    onMouseStop = vi.fn(),
    triggerEvent = vi.fn(),
}: CreateMouseHandlerParams) => {
    const onClickTitle = vi.fn();

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
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("handles a button click", () => {
        const element = document.createElement("div");

        const button = document.createElement("button");
        button.classList.add("jqtree-toggler");
        element.appendChild(button);

        document.body.append(element);

        const node = new Node();

        const getNode = vi.fn((element: HTMLElement) => {
            if (element === button) {
                return node;
            } else {
                return null;
            }
        });

        const onClickButton = vi.fn();

        createMouseHandler({ element, getNode, onClickButton });

        const event = new MouseEvent("click", { bubbles: true });
        button.dispatchEvent(event);

        expect(onClickButton).toHaveBeenCalledExactlyOnceWith(node);
    });

    it("handles a click with an empty target", () => {
        const element = document.createElement("div");
        const onClickButton = vi.fn();
        createMouseHandler({ element, onClickButton });

        const event = new MouseEvent("click");
        vi.spyOn(event, "target", "get").mockReturnValue(null);

        element.dispatchEvent(event);

        expect(onClickButton).not.toHaveBeenCalled();
    });
});

describe("handleContextmenu", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("handles a context menu event on a node", () => {
        const treeElement = document.createElement("ul");
        treeElement.classList.add("jqtree-tree");
        document.body.appendChild(treeElement);

        const nodeElement = document.createElement("div");
        nodeElement.className = "jqtree-element";
        treeElement.appendChild(nodeElement);

        const node = new Node();

        const getNode = vi.fn((element: HTMLElement) => {
            if (element === nodeElement) {
                return node;
            } else {
                return null;
            }
        });

        const triggerEvent = vi.fn<TriggerEvent>();

        createMouseHandler({ element: nodeElement, getNode, triggerEvent });

        const event = new MouseEvent("contextmenu", { bubbles: true });
        nodeElement.dispatchEvent(event);

        expect(triggerEvent).toHaveBeenCalledExactlyOnceWith("tree.contextmenu", {
            click_event: event,
            node,
        });
    });

    it("handles a context menu event that's not on a node", () => {
        const element = document.createElement("div");
        document.body.appendChild(element);

        const getNode = vi.fn(() => null);
        const triggerEvent = vi.fn<TriggerEvent>();

        createMouseHandler({ element, getNode, triggerEvent });

        const event = new MouseEvent("contextmenu", { bubbles: true });
        element.dispatchEvent(event);

        expect(triggerEvent).not.toHaveBeenCalled();
    });

    it("handles a context menu event without a target", () => {
        const element = document.createElement("div");
        document.body.appendChild(element);

        const triggerEvent = vi.fn<TriggerEvent>();

        createMouseHandler({ element, triggerEvent });

        const event = new MouseEvent("contextmenu", { bubbles: true });
        vi.spyOn(event, "target", "get").mockReturnValue(null);

        element.dispatchEvent(event);

        expect(triggerEvent).not.toHaveBeenCalled();
    });
});

describe("handleDblclick", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("handles a double click on a label", () => {
        const element = document.createElement("div");

        const label = document.createElement("div");
        label.classList.add("jqtree-element");
        element.appendChild(label);

        document.body.append(element);

        const node = new Node();

        const getNode = vi.fn((element: HTMLElement) => {
            if (element === label) {
                return node;
            } else {
                return null;
            }
        });

        const triggerEvent = vi.fn<TriggerEvent>();

        createMouseHandler({ element, getNode, triggerEvent });

        const event = new MouseEvent("dblclick", { bubbles: true });
        label.dispatchEvent(event);

        expect(triggerEvent).toHaveBeenCalledExactlyOnceWith("tree.dblclick", {
            click_event: event,
            node,
        });
    });

    it("handles a double click event without a target", () => {
        const element = document.createElement("div");
        document.body.appendChild(element);

        const triggerEvent = vi.fn<TriggerEvent>();

        createMouseHandler({ element, triggerEvent });

        const event = new MouseEvent("dblclick", { bubbles: true });
        vi.spyOn(event, "target", "get").mockReturnValue(null);

        element.dispatchEvent(event);

        expect(triggerEvent).not.toHaveBeenCalled();
    });
});

describe("touchStart", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("handles a touchstart event", () => {
        const element = document.createElement("div");
        document.body.append(element);

        const onMouseCapture = vi.fn<MouseCapture>();

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

        expect(onMouseCapture).toHaveBeenCalledExactlyOnceWith({
            originalEvent: event,
            pageX: 0,
            pageY: 0,
            target: undefined,
        });
    });

    it("handles a touchstart event with multiple touches", () => {
        const element = document.createElement("div");
        document.body.append(element);

        const onMouseCapture = vi.fn<MouseCapture>();

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

        const onMouseCapture = vi.fn<MouseCapture>();

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
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("handles a touchend event after a touchstart and a touchmove event", () => {
        const element = document.createElement("div");
        document.body.append(element);

        const onMouseCapture = vi.fn(() => true);
        const onMouseStart = vi.fn(() => true);
        const onMouseStop = vi.fn();

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

        expect(onMouseStop).toHaveBeenCalledExactlyOnceWith({
            originalEvent: touchEndEvent,
            pageX: 0,
            pageY: 0,
        });
    });

    it("handles a touchend with multiple touches", () => {
        const element = document.createElement("div");
        document.body.append(element);

        const onMouseCapture = vi.fn(() => true);
        const onMouseStart = vi.fn(() => true);
        const onMouseStop = vi.fn();

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
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("handles a touchmove event without touches", () => {
        const element = document.createElement("div");
        document.body.append(element);

        const onMouseCapture = vi.fn(() => true);
        const onMouseDrag = vi.fn();

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

        const onMouseCapture = vi.fn(() => true);
        const onMouseDrag = vi.fn();

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

describe("mouseMove", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("calls onMouseStart when the delay is met and there is a mouse move", () => {
        vi.useFakeTimers();

        const treeElement = document.createElement("ul");
        treeElement.classList.add("jqtree-tree");
        document.body.appendChild(treeElement);

        const nodeElement = document.createElement("div");
        nodeElement.className = "jqtree-element";
        treeElement.appendChild(nodeElement);

        const node = new Node();

        const getNode = vi.fn((element: HTMLElement) => {
            if (element === nodeElement) {
                return node;
            } else {
                return null;
            }
        });

        const getMouseDelay = vi.fn(() => 1_000);
        const onMouseCapture = vi.fn(() => true);
        const onMouseStart = vi.fn(() => true);

        createMouseHandler({
            element: nodeElement,
            getMouseDelay,
            getNode,
            onMouseCapture,
            onMouseStart,
        });

        nodeElement.dispatchEvent(
            new MouseEvent("mousedown", { bubbles: true }),
        );

        nodeElement.dispatchEvent(
            new MouseEvent("mousemove", { bubbles: true }),
        );

        expect(onMouseStart).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1_500);

        nodeElement.dispatchEvent(
            new MouseEvent("mousemove", { bubbles: true }),
        );

        expect(onMouseStart).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                target: nodeElement,
            }),
        );
    });

    it("calls onMouseStart when mousedown is triggered twice", () => {
        vi.useFakeTimers();

        const treeElement = document.createElement("ul");
        treeElement.classList.add("jqtree-tree");
        document.body.appendChild(treeElement);

        const nodeElement = document.createElement("div");
        nodeElement.className = "jqtree-element";
        treeElement.appendChild(nodeElement);

        const node = new Node();

        const getNode = vi.fn((element: HTMLElement) => {
            if (element === nodeElement) {
                return node;
            } else {
                return null;
            }
        });

        const getMouseDelay = vi.fn(() => 1_000);
        const onMouseCapture = vi.fn(() => true);
        const onMouseStart = vi.fn(() => true);

        createMouseHandler({
            element: nodeElement,
            getMouseDelay,
            getNode,
            onMouseCapture,
            onMouseStart,
        });

        nodeElement.dispatchEvent(
            new MouseEvent("mousedown", { bubbles: true }),
        );

        vi.advanceTimersByTime(600);

        nodeElement.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

        vi.advanceTimersByTime(600);

        expect(onMouseStart).not.toHaveBeenCalled();

        nodeElement.dispatchEvent(
            new MouseEvent("mousedown", { bubbles: true }),
        );

        vi.advanceTimersByTime(600);

        nodeElement.dispatchEvent(
            new MouseEvent("mousemove", { bubbles: true }),
        );

        expect(onMouseStart).not.toHaveBeenCalled();

        vi.advanceTimersByTime(600);

        nodeElement.dispatchEvent(
            new MouseEvent("mousemove", { bubbles: true }),
        );

        expect(onMouseStart).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                target: nodeElement,
            }),
        );
    });
});
