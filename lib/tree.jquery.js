"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JqTreeWidget = void 0;
var _version = _interopRequireDefault(require("./version"));
var _dragAndDropHandler = require("./dragAndDropHandler");
var _elementsRenderer = _interopRequireDefault(require("./elementsRenderer"));
var _dataLoader = _interopRequireDefault(require("./dataLoader"));
var _keyHandler = _interopRequireDefault(require("./keyHandler"));
var _mouse = _interopRequireDefault(require("./mouse.widget"));
var _saveStateHandler = _interopRequireDefault(require("./saveStateHandler"));
var _scrollHandler = _interopRequireDefault(require("./scrollHandler"));
var _selectNodeHandler = _interopRequireDefault(require("./selectNodeHandler"));
var _simple = _interopRequireDefault(require("./simple.widget"));
var _node2 = require("./node");
var _util = require("./util");
var _nodeElement = require("./nodeElement");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const NODE_PARAM_IS_EMPTY = "Node parameter is empty";
const PARAM_IS_EMPTY = "Parameter is empty: ";
class JqTreeWidget extends _mouse.default {
  static defaults = {
    animationSpeed: "fast",
    autoEscape: true,
    autoOpen: false,
    // true / false / int (open n levels starting at 0)
    buttonLeft: true,
    // The symbol to use for a closed node - ► BLACK RIGHT-POINTING POINTER
    // http://www.fileformat.info/info/unicode/char/25ba/index.htm
    closedIcon: undefined,
    data: undefined,
    dataFilter: undefined,
    dataUrl: undefined,
    dragAndDrop: false,
    keyboardSupport: true,
    nodeClass: _node2.Node,
    onCanMove: undefined,
    // Can this node be moved?
    onCanMoveTo: undefined,
    // Can this node be moved to this position? function(moved_node, target_node, position)
    onCanSelectNode: undefined,
    onCreateLi: undefined,
    onDragMove: undefined,
    onDragStop: undefined,
    onGetStateFromStorage: undefined,
    onIsMoveHandle: undefined,
    onLoadFailed: undefined,
    onLoading: undefined,
    onSetStateFromStorage: undefined,
    openedIcon: "&#x25bc;",
    openFolderDelay: 500,
    // The delay for opening a folder during drag and drop; the value is in milliseconds
    // The symbol to use for an open node - ▼ BLACK DOWN-POINTING TRIANGLE
    // http://www.fileformat.info/info/unicode/char/25bc/index.htm
    rtl: undefined,
    // right-to-left support; true / false (default)
    saveState: false,
    // true / false / string (cookie name)
    selectable: true,
    showEmptyFolder: false,
    slide: true,
    // must display slide animation?
    startDndDelay: 300,
    // The delay for starting dnd (in milliseconds)
    tabIndex: 0,
    useContextMenu: true
  };
  toggle(node) {
    let slideParam = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    if (!node) {
      throw Error(NODE_PARAM_IS_EMPTY);
    }
    const slide = slideParam ?? this.options.slide;
    if (node.is_open) {
      this.closeNode(node, slide);
    } else {
      this.openNode(node, slide);
    }
    return this.element;
  }
  getTree() {
    return this.tree;
  }
  selectNode(node, optionsParam) {
    this.doSelectNode(node, optionsParam);
    return this.element;
  }
  getSelectedNode() {
    return this.selectNodeHandler.getSelectedNode();
  }
  toJson() {
    return JSON.stringify(this.tree.getData());
  }
  loadData(data, parentNode) {
    this.doLoadData(data, parentNode);
    return this.element;
  }

