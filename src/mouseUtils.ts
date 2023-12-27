export interface PositionInfo {
    pageX: number | undefined;
    pageY: number | undefined;
    target: HTMLElement;
    originalEvent: Event;
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
