import type { HandleFinishedLoading } from "./dataLoader";
import type { OnFinishOpenNode } from "./jqtreeMethodTypes";
import type { JQTreeOptions } from "./jqtreeOptions";
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
  options: Partial<JQTreeOptions>,
  overrideTriggerEventProvider?: TriggerEventProvider,
}

export default class HtmlTree {
  public dataLoader: DataLoader;
  public dndHandler: DragAndDropHandler;
  public htmlElement: HTMLElement;
  public isInitialized: boolean;
  public keyHandler: KeyHandler;
  public mouseHandler: MouseHandler;
  public nodeMap: WeakMap<HTMLElement, Node>;
  public options: JQTreeOptions;
  public renderer: ElementsRenderer;
  public saveStateHandler: SaveStateHandler;
  public scrollHandler: ScrollHandler;
  public selectNodeHandler: SelectNodeHandler;
  public tree: Node;

  private _triggerEventProvider: TriggerEventProvider;

  constructor({ htmlElement, options, overrideTriggerEventProvider }: HtmlTreeParams) {
    this.htmlElement = htmlElement;
    this.options = setDefaultOptions(htmlElement, options);
    this._triggerEventProvider = overrideTriggerEventProvider ?? triggerCustomEvent;

    this.isInitialized = false;
    this.tree = new Node({}, true);
    this.nodeMap = new WeakMap();

    this.init();
  }

  // Add a node after an existing node.
  public addNodeAfter(
    newNodeInfo: NodeData,
    existingNode: Node,
  ): Node | null {
    const newNode = existingNode.addAfter(newNodeInfo);

    if (newNode) {
      this.refreshElements(existingNode.parent);
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
      this.refreshElements(existingNode.parent);
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
      this.refreshElements(newNode.parent);
    }

    return newNode;
  }

  public addToSelection(node: Node, mustSetFocus?: boolean) {
    this.selectNodeHandler.addToSelection(node);
    this.openParents(node);

    this.getNodeElementForNode(node).select(mustSetFocus ?? true);

    this.saveState();
  }

  // Add a node as child of another node.
  public appendNode(newNodeInfo: NodeData, parentNode: Node): Node {
    const node = parentNode.append(newNodeInfo);

    this.refreshElements(parentNode);

    return node;
  }

  public closeNode(node: Node, slideParam?: boolean | null): void {
    const slide = slideParam ?? this.options.slide;

    if (node.isFolder() || node.isEmptyFolder) {
      this.createFolderElement(node).close(
        slide,
        this.options.animationSpeed,
      );

      this.saveState();
    }
  }

  // Is this HTML element part of the tree?
  public containsElement(element: HTMLElement): boolean {
    const node = this.getNode(element);

    return node?.tree === this.tree;
  }

