import type { HtmlTreeOptions, IconElement } from "./htmlTree/options";

export type JQTreeIconElement = IconElement | JQuery;

export type JQTreeOptions = Modify<HtmlTreeOptions, {
    closedIcon?: JQTreeIconElement;
    openedIcon?: JQTreeIconElement;
}>

type Modify<T, R> = Omit<T, keyof R> & R;