interface INode {
    id: number | string;
    name: string;
    children: INode[];
    parent: INode | null;
    is_open: boolean;
    element: Element;
    load_on_demand: boolean | null;

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
    onCreateLi?: (node: INode, el: JQuery) => void;
    onDragMove?: (node: INode, event: JQueryEventObject | Touch) => void;
    onDragStop?: (node: INode, event: JQueryEventObject | Touch) => void;
    onIsMoveHandle?: (el: JQuery) => boolean;
    onLoadFailed?: (response: any) => void;
    onLoading?: (is_loading: boolean, node: INode, $el: JQuery) => void;
    onGetStateFromStorage?: () => any;
    onSetStateFromStorage?: (data: string) => void;
    openedIcon?: string | Element;
    openFolderDelay?: number;
    rtl?: boolean;
    selectable?: boolean;
    saveState?: boolean | string;
    slide?: boolean;
    tabIndex?: number;
    useContextMenu?: boolean;
}

interface IJQTreePlugin {
    (options: IJQTreeOptions): JQuery;
    (
        behavior: "addNodeAfter",
        new_node_info: any,
        existing_node: INode
    ): INode | null;
    (
        behavior: "addNodeBefore",
        new_node_info: any,
        existing_node?: INode
    ): Node | null;
    (
        behavior: "addParentNode",
        new_node_info: any,
        existing_node: INode
    ): INode | null;
    (behavior: "addToSelection", node: INode): JQuery;
    (behavior: "appendNode", new_node_info: any, parent_node?: INode): INode;
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
    (behavior: "loadData", data: any, parent_node?: INode): JQuery;
    (
        behavior: "moveNode",
        node: INode,
        target_node: INode,
        position: string
    ): JQuery;
    (behavior: "openNode", node: INode): JQuery;
    (behavior: "openNode", node: INode, slide: boolean): JQuery;
    (
        behavior: "openNode",
        node: INode,
        on_finished: (node: INode) => void
    ): JQuery;
    (
        behavior: "openNode",
        node: INode,
        slide: boolean,
        on_finished?: (node: INode) => void
    ): JQuery;
    (behavior: "prependNode", new_node_info: any, parent_node?: INode): INode;
    (behavior: "removeNode", node: INode): JQuery;
    (behavior: "selectNode", node: INode | null): JQuery;
    (behavior: "setMouseDelay", delay: number): void;
    (behavior: "toggle", node: INode, slide_param?: boolean): JQuery;
    (behavior: "toJson"): string;
    (behavior: "updateNode", node: INode, data: any): JQuery;
}

// tslint:disable-next-line: interface-name
interface JQuery {
    tree: IJQTreePlugin;
}
