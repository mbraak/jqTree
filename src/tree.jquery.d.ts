interface INode {
    id: number | string;
    name: string;
    children: INode[];
    parent: INode | null;
    is_open: boolean;
    element: Element;
    load_on_demand: boolean | null;
    isEmptyFolder: boolean;

    [key: string]: any;

    isFolder(): boolean;
    iterate(callback: (node: INode, level: number) => boolean): void;
}

interface IJQTreeOptions {
    animationSpeed?: string | number;
    autoEscape?: boolean;
    autoOpen?: boolean | number;
    buttonLeft?: boolean;
    closedIcon?: string | Element;
    data?: any[];
    dataFilter?: (data: any) => any;
    dataUrl?: string | object;
    dragAndDrop?: boolean;
    nodeClass?: any;
    keyboardSupport?: boolean;
    onCanMove?: (node: INode) => boolean;
    onCanSelectNode?: (node: INode) => boolean;
    onCreateLi?: (node: INode, el: JQuery, isSelected: boolean) => void;
    onDragMove?: (node: INode, event: JQueryEventObject | Touch) => void;
    onDragStop?: (node: INode, event: JQueryEventObject | Touch) => void;
    onIsMoveHandle?: (el: JQuery) => boolean;
    onLoadFailed?: (response: any) => void;
    onLoading?: (isLoading: boolean, node: INode, $el: JQuery) => void;
    onGetStateFromStorage?: () => any;
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
    (behavior: "addNodeAfter", newNodeInfo: any, existingNode: INode): INode | null;
    (behavior: "addNodeBefore", newNodeInfo: any, existingNode: INode): Node | null;
    (behavior: "addParentNode", newNodeInfo: any, existingNode: INode): INode | null;
    (behavior: "addToSelection", node: INode, mustSetFocus?: boolean): JQuery;
    (behavior: "appendNode", newNodeInfo: any, parentNode?: INode): INode;
    (behavior: "closeNode", node: INode, slide?: boolean): JQuery;
    (behavior: "destroy"): void;
    (behavior: "getNodeByHtmlElement", element: Element | JQuery): INode | null;
    (behavior: "getNodeById", id: any): INode | null;
    (behavior: "getNodeByName", name: string): INode | null;
    (behavior: "getNodesByProperty", key: string, value: any): INode[];
    (behavior: "getSelectedNode"): INode | false;
    (behavior: "getSelectedNodes"): INode[];
    (behavior: "getTree"): INode;
    (behavior: "isNodeSelected", node: INode): boolean;
    (behavior: "loadData", data: any, parentNode?: INode): JQuery;
    (behavior: "moveNode", node: INode, targetNode: INode, position: string): JQuery;
    (behavior: "openNode", node: INode): JQuery;
    (behavior: "openNode", node: INode, slide: boolean): JQuery;
    (behavior: "openNode", node: INode, onFinished: (node: INode) => void): JQuery;
    (behavior: "openNode", node: INode, slide: boolean, onFinished?: (node: INode) => void): JQuery;
    (behavior: "prependNode", newNodeInfo: any, parentNode?: INode): INode;
    (behavior: "removeFromSelection", node: INode): JQuery;
    (behavior: "removeNode", node: INode): JQuery;
    (behavior: "scrollToNode", node: INode): JQuery;
    (behavior: "selectNode", node: INode | null): JQuery;
    (behavior: "setMouseDelay", delay: number): void;
    (behavior: "toggle", node: INode, slideParam?: boolean): JQuery;
    (behavior: "toJson"): string;
    (behavior: "updateNode", node: INode, data: any): JQuery;
}

interface JQuery {
    tree: IJQTreePlugin;
}
