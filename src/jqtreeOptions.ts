import { Node } from "./node";

export type CanMoveNodeTo = (
    node: Node,
    targetNode: Node,
    positionName: string,
) => boolean;
export type CreateLi = (node: Node, el: JQuery, isSelected: boolean) => void;
export type DataFilter = (data: unknown) => NodeData[];
type DataUrlFunction = (node: Node | null) => JQuery.AjaxSettings;
type DataUrl = string | JQuery.AjaxSettings | DataUrlFunction;
export type DragMethod = (node: Node, event: Event | Touch) => void;
export type HandleLoadingMethod = (
    isLoading: boolean,
    node: Node | null,
    $el: JQuery,
) => void;

export interface JQTreeOptions {
    animationSpeed: JQuery.Duration;
    autoEscape: boolean;
    autoOpen: boolean | number;
    buttonLeft: boolean;
    closedIcon?: string | HTMLElement | JQuery<HTMLElement>;
    data?: NodeData[];
    dataFilter?: DataFilter;
    dataUrl?: DataUrl;
    dragAndDrop: boolean;
    keyboardSupport: boolean;
    nodeClass: typeof Node;
    onCanMove?: (node: Node) => boolean;
    onCanMoveTo?: CanMoveNodeTo;
    onCanSelectNode?: (node: Node) => boolean;
    onCreateLi?: CreateLi;
    onDragMove?: DragMethod;
    onDragStop?: DragMethod;
    onGetStateFromStorage?: () => string;
    onIsMoveHandle?: (el: JQuery) => boolean;
    onLoadFailed?: (response: JQuery.jqXHR) => void;
    onLoading?: HandleLoadingMethod;
    onSetStateFromStorage?: (data: string) => void;
    openedIcon?: string | HTMLElement | JQuery<HTMLElement>;
    openFolderDelay: number | false;
    rtl?: boolean;
    selectable: boolean;
    saveState: boolean | string;
    showEmptyFolder: boolean;
    slide: boolean;
    startDndDelay: number;
    tabIndex?: number;
    useContextMenu: boolean;
}
