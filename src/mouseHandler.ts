import type { TriggerEvent } from "./jqtreeMethodTypes";
import type { PositionInfo } from "./mouseUtils";
import type { Node } from "./node";

import {
    getPositionInfoFromMouseEvent,
    getPositionInfoFromTouch,
} from "./mouseUtils";

export type GetMouseDelay = () => number;
export type GetNode = (element: HTMLElement) => Node | null;
export type MouseCapture = (positionInfo: PositionInfo) => boolean | null;
export type MouseStart = (positionInfo: PositionInfo) => boolean;

interface ClickTarget {
    node: Node;
    type: "button" | "label";
}

interface MouseHandlerParams {
    element: HTMLElement;
    getMouseDelay: () => number;
    getNode: GetNode;
    onClickButton: (node: Node) => void;
    onClickTitle: (node: Node) => void;
    onMouseCapture: MouseCapture;
    onMouseDrag: (positionInfo: PositionInfo) => void;
    onMouseStart: MouseStart;
    onMouseStop: (positionInfo: PositionInfo) => void;
    triggerEvent: TriggerEvent;
    useContextMenu: boolean;
}

class MouseHandler {
    private _element: HTMLElement;
    private _getMouseDelay: GetMouseDelay;
    private _getNode: GetNode;

    private _isMouseDelayMet: boolean;

    private _isMouseStarted: boolean;

    private _mouseDelayTimer: null | number;

    private _mouseDownInfo: null | PositionInfo;
    private _onClickButton: (node: Node) => void;
    private _onClickTitle: (node: Node) => void;

    private _onMouseCapture: MouseCapture;

    private _onMouseDrag: (positionInfo: PositionInfo) => void;

    private _onMouseStart: MouseStart;

    private _onMouseStop: (positionInfo: PositionInfo) => void;

    private _triggerEvent: TriggerEvent;
    private _useContextMenu: boolean;
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
        this._element = element;
        this._getMouseDelay = getMouseDelay;
        this._getNode = getNode;
        this._onClickButton = onClickButton;
        this._onClickTitle = onClickTitle;
        this._onMouseCapture = onMouseCapture;
        this._onMouseDrag = onMouseDrag;
        this._onMouseStart = onMouseStart;
        this._onMouseStop = onMouseStop;
        this._triggerEvent = triggerEvent;
        this._useContextMenu = useContextMenu;

        element.addEventListener("click", this._handleClick);
        element.addEventListener("dblclick", this._handleDblclick);
        element.addEventListener("mousedown", this._mouseDown, {
            passive: false,
        });
        element.addEventListener("touchstart", this._touchStart, {
            passive: false,
        });

        if (useContextMenu) {
            element.addEventListener("contextmenu", this._handleContextmenu);
        }

