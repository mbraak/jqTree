import { Node } from "./node";

type CanMoveNodeTo = (
    node: Node,
    targetNode: Node,
    positionName: string
) => boolean;
type CreateLi = (node: Node, el: JQuery, isSelected: boolean) => void;
type DataFilter = (data: unknown) => NodeData[];
type DataUrlFunction = (node: Node | null) => JQuery.AjaxSettings;
type DataUrl = string | JQuery.AjaxSettings | DataUrlFunction;
type DragMethod = (node: Node, event: Event | Touch) => void;
type HandleLoadingMethod = (
    isLoading: boolean,
    node: Node | null,
    $el: JQuery
) => void;

export interface JQTreeOptions {
    animationSpeed: string | number;
    autoEscape: boolean;
    autoOpen: boolean | number;
    buttonLeft: boolean;
    closedIcon: string | Element | undefined;
    data: NodeData[] | undefined;
    dataFilter: DataFilter | undefined;
    dataUrl: DataUrl | undefined;
    dragAndDrop: boolean;
    keyboardSupport: boolean;
    nodeClass: typeof Node;
    onCanMove: ((node: Node) => boolean) | undefined;
    onCanMoveTo: CanMoveNodeTo | undefined;
    onCanSelectNode: ((node: Node) => boolean) | undefined;
    onCreateLi: CreateLi | undefined;
    onDragMove: DragMethod | undefined;
    onDragStop: DragMethod | undefined;
    onGetStateFromStorage: (() => string) | undefined;
    onIsMoveHandle: ((el: JQuery) => boolean) | undefined;
    onLoadFailed: ((response: JQuery.jqXHR) => void) | undefined;
    onLoading: HandleLoadingMethod | undefined;
    onSetStateFromStorage: ((data: string) => void) | undefined;
    openedIcon: string | Element;
    openFolderDelay: number;
    rtl: boolean | undefined;
    selectable: boolean;
    saveState: boolean | string;
    showEmptyFolder: boolean;
    slide: boolean;
    startDndDelay: number;
    tabIndex: number;
    useContextMenu: boolean;
}
