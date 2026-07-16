import type { HandleFinishedLoading } from "./dataLoader";
import type { OnFinishOpenNode } from "./jqtreeMethodTypes";
import type { JQTreeOptions } from "./jqtreeOptions";
import type { PositionInfo } from "./mouseUtils";
import type { Position } from "./node";
import type { SavedState } from "./saveStateHandler";

import DataLoader from "./dataLoader";
import { DragAndDropHandler } from "./dragAndDropHandler";
import ElementsRenderer from "./elementsRenderer";
import HtmlTree from "./htmlTree";
import KeyHandler from "./keyHandler";
import MouseHandler from "./mouseHandler";
import { Node } from "./node";
import NodeElement from "./nodeElement";
import FolderElement from "./nodeElement/folderElement";
import { getOffsetTop } from "./positionUtils";
import RequestUrl from "./requestUrl";
import SaveStateHandler from "./saveStateHandler";
import ScrollHandler from "./scrollHandler";
import SimpleWidget from "./simple.widget";
import __version__ from "./version";

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
    private dataLoader: DataLoader;
    private dndHandler: DragAndDropHandler;
    private element: JQuery;
    private htmlTree: HtmlTree;

    private keyHandler: KeyHandler;
    private mouseHandler: MouseHandler;
    private renderer: ElementsRenderer;
    private saveStateHandler: SaveStateHandler;
    private scrollHandler: ScrollHandler;

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

        const newNode = existingNode.addParent(newNodeInfo);

        if (newNode) {
            this.refreshElements(newNode.parent);
        }

        return newNode;
    }

    public addToSelection(node?: Node, mustSetFocus?: boolean): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this.htmlTree.selectNodeHandler.addToSelection(node);
        this.openParents(node);

        this.getNodeElementForNode(node).select(mustSetFocus ?? true);

        this.saveState();

        return this.element;
    }

    public appendNode(newNodeInfo: NodeData, parentNodeParam?: Node): Node {
        const parentNode = parentNodeParam ?? this.htmlTree.tree;

        const node = parentNode.append(newNodeInfo);

        this.refreshElements(parentNode);

        return node;
    }

    public closeNode(node?: Node, slideParam?: boolean | null): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const slide = slideParam ?? this.htmlTree.options.slide;

        if (node.isFolder() || node.isEmptyFolder) {
            this.createFolderElement(node).close(
                slide,
                this.htmlTree.options.animationSpeed,
            );

            this.saveState();
        }

        return this.element;
    }

    public deinit(): void {
        this.element.empty();
        this.element.off();

        this.keyHandler.deinit();
        this.mouseHandler.deinit();

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
        return this.htmlTree.selectNodeHandler.getSelectedNode();
    }

    public getSelectedNodes(): Node[] {
        return this.htmlTree.selectNodeHandler.getSelectedNodes();
    }

    public getState(): null | SavedState {
        return this.saveStateHandler.getState();
    }

    public getStateFromStorage(): null | SavedState {
        return this.saveStateHandler.getStateFromStorage();
    }

    public getTree(): Node {
        return this.htmlTree.tree;
    }

    public getVersion(): string {
        return __version__;
    }

    public init(): void {
        super.init();

        this.element = this.$el;

        const htmlElement = this.$el.get(0) as HTMLElement;
        const getNodeIdToBeSelected = this.getNodeIdToBeSelected.bind(this);
        const refreshElements = this.refreshElements.bind(this);

        this.htmlTree = new HtmlTree(
            {
                getNodeIdToBeSelected,
                htmlElement,
                options: this.inputOptions,
                overrideTriggerEventProvider: triggerJQueryEvent,
                refreshElements,
            }
        );

        this.connectHandlers();

        this.initData();
    }

    public isDragging(): boolean {
        return this.dndHandler.isDragging;
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
            this.doLoadDataFromUrl(
                param1,
                param2 as Node | null,
                param3 ?? null,
            );
        } else {
            // first parameter is not url
            this.doLoadDataFromUrl(
                null,
                param1,
                param2 as HandleFinishedLoading | null,
            );
        }

        return this.element;
    }

    public moveDown(): JQuery {
        const selectedNode = this.getSelectedNode();
        if (selectedNode) {
            this.keyHandler.moveDown(selectedNode);
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
        const selectedNode = this.getSelectedNode();
        if (selectedNode) {
            this.keyHandler.moveUp(selectedNode);
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

            slide ??= this.htmlTree.options.slide;

            return [slide, onFinished];
        };

        const [slide, onFinished] = parseParams();

        this.openNodeInternal(node, slide, onFinished);
        return this.element;
    }

    public prependNode(newNodeInfo: NodeData, parentNodeParam?: Node): Node {
        const parentNode = parentNodeParam ?? this.htmlTree.tree;

        return this.htmlTree.prependNode(newNodeInfo, parentNode);
    }

    public refresh(): JQuery {
        this.refreshElements(null);
        return this.element;
    }

    public refreshHitAreas(): JQuery {
        this.dndHandler.refresh();
        return this.element;
    }

    public reload(onFinished: HandleFinishedLoading | null): JQuery {
        this.doLoadDataFromUrl(null, null, onFinished);
        return this.element;
    }

    public removeFromSelection(node?: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this.htmlTree.selectNodeHandler.removeFromSelection(node);

        this.getNodeElementForNode(node).deselect();
        this.saveState();

        return this.element;
    }

    public removeNode(node?: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!node.parent) {
            throw Error("Node has no parent");
        }

        this.htmlTree.selectNodeHandler.removeFromSelection(node, true); // including children

        const parent = node.parent;
        node.remove();
        this.refreshElements(parent);

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

        this.scrollHandler.scrollToY(top);

        return this.element;
    }

    public selectNode(
        node: Node | null,
        optionsParam?: SelectNodeOptions,
    ): JQuery {
        this.doSelectNode(node, optionsParam);
        return this.element;
    }

    public setOption(option: string, value: unknown): JQuery {
        (this.htmlTree.options as unknown as Record<string, unknown>)[option] = value;
        return this.element;
    }

    public setState(state?: SavedState): JQuery {
        if (state) {
            this.saveStateHandler.setInitialState(state);
            this.refreshElements(null);
        }

        return this.element;
    }

    public toggle(node?: Node, slideParam: boolean | null = null): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const slide = slideParam ?? this.htmlTree.options.slide;

        if (node.is_open) {
            this.closeNode(node, slide);
        } else {
            this.openNode(node, slide);
        }

        return this.element;
    }

    public toJson(): string {
        return JSON.stringify(this.htmlTree.tree.getData());
    }

    public updateNode(node?: Node, data?: NodeData): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!data) {
            return this.element;
        }

        const idIsChanged =
            typeof data === "object" && data.id && data.id !== node.id;

        if (idIsChanged) {
            this.htmlTree.tree.removeNodeFromIndex(node);
        }

        node.setData(data);

        if (idIsChanged) {
            this.htmlTree.tree.addNodeToIndex(node);
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

        return this.element;
    }

    private connectHandlers() {
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
        } = this.htmlTree.options;

        const closeNode = this.closeNode.bind(this);
        const getNodeElement = this.getNodeElement.bind(this);
        const getNodeElementForNode = this.getNodeElementForNode.bind(this);
        const getNodeById = this.htmlTree.getNodeById.bind(this.htmlTree);
        const getSelectedNode = this.getSelectedNode.bind(this);
        const getTree = this.getTree.bind(this);
        const isFocusOnTree = this.htmlTree.isFocusOnTree.bind(this.htmlTree);
        const loadData = this.loadData.bind(this);
        const openNode = this.openNodeInternal.bind(this);
        const refreshElements = this.refreshElements.bind(this);
        const refreshHitAreas = this.refreshHitAreas.bind(this);
        const selectNode = this.selectNode.bind(this);
        const setNodeElement = this.htmlTree.setNodeElement.bind(this.htmlTree);
        const treeElement = this.element.get(0) as HTMLElement;
        const triggerEvent = this.htmlTree.triggerEvent.bind(this.htmlTree);
        const selectNodeHandler = this.htmlTree.selectNodeHandler;

        const addToSelection =
            selectNodeHandler.addToSelection.bind(selectNodeHandler);
        const getSelectedNodes =
            selectNodeHandler.getSelectedNodes.bind(selectNodeHandler);
        const isNodeSelected =
            selectNodeHandler.isNodeSelected.bind(selectNodeHandler);
        const removeFromSelection =
            selectNodeHandler.removeFromSelection.bind(selectNodeHandler);
        const getMouseDelay = () => this.htmlTree.options.startDndDelay ?? 0;

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

        const getNode = this.htmlTree.getNode.bind(this.htmlTree);
        const onMouseCapture = this.mouseCapture.bind(this);
        const onMouseDrag = this.mouseDrag.bind(this);
        const onMouseStart = this.mouseStart.bind(this);
        const onMouseStop = this.mouseStop.bind(this);

        const mouseHandler = new MouseHandler({
            element: treeElement,
            getMouseDelay,
            getNode,
            onClickButton: this.toggle.bind(this),
            onClickTitle: this.doSelectNode.bind(this),
            onMouseCapture,
            onMouseDrag,
            onMouseStart,
            onMouseStop,
            triggerEvent,
            useContextMenu: this.htmlTree.options.useContextMenu,
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

    private createFolderElement(node: Node) {
        const closedIconElement = this.renderer.closedIconElement;
        const getScrollLeft = this.scrollHandler.getScrollLeft.bind(
            this.scrollHandler,
        );
        const openedIconElement = this.renderer.openedIconElement;
        const tabIndex = this.htmlTree.options.tabIndex;
        const treeElement = this.element.get(0) as HTMLElement;
        const triggerEvent = this.htmlTree.triggerEvent.bind(this.htmlTree);

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

    private createNodeElement(node: Node) {
        const getScrollLeft = this.scrollHandler.getScrollLeft.bind(
            this.scrollHandler,
        );
        const tabIndex = this.htmlTree.options.tabIndex;
        const treeElement = this.element.get(0) as HTMLElement;

        return new NodeElement({
            getScrollLeft,
            node,
            tabIndex,
            treeElement,
        });
    }

    private deselectCurrentNode(): void {
        const node = this.getSelectedNode();
        if (node) {
            this.removeFromSelection(node);
        }
    }

    private deselectNodes(parentNode: Node): void {
        const selectedNodesUnderParent =
            this.htmlTree.selectNodeHandler.getSelectedNodesUnder(parentNode);
        for (const n of selectedNodesUnderParent) {
            this.htmlTree.selectNodeHandler.removeFromSelection(n);
        }
    }

    private doLoadData(data: NodeData[] | null, parentNode: Node | null): void {
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

        this.htmlTree.triggerEvent("tree.load_data", {
            parent_node: parentNode,
            tree_data: data,
        });
    }

    private doLoadDataFromUrl(
        inputUrl: null | string,
        parentNode: Node | null,
        onFinished: HandleFinishedLoading | null,
    ): void {
        const url = inputUrl ? new RequestUrl(inputUrl) : this.htmlTree.createRequestUrl(parentNode);

        if (url) {
            this.dataLoader.loadFromUrl(url, parentNode, onFinished);
        }
    }

    private doSelectNode(
        node: Node | null,
        optionsParam?: SelectNodeOptions,
    ): void {
        const saveState = (): void => {
            if (this.htmlTree.options.saveState) {
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
            if (this.htmlTree.options.onCanSelectNode) {
                return (
                    this.htmlTree.options.selectable &&
                    this.htmlTree.options.onCanSelectNode(node)
                );
            } else {
                return this.htmlTree.options.selectable;
            }
        };

        if (!canSelect()) {
            return;
        }

        if (this.htmlTree.selectNodeHandler.isNodeSelected(node)) {
            if (selectOptions.mustToggle) {
                this.deselectCurrentNode();
                this.htmlTree.triggerEvent("tree.select", {
                    node: null,
                    previous_node: node,
                });
            }
        } else {
            const deselectedNode = this.getSelectedNode() || null;
            this.deselectCurrentNode();
            this.addToSelection(node, selectOptions.mustSetFocus);

            this.htmlTree.triggerEvent("tree.select", {
                deselected_node: deselectedNode,
                node,
            });
            this.openParents(node);
        }

        saveState();
    }

    private getAutoOpenMaxLevel(): number {
        if (this.htmlTree.options.autoOpen === true) {
            return -1;
        } else if (typeof this.htmlTree.options.autoOpen === "number") {
            return this.htmlTree.options.autoOpen;
        } else if (typeof this.htmlTree.options.autoOpen === "string") {
            return parseInt(this.htmlTree.options.autoOpen, 10);
        } else {
            return 0;
        }
    }

    private getNodeElement(element: HTMLElement): NodeElement | null {
        const node = this.htmlTree.getNode(element);
        if (node) {
            return this.getNodeElementForNode(node);
        } else {
            return null;
        }
    }

    private getNodeElementForNode(node: Node): NodeElement {
        if (node.isFolder()) {
            return this.createFolderElement(node);
        } else {
            return this.createNodeElement(node);
        }
    }

    private getNodeIdToBeSelected(): NodeId | null {
        if (this.htmlTree.options.saveState) {
            return this.saveStateHandler.getNodeIdToBeSelected();
        } else {
            return null;
        }
    }

    private initData(): void {
        if (this.htmlTree.options.data) {
            this.doLoadData(this.htmlTree.options.data, null);
        } else {
            const dataUrl = this.htmlTree.createRequestUrl(null);

            if (dataUrl) {
                this.doLoadDataFromUrl(null, null, null);
            } else {
                this.doLoadData([], null);
            }
        }
    }

    private initTree(data: NodeData[]): void {
        const doInit = (): void => {
            if (!this.isInitialized) {
                this.isInitialized = true;
                this.htmlTree.triggerEvent("tree.init");
            }
        };

        this.htmlTree.tree = new this.htmlTree.options.nodeClass(
            null,
            true,
            this.htmlTree.options.nodeClass,
        );

        this.htmlTree.selectNodeHandler.clear();

        this.htmlTree.tree.loadFromData(data);

        const mustLoadOnDemand = this.setInitialState();

        this.refreshElements(null);

        if (!mustLoadOnDemand) {
            doInit();
        } else {
            // Load data on demand and then init the tree
            this.setInitialStateOnDemand(doInit);
        }
    }

    private isSelectedNodeInSubtree(subtree: Node): boolean {
        const selectedNode = this.getSelectedNode();

        if (!selectedNode) {
            return false;
        } else {
            return subtree === selectedNode || subtree.isParentOf(selectedNode);
        }
    }

    private loadFolderOnDemand(
        node: Node,
        slide = true,
        onFinished?: OnFinishOpenNode,
    ): void {
        node.is_loading = true;

        this.doLoadDataFromUrl(null, node, () => {
            this.openNodeInternal(node, slide, onFinished);
        });
    }

    private loadSubtree(data: NodeData[], parentNode: Node): void {
        parentNode.loadFromData(data);

        parentNode.load_on_demand = false;
        parentNode.is_loading = false;

        this.refreshElements(parentNode);
    }

    private mouseCapture(positionInfo: PositionInfo): boolean | null {
        if (this.htmlTree.options.dragAndDrop) {
            return this.dndHandler.mouseCapture(positionInfo);
        } else {
            return false;
        }
    }

    private mouseDrag(positionInfo: PositionInfo): boolean {
        if (this.htmlTree.options.dragAndDrop) {
            const result = this.dndHandler.mouseDrag(positionInfo);

            this.scrollHandler.checkScrolling(positionInfo);
            return result;
        } else {
            return false;
        }
    }

    private mouseStart(positionInfo: PositionInfo): boolean {
        if (this.htmlTree.options.dragAndDrop) {
            return this.dndHandler.mouseStart(positionInfo);
        } else {
            return false;
        }
    }

    private mouseStop(positionInfo: PositionInfo): boolean {
        if (this.htmlTree.options.dragAndDrop) {
            this.scrollHandler.stopScrolling();
            return this.dndHandler.mouseStop(positionInfo);
        } else {
            return false;
        }
    }

    private openNodeInternal(
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
                this.htmlTree.options.animationSpeed,
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

    private openParents(node: Node) {
        const parent = node.parent;

        if (parent?.parent && !parent.is_open) {
            this.openNode(parent, false);
        }
    }

    /*
    Redraw the tree or part of the tree.
     from_node: redraw this subtree
    */
    private refreshElements(fromNode: Node | null): void {
        const mustSetFocus = this.htmlTree.isFocusOnTree();
        const mustSelect = fromNode
            ? this.isSelectedNodeInSubtree(fromNode)
            : false;

        this.renderer.render(fromNode);

        if (mustSelect) {
            this.selectCurrentNode(mustSetFocus);
        }

        this.htmlTree.triggerEvent("tree.refresh");
    }

    private saveState(): void {
        if (this.htmlTree.options.saveState) {
            this.saveStateHandler.saveState();
        }
    }

    private selectCurrentNode(mustSetFocus: boolean): void {
        const node = this.getSelectedNode();
        if (node) {
            const nodeElement = this.getNodeElementForNode(node);
            nodeElement.select(mustSetFocus);
        }
    }

    // Set initial state, either by restoring the state or auto-opening nodes
    // result: must load nodes on demand?
    private setInitialState(): boolean {
        const restoreState = (): [boolean, boolean] => {
            // result: is state restored, must load on demand?
            if (!this.htmlTree.options.saveState) {
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
            if (this.htmlTree.options.autoOpen === false) {
                return false;
            }

            const maxLevel = this.getAutoOpenMaxLevel();
            let mustLoadOnDemand = false;

            this.htmlTree.tree.iterate((node: Node, level: number) => {
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
    private setInitialStateOnDemand(cbFinished: () => void): void {
        const restoreState = (): boolean => {
            if (!this.htmlTree.options.saveState) {
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
                this.htmlTree.tree.iterate((node: Node, level: number) => {
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
}

SimpleWidget.register(JqTreeWidget, "tree");
