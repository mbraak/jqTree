import { Node, NodeData } from "./node";

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
    animationSpeed?: string | number;
    autoEscape?: boolean;
    autoOpen?: boolean | number;
    buttonLeft?: boolean;
    closedIcon?: string | Element;
    data?: NodeData[];
    dataFilter?: DataFilter;
    dataUrl?: DataUrl;
    dragAndDrop?: boolean;
    nodeClass?: typeof Node;
    keyboardSupport?: boolean;
    onCanMove?: (node: Node) => boolean;
    onCanMoveTo?: CanMoveNodeTo;
    onCanSelectNode?: (node: Node) => boolean;
    onCreateLi?: CreateLi;
    onDragMove?: DragMethod;
    onDragStop?: DragMethod;
    onIsMoveHandle?: (el: JQuery) => boolean;
    onLoadFailed?: (response: JQuery.jqXHR) => void;
    onLoading?: HandleLoadingMethod;
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
