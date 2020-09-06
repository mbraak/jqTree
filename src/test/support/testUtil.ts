export const singleChild = (
    $el: JQuery<HTMLElement>,
    selector: string
): JQuery<HTMLElement> => {
    const $result = $el.children(selector);

    /* istanbul ignore if */
    if ($result.length === 0) {
        throw `No child found for selector '${selector}'`;
    }

    /* istanbul ignore if */
    if ($result.length > 1) {
        throw `Multiple elements found for selector '${selector}'`;
    }

    return $result;
};

export const titleSpan = (
    liNode: HTMLElement | JQuery<HTMLElement>
): JQuery<HTMLElement> => singleChild(nodeElement(liNode), "span.jqtree-title");

export const togglerLink = (
    liNode: HTMLElement | JQuery<HTMLElement>
): JQuery<HTMLElement> => singleChild(nodeElement(liNode), "a.jqtree-toggler");

const nodeElement = (
    liNode: HTMLElement | JQuery<HTMLElement>
): JQuery<HTMLElement> => singleChild(jQuery(liNode), "div.jqtree-element ");
