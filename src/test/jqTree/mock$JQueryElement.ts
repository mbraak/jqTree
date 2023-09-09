interface MockJQueryElementParams {
    height?: number;
    innerHeight?: number;
    offsetTop?: number;
    scrollLeft?: number;
}

const defaultMockJQueryElementParams: MockJQueryElementParams = {
    height: 200,
    innerHeight: 180,
    offsetTop: 20,
    scrollLeft: 0,
};

const mock$JQueryElement = (inputParams: MockJQueryElementParams) => {
    const params = { ...defaultMockJQueryElementParams, ...inputParams };

    const element = {} as HTMLElement;

    const $element = {
        get: (_) => element,
        height: () => params.height,
        innerHeight: () => params.innerHeight,
        offset: () => ({ top: params.offsetTop }),
        scrollLeft: () => params.scrollLeft,
    } as JQuery<HTMLElement>;

    return $element;
};

export default mock$JQueryElement;
