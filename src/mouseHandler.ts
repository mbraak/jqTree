import {
    getPositionInfoFromMouseEvent,
    getPositionInfoFromTouch,
    PositionInfo,
} from "./mouseUtils";
import { Node } from "./node";
import { TriggerEvent } from "./jqtreeMethodTypes";

interface ClickTarget {
    node: Node;
    type: "button" | "label";
}

type GetNode = (element: HTMLElement) => null | Node;

interface MouseHandlerParams {
    element: HTMLElement;
    getMouseDelay: () => number;
    getNode: GetNode;
    onClickButton: (node: Node) => void;
    onClickTitle: (node: Node) => void;
    onMouseCapture: (positionInfo: PositionInfo) => boolean | null;
    onMouseDrag: (positionInfo: PositionInfo) => void;
    onMouseStart: (positionInfo: PositionInfo) => boolean;
    onMouseStop: (positionInfo: PositionInfo) => void;
    triggerEvent: TriggerEvent;
    useContextMenu: boolean;
}

class MouseHandler {
    private element: HTMLElement;
    private getMouseDelay: () => number;
    private getNode: GetNode;
    private isMouseDelayMet: boolean;
    private isMouseStarted: boolean;
    private mouseDelayTimer: number | null;
    private mouseDownInfo: PositionInfo | null;
    private onClickButton: (node: Node) => void;
    private onClickTitle: (node: Node) => void;
    private onMouseCapture: (positionInfo: PositionInfo) => boolean | null;
    private onMouseDrag: (positionInfo: PositionInfo) => void;
    private onMouseStart: (positionInfo: PositionInfo) => boolean;
    private onMouseStop: (positionInfo: PositionInfo) => void;
    private triggerEvent: TriggerEvent;
    private useContextMenu: boolean;

    constructor({
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
        useContextMenu,
    }: MouseHandlerParams) {
        this.element = element;
        this.getMouseDelay = getMouseDelay;
        this.getNode = getNode;
        this.onClickButton = onClickButton;
        this.onClickTitle = onClickTitle;
        this.onMouseCapture = onMouseCapture;
        this.onMouseDrag = onMouseDrag;
        this.onMouseStart = onMouseStart;
        this.onMouseStop = onMouseStop;
        this.triggerEvent = triggerEvent;
        this.useContextMenu = useContextMenu;

        element.addEventListener("click", this.handleClick);
        element.addEventListener("dblclick", this.handleDblclick);
        element.addEventListener("mousedown", this.mouseDown, {
            passive: false,
        });
        element.addEventListener("touchstart", this.touchStart, {
            passive: false,
        });

        if (useContextMenu) {
            element.addEventListener("contextmenu", this.handleContextmenu);
        }

        this.isMouseStarted = false;
        this.mouseDelayTimer = null;
        this.isMouseDelayMet = false;
        this.mouseDownInfo = null;
    }

    public deinit(): void {
        this.element.removeEventListener("click", this.handleClick);
        this.element.removeEventListener("dblclick", this.handleDblclick);

        if (this.useContextMenu) {
            this.element.removeEventListener(
                "contextmenu",
                this.handleContextmenu,
            );
        }

        this.element.removeEventListener("mousedown", this.mouseDown);
        this.element.removeEventListener("touchstart", this.touchStart);
        this.removeMouseMoveEventListeners();
    }

    private mouseDown = (e: MouseEvent): void => {
        // Left mouse button?
        if (e.button !== 0) {
            return;
        }

        const result = this.handleMouseDown(getPositionInfoFromMouseEvent(e));

        if (result && e.cancelable) {
            e.preventDefault();
        }
    };

    private handleMouseDown(positionInfo: PositionInfo): boolean {
        // We may have missed mouseup (out of window)
        if (this.isMouseStarted) {
            this.handleMouseUp(positionInfo);
        }

        this.mouseDownInfo = positionInfo;

        if (!this.onMouseCapture(positionInfo)) {
            return false;
        }

        this.handleStartMouse();

        return true;
    }

    private handleStartMouse(): void {
        document.addEventListener("mousemove", this.mouseMove, {
            passive: false,
        });
        document.addEventListener("touchmove", this.touchMove, {
            passive: false,
        });
        document.addEventListener("mouseup", this.mouseUp, { passive: false });
        document.addEventListener("touchend", this.touchEnd, {
            passive: false,
        });

        const mouseDelay = this.getMouseDelay();

        if (mouseDelay) {
            this.startMouseDelayTimer(mouseDelay);
        } else {
            this.isMouseDelayMet = true;
        }
    }

    private startMouseDelayTimer(mouseDelay: number): void {
        if (this.mouseDelayTimer) {
            clearTimeout(this.mouseDelayTimer);
        }

        this.mouseDelayTimer = window.setTimeout(() => {
            if (this.mouseDownInfo) {
                this.isMouseDelayMet = true;
            }
        }, mouseDelay);

        this.isMouseDelayMet = false;
    }

