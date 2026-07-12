import type { JQTreeOptions } from "./jqtreeOptions";

import setDefaultOptions from "./htmlTree/setDefaultOptions";
import { Node } from "./node";

export default class HtmlTree {
  public htmlElement: HTMLElement;
  public isInitialized: boolean;
  public nodeMap: WeakMap<HTMLElement, Node>;
  public options: JQTreeOptions;
  public tree: Node;

  constructor(htmlElement: HTMLElement, options: JQTreeOptions) {
    this.htmlElement = htmlElement;
    this.options = options;

    setDefaultOptions(htmlElement, options);

    this.isInitialized = false;
    this.tree = new Node({}, true);
    this.nodeMap = new WeakMap();
  }

  // Is this HTML element part of the tree?
  public containsElement(element: HTMLElement): boolean {
    const node = this.getNode(element);

    return node?.tree === this.tree;
  }

  // Return the tree node for an HTMl element.
  public getNode(element: HTMLElement): Node | null {
    const liElement = element.closest<HTMLElement>("li.jqtree_common");

    if (liElement) {
      return this.nodeMap.get(liElement) ?? null;
    } else {
      return null;
    }
  }

  // Does an HTML element of the tree have the focus?
  public isFocusOnTree(): boolean {
    const activeElement = document.activeElement;

    return activeElement?.tagName === "SPAN" && this.containsElement(activeElement as HTMLElement);
  }
}