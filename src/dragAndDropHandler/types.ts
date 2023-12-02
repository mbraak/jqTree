import { Node } from "../node";
import { Position } from "../position";

export interface DropHint {
    remove: () => void;
}

export interface HitArea {
    top: number;
    bottom: number;
    node: Node;
    position: Position;
}
