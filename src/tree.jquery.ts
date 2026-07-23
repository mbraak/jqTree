import type { HandleFinishedLoading } from "./dataLoader";
import type { HtmlTreeOptions, IconElement, OnCreateLi, OnIsMoveHandle, OnLoading } from "./htmlTree/options";
import type { OnFinishOpenNode } from "./jqtreeMethodTypes";
import type { JQTreeIconElement, JQTreeOptions } from "./jqtreeOptions";
import type { Node, Position } from "./node";
import type { SavedState } from "./saveStateHandler";

import HtmlTree from "./htmlTree";

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

export class JqTreeWidget {
    [key: string]: unknown;

    private _element: JQuery;
    private _htmlTree: HtmlTree;
    private _inputOptions: Partial<JQTreeOptions>;

    constructor(el: HTMLElement, options: Partial<JQTreeOptions>) {
        this._element = jQuery(el);

        this._inputOptions = options;
    }

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
    }

    public destroy(): void {
        this.deinit();
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
        const htmlElement = this._element.get(0) as HTMLElement;

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

    public loadData(data: NodeData[], parentNode?: Node): JQuery {
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
        param1?: Node | string,
        param2?: HandleFinishedLoading | Node | null,
        param3?: HandleFinishedLoading,
    ): JQuery {
        if (typeof param1 === "string") {
            // first parameter is url
            this._htmlTree.loadDataFromUrl(
                param1,
                param2 as Node | undefined,
                param3,
            );
        } else {
            // first parameter is not url
            this._htmlTree.loadDataFromUrl(
                undefined,
                param1,
                param2 as HandleFinishedLoading | undefined,
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

    public reload(onFinished?: HandleFinishedLoading): JQuery {
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

        const closedIcon = convertToIconElement(this._inputOptions.closedIcon);
        const openedIcon = convertToIconElement(this._inputOptions.openedIcon);

        let onCreateLi: OnCreateLi | undefined = undefined;
        const jqTreeOnCreateLi = this._inputOptions.onCreateLi;

        if (jqTreeOnCreateLi) {
            onCreateLi = (node: Node, el: HTMLElement, isSelected: boolean) => {
                jqTreeOnCreateLi(node, jQuery(el), isSelected);
            };
        }

        let onIsMoveHandle: OnIsMoveHandle | undefined = undefined;
        const jqTreeOnIsMoveHandle = this._inputOptions.onIsMoveHandle;

        if (jqTreeOnIsMoveHandle) {
            onIsMoveHandle = (el: HTMLElement) => jqTreeOnIsMoveHandle(jQuery(el))
        }

        let onLoading: OnLoading | undefined = undefined;
        const jqTreeOnLoading = this._inputOptions.onLoading;

        if (jqTreeOnLoading) {
            onLoading = (isLoading: boolean, node: Node | null, element: HTMLElement) => {
                jqTreeOnLoading(isLoading, node, jQuery(element))
            }
        }

        return {
            ...this._inputOptions,
            closedIcon,
            onCreateLi,
            onIsMoveHandle,
            onLoading,
            openedIcon,
        }
    }
}

const register = (): void => {
    const getWidgetData = (
        el: HTMLElement,
        dataKey: string,
    ): JqTreeWidget | null => {
        const widget = jQuery.data(el, dataKey) as unknown;

        if (widget && widget instanceof JqTreeWidget) {
            return widget;
        } else {
            return null;
        }
    };

    const createWidget = ($el: JQuery, options: null | Partial<JQTreeOptions>): JQuery => {
        for (const el of $el.get()) {
            const existingWidget = getWidgetData(el, "jqtree");

            if (!existingWidget) {
                const widget = new JqTreeWidget(el, options ?? {});

                if (!jQuery.data(el, "jqtree")) {
                    jQuery.data(el, "jqtree", widget);
                }

                // Call init after setting data, so we can call methods
                widget.init();
            }
        }

        return $el;
    };

    const destroyWidget = ($el: JQuery): void => {
        for (const el of $el.get()) {
            const widget = getWidgetData(el, "jqtree");

            if (widget) {
                widget.destroy();
            }

            jQuery.removeData(el, "jqtree");
        }
    };

    const callFunction = (
        $el: JQuery,
        functionName: string,
        args: unknown[],
    ): unknown => {
        let result = null;

        for (const el of $el.get()) {
            const widget = jQuery.data(el, "jqtree") as unknown;

            if (widget && widget instanceof JqTreeWidget) {
                const widgetFunction = widget[functionName];

                if (widgetFunction && typeof widgetFunction === "function") {
                    result = widgetFunction.apply(widget, args) as unknown;
                }
            }
        }

        return result;
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (jQuery.fn as any).tree = function (
        this: JQuery,
        argument1: unknown,
        ...args: unknown[]
    ) {
        if (!argument1) {
            return createWidget(this, null);
        } else if (typeof argument1 === "object") {
            const options = argument1 as unknown;
            return createWidget(this, options as JQTreeOptions);
        } else if (typeof argument1 === "string" && argument1[0] !== "_") {
            const functionName = argument1;

            if (argument1 === "destroy") {
                destroyWidget(this);
                return undefined;
            } else {
                return callFunction(this, functionName, args);
            }
        } else {
            return undefined;
        }
    };
};

register();
