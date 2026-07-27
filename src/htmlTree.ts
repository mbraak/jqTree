import type { HandleFinishedLoading } from "./dataLoader";
import type { HtmlTreeOptions } from "./htmlTree/options";
import type { OnFinishOpenNode } from "./jqtreeMethodTypes";
import type { PositionInfo } from "./mouseUtils";
import type { Position } from "./node";
import type { SavedState } from "./saveStateHandler";

import DataLoader from "./dataLoader";
import { DragAndDropHandler } from "./dragAndDropHandler";
import ElementsRenderer from "./elementsRenderer";
import setDefaultOptions from "./htmlTree/setDefaultOptions";
import triggerCustomEvent from "./htmlTree/triggerCustomEvent";
import KeyHandler from "./keyHandler";
import MouseHandler from "./mouseHandler";
import { Node } from "./node";
import NodeElement from "./nodeElement";
import FolderElement from "./nodeElement/folderElement";
import { getOffsetTop } from "./positionUtils";
import RequestUrl from "./requestUrl";
import SaveStateHandler from "./saveStateHandler";
import ScrollHandler from "./scrollHandler";
import SelectNodeHandler from "./selectNodeHandler";
import __version__ from "./version";

export type TriggerEventProvider = (element: HTMLElement, eventName: string, values?: Record<string, unknown>) => boolean;

interface HtmlTreeParams {
  htmlElement: HTMLElement;
  options: Partial<HtmlTreeOptions>,
  overrideTriggerEventProvider?: TriggerEventProvider,
}

export default class HtmlTree {
  public tree: Node;

  private _dataLoader: DataLoader;
  private _dndHandler: DragAndDropHandler;
  private _htmlElement: HTMLElement;
  private _isInitialized: boolean;
  private _keyHandler: KeyHandler;
  private _mouseHandler: MouseHandler;
  private _nodeMap: WeakMap<HTMLElement, Node>;
  private _options: HtmlTreeOptions;
  private _renderer: ElementsRenderer;
  private _saveStateHandler: SaveStateHandler;
  private _scrollHandler: ScrollHandler;
  private _selectNodeHandler: SelectNodeHandler;
  private _triggerEventProvider: TriggerEventProvider;

  constructor({ htmlElement, options, overrideTriggerEventProvider }: HtmlTreeParams) {
    this._htmlElement = htmlElement;
    this._options = setDefaultOptions(htmlElement, options);
    this._triggerEventProvider = overrideTriggerEventProvider ?? triggerCustomEvent;

    this._isInitialized = false;
    this.tree = new Node({}, true);
    this._nodeMap = new WeakMap();

    this._init();
  }

  // Add a node after an existing node.
  public addNodeAfter(
    newNodeInfo: NodeData,
    existingNode: Node,
  ): Node | null {
    const newNode = existingNode.addAfter(newNodeInfo);

    if (newNode) {
      this._refreshElements(existingNode.parent);
    }

    return newNode;
  }

  // Add a node before another node.
  public addNodeBefore(
    newNodeInfo: NodeData,
    existingNode: Node,
  ): Node | null {
    const newNode = existingNode.addBefore(newNodeInfo);

    if (newNode) {
      this._refreshElements(existingNode.parent);
    }

    return newNode;
  }

  // Add a node as parent node of an existing node.
  public addParentNode(
    newNodeInfo: NodeData,
    existingNode: Node,
  ): Node | null {
    const newNode = existingNode.addParent(newNodeInfo);

    if (newNode) {
      this._refreshElements(newNode.parent);
    }

    return newNode;
  }

  public addToSelection(node: Node, mustSetFocus?: boolean) {
    this._selectNodeHandler.addToSelection(node);
    this._openParents(node);

    this._getNodeElementForNode(node).select(mustSetFocus ?? true);

    this._saveState();
  }

  // Add a node as child of another node.
  public appendNode(newNodeInfo: NodeData, parentNode: Node): Node {
    const node = parentNode.append(newNodeInfo);

    this._refreshElements(parentNode);

    return node;
  }

  public closeNode(node: Node, slideParam?: boolean | null): void {
    const slide = slideParam ?? this._options.slide;

    if (node.isFolder() || node.isEmptyFolder) {
      this._createFolderElement(node).close(
        slide,
        this._options.animationSpeed,
      );

      this._saveState();
    }
  }

  public deinit(): void {
    this._htmlElement.textContent = '';

    this._keyHandler.deinit();
    this._mouseHandler.deinit();

    this.tree = new Node({}, true);
  }

