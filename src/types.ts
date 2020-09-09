import { Node, Position } from "./node";

export interface DropHint {
    remove: () => void;
}

export interface HitArea {
    top: number;
    bottom: number;
    node: Node;
    position: Position;
}

export interface PositionInfo {
    pageX: number | undefined;
    pageY: number | undefined;
    target: HTMLElement;
    originalEvent: Event;
}
