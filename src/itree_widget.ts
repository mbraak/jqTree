import { Node } from "./node";

export type IconElement = Text|HTMLElement;

export interface IHitArea {
    top: number;
    bottom: number;
    node: Node;
    position: number;
};

export interface IDragAndDropHandler {
    hovered_area: IHitArea|null;
};

export interface IElementsRenderer {
    opened_icon_element: IconElement;
    closed_icon_element: IconElement;
};

export interface IScrollHandler {
    isScrolledIntoView: Function;
};

export interface ISelectNodeHandler {
    addToSelection: Function;
    isNodeSelected: Function;
};

export interface ITreeWidget {
    $el: JQuery;
    element: JQuery;
    options: any;
    tree: Node;

    dnd_handler: IDragAndDropHandler;
    renderer: IElementsRenderer;
    scroll_handler: IScrollHandler;
    select_node_handler: ISelectNodeHandler;

    // todo: signatures
    _triggerEvent: Function;
    _openNode: Function;
    _refreshElements: Function;
    _getNodeElement: Function;
    _getNodeElementForNode: Function;
    refreshHitAreas: Function;
    getSelectedNode: Function;
    openNode: Function;
    closeNode: Function;
    selectNode: Function;
    scrollToNode: Function;
    getNodeById: Function;
    getSelectedNodes: Function;
};

export interface INodeElement {
    node: Node;
    $element: JQuery;
};

export interface IDropHint {
    remove: Function;
};