  // Return the tree node for an HTMl element.
  public getNode(element: HTMLElement): Node | null {
    const liElement = element.closest<HTMLElement>("li.jqtree_common");

    if (liElement) {
      return this._nodeMap.get(liElement) ?? null;
    } else {
      return null;
    }
  }

  public getNodeByCallback(callback: (node: Node) => boolean): Node | null {
    return this.tree.getNodeByCallback(callback);
  }

  public getNodeById(nodeId: NodeId): Node | null {
    return this.tree.getNodeById(nodeId);
  }

  public getNodeByName(name: string): Node | null {
    return this.tree.getNodeByName(name);
  }

  public getNodeByNameMustExist(name: string): Node {
    return this.tree.getNodeByNameMustExist(name);
  }

  public getNodesByProperty(key: string, value: unknown): Node[] {
    return this.tree.getNodesByProperty(key, value);
  }

  // Return the node that is selected.
  public getSelectedNode(): false | Node {
    return this._selectNodeHandler.getSelectedNode();
  }

  public getSelectedNodes(): Node[] {
    return this._selectNodeHandler.getSelectedNodes();
  }

  public getState(): null | SavedState {
    return this._saveStateHandler.getState();
  }

  public getStateFromStorage(): null | SavedState {
    return this._saveStateHandler.getStateFromStorage();
  }

  public getTree(): Node {
    return this.tree;
  }

  public getVersion(): string {
    return __version__;
  }

  public isDragging(): boolean {
    return this._dndHandler.isDragging;
  }

  public isNodeSelected(node: Node): boolean {
    return this._selectNodeHandler.isNodeSelected(node);
  }

  public loadData(data: NodeData[] | null, parentNode?: Node): void {
    if (data) {
      if (parentNode) {
        this._deselectNodes(parentNode);
        this._loadSubtree(data, parentNode);
      } else {
        this._initTree(data);
      }

      if (this.isDragging()) {
        this._dndHandler.refresh();
      }
    }

    this._triggerEvent("tree.load_data", {
      parent_node: parentNode,
      tree_data: data,
    });
  }

  public loadDataFromUrl(
    inputUrl?: string,
    parentNode?: Node,
    onFinished?: HandleFinishedLoading,
  ): void {
    const url = inputUrl ? new RequestUrl(inputUrl) : this._createRequestUrl(parentNode);

    if (url) {
      this._dataLoader.loadFromUrl(url, parentNode, onFinished);
    }
  }

  public moveDown() {
    const selectedNode = this.getSelectedNode();
    if (selectedNode) {
      this._keyHandler.moveDown(selectedNode);
    }
  }

  // Move a node inside the tree.
  public moveNode(
    node: Node,
    targetNode: Node,
    position: Position,
  ): void {
    this.tree.moveNode(node, targetNode, position);
    this._refreshElements(null);
  }

  public moveUp() {
    const selectedNode = this.getSelectedNode();
    if (selectedNode) {
      this._keyHandler.moveUp(selectedNode);
    }
  }

  public openNode(
    node: Node,
    param1?: boolean | OnFinishOpenNode,
    param2?: OnFinishOpenNode,
  ) {
    const parseParams = (): [boolean, OnFinishOpenNode | undefined] => {
      let onFinished: null | OnFinishOpenNode;
      let slide: boolean | null;

      if (typeof param1 === "function") {
        onFinished = param1;
        slide = null;
      } else {
        slide = param1 as boolean;
        onFinished = param2 as OnFinishOpenNode;
      }

      slide ??= this._options.slide;

      return [slide, onFinished];
    };

    const [slide, onFinished] = parseParams();

    this._openNodeInternal(node, slide, onFinished);
  }

  // Add a node before another node.
  public prependNode(newNodeInfo: NodeData, parentNode: Node): Node {
    const node = parentNode.prepend(newNodeInfo);

    this._refreshElements(parentNode);

    return node;
  }

  public refresh() {
    this._refreshElements(null);
  }

  public refreshHitAreas() {
    this._dndHandler.refresh();
  }

  public removeFromSelection(node: Node) {
    this._selectNodeHandler.removeFromSelection(node);

    this._getNodeElementForNode(node).deselect();
    this._saveState();
  }

  // Remove the node from the tree.
  public removeNode(node: Node): void {
    this._selectNodeHandler.removeFromSelection(node, true); // including children

    const parent = node.parent;
    node.remove();
    this._refreshElements(parent);
  }

