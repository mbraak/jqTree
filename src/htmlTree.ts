import type { JQTreeOptions } from "./jqtreeOptions";

import setDefaultOptions from "./htmlTree/setDefaultOptions";
import { Node } from "./node";

export default class HtmlTree {
  public htmlElement: HTMLElement;
  public isInitialized: boolean;
  public options: JQTreeOptions;
  public tree: Node;

  constructor(htmlElement: HTMLElement, options: JQTreeOptions) {
    this.htmlElement = htmlElement;
    this.options = options;

    setDefaultOptions(htmlElement, options);

    this.isInitialized = false;
    this.tree = new Node({}, true);
  }
}