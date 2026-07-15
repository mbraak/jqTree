import type { JQTreeOptions } from "./jqtreeOptions";

import setDefaultOptions from "./htmlTree/setDefaultOptions";
import triggerCustomEvent from "./htmlTree/triggerCustomEvent";
import { Node } from "./node";
import SelectNodeHandler from "./selectNodeHandler";

export type TriggerEventProvider = (element: HTMLElement, eventName: string, values?: Record<string, unknown>) => boolean;

export default class HtmlTree {
  public htmlElement: HTMLElement;
  public isInitialized: boolean;
  public nodeMap: WeakMap<HTMLElement, Node>;
  public options: JQTreeOptions;
  public selectNodeHandler: SelectNodeHandler;
  public tree: Node;

  private triggerEventProvider: TriggerEventProvider;

  constructor(htmlElement: HTMLElement, options: Partial<JQTreeOptions>, overrideTriggerEventProvider?: TriggerEventProvider) {
    this.htmlElement = htmlElement;
    this.options = setDefaultOptions(htmlElement, options);
    this.triggerEventProvider = overrideTriggerEventProvider ?? triggerCustomEvent;

    this.isInitialized = false;
    this.tree = new Node({}, true);
    this.nodeMap = new WeakMap();

    this.connectHandlers();
  }

  // Is this HTML element part of the tree?
  public containsElement(element: HTMLElement): boolean {
    const node = this.getNode(element);

    return node?.tree === this.tree;
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

  // Does an HTML element of the tree have the focus?
  public isFocusOnTree(): boolean {
    const activeElement = document.activeElement;

    return activeElement?.tagName === "SPAN" && this.containsElement(activeElement as HTMLElement);
  }

  // Set this HTML element to this node in the node map.
  public setNodeElement(element: HTMLElement, node: Node) {
    this.nodeMap.set(element, node);
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