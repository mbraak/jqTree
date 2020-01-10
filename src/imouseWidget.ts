export interface IPositionInfo {
    pageX: number | undefined;
    pageY: number | undefined;
    target: Element | EventTarget;
    originalEvent: JQuery.Event | Touch;
}
