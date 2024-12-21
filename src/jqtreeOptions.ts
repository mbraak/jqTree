import { Node } from "./node";

export type DataFilter = (data: unknown) => NodeData[];

export type DataUrl = DataUrlFunction | JQuery.AjaxSettings | string;

export type DragMethod = (node: Node, event: Event | Touch) => void;

export type IconElement = HTMLElement | JQuery | string;

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
    openFolderDelay: false | number;
    rtl?: boolean;
    saveState: boolean | string;
    selectable: boolean;
    showEmptyFolder: boolean;
    slide: boolean;
    startDndDelay?: number;
    tabIndex?: number;
    useContextMenu: boolean;
}

export type OnCanMove = ((node: Node) => boolean) | undefined;

export type OnCanMoveTo = (
    node: Node,
    targetNode: Node,
    positionName: string,
) => boolean;

export type OnCreateLi = (node: Node, el: JQuery, isSelected: boolean) => void;

export type OnGetStateFromStorage = (() => string) | undefined;

export type OnIsMoveHandle = (el: JQuery) => boolean;

export type OnLoadFailed = (response: JQuery.jqXHR) => void;

export type OnLoading = (
    isLoading: boolean,
    node: Node | null,
    $el: JQuery,
) => void;

export type OnSetStateFromStorage = ((data: string) => void) | undefined;

type DataUrlFunction = (node: Node | null) => JQuery.AjaxSettings;
