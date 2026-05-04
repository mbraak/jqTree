import { titleSpan } from "../testUtil";

export function toBeFocused(el: HTMLElement) {
  /* istanbul ignore next @preserve */
  return {
    message: () => "The is node is not focused",
    pass: document.activeElement === titleSpan(el),
  };
}
