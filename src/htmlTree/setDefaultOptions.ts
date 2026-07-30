import type { HtmlTreeOptions } from "./options";

import { Node } from "./node";

const defaults: HtmlTreeOptions = {
  animationSpeed: "fast",
  autoEscape: true,
  autoOpen: false, // true / false / int (open n levels starting at 0)
  buttonLeft: true,
  // The symbol to use for a closed node - ► BLACK RIGHT-POINTING POINTER
  // http://www.fileformat.info/info/unicode/char/25ba/index.htm
  closedIcon: undefined,
  data: undefined,
  dataFilter: undefined,
  dataUrl: undefined,
  dragAndDrop: false,
  keyboardSupport: true,
  nodeClass: Node,
  onCanMove: undefined, // Can this node be moved?
  onCanMoveTo: undefined, // Can this node be moved to this position? function(moved_node, target_node, position)
  onCanSelectNode: undefined,
  onCreateLi: undefined,
  onDragMove: undefined,
  onDragStop: undefined,
  onGetStateFromStorage: undefined,
  onIsMoveHandle: undefined,
  onLoadFailed: undefined,
  onLoading: undefined,
  onSetStateFromStorage: undefined,
  openedIcon: undefined,
  openFolderDelay: 500, // The delay for opening a folder during drag and drop; the value is in milliseconds
  // The symbol to use for an open node - ▼ BLACK DOWN-POINTING TRIANGLE
  // http://www.fileformat.info/info/unicode/char/25bc/index.htm
  rtl: undefined, // right-to-left support; true / false (default)
  saveState: false, // true / false / string (cookie name)
  selectable: true,
  showEmptyFolder: false,
  slide: true, // must display slide animation?
  startDndDelay: 300, // The delay for starting dnd (in milliseconds)
  tabIndex: 0,
  useContextMenu: true,
};

const setDefaultOptions = (htmlElement: HTMLElement, inputOptions: Partial<HtmlTreeOptions>): HtmlTreeOptions => {
  const options = { ...defaults, ...inputOptions };

  options.dataUrl ??= htmlElement.dataset.url;
  options.rtl ??= getRtlOptionFromHTMLElement(htmlElement);
  options.closedIcon ??= getDefaultClosedIcon(options);
  options.openedIcon ??= "&#x25bc;";

  return options;
}

const getDefaultClosedIcon = (options: HtmlTreeOptions): string => {
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

  if (dataRtl == "") {
    return true;
  } else if (dataRtl === "false") {
    return false;
  } else {
    return Boolean(dataRtl);
  }
}

export default setDefaultOptions;