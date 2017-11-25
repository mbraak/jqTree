import { Node, NodeId, Position } from "./node";
import { IPositionInfo } from "./imouse_widget";

export type IconElement = Text | HTMLElement;

export type OnFinishOpenNode = (node: Node) => void;

export interface IHitArea {
    top: number;
    bottom: number;
    node: Node;
    position: Position;
}

export interface IDragAndDropHandler {
    hovered_area: IHitArea | null;
    position_info: IPositionInfo | null;
}

export interface IElementsRenderer {
    opened_icon_element: IconElement;
    closed_icon_element: IconElement;
}

export interface IScrollHandler {
    isScrolledIntoView: ($element: JQuery) => boolean;
}

export interface ISelectNodeHandler {
    addToSelection: (node: Node) => void;
    isNodeSelected: (node?: Node) => boolean;
    getSelectedNodes: () => Node[];
    removeFromSelection: (node: Node) => void;
}

export interface ITreeWidget {
    $el: JQuery;
    element: JQuery;
    options: any;
    tree: Node;

    dnd_handler: IDragAndDropHandler | null;
    renderer: IElementsRenderer;
    scroll_handler: IScrollHandler | null;
    select_node_handler: ISelectNodeHandler | null;

    _triggerEvent: (event_name: string, values?: any) => JQuery.Event;
    _openNode: (
        node: Node,
        slide: boolean,
        on_finished: OnFinishOpenNode | null
    ) => void;
    _refreshElements: (from_node: Node | null) => void;
    _getNodeElement: ($element: JQuery) => INodeElement | null;
    _getNodeElementForNode: (node: Node) => INodeElement;
    _containsElement: (element: Element) => boolean;
    _getScrollLeft: () => number;
    refreshHitAreas: () => JQuery;
    getSelectedNode: () => Node | false;
    openNode: (node: Node, param1?: any, param2?: any) => JQuery;
    closeNode: (node: Node, slide_param?: any) => JQuery;
    selectNode: (node: Node) => JQuery;
    scrollToNode: (node: Node) => JQuery;
    getNodeById: (node_id: NodeId) => Node | null;
    getSelectedNodes: () => Node[];
}

export interface INodeElement {
    node: Node;
    $element: JQuery;

    addDropHint: (position: Position) => IDropHint;
    select: () => void;
    deselect: () => void;
}

export interface IDropHint {
    remove: () => void;
}
