type NodeId = number | string;

interface NodeRecord {
    [key: string]: unknown;
    children?: NodeData[];
    id?: NodeId;
}

type NodeData = NodeRecord | string;

type IterateCallback = (node: INode, level: number) => boolean;

interface INode {
    [key: string]: unknown;
    children: INode[];
    element?: HTMLElement;
    id?: NodeId;
    is_open: boolean;
    iterate(callback: IterateCallback): void;

    name: string;

    parent: INode | null;
}

type DataUrlFunction = (node?: Node) => JQuery.AjaxSettings;
type DataUrl = DataUrlFunction | JQuery.AjaxSettings | string;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ClickNodeEvent {
    click_event: JQuery.ClickEvent;
    deselected_node?: INode | null;
    node: INode;
    previous_node?: INode;
}

interface SelectNodeOptions {
    mustSetFocus?: boolean;
    mustToggle?: boolean;
}

interface SavedState {
    open_nodes: NodeId[];
    selected_node: NodeId[];
}

interface IJQTreeOptions {
    animationSpeed?: number | string;
    autoEscape?: boolean;
    autoOpen?: boolean | number | string;
    buttonLeft?: boolean;
    closedIcon?: HTMLElement | JQuery | string;
    data?: NodeData[];
    dataFilter?: (data: NodeData[]) => NodeData[];
    dataUrl?: DataUrl;
    dragAndDrop?: boolean;
    keyboardSupport?: boolean;
    nodeClass?: any;
    onCanMove?: (node: INode) => boolean;
    onCanSelectNode?: (node: INode) => boolean;
    onCreateLi?: (node: INode, el: JQuery, isSelected: boolean) => void;
    onDragMove?: (node: INode, event: JQuery.Event | Touch) => void;
    onDragStop?: (node: INode, event: JQuery.Event | Touch) => void;
    onGetStateFromStorage?: () => string;
    onIsMoveHandle?: (el: JQuery) => boolean;
    onLoadFailed?: (response: JQuery.jqXHR) => void;
    onLoading?: (isLoading: boolean, node: INode, $el: JQuery) => void;
    onSetStateFromStorage?: (data: string) => void;
    openedIcon?: HTMLElement | JQuery | string;
    openFolderDelay?: false | number;
    rtl?: boolean;
    saveState?: boolean | string;
    selectable?: boolean;
    showEmptyFolder?: boolean;
    slide?: boolean;
    startDndDelay?: number;
    tabIndex?: number;
    useContextMenu?: boolean;
}

interface IJQTreePlugin {
    (options?: IJQTreeOptions): JQuery;
    (
        behavior: "addNodeAfter",
        newNodeInfo: NodeData,
        existingNode: INode,
    ): INode | null;
    (
        behavior: "addNodeBefore",
        newNodeInfo: NodeData,
        existingNode: INode,
    ): INode | null;
    (
        behavior: "addParentNode",
        newNodeInfo: NodeData,
        existingNode: INode,
    ): INode | null;
    (behavior: "addToSelection", node: INode, mustSetFocus?: boolean): JQuery;
    (behavior: "appendNode", newNodeInfo: NodeData, parentNode?: INode): INode;
    (behavior: "closeNode", node: INode, slide?: boolean): JQuery;
    (behavior: "destroy"): void;
    (
        behavior: "getNodeByCallback",
        callback: (node: INode) => boolean,
    ): INode | null;
    (behavior: "getNodeByHtmlElement", element: Element | JQuery): INode | null;
    (behavior: "getNodeById", id: NodeId): INode | null;
    (behavior: "getNodeByName", name: string): INode | null;
    (behavior: "getNodeByNameMustExist", name: string): INode;
    (behavior: "getNodesByProperty", key: string, value: unknown): INode[];
    (behavior: "getSelectedNode"): false | INode;
    (behavior: "getSelectedNodes"): INode[];
    (behavior: "getState"): null | SavedState;
    (behavior: "getStateFromStorage"): INode | null;
    (behavior: "getTree"): INode;
    (behavior: "getVersion"): string;
    (behavior: "isNodeSelected", node: INode): boolean;
    (behavior: "loadData", data: NodeData[], parentNode?: INode): JQuery;
    (
        behavior: "loadDataFromUrl",
        param1?: INode | null | string,
        param2?: (() => void) | INode | null,
        param3?: () => void,
    ): JQuery;
    (behavior: "moveDown"): JQuery;
    (
        behavior: "moveNode",
        node: INode,
        targetNode: INode,
        position: string,
    ): JQuery;
    (behavior: "moveUp"): JQuery;
    (behavior: "openNode", node: INode): JQuery;
    (behavior: "openNode", node: INode, slide: boolean): JQuery;
    (
        behavior: "openNode",
        node: INode,
        onFinished: (node: INode) => void,
    ): JQuery;
    (
        behavior: "openNode",
        node: INode,
        slide: boolean,
        onFinished?: (node: INode) => void,
    ): JQuery;
    (behavior: "prependNode", newNodeInfo: NodeData, parentNode?: INode): INode;
    (behavior: "refresh"): JQuery;
    (behavior: "reload", onFinished?: () => void): JQuery;
    (behavior: "removeFromSelection", node: INode): JQuery;
    (behavior: "removeNode", node: INode): JQuery;
    (behavior: "scrollToNode", node: INode): JQuery;
    (
        behavior: "selectNode",
        node: INode | null,
        optionsParam?: SelectNodeOptions,
    ): JQuery;
    (behavior: "setOption", option: string, value: unknown): JQuery;
    (behavior: "setState", options: Record<string, unknown>): JQuery;
    (behavior: "toggle", node: INode, slideParam?: boolean): JQuery;
    (behavior: "toJson"): string;
    (behavior: "updateNode", node: INode, data: NodeData): JQuery;
}

interface JQuery {
    tree: IJQTreePlugin;
}
