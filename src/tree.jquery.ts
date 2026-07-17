import type { HandleFinishedLoading } from "./dataLoader";
import type { OnFinishOpenNode } from "./jqtreeMethodTypes";
import type { JQTreeOptions } from "./jqtreeOptions";
import type { Position } from "./node";
import type { SavedState } from "./saveStateHandler";

import HtmlTree from "./htmlTree";
import { Node } from "./node";
import { getOffsetTop } from "./positionUtils";
import SimpleWidget from "./simple.widget";

interface SelectNodeOptions {
    mustSetFocus?: boolean;
    mustToggle?: boolean;
}

const NODE_PARAM_IS_EMPTY = "Node parameter is empty";
const PARAM_IS_EMPTY = "Parameter is empty: ";

const triggerJQueryEvent = (
    element: HTMLElement,
    eventName: string,
    values?: Record<string, unknown>,
): boolean => {
    const event = jQuery.Event(eventName, values);
    jQuery(element).trigger(event);
    return !event.isDefaultPrevented();
}

export class JqTreeWidget extends SimpleWidget<JQTreeOptions> {
    private element: JQuery;
    private htmlTree: HtmlTree;

    public addNodeAfter(
        newNodeInfo: NodeData,
        existingNode: Node,
    ): Node | null {
        return this.htmlTree.addNodeAfter(newNodeInfo, existingNode);
    }

    public addNodeBefore(
        newNodeInfo: NodeData,
        existingNode?: Node,
    ): Node | null {
        if (!existingNode) {
            throw Error(PARAM_IS_EMPTY + "existingNode");
        }

        return this.htmlTree.addNodeBefore(newNodeInfo, existingNode);
    }

    public addParentNode(
        newNodeInfo: NodeData,
        existingNode?: Node,
    ): Node | null {
        if (!existingNode) {
            throw Error(PARAM_IS_EMPTY + "existingNode");
        }

        return this.htmlTree.addParentNode(newNodeInfo, existingNode);
    }