  public scrollToNode(node: Node) {
    if (!node.element) {
      return;
    }

    const top =
      getOffsetTop(node.element) -
      getOffsetTop(this._htmlElement);

    this._scrollHandler.scrollToY(top);
  }

  public selectNode(
    node: Node | null,
    optionsParam?: SelectNodeOptions,
  ): void {
    const saveState = (): void => {
      if (this._options.saveState) {
        this._saveStateHandler.saveState();
      }
    };

    if (!node) {
      // Called with empty node -> deselect current node
      this._deselectCurrentNode();
      saveState();
      return;
    }
    const defaultOptions = { mustSetFocus: true, mustToggle: true };
    const selectOptions = { ...defaultOptions, ...(optionsParam ?? {}) };

    const canSelect = (): boolean => {
      if (this._options.onCanSelectNode) {
        return (
          this._options.selectable &&
          this._options.onCanSelectNode(node)
        );
      } else {
        return this._options.selectable;
      }
    };

    if (!canSelect()) {
      return;
    }

    if (this._selectNodeHandler.isNodeSelected(node)) {
      if (selectOptions.mustToggle) {
        this._deselectCurrentNode();
        this._triggerEvent("tree.select", {
          node: null,
          previous_node: node,
        });
      }
    } else {
      const deselectedNode = this.getSelectedNode() || null;
      this._deselectCurrentNode();
      this.addToSelection(node, selectOptions.mustSetFocus);

      this._triggerEvent("tree.select", {
        deselected_node: deselectedNode,
        node,
      });
      this._openParents(node);
    }

    saveState();
  }

  public setOption(option: string, value: unknown) {
    (this._options as unknown as Record<string, unknown>)[option] = value;
  }

  public setState(state: SavedState) {
    this._saveStateHandler.setInitialState(state);
    this._refreshElements(null);
  }

  public toggle(node: Node, slideParam: boolean | null = null) {
    const slide = slideParam ?? this._options.slide;

    if (node.is_open) {
      this.closeNode(node, slide);
    } else {
      this.openNode(node, slide);
    }
  }

  // Return tree as json string.
  public toJson(): string {
    return JSON.stringify(this.tree.getData());
  }

  // Update the data of a node in the tree.
  public updateNode(node: Node, data: NodeData): void {
    const idIsChanged =
      typeof data === "object" && data.id && data.id !== node.id;

    if (idIsChanged) {
      this.tree.removeNodeFromIndex(node);
    }

    node.setData(data);

    if (idIsChanged) {
      this.tree.addNodeToIndex(node);
    }

    if (
      typeof data === "object" &&
      data.children &&
      data.children instanceof Array
    ) {
      node.removeChildren();

      if (data.children.length) {
        node.loadFromData(data.children);
      }
    }

    this._refreshElements(node);
  }

