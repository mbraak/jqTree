export const singleChild = ($el, selector) => {
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
export const titleSpan = (liNode) => singleChild(nodeElement(liNode), "span.jqtree-title");
export const togglerLink = (liNode) => singleChild(nodeElement(liNode), "a.jqtree-toggler");
const nodeElement = (liNode) => singleChild(jQuery(liNode), "div.jqtree-element ");
