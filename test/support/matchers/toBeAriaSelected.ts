import type { Matcher, MatcherState } from 'vitest'

export const toBeAriaSelected: Matcher = function (this: MatcherState, el: HTMLElement) {
  const { isNot } = this

  /* istanbul ignore next @preserve */
  return {
    message: () => `The element is${isNot ? "" : "not "} ARIA selected`,
    pass: el.ariaSelected === "true",
  };
}
