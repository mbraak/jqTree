interface JQTreeNode {
    [key: string]: unknown;
    children: JQTreeNode[];
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

interface JQTreeOptions {
    animationSpeed?: number | string;
    autoEscape?: boolean;
    autoOpen?: boolean | number | string;
    buttonLeft?: boolean;
    closedIcon?: HTMLElement | JQuery | string;
    data?: NodeData[];
    dataFilter?: (data: JQTreeNodeData[]) => JQTreeNodeData[];
    dataUrl?: ((node?: Node) => string) | string;
    dragAndDrop?: boolean;
    keyboardSupport?: boolean;
    nodeClass?: any;
    onCanMove?: (node: JQTreeNode) => boolean;
    onCanSelectNode?: (node: JQTreeNode) => boolean;
    onCreateLi?: (node: JQTreeNode, el: JQuery, isSelected: boolean) => void;
    onDragMove?: (node: JQTreeNode, event: Event | Touch) => void;
    onDragStop?: (node: JQTreeNode, event: Event | Touch) => void;
    onGetStateFromStorage?: () => string;
    onIsMoveHandle?: (el: JQuery) => boolean;
    onLoadFailed?: (response: Response) => void;
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

interface JQTreePlugin {
    (options?: JQTreeOptions): JQuery;
    (
        behavior: "addNodeAfter",
        newNodeInfo: NodeData,
        existingNode: JQTreeNode,
    ): JQTreeNode | null;
    (
        behavior: "addNodeBefore",
        newNodeInfo: NodeData,
        existingNode: JQTreeNode,
    ): JQTreeNode | null;
    (
        behavior: "addParentNode",
        newNodeInfo: NodeData,
        existingNode: JQTreeNode,
    ): JQTreeNode | null;
    (behavior: "addToSelection", node: JQTreeNode, mustSetFocus?: boolean): JQuery;
    (behavior: "appendNode", newNodeInfo: NodeData, parentNode?: JQTreeNode): JQTreeNode;
    (behavior: "closeNode", node: JQTreeNode, slide?: boolean): JQuery;
    (behavior: "destroy"): void;
    (
        behavior: "getNodeByCallback",
        callback: (node: JQTreeNode) => boolean,
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
        param2?: (() => void) | JQTreeNode,
        param3?: () => void,
    ): JQuery;
    (behavior: "moveDown"): JQuery;
    (
        behavior: "moveNode",
        node: JQTreeNode,
        targetNode: JQTreeNode,
        position: "after" | "before" | "inside",
    ): JQuery;
    (behavior: "moveUp"): JQuery;
    (behavior: "openNode", node: JQTreeNode): JQuery;
    (behavior: "openNode", node: JQTreeNode, slide: boolean): JQuery;
    (
        behavior: "openNode",
        node: JQTreeNode,
        onFinished: (node: JQTreeNode) => void,
    ): JQuery;
    (
        behavior: "openNode",
        node: JQTreeNode,
        slide: boolean,
        onFinished?: (node: JQTreeNode) => void,
    ): JQuery;
    (behavior: "prependNode", newNodeInfo: NodeData, parentNode?: JQTreeNode): JQTreeNode;
    (behavior: "refresh"): JQuery;
    (behavior: "reload", onFinished?: () => void): JQuery;
    (behavior: "removeFromSelection", node: JQTreeNode): JQuery;
    (behavior: "removeNode", node: JQTreeNode): JQuery;
    (behavior: "scrollToNode", node: JQTreeNode): JQuery;
    (
        behavior: "selectNode",
        node: JQTreeNode | null,
        optionsParam?: JQTreeSelectNodeOptions,
    ): JQuery;
    (behavior: "setOption", option: string, value: unknown): JQuery;
    (behavior: "setState", options: Record<string, unknown>): JQuery;
    (behavior: "toggle", node: JQTreeNode, slideParam?: boolean): JQuery;
    (behavior: "toJson"): string;
    (behavior: "updateNode", node: JQTreeNode, data: NodeData): JQuery;
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
    tree: JQTreePlugin;
}