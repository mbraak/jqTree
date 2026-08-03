interface IJQTreeClickNodeEvent {
    click_event: JQuery.ClickEvent;
    deselected_node?: JQTreeNode | null;
    node: JQTreeNode;
    previous_node?: JQTreeNode;
}

interface IJQTreeOptions {
    animationSpeed?: number | string;
    autoEscape?: boolean;
    autoOpen?: boolean | number | string;
    buttonLeft?: boolean;
    closedIcon?: HTMLElement | JQuery | string;
    data?: NodeData[];
    dataFilter?: (data: JQTreeNodeData[]) => JQTreeNodeData[];
    dataUrl?: ((node?: Node) => JQuery.AjaxSettings) | JQuery.AjaxSettings | string;
    dragAndDrop?: boolean;
    keyboardSupport?: boolean;
    nodeClass?: any;
    onCanMove?: (node: JQTreeNode) => boolean;
    onCanSelectNode?: (node: INode) => boolean;
    onCreateLi?: (node: JQTreeNode, el: JQuery, isSelected: boolean) => void;
    onDragMove?: (node: JQTreeNode, event: Event | Touch) => void;
    onDragStop?: (node: JQTreeNode, event: Event | Touch) => void;
    onGetStateFromStorage?: () => string;
    onIsMoveHandle?: (el: JQuery) => boolean;
    onLoadFailed?: (response: JQuery.jqXHR) => void;
    onLoading?: (isLoading: boolean, node: JQTreeNode, $el: JQuery) => void;
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
    ): JQTreeNode | null;
    (
        behavior: "addNodeBefore",
        newNodeInfo: NodeData,
        existingNode: INode,
    ): JQTreeNode | null;
    (
        behavior: "addParentNode",
        newNodeInfo: NodeData,
        existingNode: INode,
    ): JQTreeNode | null;
    (behavior: "addToSelection", node: INode, mustSetFocus?: boolean): JQuery;
    (behavior: "appendNode", newNodeInfo: NodeData, parentNode?: INode): INode;
    (behavior: "closeNode", node: INode, slide?: boolean): JQuery;
    (behavior: "destroy"): void;
    (
        behavior: "getNodeByCallback",
        callback: (node: INode) => boolean,
    ): JQTreeNode | null;
    (behavior: "getNodeByHtmlElement", element: Element | JQuery): JQTreeNode | null;
    (behavior: "getNodeById", id: NodeId): JQTreeNode | null;
    (behavior: "getNodeByName", name: string): JQTreeNode | null;
    (behavior: "getNodeByNameMustExist", name: string): JQTreeNode;
    (behavior: "getNodesByProperty", key: string, value: unknown): JQTreeNode[];
    (behavior: "getSelectedNode"): false | JQTreeNode;
    (behavior: "getSelectedNodes"): JQTreeNode[];
    (behavior: "getState"): JQTreeSavedState | null;
    (behavior: "getStateFromStorage"): JQTreeNode | null;
    (behavior: "getTree"): JQTreeNode;
    (behavior: "getVersion"): string;
    (behavior: "isDragging"): boolean;
    (behavior: "isNodeSelected", node: JQTreeNode): boolean;
    (behavior: "loadData", data: NodeData[], parentNode?: JQTreeNode): JQuery;
    (
        behavior: "loadDataFromUrl",
        param1?: JQTreeNode | null | string,
        param2?: (() => void) | JQTreeNode | null,
        param3?: () => void,
    ): JQuery;
    (behavior: "moveDown"): JQuery;
    (
        behavior: "moveNode",
        node: INode,
        targetNode: INode,
        position: "after" | "before" | "inside",
    ): JQuery;
    (behavior: "moveUp"): JQuery;
    (behavior: "openNode", node: JQTreeNode): JQuery;
    (behavior: "openNode", node: JQTreeNode, slide: boolean): JQuery;
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
    (behavior: "removeFromSelection", node: JQTreeNode): JQuery;
    (behavior: "removeNode", node: JQTreeNode): JQuery;
    (behavior: "scrollToNode", node: JQTreeNode): JQuery;
    (
        behavior: "selectNode",
        node: JQTreeNode | null,
        optionsParam?: SelectNodeOptions,
    ): JQuery;
    (behavior: "setOption", option: string, value: unknown): JQuery;
    (behavior: "setState", options: Record<string, unknown>): JQuery;
    (behavior: "toggle", node: JQTreeNode, slideParam?: boolean): JQuery;
    (behavior: "toJson"): string;
    (behavior: "updateNode", node: JQTreeNode, data: NodeData): JQuery;
}

interface JQTreeNode {
    [key: string]: unknown;
    children: INode[];
    element?: HTMLElement;
    id?: NodeId;
    is_open: boolean;
    iterate(callback: (node: JQTreeNode, level: number) => boolean): void;

    name: string;

    parent: JQTreeNode | null;
}

type JQTreeNodeData = JQTreeNodeRecord | string;

type JQTreeNodeId = number | string;

interface JQTreeNodeRecord {
    [key: string]: unknown;
    children?: JQTreeNodeData[];
    id?: JQTreeNodeId;
}

interface JQTreeSavedState {
    open_nodes: JQTreeNodeId[];
    selected_node: JQTreeNodeId[];
}

interface JQTreeSelectNodeOptions {
    mustSetFocus?: boolean;
    mustToggle?: boolean;
}

interface JQuery {
    tree: IJQTreePlugin;
}