export const singleChild = ($el: JQuery, selector: string): JQuery => {
    const $result = $el.children(selector);

    /* istanbul ignore if */
    if ($result.length === 0) {
        throw new Error(`No child found for selector '${selector}'`);
    }

    /* istanbul ignore if */
    if ($result.length > 1) {
        throw new Error(`Multiple elements found for selector '${selector}'`);
    }

    return $result;
};

export const titleSpan = (liNode: HTMLElement | JQuery): JQuery =>
    singleChild(nodeElement(liNode), "span.jqtree-title");

export const togglerLink = (liNode: HTMLElement | JQuery): JQuery =>
    singleChild(nodeElement(liNode), "a.jqtree-toggler");

const nodeElement = (liNode: HTMLElement | JQuery): JQuery =>
    singleChild(jQuery(liNode), "div.jqtree-element ");
