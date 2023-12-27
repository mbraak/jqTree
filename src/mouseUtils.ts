export interface PositionInfo {
    originalEvent: Event;
    pageX: number;
    pageY: number;
    target: HTMLElement;
}

export const getPositionInfoFromMouseEvent = (e: MouseEvent): PositionInfo => ({
    originalEvent: e,
    pageX: e.pageX,
    pageY: e.pageY,
    target: e.target as HTMLElement,
});

export const getPositionInfoFromTouch = (
    touch: Touch,
    e: TouchEvent,
): PositionInfo => ({
    originalEvent: e,
    pageX: touch.pageX,
    pageY: touch.pageY,
    target: touch.target as HTMLElement,
});