  /*
  signatures:
  - loadDataFromUrl(url, parent_node=null, on_finished=null)
      loadDataFromUrl('/my_data');
      loadDataFromUrl('/my_data', node1);
      loadDataFromUrl('/my_data', node1, function() { console.log('finished'); });
      loadDataFromUrl('/my_data', null, function() { console.log('finished'); });
   - loadDataFromUrl(parent_node=null, on_finished=null)
      loadDataFromUrl();
      loadDataFromUrl(node1);
      loadDataFromUrl(null, function() { console.log('finished'); });
      loadDataFromUrl(node1, function() { console.log('finished'); });
  */
  loadDataFromUrl(param1, param2, param3) {
    if (typeof param1 === "string") {
      // first parameter is url
      this.doLoadDataFromUrl(param1, param2, param3 ?? null);
    } else {
      // first parameter is not url
      this.doLoadDataFromUrl(null, param1, param2);
    }
    return this.element;
  }
  reload(onFinished) {
    this.doLoadDataFromUrl(null, null, onFinished);
    return this.element;
  }
  refresh() {
    this._refreshElements(null);
    return this.element;
  }
  getNodeById(nodeId) {
    return this.tree.getNodeById(nodeId);
  }
  getNodeByName(name) {
    return this.tree.getNodeByName(name);
  }
  getNodeByNameMustExist(name) {
    return this.tree.getNodeByNameMustExist(name);
  }
  getNodesByProperty(key, value) {
    return this.tree.getNodesByProperty(key, value);
  }
  getNodeByHtmlElement(element) {
    return this.getNode(jQuery(element));
  }
  getNodeByCallback(callback) {
    return this.tree.getNodeByCallback(callback);
  }
  openNode(node, param1, param2) {
    if (!node) {
      throw Error(NODE_PARAM_IS_EMPTY);
    }
    const parseParams = () => {
      let onFinished;
      let slide;
      if ((0, _util.isFunction)(param1)) {
        onFinished = param1;
        slide = null;
      } else {
        slide = param1;
        onFinished = param2;
      }
      if (slide == null) {
        slide = this.options.slide ?? false;
      }
      return [slide, onFinished];
    };
    const [slide, onFinished] = parseParams();
    this._openNode(node, slide, onFinished);
    return this.element;
  }
  closeNode(node, slideParam) {
    if (!node) {
      throw Error(NODE_PARAM_IS_EMPTY);
    }
    const slide = slideParam ?? this.options.slide;
    if (node.isFolder() || node.isEmptyFolder) {
      new _nodeElement.FolderElement(node, this).close(slide, this.options.animationSpeed);
      this.saveState();
    }
    return this.element;
  }
  isDragging() {
    return this.dndHandler.isDragging;
  }
  refreshHitAreas() {
    this.dndHandler.refresh();
    return this.element;
  }
  addNodeAfter(newNodeInfo, existingNode) {
    const newNode = existingNode.addAfter(newNodeInfo);
    if (newNode) {
      this._refreshElements(existingNode.parent);
    }
    return newNode;
  }
  addNodeBefore(newNodeInfo, existingNode) {
    if (!existingNode) {
      throw Error(PARAM_IS_EMPTY + "existingNode");
    }
    const newNode = existingNode.addBefore(newNodeInfo);
    if (newNode) {
      this._refreshElements(existingNode.parent);
    }
    return newNode;
  }
  addParentNode(newNodeInfo, existingNode) {
    if (!existingNode) {
      throw Error(PARAM_IS_EMPTY + "existingNode");
    }
    const newNode = existingNode.addParent(newNodeInfo);
    if (newNode) {
      this._refreshElements(newNode.parent);
    }
    return newNode;
  }
  removeNode(node) {
    if (!node) {
      throw Error(NODE_PARAM_IS_EMPTY);
    }
    if (!node.parent) {
      throw Error("Node has no parent");
    }
    this.selectNodeHandler.removeFromSelection(node, true); // including children

    const parent = node.parent;
    node.remove();
    this._refreshElements(parent);
    return this.element;
  }
  appendNode(newNodeInfo, parentNodeParam) {
    const parentNode = parentNodeParam || this.tree;
    const node = parentNode.append(newNodeInfo);
    this._refreshElements(parentNode);
    return node;
  }
  prependNode(newNodeInfo, parentNodeParam) {
    const parentNode = parentNodeParam ?? this.tree;
    const node = parentNode.prepend(newNodeInfo);
    this._refreshElements(parentNode);
    return node;
  }
  updateNode(node, data) {
    if (!node) {
      throw Error(NODE_PARAM_IS_EMPTY);
    }
    const idIsChanged = typeof data === "object" && data.id && data.id !== node.id;
    if (idIsChanged) {
      this.tree.removeNodeFromIndex(node);
    }
    node.setData(data);
    if (idIsChanged) {
      this.tree.addNodeToIndex(node);
    }
    if (typeof data === "object" && data["children"] && data["children"] instanceof Array) {
      node.removeChildren();
      if (data.children.length) {
        node.loadFromData(data.children);
      }
    }
    this._refreshElements(node);
    return this.element;
  }
  isSelectedNodeInSubtree(subtree) {
    const selectedNode = this.getSelectedNode();
    if (!selectedNode) {
      return false;
    } else {
      return subtree === selectedNode || subtree.isParentOf(selectedNode);
    }
  }
  moveNode(node, targetNode, position) {
    if (!node) {
      throw Error(NODE_PARAM_IS_EMPTY);
    }
    if (!targetNode) {
      throw Error(PARAM_IS_EMPTY + "targetNode");
    }
    const positionIndex = (0, _node2.getPosition)(position);
    if (positionIndex !== undefined) {
      this.tree.moveNode(node, targetNode, positionIndex);
      this._refreshElements(null);
    }
    return this.element;
  }
  getStateFromStorage() {
    return this.saveStateHandler.getStateFromStorage();
  }
  addToSelection(node, mustSetFocus) {
    if (!node) {
      throw Error(NODE_PARAM_IS_EMPTY);
    }
    this.selectNodeHandler.addToSelection(node);
    this._getNodeElementForNode(node).select(mustSetFocus === undefined ? true : mustSetFocus);
    this.saveState();
    return this.element;
  }
  getSelectedNodes() {
    return this.selectNodeHandler.getSelectedNodes();
  }
  isNodeSelected(node) {
    if (!node) {
      throw Error(NODE_PARAM_IS_EMPTY);
    }
    return this.selectNodeHandler.isNodeSelected(node);
  }
  removeFromSelection(node) {
    if (!node) {
      throw Error(NODE_PARAM_IS_EMPTY);
    }
    this.selectNodeHandler.removeFromSelection(node);
    this._getNodeElementForNode(node).deselect();
    this.saveState();
    return this.element;
  }
  scrollToNode(node) {
    if (!node) {
      throw Error(NODE_PARAM_IS_EMPTY);
    }
    const nodeOffset = jQuery(node.element).offset();
    const nodeTop = nodeOffset ? nodeOffset.top : 0;
    const treeOffset = this.$el.offset();
    const treeTop = treeOffset ? treeOffset.top : 0;
    const top = nodeTop - treeTop;
    this.scrollHandler.scrollToY(top);
    return this.element;
  }
  getState() {
    return this.saveStateHandler.getState();
  }
  setState(state) {
    this.saveStateHandler.setInitialState(state);
    this._refreshElements(null);
    return this.element;
  }
  setOption(option, value) {
    this.options[option] = value;
    return this.element;
  }
  moveDown() {
    const selectedNode = this.getSelectedNode();
    if (selectedNode) {
      this.keyHandler.moveDown(selectedNode);
    }
    return this.element;
  }
  moveUp() {
    const selectedNode = this.getSelectedNode();
    if (selectedNode) {
      this.keyHandler.moveUp(selectedNode);
    }
    return this.element;
  }
  getVersion() {
    return _version.default;
  }
  _triggerEvent(eventName, values) {
    const event = jQuery.Event(eventName, values);
    this.element.trigger(event);
    return event;
  }
  _openNode(node) {
    let slide = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let onFinished = arguments.length > 2 ? arguments[2] : undefined;
    const doOpenNode = (_node, _slide, _onFinished) => {
      const folderElement = new _nodeElement.FolderElement(_node, this);
      folderElement.open(_onFinished, _slide, this.options.animationSpeed);
    };
    if (node.isFolder() || node.isEmptyFolder) {
      if (node.load_on_demand) {
        this.loadFolderOnDemand(node, slide, onFinished);
      } else {
        let parent = node.parent;
        while (parent) {
          // nb: do not open root element
          if (parent.parent) {
            doOpenNode(parent, false, null);
          }
          parent = parent.parent;
        }
        doOpenNode(node, slide, onFinished);
        this.saveState();
      }
    }
  }

