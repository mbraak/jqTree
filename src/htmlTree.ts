import type { JQTreeOptions } from "./jqtreeOptions";

export default class HtmlTree {
  public isInitialized: boolean;
  public options: JQTreeOptions;

  private htmlElement: HTMLElement;

  constructor(htmlElement: HTMLElement, options: JQTreeOptions) {
    this.htmlElement = htmlElement;
    this.options = options;

    this.isInitialized = false;

    this.options.rtl ??= this.getRtlOption();
    this.options.closedIcon ??= this.getDefaultClosedIcon();
  }

  private getDefaultClosedIcon(): string {
    if (this.options.rtl) {
      // triangle to the left
      return "&#x25c0;";
    } else {
      // triangle to the right
      return "&#x25ba;";
    }
  }

  private getRtlOption(): boolean {
    if (this.options.rtl != null) {
      return this.options.rtl;
    } else {
      const dataRtl = this.htmlElement.dataset.rtl;

      if (
        dataRtl !== undefined && dataRtl !== 'false'
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
}