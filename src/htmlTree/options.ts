import type { AnimationSpeed } from "./animation";
import type { Node, NodeData } from "./node";

export type DataFilter = (data: unknown) => NodeData[];

export type DataUrl = DataUrlFunction | string;

export type DragMethod = (node: Node, event: Event | Touch) => void;

export interface HtmlTreeOptions {
  animationSpeed: AnimationSpeed;
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

export type IconElement = HTMLElement | string;

export type OnCanMove = ((node: Node) => boolean) | undefined;

export type OnCanMoveTo = (
  node: Node,
  targetNode: Node,
  positionName: string,
) => boolean;

export type OnCreateLi = (node: Node, el: HTMLElement, isSelected: boolean) => void;

export type OnGetStateFromStorage = (() => string) | undefined;

export type OnIsMoveHandle = (el: HTMLElement) => boolean;

export type OnLoadFailed = (response: Response) => void;

export type OnLoading = (
  isLoading: boolean,
  node: Node | undefined,
  element: HTMLElement,
) => void;

export type OnSetStateFromStorage = ((data: string) => void) | undefined;

type DataUrlFunction = (node?: Node) => string;