  private _connectHandlers() {
    const {
      autoEscape,
      buttonLeft,
      closedIcon,
      dataFilter,
      dragAndDrop,
      keyboardSupport,
      onCanMove,
      onCanMoveTo,
      onCreateLi,
      onDragMove,
      onDragStop,
      onGetStateFromStorage,
      onIsMoveHandle,
      onLoadFailed,
      onLoading,
      onSetStateFromStorage,
      openedIcon,
      openFolderDelay,
      rtl,
      saveState,
      showEmptyFolder,
      slide,
      tabIndex,
    } = this._options;

    const closeNode = this.closeNode.bind(this);
    const getNodeElement = this._getNodeElement.bind(this);
    const getNodeElementForNode = this._getNodeElementForNode.bind(this);
    const getNodeById = this.getNodeById.bind(this);
    const getSelectedNode = this.getSelectedNode.bind(this);
    const getTree = this.getTree.bind(this);
    const isFocusOnTree = this._isFocusOnTree.bind(this);
    const loadData = this.loadData.bind(this);
    const openNode = this._openNodeInternal.bind(this);
    const refreshElements = this._refreshElements.bind(this);
    const refreshHitAreas = this.refreshHitAreas.bind(this);
    const selectNode = this.selectNode.bind(this);
    const setNodeElement = this._setNodeElement.bind(this);
    const treeElement = this._htmlElement;
    const triggerEvent = this._triggerEvent.bind(this);

    const selectNodeHandler = new SelectNodeHandler({
      getNodeById,
    });

    const addToSelection =
      selectNodeHandler.addToSelection.bind(selectNodeHandler);
    const getSelectedNodes =
      selectNodeHandler.getSelectedNodes.bind(selectNodeHandler);
    const isNodeSelected =
      selectNodeHandler.isNodeSelected.bind(selectNodeHandler);
    const removeFromSelection =
      selectNodeHandler.removeFromSelection.bind(selectNodeHandler);
    const getMouseDelay = () => this._options.startDndDelay ?? 0;

    const dataLoader = new DataLoader({
      dataFilter,
      loadData,
      onLoadFailed,
      onLoading,
      treeElement,
      triggerEvent,
    });

    const saveStateHandler = new SaveStateHandler({
      addToSelection,
      getNodeById,
      getSelectedNodes,
      getTree,
      onGetStateFromStorage,
      onSetStateFromStorage,
      openNode,
      refreshElements,
      removeFromSelection,
      saveState,
    });

    const scrollHandler = new ScrollHandler({
      refreshHitAreas,
      treeElement,
    });

    const getScrollLeft = scrollHandler.getScrollLeft.bind(scrollHandler);

    const dndHandler = new DragAndDropHandler({
      autoEscape,
      getNodeElement,
      getNodeElementForNode,
      getScrollLeft,
      getTree,
      onCanMove,
      onCanMoveTo,
      onDragMove,
      onDragStop,
      onIsMoveHandle,
      openFolderDelay,
      openNode,
      refreshElements,
      slide,
      treeElement,
      triggerEvent,
    });

    const keyHandler = new KeyHandler({
      closeNode,
      getSelectedNode,
      isFocusOnTree,
      keyboardSupport,
      openNode,
      selectNode,
    });

    const renderer = new ElementsRenderer({
      autoEscape,
      buttonLeft,
      closedIcon,
      dragAndDrop,
      getTree,
      htmlElement: treeElement,
      isNodeSelected,
      onCreateLi,
      openedIcon,
      rtl,
      setNodeElement,
      showEmptyFolder,
      tabIndex,
    });

    const getNode = this.getNode.bind(this);
    const onMouseCapture = this._mouseCapture.bind(this);
    const onMouseDrag = this._mouseDrag.bind(this);
    const onMouseStart = this._mouseStart.bind(this);
    const onMouseStop = this._mouseStop.bind(this);

    const mouseHandler = new MouseHandler({
      element: treeElement,
      getMouseDelay,
      getNode,
      onClickButton: this.toggle.bind(this),
      onClickTitle: this.selectNode.bind(this),
      onMouseCapture,
      onMouseDrag,
      onMouseStart,
      onMouseStop,
      triggerEvent,
      useContextMenu: this._options.useContextMenu,
    });

    this._dataLoader = dataLoader;
    this._dndHandler = dndHandler;
    this._keyHandler = keyHandler;
    this._mouseHandler = mouseHandler;
    this._renderer = renderer;
    this._saveStateHandler = saveStateHandler;
    this._scrollHandler = scrollHandler;
    this._selectNodeHandler = selectNodeHandler;
  }

  // Is this HTML element part of the tree?
  private _containsElement(element: HTMLElement): boolean {
    const node = this.getNode(element);

    return node?.tree === this.tree;
  }

  private _createFolderElement(node: Node) {
    const closedIconElement = this._renderer.closedIconElement;
    const getScrollLeft = this._scrollHandler.getScrollLeft.bind(
      this._scrollHandler,
    );
    const openedIconElement = this._renderer.openedIconElement;
    const tabIndex = this._options.tabIndex;
    const treeElement = this._htmlElement;
    const triggerEvent = this._triggerEvent.bind(this);

    return new FolderElement({
      closedIconElement,
      getScrollLeft,
      node,
      openedIconElement,
      tabIndex,
      treeElement,
      triggerEvent,
    });
  }

  private _createNodeElement(node: Node) {
    const getScrollLeft = this._scrollHandler.getScrollLeft.bind(
      this._scrollHandler,
    );
    const tabIndex = this._options.tabIndex;
    const treeElement = this._htmlElement;

    return new NodeElement({
      getScrollLeft,
      node,
      tabIndex,
      treeElement,
    });
  }

  /* Create a RequestUrl based on the url in the options.
    * Add a 'node' query parameter for loading on demand
    * Add a 'selected_node' query parameter if a node is selected.
  */
  private _createRequestUrl(node?: Node): null | RequestUrl {
    const dataUrl = this._options.dataUrl;

    let url;

    if (typeof dataUrl === "function") {
      url = dataUrl(node);
    } else {
      url = dataUrl;
    }

    if (!url) {
      return null;
    }

    const requestUrl = new RequestUrl(url);

    if (node?.id) {
      // Load on demand of a subtree; add node parameter
      requestUrl.setSearchParam('node', node.id.toString());
    } else {
      // Add selected_node parameter
      const selectedNodeId = this._getNodeIdToBeSelected();
      if (selectedNodeId) {
        requestUrl.setSearchParam('selected_node', selectedNodeId.toString());
      }
    }

    return requestUrl;
  }