  /*
  Redraw the tree or part of the tree.
   from_node: redraw this subtree
  */
  _refreshElements(fromNode) {
    const mustSetFocus = this.selectNodeHandler.isFocusOnTree();
    const mustSelect = fromNode ? this.isSelectedNodeInSubtree(fromNode) : false;
    this.renderer.render(fromNode);
    if (mustSelect) {
      this.selectCurrentNode(mustSetFocus);
    }
    this._triggerEvent("tree.refresh");
  }
  _getNodeElementForNode(node) {
    if (node.isFolder()) {
      return new _nodeElement.FolderElement(node, this);
    } else {
      return new _nodeElement.NodeElement(node, this);
    }
  }
  _getNodeElement($element) {
    const node = this.getNode($element);
    if (node) {
      return this._getNodeElementForNode(node);
    } else {
      return null;
    }
  }
  _containsElement(element) {
    const node = this.getNode(jQuery(element));
    return node != null && node.tree === this.tree;
  }
  _getScrollLeft() {
    return this.scrollHandler.getScrollLeft();
  }
  init() {
    super.init();
    this.element = this.$el;
    this.isInitialized = false;
    this.options.rtl = this.getRtlOption();
    if (this.options.closedIcon == null) {
      this.options.closedIcon = this.getDefaultClosedIcon();
    }
    this.renderer = new _elementsRenderer.default(this);
    this.dataLoader = new _dataLoader.default(this);
    this.saveStateHandler = new _saveStateHandler.default(this);
    this.selectNodeHandler = new _selectNodeHandler.default(this);
    this.dndHandler = new _dragAndDropHandler.DragAndDropHandler(this);
    this.scrollHandler = new _scrollHandler.default(this);
    this.keyHandler = new _keyHandler.default(this);
    this.initData();
    this.element.on("click", this.handleClick);
    this.element.on("dblclick", this.handleDblclick);
    if (this.options.useContextMenu) {
      this.element.on("contextmenu", this.handleContextmenu);
    }
  }
  deinit() {
    this.element.empty();
    this.element.off();
    this.keyHandler.deinit();
    this.tree = new _node2.Node({}, true);
    super.deinit();
  }
  mouseCapture(positionInfo) {
    if (this.options.dragAndDrop) {
      return this.dndHandler.mouseCapture(positionInfo);
    } else {
      return false;
    }
  }
  mouseStart(positionInfo) {
    if (this.options.dragAndDrop) {
      return this.dndHandler.mouseStart(positionInfo);
    } else {
      return false;
    }
  }
  mouseDrag(positionInfo) {
    if (this.options.dragAndDrop) {
      const result = this.dndHandler.mouseDrag(positionInfo);
      this.scrollHandler.checkScrolling();
      return result;
    } else {
      return false;
    }
  }
  mouseStop(positionInfo) {
    if (this.options.dragAndDrop) {
      return this.dndHandler.mouseStop(positionInfo);
    } else {
      return false;
    }
  }
  getMouseDelay() {
    return this.options.startDndDelay ?? 0;
  }
  initData() {
    if (this.options.data) {
      this.doLoadData(this.options.data, null);
    } else {
      const dataUrl = this.getDataUrlInfo(null);
      if (dataUrl) {
        this.doLoadDataFromUrl(null, null, null);
      } else {
        this.doLoadData([], null);
      }
    }
  }
  getDataUrlInfo(node) {
    const dataUrl = this.options.dataUrl || this.element.data("url");
    const getUrlFromString = url => {
      const urlInfo = {
        url
      };
      setUrlInfoData(urlInfo);
      return urlInfo;
    };
    const setUrlInfoData = urlInfo => {
      if (node?.id) {
        // Load on demand of a subtree; add node parameter
        const data = {
          node: node.id
        };
        urlInfo["data"] = data;
      } else {
        // Add selected_node parameter
        const selectedNodeId = this.getNodeIdToBeSelected();
        if (selectedNodeId) {
          const data = {
            selected_node: selectedNodeId
          };
          urlInfo["data"] = data;
        }
      }
    };
    if (typeof dataUrl === "function") {
      return dataUrl(node);
    } else if (typeof dataUrl === "string") {
      return getUrlFromString(dataUrl);
    } else if (dataUrl && typeof dataUrl === "object") {
      setUrlInfoData(dataUrl);
      return dataUrl;
    } else {
      return null;
    }
  }
  getNodeIdToBeSelected() {
    if (this.options.saveState) {
      return this.saveStateHandler.getNodeIdToBeSelected();
    } else {
      return null;
    }
  }
  initTree(data) {
    const doInit = () => {
      if (!this.isInitialized) {
        this.isInitialized = true;
        this._triggerEvent("tree.init");
      }
    };
    if (!this.options.nodeClass) {
      return;
    }
    this.tree = new this.options.nodeClass(null, true, this.options.nodeClass);
    this.selectNodeHandler.clear();
    this.tree.loadFromData(data);
    const mustLoadOnDemand = this.setInitialState();
    this._refreshElements(null);
    if (!mustLoadOnDemand) {
      doInit();
    } else {
      // Load data on demand and then init the tree
      this.setInitialStateOnDemand(doInit);
    }
  }