    public addToSelection(node?: Node, mustSetFocus?: boolean): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this.htmlTree.addToSelection(node, mustSetFocus);
        return this.element;
    }

    public appendNode(newNodeInfo: NodeData, parentNodeParam?: Node): Node {
        const parentNode = parentNodeParam ?? this.htmlTree.tree;

        return this.htmlTree.appendNode(newNodeInfo, parentNode);
    }

    public closeNode(node?: Node, slideParam?: boolean | null): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this.htmlTree.closeNode(node, slideParam);

        return this.element;
    }

    public deinit(): void {
        this.element.empty();
        this.element.off();

        this.htmlTree.keyHandler.deinit();
        this.htmlTree.mouseHandler.deinit();

        this.htmlTree.tree = new Node({}, true);

        super.deinit();
    }

    public getNodeByCallback(callback: (node: Node) => boolean): Node | null {
        return this.htmlTree.tree.getNodeByCallback(callback);
    }

    public getNodeByHtmlElement(
        inputElement: HTMLElement | JQuery,
    ): Node | null {
        const element =
            inputElement instanceof HTMLElement
                ? inputElement
                : inputElement.get(0);

        if (!element) {
            return null;
        }

        return this.htmlTree.getNode(element);
    }

    public getNodeById(nodeId: NodeId): Node | null {
        return this.htmlTree.getNodeById(nodeId);
    }

    public getNodeByName(name: string): Node | null {
        return this.htmlTree.tree.getNodeByName(name);
    }

    public getNodeByNameMustExist(name: string): Node {
        return this.htmlTree.tree.getNodeByNameMustExist(name);
    }

    public getNodesByProperty(key: string, value: unknown): Node[] {
        return this.htmlTree.tree.getNodesByProperty(key, value);
    }

    public getSelectedNode(): false | Node {
        return this.htmlTree.getSelectedNode();
    }

    public getSelectedNodes(): Node[] {
        return this.htmlTree.selectNodeHandler.getSelectedNodes();
    }

    public getState(): null | SavedState {
        return this.htmlTree.saveStateHandler.getState();
    }

    public getStateFromStorage(): null | SavedState {
        return this.htmlTree.saveStateHandler.getStateFromStorage();
    }

    public getTree(): Node {
        return this.htmlTree.getTree();
    }

    public getVersion(): string {
        return this.htmlTree.getVersion();
    }

    public init(): void {
        super.init();

        this.element = this.$el;

        const htmlElement = this.$el.get(0) as HTMLElement;

        const htmlTree = new HtmlTree(
            {
                htmlElement,
                options: this.inputOptions,
                overrideTriggerEventProvider: triggerJQueryEvent,
            }
        );

        this.htmlTree = htmlTree;
    }

    public isDragging(): boolean {
        return this.htmlTree.isDragging();
    }

    public isNodeSelected(node?: Node): boolean {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        return this.htmlTree.selectNodeHandler.isNodeSelected(node);
    }

    public loadData(data: NodeData[], parentNode: Node | null): JQuery {
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
    public loadDataFromUrl(
        param1: Node | null | string,
        param2?: HandleFinishedLoading | Node | null,
        param3?: HandleFinishedLoading,
    ): JQuery {
        if (typeof param1 === "string") {
            // first parameter is url
            this.htmlTree.doLoadDataFromUrl(
                param1,
                param2 as Node | null,
                param3 ?? null,
            );
        } else {
            // first parameter is not url
            this.htmlTree.doLoadDataFromUrl(
                null,
                param1,
                param2 as HandleFinishedLoading | null,
            );
        }

        return this.element;
    }

    public moveDown(): JQuery {
        const selectedNode = this.htmlTree.getSelectedNode();
        if (selectedNode) {
            this.htmlTree.keyHandler.moveDown(selectedNode);
        }

        return this.element;
    }

    public moveNode(
        node?: Node,
        targetNode?: Node,
        position?: Position,
    ): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!targetNode) {
            throw Error(PARAM_IS_EMPTY + "targetNode");
        }

        if (!position) {
            throw Error(PARAM_IS_EMPTY + "position");
        }

        this.htmlTree.moveNode(node, targetNode, position);

        return this.element;
    }

    public moveUp(): JQuery {
        const selectedNode = this.htmlTree.getSelectedNode();
        if (selectedNode) {
            this.htmlTree.keyHandler.moveUp(selectedNode);
        }

        return this.element;
    }

    public openNode(
        node?: Node,
        param1?: boolean | OnFinishOpenNode,
        param2?: OnFinishOpenNode,
    ): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this.htmlTree.openNode(node, param1, param2);
        return this.element;
    }

    public prependNode(newNodeInfo: NodeData, parentNodeParam?: Node): Node {
        const parentNode = parentNodeParam ?? this.htmlTree.tree;

        return this.htmlTree.prependNode(newNodeInfo, parentNode);
    }

    public refresh(): JQuery {
        this.htmlTree.refreshElements(null);
        return this.element;
    }

    public refreshHitAreas(): JQuery {
        this.htmlTree.refreshHitAreas();
        return this.element;
    }

    public reload(onFinished: HandleFinishedLoading | null): JQuery {
        this.htmlTree.doLoadDataFromUrl(null, null, onFinished);
        return this.element;
    }

    public removeFromSelection(node?: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this.htmlTree.removeFromSelection(node);
        return this.element;
    }

    public removeNode(node?: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!node.parent) {
            throw Error("Node has no parent");
        }

        this.htmlTree.removeNode(node);
        return this.element;
    }

    public scrollToNode(node?: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!node.element) {
            return this.element;
        }

        const top =
            getOffsetTop(node.element) -
            getOffsetTop(this.$el.get(0) as HTMLElement);

        this.htmlTree.scrollHandler.scrollToY(top);

        return this.element;
    }

    public selectNode(
        node: Node | null,
        optionsParam?: SelectNodeOptions,
    ): JQuery {
        this.htmlTree.selectNode(node, optionsParam);
        return this.element;
    }

    public setOption(option: string, value: unknown): JQuery {
        this.htmlTree.setOption(option, value);
        return this.element;
    }

    public setState(state?: SavedState): JQuery {
        if (state) {
            this.htmlTree.saveStateHandler.setInitialState(state);
            this.htmlTree.refreshElements(null);
        }

        return this.element;
    }

    public toggle(node?: Node, slideParam: boolean | null = null): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this.htmlTree.toggle(node, slideParam);
        return this.element;
    }

    public toJson(): string {
        return this.htmlTree.toJson();
    }

    public updateNode(node?: Node, data?: NodeData): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!data) {
            return this.element;
        }

        this.htmlTree.updateNode(node, data);
        return this.element;
    }

    private doLoadData(data: NodeData[] | null, parentNode: Node | null): void {
        this.htmlTree.loadData(data, parentNode);
    }
}

SimpleWidget.register(JqTreeWidget, "tree");
