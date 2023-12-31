import { Node } from "./node";

export type OnCanMove = ((node: Node) => boolean) | undefined;

type DataUrlFunction = (node: Node | null) => JQuery.AjaxSettings;

export type DataUrl = string | JQuery.AjaxSettings | DataUrlFunction;

export type DragMethod = (node: Node, event: Event | Touch) => void;

export type OnCanMoveTo = (
    node: Node,
    targetNode: Node,
    positionName: string,
) => boolean;

export type OnGetStateFromStorage = (() => string) | undefined;

export type OnIsMoveHandle = (el: JQuery) => boolean;

export type OnLoadFailed = (response: JQuery.jqXHR) => void;

export type OnSetStateFromStorage = ((data: string) => void) | undefined;

export type DataFilter = (data: unknown) => NodeData[];

export type IconElement = string | HTMLElement | JQuery<HTMLElement>;

export type OnCreateLi = (node: Node, el: JQuery, isSelected: boolean) => void;

export type OnLoading = (
    isLoading: boolean,
    node: Node | null,
    element: HTMLElement,
) => void;

export interface JQTreeOptions {
    animationSpeed: JQuery.Duration;
    autoEscape: boolean;
    autoOpen: boolean | number;
    buttonLeft: boolean;
    closedIcon?: IconElement;
    data?: NodeData[];
    dataFilter?: DataFilter;
    dataUrl?: DataUrl;
    dragAndDrop: boolean;
    keyboardSupport: boolean;
    nodeClass: typeof Node;
    onCanMove?: OnCanMove;
    onCanMoveTo?: OnCanMoveTo;
    onCanSelectNode?: (node: Node) => boolean;
    onCreateLi?: OnCreateLi;
    onDragMove?: DragMethod;
    onDragStop?: DragMethod;
    onGetStateFromStorage?: OnGetStateFromStorage;
    onIsMoveHandle?: OnIsMoveHandle;
    onLoadFailed?: OnLoadFailed;
    onLoading?: OnLoading;
    onSetStateFromStorage?: OnSetStateFromStorage;
    openedIcon?: IconElement;
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