        this._isMouseStarted = false;
        this._mouseDelayTimer = null;
        this._isMouseDelayMet = false;
        this._mouseDownInfo = null;
    }
    public deinit(): void {
        this._element.removeEventListener("click", this._handleClick);
        this._element.removeEventListener("dblclick", this._handleDblclick);

        if (this._useContextMenu) {
            this._element.removeEventListener(
                "contextmenu",
                this._handleContextmenu,
            );
        }

        this._element.removeEventListener("mousedown", this._mouseDown);
        this._element.removeEventListener("touchstart", this._touchStart);
        this._removeMouseMoveEventListeners();
    }
    private _getClickTarget(element: HTMLElement): ClickTarget | null {
        const button = element.closest<HTMLElement>(".jqtree-toggler");

        if (button) {
            const node = this._getNode(button);

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
                const node = this._getNode(jqTreeElement);
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
    private _handleClick = (e: MouseEvent): void => {
        if (!e.target) {
            return;
        }

        const clickTarget = this._getClickTarget(e.target as HTMLElement);

        if (!clickTarget) {
            return;
        }

        switch (clickTarget.type) {
            case "button":
                this._onClickButton(clickTarget.node);

                e.preventDefault();
                e.stopPropagation();
                break;

            case "label": {
                if (this._triggerEvent("tree.click", {
                    click_event: e,
                    node: clickTarget.node,
                })) {
                    this._onClickTitle(clickTarget.node);
                }
                break;
            }
        }
    };

    private _handleContextmenu = (e: MouseEvent) => {
        if (!e.target) {
            return;
        }

        const div = (e.target as HTMLElement).closest<HTMLElement>(
            "ul.jqtree-tree .jqtree-element",
        );

        if (div) {
            const node = this._getNode(div);
            if (node) {
                e.preventDefault();
                e.stopPropagation();

                this._triggerEvent("tree.contextmenu", {
                    click_event: e,
                    node,
                });
                return false;
            }
        }

        return null;
    };

    private _handleDblclick = (e: MouseEvent): void => {
        if (!e.target) {
            return;
        }

        const clickTarget = this._getClickTarget(e.target as HTMLElement);

        if (clickTarget?.type === "label") {
            this._triggerEvent("tree.dblclick", {
                click_event: e,
                node: clickTarget.node,
            });
        }
    };

    private _handleMouseDown(positionInfo: PositionInfo): boolean {
        // We may have missed mouseup (out of window)
        if (this._isMouseStarted) {
            this._handleMouseUp(positionInfo);
        }

        this._mouseDownInfo = positionInfo;

        if (!this._onMouseCapture(positionInfo)) {
            return false;
        }

        this._handleStartMouse();

        return true;
    }

    private _handleMouseMove(
        e: MouseEvent | TouchEvent,
        positionInfo: PositionInfo,
    ): void {
        if (this._isMouseStarted) {
            this._onMouseDrag(positionInfo);

            if (e.cancelable) {
                e.preventDefault();
            }
            return;
        }

        if (!this._isMouseDelayMet) {
            return;
        }

        if (this._mouseDownInfo) {
            this._isMouseStarted = this._onMouseStart(this._mouseDownInfo);
        }

        if (this._isMouseStarted) {
            this._onMouseDrag(positionInfo);

            if (e.cancelable) {
                e.preventDefault();
            }
        } else {
            this._handleMouseUp(positionInfo);
        }
    }
    private _handleMouseUp(positionInfo: PositionInfo): void {
        this._removeMouseMoveEventListeners();
        this._isMouseDelayMet = false;
        this._mouseDownInfo = null;

        if (this._isMouseStarted) {
            this._isMouseStarted = false;
            this._onMouseStop(positionInfo);
        }
    }

    private _handleStartMouse(): void {
        document.addEventListener("mousemove", this._mouseMove, {
            passive: false,
        });
        document.addEventListener("touchmove", this._touchMove, {
            passive: false,
        });
        document.addEventListener("mouseup", this._mouseUp, { passive: false });
        document.addEventListener("touchend", this._touchEnd, {
            passive: false,
        });

        const mouseDelay = this._getMouseDelay();

        if (mouseDelay) {
            this._startMouseDelayTimer(mouseDelay);
        } else {
            this._isMouseDelayMet = true;
        }
    }

    private _mouseDown = (e: MouseEvent): void => {
        // Left mouse button?
        if (e.button !== 0) {
            return;
        }

        const result = this._handleMouseDown(getPositionInfoFromMouseEvent(e));

        if (result && e.cancelable) {
            e.preventDefault();
        }
    };

    private _mouseMove = (e: MouseEvent): void => {
        this._handleMouseMove(e, getPositionInfoFromMouseEvent(e));
    };

    private _mouseUp = (e: MouseEvent): void => {
        this._handleMouseUp(getPositionInfoFromMouseEvent(e));
    };

    private _removeMouseMoveEventListeners() {
        document.removeEventListener("mousemove", this._mouseMove);
        document.removeEventListener("touchmove", this._touchMove);
        document.removeEventListener("mouseup", this._mouseUp);
        document.removeEventListener("touchend", this._touchEnd);
    }

    private _startMouseDelayTimer(mouseDelay: number): void {
        if (this._mouseDelayTimer) {
            clearTimeout(this._mouseDelayTimer);
        }

        this._mouseDelayTimer = window.setTimeout(() => {
            if (this._mouseDownInfo) {
                this._isMouseDelayMet = true;
            }
        }, mouseDelay);

        this._isMouseDelayMet = false;
    }

    private _touchEnd = (e: TouchEvent): void => {
        if (e.touches.length > 1) {
            return;
        }

        const touch = e.touches[0];

        if (!touch) {
            return;
        }

        this._handleMouseUp(getPositionInfoFromTouch(touch, e));
    };

    private _touchMove = (e: TouchEvent): void => {
        if (e.touches.length > 1) {
            return;
        }

        const touch = e.touches[0];

        if (!touch) {
            return;
        }

        this._handleMouseMove(e, getPositionInfoFromTouch(touch, e));
    };

    private _touchStart = (e: TouchEvent): void => {
        if (e.touches.length > 1) {
            return;
        }

        const touch = e.touches[0];

        if (!touch) {
            return;
        }

        this._handleMouseDown(getPositionInfoFromTouch(touch, e));
    };
}

export default MouseHandler;
