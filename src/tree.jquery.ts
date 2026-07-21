import type { HandleFinishedLoading } from "./dataLoader";
import type { HtmlTreeOptions, IconElement, OnCreateLi } from "./htmlTree/options";
import type { OnFinishOpenNode } from "./jqtreeMethodTypes";
import type { JQTreeIconElement, JQTreeOptions } from "./jqtreeOptions";
import type { Node, Position } from "./node";
import type { SavedState } from "./saveStateHandler";

import HtmlTree from "./htmlTree";
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
    private _element: JQuery;
    private _htmlTree: HtmlTree;

    public addNodeAfter(
        newNodeInfo: NodeData,
        existingNode: Node,
    ): Node | null {
        return this._htmlTree.addNodeAfter(newNodeInfo, existingNode);
    }

    public addNodeBefore(
        newNodeInfo: NodeData,
        existingNode?: Node,
    ): Node | null {
        if (!existingNode) {
            throw Error(PARAM_IS_EMPTY + "existingNode");
        }

        return this._htmlTree.addNodeBefore(newNodeInfo, existingNode);
    }

    public addParentNode(
        newNodeInfo: NodeData,
        existingNode?: Node,
    ): Node | null {
        if (!existingNode) {
            throw Error(PARAM_IS_EMPTY + "existingNode");
        }

        return this._htmlTree.addParentNode(newNodeInfo, existingNode);
    }

    public addToSelection(node?: Node, mustSetFocus?: boolean): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this._htmlTree.addToSelection(node, mustSetFocus);
        return this._element;
    }

    public appendNode(newNodeInfo: NodeData, parentNodeParam?: Node): Node {
        const parentNode = parentNodeParam ?? this._htmlTree.tree;

        return this._htmlTree.appendNode(newNodeInfo, parentNode);
    }

    public closeNode(node?: Node, slideParam?: boolean | null): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this._htmlTree.closeNode(node, slideParam);

        return this._element;
    }

    public deinit(): void {
        this._element.off();
        this._htmlTree.deinit();
        super.deinit();
    }

    public getNodeByCallback(callback: (node: Node) => boolean): Node | null {
        return this._htmlTree.getNodeByCallback(callback);
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

        return this._htmlTree.getNode(element);
    }

    public getNodeById(nodeId: NodeId): Node | null {
        return this._htmlTree.getNodeById(nodeId);
    }

    public getNodeByName(name: string): Node | null {
        return this._htmlTree.getNodeByName(name);
    }

    public getNodeByNameMustExist(name: string): Node {
        return this._htmlTree.getNodeByNameMustExist(name);
    }

    public getNodesByProperty(key: string, value: unknown): Node[] {
        return this._htmlTree.getNodesByProperty(key, value);
    }

    public getSelectedNode(): false | Node {
        return this._htmlTree.getSelectedNode();
    }

    public getSelectedNodes(): Node[] {
        return this._htmlTree.getSelectedNodes();
    }

    public getState(): null | SavedState {
        return this._htmlTree.getState();
    }

    public getStateFromStorage(): null | SavedState {
        return this._htmlTree.getStateFromStorage();
    }

    public getTree(): Node {
        return this._htmlTree.getTree();
    }

    public getVersion(): string {
        return this._htmlTree.getVersion();
    }

    public init(): void {
        super.init();

        this._element = this.$el;
        const htmlElement = this.$el.get(0) as HTMLElement;

        const htmlTree = new HtmlTree(
            {
                htmlElement,
                options: this._transformInputOptions(),
                overrideTriggerEventProvider: triggerJQueryEvent,
            }
        );

        this._htmlTree = htmlTree;
    }

    public isDragging(): boolean {
        return this._htmlTree.isDragging();
    }

    public isNodeSelected(node?: Node): boolean {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        return this._htmlTree.isNodeSelected(node);
    }

    public loadData(data: NodeData[], parentNode: Node | null): JQuery {
        this._htmlTree.loadData(data, parentNode);
        return this._element;
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
            this._htmlTree.loadDataFromUrl(
                param1,
                param2 as Node | null,
                param3 ?? null,
            );
        } else {
            // first parameter is not url
            this._htmlTree.loadDataFromUrl(
                null,
                param1,
                param2 as HandleFinishedLoading | null,
            );
        }

        return this._element;
    }

    public moveDown(): JQuery {
        this._htmlTree.moveDown();

        return this._element;
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

        this._htmlTree.moveNode(node, targetNode, position);

        return this._element;
    }

    public moveUp(): JQuery {
        this._htmlTree.moveUp();
        return this._element;
    }

    public openNode(
        node?: Node,
        param1?: boolean | OnFinishOpenNode,
        param2?: OnFinishOpenNode,
    ): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this._htmlTree.openNode(node, param1, param2);
        return this._element;
    }

    public prependNode(newNodeInfo: NodeData, parentNodeParam?: Node): Node {
        const parentNode = parentNodeParam ?? this._htmlTree.tree;

        return this._htmlTree.prependNode(newNodeInfo, parentNode);
    }

    public refresh(): JQuery {
        this._htmlTree.refreshElements(null);
        return this._element;
    }

    public refreshHitAreas(): JQuery {
        this._htmlTree.refreshHitAreas();
        return this._element;
    }

    public reload(onFinished: HandleFinishedLoading | null): JQuery {
        this._htmlTree.loadDataFromUrl(null, null, onFinished);
        return this._element;
    }

    public removeFromSelection(node?: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this._htmlTree.removeFromSelection(node);
        return this._element;
    }

    public removeNode(node?: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!node.parent) {
            throw Error("Node has no parent");
        }

        this._htmlTree.removeNode(node);
        return this._element;
    }

    public scrollToNode(node?: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this._htmlTree.scrollToNode(node);
        return this._element;
    }

    public selectNode(
        node: Node | null,
        optionsParam?: SelectNodeOptions,
    ): JQuery {
        this._htmlTree.selectNode(node, optionsParam);
        return this._element;
    }

    public setOption(option: string, value: unknown): JQuery {
        this._htmlTree.setOption(option, value);
        return this._element;
    }

    public setState(state?: SavedState): JQuery {
        if (state) {
            this._htmlTree.setState(state);
        }

        return this._element;
    }

    public toggle(node?: Node, slideParam: boolean | null = null): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this._htmlTree.toggle(node, slideParam);
        return this._element;
    }

    public toJson(): string {
        return this._htmlTree.toJson();
    }

    public updateNode(node?: Node, data?: NodeData): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!data) {
            return this._element;
        }

        this._htmlTree.updateNode(node, data);
        return this._element;
    }

    private _transformInputOptions(): Partial<HtmlTreeOptions> {
        function convertToIconElement(jqtreeIconElement: JQTreeIconElement | undefined) {
            if (jqtreeIconElement instanceof jQuery) {
                return (jqtreeIconElement as JQuery).get(0);
            } else {
                return jqtreeIconElement as IconElement;
            }
        }

        const closedIcon = convertToIconElement(this.inputOptions.closedIcon);
        const openedIcon = convertToIconElement(this.inputOptions.openedIcon);

        let onCreateLi: OnCreateLi | undefined = undefined;
        const jqTreeOnCreateLi = this.inputOptions.onCreateLi;

        if (jqTreeOnCreateLi) {
            onCreateLi = (node: Node, el: HTMLElement, isSelected: boolean) => {
                jqTreeOnCreateLi(node, jQuery(el), isSelected);
            };
        }

        return {
            ...this.inputOptions,
            closedIcon,
            onCreateLi,
            openedIcon,
        }
    }
}


SimpleWidget.register(JqTreeWidget, "tree");