  private _deselectCurrentNode(): void {
    const node = this.getSelectedNode();
    if (node) {
      this.removeFromSelection(node);
    }
  }

  // Deselect the children of the node.
  private _deselectNodes(parentNode: Node): void {
    const selectedNodesUnderParent =
      this._selectNodeHandler.getSelectedNodesUnder(parentNode);
    for (const n of selectedNodesUnderParent) {
      this._selectNodeHandler.removeFromSelection(n);
    }
  }

  // Get the maximum level for auto open
  private _getAutoOpenMaxLevel(): number {
    if (this._options.autoOpen === true) {
      return -1;
    } else if (typeof this._options.autoOpen === "number") {
      return this._options.autoOpen;
    } else if (typeof this._options.autoOpen === "string") {
      return parseInt(this._options.autoOpen, 10);
    }

    /* istanbul ignore next @preserve */
    return 0;
  }

  private _getNodeElement(element: HTMLElement): NodeElement | null {
    const node = this.getNode(element);
    if (node) {
      return this._getNodeElementForNode(node);
    } else {
      return null;
    }
  }

  private _getNodeElementForNode(node: Node): NodeElement {
    if (node.isFolder()) {
      return this._createFolderElement(node);
    } else {
      return this._createNodeElement(node);
    }
  }

  private _getNodeIdToBeSelected(): NodeId | null {
    if (this._options.saveState) {
      return this._saveStateHandler.getNodeIdToBeSelected();
    } else {
      return null;
    }
  }

  private _init(): void {
    this._connectHandlers();

    this._initData();
  }

  private _initData(): void {
    if (this._options.data) {
      this.loadData(this._options.data);
    } else {
      const dataUrl = this._createRequestUrl();

      if (dataUrl) {
        this.loadDataFromUrl();
      } else {
        this.loadData([]);
      }
    }
  }

  private _initTree(data: NodeData[]): void {
    const doInit = (): void => {
      if (!this._isInitialized) {
        this._isInitialized = true;
        this._triggerEvent("tree.init");
      }
    };

    this.tree = new this._options.nodeClass(
      null,
      true,
      this._options.nodeClass,
    );

    this._selectNodeHandler.clear();

    this.tree.loadFromData(data);

    const mustLoadOnDemand = this._setInitialState();

    this._refreshElements(null);

    if (mustLoadOnDemand) {
      // Load data on demand and then init the tree
      this._setInitialStateOnDemand(doInit);
    } else {
      doInit();
    }
  }

  // Does an HTML element of the tree have the focus?
  private _isFocusOnTree(): boolean {
    const activeElement = document.activeElement;

    return activeElement?.tagName === "SPAN" && this._containsElement(activeElement as HTMLElement);
  }

  private _isSelectedNodeInSubtree(subtree: Node): boolean {
    const selectedNode = this.getSelectedNode();

    if (!selectedNode) {
      return false;
    } else {
      return subtree === selectedNode || subtree.isParentOf(selectedNode);
    }
  }

  private _loadFolderOnDemand(
    node: Node,
    slide: boolean,
    onFinished?: OnFinishOpenNode,
  ): void {
    node.is_loading = true;

    this.loadDataFromUrl(undefined, node, () => {
      this._openNodeInternal(node, slide, onFinished);
    });
  }

  private _loadSubtree(data: NodeData[], parentNode: Node): void {
    parentNode.loadFromData(data);

    parentNode.load_on_demand = false;
    parentNode.is_loading = false;

    this._refreshElements(parentNode);
  }

  private _mouseCapture(positionInfo: PositionInfo): boolean | null {
    if (this._options.dragAndDrop) {
      return this._dndHandler.mouseCapture(positionInfo);
    } else {
      return false;
    }
  }

  private _mouseDrag(positionInfo: PositionInfo): boolean {
    if (this._options.dragAndDrop) {
      const result = this._dndHandler.mouseDrag(positionInfo);

      this._scrollHandler.checkScrolling(positionInfo);
      return result;
    } else {
      return false;
    }
  }

