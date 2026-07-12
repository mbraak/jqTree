import type { JQTreeOptions } from "../jqtreeOptions";

const setDefaultOptions = (htmlElement: HTMLElement, options: JQTreeOptions) => {
  options.rtl ??= getRtlOption(htmlElement, options);
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

const getRtlOption = (htmlElement: HTMLElement, options: JQTreeOptions): boolean => {
  if (options.rtl != null) {
    return options.rtl;
  } else {
    const dataRtl = htmlElement.dataset.rtl;
    return dataRtl !== undefined;
  }
}

export default setDefaultOptions;