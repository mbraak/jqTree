// Attributes of html-tree events that have a different name in the jqTree api.
// Attributes that are not listed here are passed on unchanged; e.g. 'node' and
// 'isLoading'.
const attributeNames: Record<string, string> = {
  deselectedNode: "deselected_node",
  originalEvent: "click_event",
  parentNode: "parent_node",
  treeData: "tree_data",
};

const convertValues = (
  values: Record<string, unknown>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      attributeNames[key] ?? key,
      value,
    ]),
  );

const triggerJQueryEvent = (
  element: HTMLElement,
  eventName: string,
  inputValues?: Record<string, unknown>,
): boolean => {
  const values = inputValues ? convertValues(inputValues) : undefined;

  if (values?.element) {
    values.$el = jQuery(values.element as HTMLElement);
    delete values.element;
  }

  const event =
    eventName === "tree.deselect"
      ? jQuery.Event("tree.select", {
        node: null,
        previous_node: values?.node,
      })
      : jQuery.Event(eventName, values);

  jQuery(element).trigger(event);
  return !event.isDefaultPrevented();
};

export default triggerJQueryEvent;