  // Set initial state, either by restoring the state or auto-opening nodes
  // result: must load nodes on demand?
  setInitialState() {
    const restoreState = () => {
      // result: is state restored, must load on demand?
      if (!this.options.saveState) {
        return [false, false];
      } else {
        const state = this.saveStateHandler.getStateFromStorage();
        if (!state) {
          return [false, false];
        } else {
          const mustLoadOnDemand = this.saveStateHandler.setInitialState(state);

          // return true: the state is restored
          return [true, mustLoadOnDemand];
        }
      }
    };
    const autoOpenNodes = () => {
      // result: must load on demand?
      if (this.options.autoOpen === false) {
        return false;
      }
      const maxLevel = this.getAutoOpenMaxLevel();
      let mustLoadOnDemand = false;
      this.tree.iterate((node, level) => {
        if (node.load_on_demand) {
          mustLoadOnDemand = true;
          return false;
        } else if (!node.hasChildren()) {
          return false;
        } else {
          node.is_open = true;
          return level !== maxLevel;
        }
      });
      return mustLoadOnDemand;
    };
    let [isRestored, mustLoadOnDemand] = restoreState(); // eslint-disable-line prefer-const

    if (!isRestored) {
      mustLoadOnDemand = autoOpenNodes();
    }
    return mustLoadOnDemand;
  }

