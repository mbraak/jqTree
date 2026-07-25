import type { Matcher, MatcherState } from 'vitest'

export const toBeAriaExpanded: Matcher = function (this: MatcherState, el: HTMLElement) {
  const { isNot } = this

  /* istanbul ignore next @preserve */
  return {
    message: () => `The element is${isNot ? "" : "not "} ARIA expanded`,
    pass: el.ariaExpanded === "true",
  };
}
