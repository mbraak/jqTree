const triggerJQueryEvent = (
  element: HTMLElement,
  eventName: string,
  inputValues?: Record<string, unknown>,
): boolean => {
  let values: Record<string, unknown> | undefined = inputValues;

  if (inputValues?.element) {
    values = { ...values, $el: jQuery(inputValues.element) };
    delete values.element;
  }

  // eslint-disable-next-line no-prototype-builtins
  if (values?.hasOwnProperty("deselectedNode")) {
    values.deselected_node = values.deselectedNode;
    delete values.deselectedNode;
  }

  if (values?.hasOwnProperty("originalEvent")) { // eslint-disable-line no-prototype-builtins
    values.click_event = values.originalEvent;
    delete values.originalEvent;
  }

  if (values?.hasOwnProperty("parentNode")) { // eslint-disable-line no-prototype-builtins
    values.parent_node = values.parentNode;
    delete values.parentNode;
  }

  if (values?.hasOwnProperty("treeData")) { // eslint-disable-line no-prototype-builtins
    values.tree_data = values.treeData;
    delete values.treeData;
  }


  let event: JQuery.Event;

  if (eventName === "tree.deselect") {
    event = jQuery.Event("tree.select", { node: null, previous_node: values?.node });
  } else {
    event = jQuery.Event(eventName, values);
  }

  jQuery(element).trigger(event);
  return !event.isDefaultPrevented();
}

export default triggerJQueryEvent;