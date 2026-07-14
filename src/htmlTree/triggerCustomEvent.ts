// Trigger a CustomEvent. Return if the event is processed (true) or cancelled (false).
const triggerCustomEvent = (element: HTMLElement, eventName: string, values?: Record<string, unknown>): boolean => {
  const event = new CustomEvent(eventName, {
    bubbles: true,
    cancelable: true,
    detail: values,
  });

  element.dispatchEvent(event);

  return !event.defaultPrevented;
}

export default triggerCustomEvent;