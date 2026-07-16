import type { JQTreeOptions } from "./jqtreeOptions";
import type { Position } from "./node";

import setDefaultOptions from "./htmlTree/setDefaultOptions";
import triggerCustomEvent from "./htmlTree/triggerCustomEvent";
import { Node } from "./node";
import RequestUrl from "./requestUrl";
import SelectNodeHandler from "./selectNodeHandler";
import __version__ from "./version";

export type TriggerEventProvider = (element: HTMLElement, eventName: string, values?: Record<string, unknown>) => boolean;

type GetNodeIdToBeSelected = () => NodeId | null;

interface HtmlTreeParams {
  getNodeIdToBeSelected: GetNodeIdToBeSelected;
  htmlElement: HTMLElement;
  options: Partial<JQTreeOptions>,
  overrideTriggerEventProvider?: TriggerEventProvider,
  refreshElements: RefreshElements;
}

type RefreshElements = (fromNode: Node | null) => void;

export default class HtmlTree {
  public htmlElement: HTMLElement;
  public isInitialized: boolean;
  public nodeMap: WeakMap<HTMLElement, Node>;
  public options: JQTreeOptions;
  public selectNodeHandler: SelectNodeHandler;
  public tree: Node;

  private getNodeIdToBeSelected: GetNodeIdToBeSelected;
  private refreshElements: RefreshElements;
  private triggerEventProvider: TriggerEventProvider;

  constructor({ getNodeIdToBeSelected, htmlElement, options, overrideTriggerEventProvider, refreshElements }: HtmlTreeParams) {
    this.getNodeIdToBeSelected = getNodeIdToBeSelected;
    this.htmlElement = htmlElement;
    this.options = setDefaultOptions(htmlElement, options);
    this.refreshElements = refreshElements;
    this.triggerEventProvider = overrideTriggerEventProvider ?? triggerCustomEvent;

    this.isInitialized = false;
    this.tree = new Node({}, true);
    this.nodeMap = new WeakMap();

    this.connectHandlers();
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

  // Add a node as child of another node.
  public appendNode(newNodeInfo: NodeData, parentNode: Node): Node {
    const node = parentNode.append(newNodeInfo);

    this.refreshElements(parentNode);

    return node;
  }

  // Is this HTML element part of the tree?
  public containsElement(element: HTMLElement): boolean {
    const node = this.getNode(element);

    return node?.tree === this.tree;
  }

  /* Create a RequestUrl based on the url in the options.
    * Add a 'node' query parameter for loading on demand
    * Add a 'selected_node' query parameter if a node is selected.
  */
  public createRequestUrl(node: Node | null): null | RequestUrl {
    const dataUrl =
      this.options.dataUrl ?? this.htmlElement.dataset.url;

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

  // Return the tree node for an HTMl element.
  public getNode(element: HTMLElement): Node | null {
    const liElement = element.closest<HTMLElement>("li.jqtree_common");

    if (liElement) {
      return this.nodeMap.get(liElement) ?? null;
    } else {
      return null;
    }
  }

  public getNodeById(nodeId: NodeId): Node | null {
    return this.tree.getNodeById(nodeId);
  }

  public getVersion(): string {
    return __version__;
  }

  // Does an HTML element of the tree have the focus?
  public isFocusOnTree(): boolean {
    const activeElement = document.activeElement;

    return activeElement?.tagName === "SPAN" && this.containsElement(activeElement as HTMLElement);
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

  // Add a node before another node. 
  public prependNode(newNodeInfo: NodeData, parentNode: Node): Node {
    const node = parentNode.prepend(newNodeInfo);

    this.refreshElements(parentNode);

    return node;
  }

  // Set this HTML element to this node in the node map.
  public setNodeElement(element: HTMLElement, node: Node) {
    this.nodeMap.set(element, node);
  }

  public setOption(option: string, value: unknown) {
    (this.options as unknown as Record<string, unknown>)[option] = value;
  }

  public triggerEvent(eventName: string, values?: Record<string, unknown>): boolean {
    return this.triggerEventProvider(this.htmlElement, eventName, values)
  }

  private connectHandlers() {
    const getNodeById = this.getNodeById.bind(this);

    this.selectNodeHandler = new SelectNodeHandler({
      getNodeById,
    });
  }
}