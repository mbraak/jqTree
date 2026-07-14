import type { JQTreeOptions } from "../jqtreeOptions";

const setDefaultOptions = (htmlElement: HTMLElement, options: JQTreeOptions) => {
  options.rtl ??= getRtlOptionFromHTMLElement(htmlElement);
  options.closedIcon ??= getDefaultClosedIcon(options);
}

const getDefaultClosedIcon = (options: JQTreeOptions): string => {
  if (options.rtl) {
    // triangle to the left
    return "&#x25c0;";
  } else {
    // triangle to the right
    return "&#x25ba;";
  }
}

const getRtlOptionFromHTMLElement = (htmlElement: HTMLElement): boolean => {
  const dataRtl = htmlElement.dataset.rtl;
  return dataRtl !== undefined;
}

export default setDefaultOptions;