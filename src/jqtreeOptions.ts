import type { HtmlTreeOptions, IconElement } from "./htmlTree/options";
import type { Node } from "./node";

export type JQTreeIconElement = IconElement | JQuery;

export type JQTreeOnCreateLi = (node: Node, el: JQuery, isSelected: boolean) => void;

export type JQTreeOnIsMoveHandle = (el: JQuery) => boolean;

export type JQTreeOnLoading = (
    isLoading: boolean,
    node: Node | null,
    element: JQuery,
) => void;

export type JQTreeOptions = Modify<HtmlTreeOptions, {
    closedIcon?: JQTreeIconElement;
    onCreateLi?: JQTreeOnCreateLi;
    onIsMoveHandle?: JQTreeOnIsMoveHandle;
    onLoading?: JQTreeOnLoading;
    openedIcon?: JQTreeIconElement;
}>

type Modify<T, R> = Omit<T, keyof R> & R;

