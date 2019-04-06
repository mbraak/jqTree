import { Node, NodeId, Position } from "./node";
import { IPositionInfo } from "./imouse_widget";

export type IconElement = Text | Element;

export type OnFinishOpenNode = (node: Node) => void;

export interface IHitArea {
    top: number;
    bottom: number;
    node: Node;
    position: Position;
}

export interface IDragAndDropHandler {
    hoveredArea: IHitArea | null;
    positionInfo: IPositionInfo | null;
}

export interface IElementsRenderer {
    openedIconElement: IconElement;
    closedIconElement: IconElement;
}

export interface IScrollHandler {
    isScrolledIntoView: ($element: JQuery<any>) => boolean;
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

    dndHandler: IDragAndDropHandler | null;
    renderer: IElementsRenderer;
    scrollHandler: IScrollHandler | null;
    selectNodeHandler: ISelectNodeHandler | null;

    _triggerEvent: (eventName: string, values?: any) => JQuery.Event;
    _openNode: (
        node: Node,
        slide: boolean,
        onFinished: OnFinishOpenNode | null
    ) => void;
    _refreshElements: (fromNode: Node | null) => void;
    _getNodeElement: ($element: JQuery<any>) => INodeElement | null;
    _getNodeElementForNode: (node: Node) => INodeElement;
    _containsElement: (element: Element) => boolean;
    _getScrollLeft: () => number;
    refreshHitAreas: () => JQuery;
    getSelectedNode: () => Node | false;
    openNode: (node: Node, param1?: any, param2?: any) => JQuery;
    closeNode: (node: Node, slideParam?: any) => JQuery;
    selectNode: (node: Node) => JQuery;
    scrollToNode: (node: Node) => JQuery;
    getNodeById: (nodeId: NodeId) => Node | null;
    getSelectedNodes: () => Node[];
    loadData(data: any, parentNode: Node | null): JQuery;
}

export interface INodeElement {
    node: Node;
    $element: JQuery;

    addDropHint: (position: Position) => IDropHint;
    select: (mustSetFocus: boolean) => void;
    deselect: () => void;
}

export interface IDropHint {
    remove: () => void;
}
