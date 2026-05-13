import type { MatcherState } from 'vitest';

import type { TreeStructure } from "../treeStructure";

import treeStructure from "../treeStructure";

export function toHaveTreeStructure(
  this: MatcherState,
  $el: JQuery,
  expectedStructure: TreeStructure,
) {
  const el = $el.get(0) as HTMLElement;
  const receivedStructure = treeStructure(el);

  /* istanbul ignore next @preserve */
  return {
    message: () =>
      this.utils.printDiffOrStringify(
        expectedStructure,
        receivedStructure,
      ) ?? '',
    pass: this.equals(receivedStructure, expectedStructure),
  };
}
