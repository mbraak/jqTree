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
): JQuery<HTMLElement> => {
    const $liNode = jQuery(liNode);
    const $element = singleChild($liNode, "div.jqtree-element ");

    return singleChild($element, "span.jqtree-title");
};
