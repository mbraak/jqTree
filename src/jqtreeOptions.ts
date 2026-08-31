import type { HtmlTreeOptions, Node } from "html-tree";

export type JQTreeIconElement = HTMLElement | JQuery | string;

export type JQTreeOnCreateLi = (node: Node, el: JQuery, isSelected: boolean) => void;

export type JQTreeOnIsMoveHandle = (el: JQuery) => boolean;

export type JQTreeOnLoadFailed = (el: Response) => void;

export type JQTreeOnLoading = (
    isLoading: boolean,
    node: Node | undefined,
    $el: JQuery,
) => void;

/* The class name options are set by jqTree itself, so they are not part of the
 * jqTree options.
 */
export type JQTreeOptions = Modify<Omit<HtmlTreeOptions, "classPrefix" | "commonClassName" | "treeClassName">, {
    closedIcon?: JQTreeIconElement;
    onCreateLi?: JQTreeOnCreateLi;
    onIsMoveHandle?: JQTreeOnIsMoveHandle;
    onLoadFailed?: JQTreeOnLoadFailed;
    onLoading?: JQTreeOnLoading;
    openedIcon?: JQTreeIconElement;
}>

type Modify<T, R> = Omit<T, keyof R> & R;
