// Attributes of tree-element events that have a different name in the jqTree api.
// Attributes that are not listed here are passed on unchanged; e.g. 'node' and
// 'isLoading'.
const attributeNames: Record<string, string> = {
  deselectedNode: "deselected_node",
  moveInfo: "move_info",
  originalEvent: "click_event",
  parentNode: "parent_node",
  treeData: "tree_data",
};

// Attributes of the move info of the tree.move event.
const moveInfoAttributeNames: Record<string, string> = {
  doMove: "do_move",
  movedNode: "moved_node",
  originalEvent: "original_event",
  previousParent: "previous_parent",
  targetNode: "target_node",
};

const convertAttributes = (
  values: Record<string, unknown>,
  names: Record<string, string>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [names[key] ?? key, value]),
  );

const convertValues = (
  values: Record<string, unknown>,
): Record<string, unknown> => {
  const result = convertAttributes(values, attributeNames);

  if (result.move_info) {
    result.move_info = convertAttributes(
      result.move_info as Record<string, unknown>,
      moveInfoAttributeNames,
    );
  }

  return result;
};

const triggerJQueryEvent = (
  element: HTMLElement,
  eventName: string,
  inputValues?: Record<string, unknown>,
): boolean => {
  const values = inputValues ? convertValues(inputValues) : {};

  if (values.element) {
    values.$el = jQuery(values.element as HTMLElement);
    delete values.element;
  }

  let event: JQuery.Event;

  switch (eventName) {
    case "tree.deselect":
      event = jQuery.Event("tree.select", {
        node: null,
        previous_node: values.node,
      });
      break;

    case "tree.loaded_data":
      event = jQuery.Event("tree.loading_data", {
        ...values,
        isLoading: false,
        node: values.node ?? null
      });
      break;

    case "tree.loading_data":
      event = jQuery.Event("tree.loading_data", {
        ...values,
        isLoading: true,
        node: values.node ?? null
      });
      break;

    case "tree.set_data":
      values.parent_node = values.node;
      delete values.node;
      event = jQuery.Event("tree.load_data", values);
      break;

    default:
      event = jQuery.Event(eventName, values);
      break;
  }

  jQuery(element).trigger(event);
  return !event.isDefaultPrevented();
};

export default triggerJQueryEvent;
