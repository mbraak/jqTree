type NodeId = number | string;

type DefaultRecord = Record<string, unknown>;
type NodeData = string | DefaultRecord;

type IterateCallback = (node: INode, level: number) => boolean;

declare class INode {
    public id?: NodeId;
    public name: string;
    public children: INode[];
    public element: HTMLElement;
    public is_open: boolean;
    public parent: INode | null;

    [key: string]: unknown;

    public iterate(callback: IterateCallback): void;
}

type DataUrlFunction = (node?: Node) => JQuery.AjaxSettings;
type DataUrl = string | JQuery.AjaxSettings | DataUrlFunction;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ClickNodeEvent {
    node: INode;
    deselected_node?: INode | null;
    click_event: JQuery.ClickEvent;
    previous_node?: INode;
}

interface SavedState {
    open_nodes: NodeId[];
    selected_node: NodeId[];
}

interface IJQTreeOptions {
    animationSpeed?: string | number;
    autoEscape?: boolean;
    autoOpen?: boolean | number | string;
    buttonLeft?: boolean;
    closedIcon?: string | Element;
    data?: NodeData[];
    dataFilter?: (data: unknown) => NodeData[];
    dataUrl?: DataUrl;
    dragAndDrop?: boolean;
    nodeClass?: any;
    keyboardSupport?: boolean;
    onCanMove?: (node: INode) => boolean;
    onCanSelectNode?: (node: INode) => boolean;
    onCreateLi?: (node: INode, el: JQuery, isSelected: boolean) => void;
    onDragMove?: (node: INode, event: JQuery.Event | Touch) => void;
    onDragStop?: (node: INode, event: JQuery.Event | Touch) => void;
    onIsMoveHandle?: (el: JQuery) => boolean;
    onLoadFailed?: (response: JQuery.jqXHR) => void;
    onLoading?: (isLoading: boolean, node: INode, $el: JQuery) => void;
    onGetStateFromStorage?: () => string;
    onSetStateFromStorage?: (data: string) => void;
    openedIcon?: string | Element;
    openFolderDelay?: number;
    rtl?: boolean;
    selectable?: boolean;
    saveState?: boolean | string;
    slide?: boolean;
    showEmptyFolder?: boolean;
    tabIndex?: number;
    useContextMenu?: boolean;
}

interface IJQTreePlugin {
    (): JQuery;
    (options: IJQTreeOptions): JQuery;
    (
        behavior: "addNodeAfter",
        newNodeInfo: NodeData,
        existingNode: INode
    ): INode | null;
    (
        behavior: "addNodeBefore",
        newNodeInfo: NodeData,
        existingNode: INode
    ): INode | null;
    (
        behavior: "addParentNode",
        newNodeInfo: NodeData,
        existingNode: INode
    ): INode | null;
    (behavior: "addToSelection", node: INode, mustSetFocus?: boolean): JQuery;
    (behavior: "appendNode", newNodeInfo: NodeData, parentNode?: INode): INode;
    (behavior: "closeNode", node: INode, slide?: boolean): JQuery;
    (behavior: "destroy"): void;
    (
        behavior: "getNodeByCallback",
        callback: (node: INode) => boolean
    ): INode | null;
    (behavior: "getNodeByHtmlElement", element: Element | JQuery): INode | null;
    (behavior: "getNodeById", id: NodeId): INode | null;
    (behavior: "getNodeByName", name: string): INode | null;
    (behavior: "getNodeByNameMustExist", name: string): INode;
    (behavior: "getNodesByProperty", key: string, value: unknown): INode[];
    (behavior: "getSelectedNode"): INode | false;
    (behavior: "getSelectedNodes"): INode[];
    (behavior: "getState"): SavedState | null;
    (behavior: "getStateFromStorage"): INode | null;
    (behavior: "getTree"): INode;
    (behavior: "getVersion"): string;
    (behavior: "isNodeSelected", node: INode): boolean;
    (behavior: "loadData", data: NodeData[], parentNode?: INode): JQuery;
    (
        behavior: "loadDataFromUrl",
        param1?: string | null | INode,
        param2?: INode | null | (() => void),
        param3?: () => void
    ): JQuery;
    (behavior: "moveDown"): JQuery;
    (
        behavior: "moveNode",
        node: INode,
        targetNode: INode,
        position: string
    ): JQuery;
    (behavior: "moveUp"): JQuery;
    (behavior: "openNode", node: INode): JQuery;
    (behavior: "openNode", node: INode, slide: boolean): JQuery;
    (
        behavior: "openNode",
        node: INode,
        onFinished: (node: INode) => void
    ): JQuery;
    (
        behavior: "openNode",
        node: INode,
        slide: boolean,
        onFinished?: (node: INode) => void
    ): JQuery;
    (behavior: "prependNode", newNodeInfo: NodeData, parentNode?: INode): INode;
    (behavior: "reload", onFinished?: () => void): JQuery;
    (behavior: "removeFromSelection", node: INode): JQuery;
    (behavior: "removeNode", node: INode): JQuery;
    (behavior: "scrollToNode", node: INode): JQuery;
    (behavior: "selectNode", node: INode | null): JQuery;
    (behavior: "setMouseDelay", delay: number): void;
    (behavior: "setOption", option: string, value: unknown): JQuery;
    (behavior: "setState", options: DefaultRecord): JQuery;
    (behavior: "toggle", node: INode, slideParam?: boolean): JQuery;
    (behavior: "toJson"): string;
    (behavior: "updateNode", node: INode, data: NodeData): JQuery;
}

interface JQuery {
    tree: IJQTreePlugin;
}
