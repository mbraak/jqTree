import { Node, Position } from "../node";

export interface DropHint {
    remove: () => void;
}

export interface HitArea {
    bottom: number;
    node: Node;
    position: Position;
    top: number;
}
