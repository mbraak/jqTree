export interface IPositionInfo {
    page_x: number;
    page_y: number;
    target: Element | EventTarget;
    original_event: JQueryEventObject | Touch;
}
