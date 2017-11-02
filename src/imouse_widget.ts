export interface IPositionInfo {
    page_x: number;
    page_y: number;
    target: Element | EventTarget;
    original_event: JQuery.Event | Touch;
}
