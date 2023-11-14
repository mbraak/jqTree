import { Node } from "./node";

export type AddToSelection = (node: Node) => void;

export type CloseNode = (node: Node) => void;

export type GetNodeById = (nodeId: NodeId) => Node | null;

export type GetScrollLeft = () => number;

export type GetSelectedNode = () => Node | false;

export type GetSelectedNodes = () => Node[];

export type GetTree = () => Node | null;

export type IsFocusOnTree = () => boolean;

export type IsNodeSelected = (node: Node) => boolean;

export type LoadData = (data: NodeData[], parentNode: Node | null) => void;

export type OnFinishOpenNode = (node: Node) => void;

export type OpenNode = (
    node: Node,
    slide?: boolean,
    onFinished?: OnFinishOpenNode,
) => void;

export type RefreshElements = (fromNode: Node | null) => void;

export type RemoveFromSelection = (node: Node) => void;

export type SelectNode = (node: Node) => void;

export type TriggerEvent = (
    eventName: string,
    values?: Record<string, unknown>,
) => JQuery.Event;