  // Set the initial state for nodes that are loaded on demand
  // Call cb_finished when done
  setInitialStateOnDemand(cbFinished) {
    const restoreState = () => {
      if (!this.options.saveState) {
        return false;
      } else {
        const state = this.saveStateHandler.getStateFromStorage();
        if (!state) {
          return false;
        } else {
          this.saveStateHandler.setInitialStateOnDemand(state, cbFinished);
          return true;
        }
      }
    };
    const autoOpenNodes = () => {
      const maxLevel = this.getAutoOpenMaxLevel();
      let loadingCount = 0;
      const loadAndOpenNode = node => {
        loadingCount += 1;
        this._openNode(node, false, () => {
          loadingCount -= 1;
          openNodes();
        });
      };
      const openNodes = () => {
        this.tree.iterate((node, level) => {
          if (node.load_on_demand) {
            if (!node.is_loading) {
              loadAndOpenNode(node);
            }
            return false;
          } else {
            this._openNode(node, false, null);
            return level !== maxLevel;
          }
        });
        if (loadingCount === 0) {
          cbFinished();
        }
      };
      openNodes();
    };
    if (!restoreState()) {
      autoOpenNodes();
    }
  }
  getAutoOpenMaxLevel() {
    if (this.options.autoOpen === true) {
      return -1;
    } else if (typeof this.options.autoOpen === "number") {
      return this.options.autoOpen;
    } else if (typeof this.options.autoOpen === "string") {
      return parseInt(this.options.autoOpen, 10);
    } else {
      return 0;
    }
  }
  handleClick = e => {
    const clickTarget = this.getClickTarget(e.target);
    if (clickTarget) {
      if (clickTarget.type === "button") {
        this.toggle(clickTarget.node, this.options.slide);
        e.preventDefault();
        e.stopPropagation();
      } else if (clickTarget.type === "label") {
        const node = clickTarget.node;
        const event = this._triggerEvent("tree.click", {
          node,
          click_event: e
        });
        if (!event.isDefaultPrevented()) {
          this.doSelectNode(node);
        }
      }
    }
  };
  handleDblclick = e => {
    const clickTarget = this.getClickTarget(e.target);
    if (clickTarget?.type === "label") {
      this._triggerEvent("tree.dblclick", {
        node: clickTarget.node,
        click_event: e
      });
    }
  };
  getClickTarget(element) {
    const $target = jQuery(element);
    const $button = $target.closest(".jqtree-toggler");
    if ($button.length) {
      const node = this.getNode($button);
      if (node) {
        return {
          type: "button",
          node
        };
      }
    } else {
      const $el = $target.closest(".jqtree-element");
      if ($el.length) {
        const node = this.getNode($el);
        if (node) {
          return {
            type: "label",
            node
          };
        }
      }
    }
    return null;
  }
  getNode($element) {
    const $li = $element.closest("li.jqtree_common");
    if ($li.length === 0) {
      return null;
    } else {
      return $li.data("node");
    }
  }
  handleContextmenu = e => {
    const $div = jQuery(e.target).closest("ul.jqtree-tree .jqtree-element");
    if ($div.length) {
      const node = this.getNode($div);
      if (node) {
        e.preventDefault();
        e.stopPropagation();
        this._triggerEvent("tree.contextmenu", {
          node,
          click_event: e
        });
        return false;
      }
    }
    return null;
  };
  saveState() {
    if (this.options.saveState) {
      this.saveStateHandler.saveState();
    }
  }
  selectCurrentNode(mustSetFocus) {
    const node = this.getSelectedNode();
    if (node) {
      const nodeElement = this._getNodeElementForNode(node);
      if (nodeElement) {
        nodeElement.select(mustSetFocus);
      }
    }
  }
  deselectCurrentNode() {
    const node = this.getSelectedNode();
    if (node) {
      this.removeFromSelection(node);
    }
  }
  getDefaultClosedIcon() {
    if (this.options.rtl) {
      // triangle to the left
      return "&#x25c0;";
    } else {
      // triangle to the right
      return "&#x25ba;";
    }
  }
  getRtlOption() {
    if (this.options.rtl != null) {
      return this.options.rtl;
    } else {
      const dataRtl = this.element.data("rtl");
      if (dataRtl !== null && dataRtl !== false && dataRtl !== undefined) {
        return true;
      } else {
        return false;
      }
    }
  }
  doSelectNode(node, optionsParam) {
    const saveState = () => {
      if (this.options.saveState) {
        this.saveStateHandler.saveState();
      }
    };
    if (!node) {
      // Called with empty node -> deselect current node
      this.deselectCurrentNode();
      saveState();
      return;
    }
    const defaultOptions = {
      mustSetFocus: true,
      mustToggle: true
    };
    const selectOptions = {
      ...defaultOptions,
      ...(optionsParam || {})
    };
    const canSelect = () => {
      if (this.options.onCanSelectNode) {
        return this.options.selectable === true && this.options.onCanSelectNode(node);
      } else {
        return this.options.selectable === true;
      }
    };
    const openParents = () => {
      const parent = node.parent;
      if (parent && parent.parent && !parent.is_open) {
        this.openNode(parent, false);
      }
    };
    if (!canSelect()) {
      return;
    }
    if (this.selectNodeHandler.isNodeSelected(node)) {
      if (selectOptions.mustToggle) {
        this.deselectCurrentNode();
        this._triggerEvent("tree.select", {
          node: null,
          previous_node: node
        });
      }
    } else {
      const deselectedNode = this.getSelectedNode() || null;
      this.deselectCurrentNode();
      this.addToSelection(node, selectOptions.mustSetFocus);
      this._triggerEvent("tree.select", {
        node,
        deselected_node: deselectedNode
      });
      openParents();
    }
    saveState();
  }
  doLoadData(data, parentNode) {
    if (data) {
      if (parentNode) {
        this.deselectNodes(parentNode);
        this.loadSubtree(data, parentNode);
      } else {
        this.initTree(data);
      }
      if (this.isDragging()) {
        this.dndHandler.refresh();
      }
    }
    this._triggerEvent("tree.load_data", {
      tree_data: data,
      parent_node: parentNode
    });
  }
  deselectNodes(parentNode) {
    const selectedNodesUnderParent = this.selectNodeHandler.getSelectedNodesUnder(parentNode);
    for (const n of selectedNodesUnderParent) {
      this.selectNodeHandler.removeFromSelection(n);
    }
  }
  loadSubtree(data, parentNode) {
    parentNode.loadFromData(data);
    parentNode.load_on_demand = false;
    parentNode.is_loading = false;
    this._refreshElements(parentNode);
  }
  doLoadDataFromUrl(urlInfoParam, parentNode, onFinished) {
    const urlInfo = urlInfoParam || this.getDataUrlInfo(parentNode);
    this.dataLoader.loadFromUrl(urlInfo, parentNode, onFinished);
  }
  loadFolderOnDemand(node) {
    let slide = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let onFinished = arguments.length > 2 ? arguments[2] : undefined;
    node.is_loading = true;
    this.doLoadDataFromUrl(null, node, () => {
      this._openNode(node, slide, onFinished);
    });
  }
}
exports.JqTreeWidget = JqTreeWidget;
_simple.default.register(JqTreeWidget, "tree");