  public createFolderElement(node: Node) {
    const closedIconElement = this.renderer.closedIconElement;
    const getScrollLeft = this.scrollHandler.getScrollLeft.bind(
      this.scrollHandler,
    );
    const openedIconElement = this.renderer.openedIconElement;
    const tabIndex = this.options.tabIndex;
    const treeElement = this.htmlElement;
    const triggerEvent = this.triggerEvent.bind(this);

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

  public createNodeElement(node: Node) {
    const getScrollLeft = this.scrollHandler.getScrollLeft.bind(
      this.scrollHandler,
    );
    const tabIndex = this.options.tabIndex;
    const treeElement = this.htmlElement;

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
  public createRequestUrl(node: Node | null): null | RequestUrl {
    const dataUrl = this.options.dataUrl;

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
      const selectedNodeId = this.getNodeIdToBeSelected();
      if (selectedNodeId) {
        requestUrl.setSearchParam('selected_node', selectedNodeId.toString());
      }
    }

    return requestUrl;
  }

  public deinit(): void {
    this.htmlElement.textContent = '';

    this.keyHandler.deinit();
    this.mouseHandler.deinit();

    this.tree = new Node({}, true);
  }

  public deselectCurrentNode(): void {
    const node = this.getSelectedNode();
    if (node) {
      this.removeFromSelection(node);
    }
  }

  // Deselect the children of the node.
  public deselectNodes(parentNode: Node): void {
    const selectedNodesUnderParent =
      this.selectNodeHandler.getSelectedNodesUnder(parentNode);
    for (const n of selectedNodesUnderParent) {
      this.selectNodeHandler.removeFromSelection(n);
    }
  }

  // Get the maximum level for auto open
  public getAutoOpenMaxLevel(): number {
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

  // Return the tree node for an HTMl element.
  public getNode(element: HTMLElement): Node | null {
    const liElement = element.closest<HTMLElement>("li.jqtree_common");

    if (liElement) {
      return this.nodeMap.get(liElement) ?? null;
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

  public getNodeElement(element: HTMLElement): NodeElement | null {
    const node = this.getNode(element);
    if (node) {
      return this.getNodeElementForNode(node);
    } else {
      return null;
    }
  }

  public getNodeElementForNode(node: Node): NodeElement {
    if (node.isFolder()) {
      return this.createFolderElement(node);
    } else {
      return this.createNodeElement(node);
    }
  }

  public getNodeIdToBeSelected(): NodeId | null {
    if (this.options.saveState) {
      return this.saveStateHandler.getNodeIdToBeSelected();
    } else {
      return null;
    }
  }

  public getNodesByProperty(key: string, value: unknown): Node[] {
    return this.tree.getNodesByProperty(key, value);
  }

  // Return the node that is selected.
  public getSelectedNode(): false | Node {
    return this.selectNodeHandler.getSelectedNode();
  }

  public getSelectedNodes(): Node[] {
    return this.selectNodeHandler.getSelectedNodes();
  }

  public getState(): null | SavedState {
    return this.saveStateHandler.getState();
  }

  public getStateFromStorage(): null | SavedState {
    return this.saveStateHandler.getStateFromStorage();
  }

  public getTree(): Node {
    return this.tree;
  }

  public getVersion(): string {
    return __version__;
  }

  public init(): void {
    this._connectHandlers();

    this.initData();
  }

  public initData(): void {
    if (this.options.data) {
      this.loadData(this.options.data, null);
    } else {
      const dataUrl = this.createRequestUrl(null);

      if (dataUrl) {
        this.loadDataFromUrl(null, null, null);
      } else {
        this.loadData([], null);
      }
    }
  }

  public initTree(data: NodeData[]): void {
    const doInit = (): void => {
      if (!this.isInitialized) {
        this.isInitialized = true;
        this.triggerEvent("tree.init");
      }
    };

    this.tree = new this.options.nodeClass(
      null,
      true,
      this.options.nodeClass,
    );

    this.selectNodeHandler.clear();

    this.tree.loadFromData(data);

    const mustLoadOnDemand = this.setInitialState();

    this.refreshElements(null);

    if (!mustLoadOnDemand) {
      doInit();
    } else {
      // Load data on demand and then init the tree
      this.setInitialStateOnDemand(doInit);
    }
  }

  public isDragging(): boolean {
    return this.dndHandler.isDragging;
  }

  // Does an HTML element of the tree have the focus?
  public isFocusOnTree(): boolean {
    const activeElement = document.activeElement;

    return activeElement?.tagName === "SPAN" && this.containsElement(activeElement as HTMLElement);
  }

  public isNodeSelected(node: Node): boolean {
    return this.selectNodeHandler.isNodeSelected(node);
  }

  public isSelectedNodeInSubtree(subtree: Node): boolean {
    const selectedNode = this.getSelectedNode();

    if (!selectedNode) {
      return false;
    } else {
      return subtree === selectedNode || subtree.isParentOf(selectedNode);
    }
  }

  public loadData(data: NodeData[] | null, parentNode: Node | null): void {
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

    this.triggerEvent("tree.load_data", {
      parent_node: parentNode,
      tree_data: data,
    });
  }

  public loadDataFromUrl(
    inputUrl: null | string,
    parentNode: Node | null,
    onFinished: HandleFinishedLoading | null,
  ): void {
    const url = inputUrl ? new RequestUrl(inputUrl) : this.createRequestUrl(parentNode);

    if (url) {
      this.dataLoader.loadFromUrl(url, parentNode, onFinished);
    }
  }

  public loadFolderOnDemand(
    node: Node,
    slide = true,
    onFinished?: OnFinishOpenNode,
  ): void {
    node.is_loading = true;

    this.loadDataFromUrl(null, node, () => {
      this.openNodeInternal(node, slide, onFinished);
    });
  }

  public loadSubtree(data: NodeData[], parentNode: Node): void {
    parentNode.loadFromData(data);

    parentNode.load_on_demand = false;
    parentNode.is_loading = false;

    this.refreshElements(parentNode);
  }

  public mouseCapture(positionInfo: PositionInfo): boolean | null {
    if (this.options.dragAndDrop) {
      return this.dndHandler.mouseCapture(positionInfo);
    } else {
      return false;
    }
  }

  public mouseDrag(positionInfo: PositionInfo): boolean {
    if (this.options.dragAndDrop) {
      const result = this.dndHandler.mouseDrag(positionInfo);

      this.scrollHandler.checkScrolling(positionInfo);
      return result;
    } else {
      return false;
    }
  }

  public mouseStart(positionInfo: PositionInfo): boolean {
    if (this.options.dragAndDrop) {
      return this.dndHandler.mouseStart(positionInfo);
    } else {
      return false;
    }
  }

  public mouseStop(positionInfo: PositionInfo): boolean {
    if (this.options.dragAndDrop) {
      this.scrollHandler.stopScrolling();
      return this.dndHandler.mouseStop(positionInfo);
    } else {
      return false;
    }
  }

  public moveDown() {
    const selectedNode = this.getSelectedNode();
    if (selectedNode) {
      this.keyHandler.moveDown(selectedNode);
    }
  }

  // Move a node inside the tree.
  public moveNode(
    node: Node,
    targetNode: Node,
    position: Position,
  ): void {
    this.tree.moveNode(node, targetNode, position);
    this.refreshElements(null);
  }

  public moveUp() {
    const selectedNode = this.getSelectedNode();
    if (selectedNode) {
      this.keyHandler.moveUp(selectedNode);
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

      slide ??= this.options.slide;

      return [slide, onFinished];
    };

    const [slide, onFinished] = parseParams();

    this.openNodeInternal(node, slide, onFinished);
  }

  public openNodeInternal(
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

      const folderElement = this.createFolderElement(_node);
      folderElement.open(
        _onFinished,
        _slide,
        this.options.animationSpeed,
      );
    };

    if (node.isFolder() || node.isEmptyFolder) {
      if (node.load_on_demand) {
        this.loadFolderOnDemand(node, slide, onFinished);
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
        this.saveState();
      }
    }
  }

  public openParents(node: Node) {
    const parent = node.parent;

    if (parent?.parent && !parent.is_open) {
      this.openNode(parent, false);
    }
  }

  // Add a node before another node. 
  public prependNode(newNodeInfo: NodeData, parentNode: Node): Node {
    const node = parentNode.prepend(newNodeInfo);

    this.refreshElements(parentNode);

    return node;
  }

  /*
  Redraw the tree or part of the tree.
    from_node: redraw this subtree
  */
  public refreshElements(fromNode: Node | null): void {
    const mustSetFocus = this.isFocusOnTree();
    const mustSelect = fromNode
      ? this.isSelectedNodeInSubtree(fromNode)
      : false;

    this.renderer.render(fromNode);

    if (mustSelect) {
      this.selectCurrentNode(mustSetFocus);
    }

    this.triggerEvent("tree.refresh");
  }

  public refreshHitAreas() {
    this.dndHandler.refresh();
  }

  public removeFromSelection(node: Node) {
    this.selectNodeHandler.removeFromSelection(node);

    this.getNodeElementForNode(node).deselect();
    this.saveState();
  }

  // Remove the node from the tree.
  public removeNode(node: Node): void {
    this.selectNodeHandler.removeFromSelection(node, true); // including children

    const parent = node.parent;
    node.remove();
    this.refreshElements(parent);
  }

  public saveState(): void {
    if (this.options.saveState) {
      this.saveStateHandler.saveState();
    }
  }

  public scrollToNode(node: Node) {
    if (!node.element) {
      return;
    }

    const top =
      getOffsetTop(node.element) -
      getOffsetTop(this.htmlElement);

    this.scrollHandler.scrollToY(top);
  }

  public selectCurrentNode(mustSetFocus: boolean): void {
    const node = this.getSelectedNode();
    if (node) {
      const nodeElement = this.getNodeElementForNode(node);
      nodeElement.select(mustSetFocus);
    }
  }

  public selectNode(
    node: Node | null,
    optionsParam?: SelectNodeOptions,
  ): void {
    const saveState = (): void => {
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
    const defaultOptions = { mustSetFocus: true, mustToggle: true };
    const selectOptions = { ...defaultOptions, ...(optionsParam ?? {}) };

    const canSelect = (): boolean => {
      if (this.options.onCanSelectNode) {
        return (
          this.options.selectable &&
          this.options.onCanSelectNode(node)
        );
      } else {
        return this.options.selectable;
      }
    };

    if (!canSelect()) {
      return;
    }

    if (this.selectNodeHandler.isNodeSelected(node)) {
      if (selectOptions.mustToggle) {
        this.deselectCurrentNode();
        this.triggerEvent("tree.select", {
          node: null,
          previous_node: node,
        });
      }
    } else {
      const deselectedNode = this.getSelectedNode() || null;
      this.deselectCurrentNode();
      this.addToSelection(node, selectOptions.mustSetFocus);

      this.triggerEvent("tree.select", {
        deselected_node: deselectedNode,
        node,
      });
      this.openParents(node);
    }

    saveState();
  }

  // Set initial state, either by restoring the state or auto-opening nodes
  // result: must load nodes on demand?
  public setInitialState(): boolean {
    const restoreState = (): [boolean, boolean] => {
      // result: is state restored, must load on demand?
      if (!this.options.saveState) {
        return [false, false];
      } else {
        const state = this.saveStateHandler.getStateFromStorage();

        if (!state) {
          return [false, false];
        } else {
          const mustLoadOnDemand =
            this.saveStateHandler.setInitialState(state);

          // return true: the state is restored
          return [true, mustLoadOnDemand];
        }
      }
    };

    const autoOpenNodes = (): boolean => {
      // result: must load on demand?
      if (this.options.autoOpen === false) {
        return false;
      }

      const maxLevel = this.getAutoOpenMaxLevel();
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
  public setInitialStateOnDemand(cbFinished: () => void): void {
    const restoreState = (): boolean => {
      if (!this.options.saveState) {
        return false;
      } else {
        const state = this.saveStateHandler.getStateFromStorage();

        if (!state) {
          return false;
        } else {
          this.saveStateHandler.setInitialStateOnDemand(
            state,
            cbFinished,
          );

          return true;
        }
      }
    };

    const autoOpenNodes = (): void => {
      const maxLevel = this.getAutoOpenMaxLevel();
      let loadingCount = 0;

      const loadAndOpenNode = (node: Node): void => {
        loadingCount += 1;
        this.openNodeInternal(node, false, () => {
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
            this.openNodeInternal(node, false);

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
  public setNodeElement(element: HTMLElement, node: Node) {
    this.nodeMap.set(element, node);
  }

  public setOption(option: string, value: unknown) {
    (this.options as unknown as Record<string, unknown>)[option] = value;
  }

  public setState(state: SavedState) {
    this.saveStateHandler.setInitialState(state);
    this.refreshElements(null);
  }

  public toggle(node: Node, slideParam: boolean | null = null) {
    const slide = slideParam ?? this.options.slide;

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

  public triggerEvent(eventName: string, values?: Record<string, unknown>): boolean {
    return this._triggerEventProvider(this.htmlElement, eventName, values)
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

    this.refreshElements(node);
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
    } = this.options;

    const closeNode = this.closeNode.bind(this);
    const getNodeElement = this.getNodeElement.bind(this);
    const getNodeElementForNode = this.getNodeElementForNode.bind(this);
    const getNodeById = this.getNodeById.bind(this);
    const getSelectedNode = this.getSelectedNode.bind(this);
    const getTree = this.getTree.bind(this);
    const isFocusOnTree = this.isFocusOnTree.bind(this);
    const loadData = this.loadData.bind(this);
    const openNode = this.openNodeInternal.bind(this);
    const refreshElements = this.refreshElements.bind(this);
    const refreshHitAreas = this.refreshHitAreas.bind(this);
    const selectNode = this.selectNode.bind(this);
    const setNodeElement = this.setNodeElement.bind(this);
    const treeElement = this.htmlElement;
    const triggerEvent = this.triggerEvent.bind(this);

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
    const getMouseDelay = () => this.options.startDndDelay ?? 0;

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
    const onMouseCapture = this.mouseCapture.bind(this);
    const onMouseDrag = this.mouseDrag.bind(this);
    const onMouseStart = this.mouseStart.bind(this);
    const onMouseStop = this.mouseStop.bind(this);

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
      useContextMenu: this.options.useContextMenu,
    });

    this.dataLoader = dataLoader;
    this.dndHandler = dndHandler;
    this.keyHandler = keyHandler;
    this.mouseHandler = mouseHandler;
    this.renderer = renderer;
    this.saveStateHandler = saveStateHandler;
    this.scrollHandler = scrollHandler;
    this.selectNodeHandler = selectNodeHandler;
  }
}