  private _mouseStart(positionInfo: PositionInfo): boolean {
    if (this._options.dragAndDrop) {
      return this._dndHandler.mouseStart(positionInfo);
    } else {
      return false;
    }
  }

  private _mouseStop(positionInfo: PositionInfo): boolean {
    if (this._options.dragAndDrop) {
      this._scrollHandler.stopScrolling();
      return this._dndHandler.mouseStop(positionInfo);
    } else {
      return false;
    }
  }

  private _openNodeInternal(
    node: Node,
    slide = true,
    onFinished?: OnFinishOpenNode,
  ): void {
    const doOpenNode = (
      _node: Node,
      _slide: boolean,
      _onFinished?: OnFinishOpenNode,
    ): void => {
      if (!node.children.length) {
        return;
      }

      const folderElement = this._createFolderElement(_node);
      folderElement.open(
        _onFinished,
        _slide,
        this._options.animationSpeed,
      );
    };

    if (node.isFolder() || node.isEmptyFolder) {
      if (node.load_on_demand) {
        this._loadFolderOnDemand(node, slide, onFinished);
      } else {
        let parent = node.parent;

        while (parent) {
          // nb: do not open root element
          if (parent.parent) {
            doOpenNode(parent, false);
          }
          parent = parent.parent;
        }

        doOpenNode(node, slide, onFinished);
        this._saveState();
      }
    }
  }

  private _openParents(node: Node) {
    const parent = node.parent;

    if (parent?.parent && !parent.is_open) {
      this.openNode(parent, false);
    }
  }

  /*
  Redraw the tree or part of the tree.
    from_node: redraw this subtree
  */
  private _refreshElements(fromNode: Node | null): void {
    const mustSetFocus = this._isFocusOnTree();
    const mustSelect = fromNode
      ? this._isSelectedNodeInSubtree(fromNode)
      : false;

    this._renderer.render(fromNode);

    if (mustSelect) {
      this._selectCurrentNode(mustSetFocus);
    }

    this._triggerEvent("tree.refresh");
  }

  private _saveState(): void {
    if (this._options.saveState) {
      this._saveStateHandler.saveState();
    }
  }

  private _selectCurrentNode(mustSetFocus: boolean): void {
    const node = this.getSelectedNode();
    if (node) {
      const nodeElement = this._getNodeElementForNode(node);
      nodeElement.select(mustSetFocus);
    }
  }

  // Set initial state, either by restoring the state or auto-opening nodes
  // result: must load nodes on demand?
  private _setInitialState(): boolean {
    const restoreState = (): [boolean, boolean] => {
      // result: is state restored, must load on demand?
      if (!this._options.saveState) {
        return [false, false];
      } else {
        const state = this._saveStateHandler.getStateFromStorage();

        if (!state) {
          return [false, false];
        } else {
          const mustLoadOnDemand =
            this._saveStateHandler.setInitialState(state);

          // return true: the state is restored
          return [true, mustLoadOnDemand];
        }
      }
    };

    const autoOpenNodes = (): boolean => {
      // result: must load on demand?
      if (this._options.autoOpen === false) {
        return false;
      }

      const maxLevel = this._getAutoOpenMaxLevel();
      let mustLoadOnDemand = false;

      this.tree.iterate((node: Node, level: number) => {
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
  private _setInitialStateOnDemand(cbFinished: () => void): void {
    const restoreState = (): boolean => {
      const state = this._saveStateHandler.getStateFromStorage();

      if (!state) {
        return false;
      } else {
        this._saveStateHandler.setInitialStateOnDemand(
          state,
          cbFinished,
        );

        return true;
      }
    };

    const autoOpenNodes = (): void => {
      const maxLevel = this._getAutoOpenMaxLevel();
      let loadingCount = 0;

      const loadAndOpenNode = (node: Node): void => {
        loadingCount += 1;
        this._openNodeInternal(node, false, () => {
          loadingCount -= 1;
          openNodes();
        });
      };

      const openNodes = (): void => {
        this.tree.iterate((node: Node, level: number) => {
          if (node.load_on_demand) {
            if (!node.is_loading) {
              loadAndOpenNode(node);
            }

            return false;
          } else {
            this._openNodeInternal(node, false);

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

  // Set this HTML element to this node in the node map.
  private _setNodeElement(element: HTMLElement, node: Node) {
    this._nodeMap.set(element, node);
  }

  private _triggerEvent(eventName: string, values?: Record<string, unknown>): boolean {
    return this._triggerEventProvider(this._htmlElement, eventName, values)
  }
}