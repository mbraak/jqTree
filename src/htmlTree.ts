import type { JQTreeOptions } from "./jqtreeOptions";

import setDefaultOptions from "./htmlTree/setDefaultOptions";

export default class HtmlTree {
  public htmlElement: HTMLElement;
  public isInitialized: boolean;
  public options: JQTreeOptions;

  constructor(htmlElement: HTMLElement, options: JQTreeOptions) {
    this.htmlElement = htmlElement;
    this.options = options;

    setDefaultOptions(htmlElement, options);

    this.isInitialized = false;
  }
}