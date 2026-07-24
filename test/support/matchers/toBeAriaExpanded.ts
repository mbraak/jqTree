import type { Matcher, MatcherState } from 'vitest'

export const toBeAriaExpanded: Matcher = function (this: MatcherState, el: HTMLElement) {
  /* istanbul ignore next @preserve */
  const { isNot } = this

  return {
    message: () => `The element is${isNot ? "" : "not "} ARIA expanded`,
    pass: el.ariaExpanded === "true",
  };
}
