import { TriggerEvent } from "./jqtreeMethodTypes";
import {
    getPositionInfoFromMouseEvent,
    getPositionInfoFromTouch,
    PositionInfo,
} from "./mouseUtils";
import { Node } from "./node";

interface ClickTarget {
    node: Node;
    type: "button" | "label";
}

type GetNode = (element: HTMLElement) => Node | null;

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

    private mouseDelayTimer: null | number;

    private mouseDownInfo: null | PositionInfo;
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
    private getClickTarget(element: HTMLElement): ClickTarget | null {
        const button = element.closest<HTMLElement>(".jqtree-toggler");

        if (button) {
            const node = this.getNode(button);

            if (node) {
                return {
                    node,
                    type: "button",
                };
            }
        } else {
            const jqTreeElement =
                element.closest<HTMLElement>(".jqtree-element");

            if (jqTreeElement) {
                const node = this.getNode(jqTreeElement);
                if (node) {
                    return {
                        node,
                        type: "label",
                    };
                }
            }
        }

        return null;
    }
    private handleClick = (e: MouseEvent): void => {
        if (!e.target) {
            return;
        }

        const clickTarget = this.getClickTarget(e.target as HTMLElement);

        if (!clickTarget) {
            return;
        }

        switch (clickTarget.type) {
            case "button":
                this.onClickButton(clickTarget.node);

                e.preventDefault();
                e.stopPropagation();
                break;

            case "label": {
                const event = this.triggerEvent("tree.click", {
                    click_event: e,
                    node: clickTarget.node,
                });

                if (!event.isDefaultPrevented()) {
                    this.onClickTitle(clickTarget.node);
                }
                break;
            }
        }
    };

    private handleContextmenu = (e: MouseEvent) => {
        if (!e.target) {
            return;
        }

        const div = (e.target as HTMLElement).closest<HTMLElement>(
            "ul.jqtree-tree .jqtree-element",
        );

        if (div) {
            const node = this.getNode(div);
            if (node) {
                e.preventDefault();
                e.stopPropagation();

                this.triggerEvent("tree.contextmenu", {
                    click_event: e,
                    node,
                });
                return false;
            }
        }

        return null;
    };

    private handleDblclick = (e: MouseEvent): void => {
        if (!e.target) {
            return;
        }

        const clickTarget = this.getClickTarget(e.target as HTMLElement);

        if (clickTarget?.type === "label") {
            this.triggerEvent("tree.dblclick", {
                click_event: e,
                node: clickTarget.node,
            });
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
            this.isMouseStarted = this.onMouseStart(this.mouseDownInfo);
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
    private handleMouseUp(positionInfo: PositionInfo): void {
        this.removeMouseMoveEventListeners();
        this.isMouseDelayMet = false;
        this.mouseDownInfo = null;

        if (this.isMouseStarted) {
            this.isMouseStarted = false;
            this.onMouseStop(positionInfo);
        }
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

    private mouseMove = (e: MouseEvent): void => {
        this.handleMouseMove(e, getPositionInfoFromMouseEvent(e));
    };

    private mouseUp = (e: MouseEvent): void => {
        this.handleMouseUp(getPositionInfoFromMouseEvent(e));
    };

    private removeMouseMoveEventListeners() {
        document.removeEventListener("mousemove", this.mouseMove);
        document.removeEventListener("touchmove", this.touchMove);
        document.removeEventListener("mouseup", this.mouseUp);
        document.removeEventListener("touchend", this.touchEnd);
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

    private touchEnd = (e: TouchEvent): void => {
        if (e.touches.length > 1) {
            return;
        }

        const touch = e.touches[0];

        if (!touch) {
            return;
        }

        this.handleMouseUp(getPositionInfoFromTouch(touch, e));
    };

    private touchMove = (e: TouchEvent): void => {
        if (e.touches.length > 1) {
            return;
        }

        const touch = e.touches[0];

        if (!touch) {
            return;
        }

        this.handleMouseMove(e, getPositionInfoFromTouch(touch, e));
    };

    private touchStart = (e: TouchEvent): void => {
        if (e.touches.length > 1) {
            return;
        }

        const touch = e.touches[0];

        if (!touch) {
            return;
        }

        this.handleMouseDown(getPositionInfoFromTouch(touch, e));
    };
}

export default MouseHandler;