    private mouseMove = (e: MouseEvent): void => {
        this.handleMouseMove(e, getPositionInfoFromMouseEvent(e));
    };

    private handleMouseMove(
        e: MouseEvent | TouchEvent,
        positionInfo: PositionInfo,
    ): void {
        if (this.isMouseStarted) {
            this.onMouseDrag(positionInfo);

            if (e.cancelable) {
                e.preventDefault();
            }
            return;
        }

        if (!this.isMouseDelayMet) {
            return;
        }

        if (this.mouseDownInfo) {
            this.isMouseStarted =
                this.onMouseStart(this.mouseDownInfo) !== false;
        }

        if (this.isMouseStarted) {
            this.onMouseDrag(positionInfo);

            if (e.cancelable) {
                e.preventDefault();
            }
        } else {
            this.handleMouseUp(positionInfo);
        }
    }

    private mouseUp = (e: MouseEvent): void => {
        this.handleMouseUp(getPositionInfoFromMouseEvent(e));
    };

    private handleMouseUp(positionInfo: PositionInfo): void {
        this.removeMouseMoveEventListeners();
        this.isMouseDelayMet = false;
        this.mouseDownInfo = null;

        if (this.isMouseStarted) {
            this.isMouseStarted = false;
            this.onMouseStop(positionInfo);
        }
    }

    private removeMouseMoveEventListeners() {
        document.removeEventListener("mousemove", this.mouseMove);
        document.removeEventListener("touchmove", this.touchMove);
        document.removeEventListener("mouseup", this.mouseUp);
        document.removeEventListener("touchend", this.touchEnd);
    }

    private touchStart = (e: TouchEvent): void => {
        if (!e) {
            return;
        }

        if (e.touches.length > 1) {
            return;
        }

        const touch = e.touches[0];

        if (!touch) {
            return;
        }

        this.handleMouseDown(getPositionInfoFromTouch(touch, e));
    };

    private touchMove = (e: TouchEvent): void => {
        if (!e) {
            return;
        }

        if (e.touches.length > 1) {
            return;
        }

        const touch = e.touches[0];

        if (!touch) {
            return;
        }

        this.handleMouseMove(e, getPositionInfoFromTouch(touch, e));
    };

    private touchEnd = (e: TouchEvent): void => {
        if (!e) {
            return;
        }

        if (e.touches.length > 1) {
            return;
        }

        const touch = e.touches[0];

        if (!touch) {
            return;
        }

        this.handleMouseUp(getPositionInfoFromTouch(touch, e));
    };

    private handleClick = (e: MouseEvent): void => {
        if (!e.target) {
            return;
        }

        const clickTarget = this.getClickTarget(e.target as HTMLElement);

        if (!clickTarget) {
            return;
        }

        if (clickTarget.type === "button") {
            this.onClickButton(clickTarget.node);

            e.preventDefault();
            e.stopPropagation();
        } else if (clickTarget.type === "label") {
            const event = this.triggerEvent("tree.click", {
                node: clickTarget.node,
                click_event: e,
            });

            if (!event.isDefaultPrevented()) {
                this.onClickTitle(clickTarget.node);
            }
        }
    };

    private handleDblclick = (e: MouseEvent): void => {
        if (!e.target) {
            return;
        }

        const clickTarget = this.getClickTarget(e.target as HTMLElement);

        if (clickTarget?.type === "label") {
            this.triggerEvent("tree.dblclick", {
                node: clickTarget.node,
                click_event: e,
            });
        }
    };

    private handleContextmenu = (e: MouseEvent) => {
        if (!e.target) {
            return;
        }

        const div = (e.target as HTMLElement).closest(
            "ul.jqtree-tree .jqtree-element",
        );

        if (div) {
            const node = this.getNode(div as HTMLElement);
            if (node) {
                e.preventDefault();
                e.stopPropagation();

                this.triggerEvent("tree.contextmenu", {
                    node,
                    click_event: e,
                });
                return false;
            }
        }

        return null;
    };

    private getClickTarget(element: HTMLElement): ClickTarget | null {
        const button = element.closest(".jqtree-toggler");

        if (button) {
            const node = this.getNode(button as HTMLElement);

            if (node) {
                return {
                    type: "button",
                    node,
                };
            }
        } else {
            const jqTreeElement =
                element.closest<HTMLElement>(".jqtree-element");

            if (jqTreeElement) {
                const node = this.getNode(jqTreeElement);
                if (node) {
                    return {
                        type: "label",
                        node,
                    };
                }
            }
        }

        return null;
    }
}

export default MouseHandler;
