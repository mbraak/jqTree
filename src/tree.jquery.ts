import type { HandleFinishedLoading } from "./dataLoader";
import type { OnFinishOpenNode } from "./jqtreeMethodTypes";
import type { JQTreeOptions } from "./jqtreeOptions";
import type { PositionInfo } from "./mouseUtils";
import type { Position } from "./node";
import type { SavedState } from "./saveStateHandler";

import DataLoader from "./dataLoader";
import { DragAndDropHandler } from "./dragAndDropHandler";
import ElementsRenderer from "./elementsRenderer";
import KeyHandler from "./keyHandler";
import MouseHandler from "./mouseHandler";
import { Node } from "./node";
import NodeElement from "./nodeElement";
import FolderElement from "./nodeElement/folderElement";
import { getOffsetTop } from "./positionUtils";
import SaveStateHandler from "./saveStateHandler";
import ScrollHandler from "./scrollHandler";
import SelectNodeHandler from "./selectNodeHandler";
import SimpleWidget from "./simple.widget";
import __version__ from "./version";

interface SelectNodeOptions {
    mustSetFocus?: boolean;
    mustToggle?: boolean;
}

const NODE_PARAM_IS_EMPTY = "Node parameter is empty";
const PARAM_IS_EMPTY = "Parameter is empty: ";

export class JqTreeWidget extends SimpleWidget<JQTreeOptions> {
    protected static defaults: JQTreeOptions = {
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
        openedIcon: "&#x25bc;",
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

    private _dataLoader: DataLoader;
    private _dndHandler: DragAndDropHandler;
    private _element: JQuery;
    private _htmlElement: HTMLElement;
    private _isInitialized: boolean;
    private _keyHandler: KeyHandler;
    private _mouseHandler: MouseHandler;
    private _renderer: ElementsRenderer;
    private _saveStateHandler: SaveStateHandler;
    private _scrollHandler: ScrollHandler;
    private _selectNodeHandler: SelectNodeHandler;
    private _tree: Node;

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

    public addNodeBefore(
        newNodeInfo: NodeData,
        existingNode?: Node,
    ): Node | null {
        if (!existingNode) {
            throw Error(PARAM_IS_EMPTY + "existingNode");
        }

        const newNode = existingNode.addBefore(newNodeInfo);

        if (newNode) {
            this._refreshElements(existingNode.parent);
        }

        return newNode;
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
            this._refreshElements(newNode.parent);
        }

        return newNode;
    }

    public addToSelection(node?: Node, mustSetFocus?: boolean): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this._selectNodeHandler.addToSelection(node);
        this._openParents(node);

        this._getNodeElementForNode(node).select(mustSetFocus ?? true);

        this._saveState();

        return this._element;
    }

    public appendNode(newNodeInfo: NodeData, parentNodeParam?: Node): Node {
        const parentNode = parentNodeParam ?? this._tree;

        const node = parentNode.append(newNodeInfo);

        this._refreshElements(parentNode);

        return node;
    }

    public closeNode(node?: Node, slideParam?: boolean | null): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const slide = slideParam ?? this.options.slide;

        if (node.isFolder() || node.isEmptyFolder) {
            this._createFolderElement(node).close(
                slide,
                this.options.animationSpeed,
            );

            this._saveState();
        }

        return this._element;
    }

    public deinit(): void {
        this._htmlElement.textContent = "";
        this._element.off();

        this._keyHandler.deinit();
        this._mouseHandler.deinit();

        this._tree = new Node({}, true);

        super.deinit();
    }

    public getNodeByCallback(callback: (node: Node) => boolean): Node | null {
        return this._tree.getNodeByCallback(callback);
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

        return this._getNode(element);
    }

    public getNodeById(nodeId: NodeId): Node | null {
        return this._tree.getNodeById(nodeId);
    }

    public getNodeByName(name: string): Node | null {
        return this._tree.getNodeByName(name);
    }

    public getNodeByNameMustExist(name: string): Node {
        return this._tree.getNodeByNameMustExist(name);
    }

    public getNodesByProperty(key: string, value: unknown): Node[] {
        return this._tree.getNodesByProperty(key, value);
    }

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
        return this._tree;
    }

    public getVersion(): string {
        return __version__;
    }

    public init(): void {
        super.init();

        this._element = this.$el;
        this._htmlElement = this._element.get(0) as HTMLElement;
        this._isInitialized = false;

        this.options.dataUrl ??= this._element.data("url");

        const dataRtl = this._element.data("rtl") as unknown;
        this.options.rtl ??= dataRtl === '' ? true : Boolean(dataRtl);

        this.options.closedIcon ??= this._getDefaultClosedIcon();

        this._connectHandlers();
        this._initData();
    }

    public isDragging(): boolean {
        return this._dndHandler.isDragging;
    }

    public isNodeSelected(node?: Node): boolean {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        return this._selectNodeHandler.isNodeSelected(node);
    }

    public loadData(data: NodeData[], parentNode: Node | null): JQuery {
        this._doLoadData(data, parentNode);
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
            this._doLoadDataFromUrl(
                param1,
                param2 as Node | null,
                param3 ?? null,
            );
        } else {
            // first parameter is not url
            this._doLoadDataFromUrl(
                null,
                param1,
                param2 as HandleFinishedLoading | null,
            );
        }

        return this._element;
    }

    public moveDown(): JQuery {
        const selectedNode = this.getSelectedNode();
        if (selectedNode) {
            this._keyHandler.moveDown(selectedNode);
        }

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

        this._tree.moveNode(node, targetNode, position);
        this._refreshElements(null);

        return this._element;
    }

    public moveUp(): JQuery {
        const selectedNode = this.getSelectedNode();
        if (selectedNode) {
            this._keyHandler.moveUp(selectedNode);
        }

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

        this._openNodeInternal(node, slide, onFinished);
        return this._element;
    }

    public prependNode(newNodeInfo: NodeData, parentNodeParam?: Node): Node {
        const parentNode = parentNodeParam ?? this._tree;

        const node = parentNode.prepend(newNodeInfo);

        this._refreshElements(parentNode);

        return node;
    }

    public refresh(): JQuery {
        this._refreshElements(null);
        return this._element;
    }

    public reload(onFinished: HandleFinishedLoading | null): JQuery {
        this._doLoadDataFromUrl(null, null, onFinished);
        return this._element;
    }

    public removeFromSelection(node?: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this._selectNodeHandler.removeFromSelection(node);

        this._getNodeElementForNode(node).deselect();
        this._saveState();

        return this._element;
    }

    public removeNode(node?: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!node.parent) {
            throw Error("Node has no parent");
        }

        this._selectNodeHandler.removeFromSelection(node, true); // including children

        const parent = node.parent;
        node.remove();
        this._refreshElements(parent);

        return this._element;
    }

    public scrollToNode(node?: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!node.element) {
            return this._element;
        }

        const top =
            getOffsetTop(node.element) -
            getOffsetTop(this._htmlElement);

        this._scrollHandler.scrollToY(top);

        return this._element;
    }

    public selectNode(
        node: Node | null,
        optionsParam?: SelectNodeOptions,
    ): JQuery {
        this._doSelectNode(node, optionsParam);
        return this._element;
    }

    public setOption(option: string, value: unknown): JQuery {
        (this.options as unknown as Record<string, unknown>)[option] = value;
        return this._element;
    }

    public setState(state?: SavedState): JQuery {
        if (state) {
            this._saveStateHandler.setInitialState(state);
            this._refreshElements(null);
        }

        return this._element;
    }

    public toggle(node?: Node, slideParam: boolean | null = null): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const slide = slideParam ?? this.options.slide;

        if (node.is_open) {
            this.closeNode(node, slide);
        } else {
            this.openNode(node, slide);
        }

        return this._element;
    }

    public toJson(): string {
        return JSON.stringify(this._tree.getData());
    }

    public updateNode(node?: Node, data?: NodeData): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!data) {
            return this._element;
        }

        const idIsChanged =
            typeof data === "object" && data.id && data.id !== node.id;

        if (idIsChanged) {
            this._tree.removeNodeFromIndex(node);
        }

        node.setData(data);

        if (idIsChanged) {
            this._tree.addNodeToIndex(node);
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

        return this._element;
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
        const getNodeElement = this._getNodeElement.bind(this);
        const getNodeElementForNode = this._getNodeElementForNode.bind(this);
        const getNodeById = this.getNodeById.bind(this);
        const getSelectedNode = this.getSelectedNode.bind(this);
        const getTree = this.getTree.bind(this);
        const isFocusOnTree = this._isFocusOnTree.bind(this);
        const loadData = this.loadData.bind(this);
        const openNode = this._openNodeInternal.bind(this);
        const refreshElements = this._refreshElements.bind(this);
        const selectNode = this.selectNode.bind(this);
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
        const getMouseDelay = () => this.options.startDndDelay ?? 0;

        const refreshHitAreas = () => {
            dndHandler.refresh();
        }

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
            showEmptyFolder,
            tabIndex,
        });

        const getNode = this._getNode.bind(this);
        const onMouseCapture = this._mouseCapture.bind(this);
        const onMouseDrag = this._mouseDrag.bind(this);
        const onMouseStart = this._mouseStart.bind(this);
        const onMouseStop = this._mouseStop.bind(this);

        const mouseHandler = new MouseHandler({
            element: treeElement,
            getMouseDelay,
            getNode,
            onClickButton: this.toggle.bind(this),
            onClickTitle: this._doSelectNode.bind(this),
            onMouseCapture,
            onMouseDrag,
            onMouseStart,
            onMouseStop,
            triggerEvent,
            useContextMenu: this.options.useContextMenu,
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

    private _createFolderElement(node: Node) {
        const closedIconElement = this._renderer.closedIconElement;
        const getScrollLeft = this._scrollHandler.getScrollLeft.bind(
            this._scrollHandler,
        );
        const openedIconElement = this._renderer.openedIconElement;
        const tabIndex = this.options.tabIndex;
        const triggerEvent = this._triggerEvent.bind(this);

        return new FolderElement({
            closedIconElement,
            getScrollLeft,
            node,
            openedIconElement,
            tabIndex,
            treeElement: this._htmlElement,
            triggerEvent,
        });
    }

    private _createNodeElement(node: Node) {
        const getScrollLeft = this._scrollHandler.getScrollLeft.bind(
            this._scrollHandler,
        );
        const tabIndex = this.options.tabIndex;

        return new NodeElement({
            getScrollLeft,
            node,
            tabIndex,
            treeElement: this._htmlElement
        });
    }

    private _deselectCurrentNode(): void {
        const node = this.getSelectedNode();
        if (node) {
            this.removeFromSelection(node);
        }
    }

    private _deselectNodes(parentNode: Node): void {
        const selectedNodesUnderParent =
            this._selectNodeHandler.getSelectedNodesUnder(parentNode);
        for (const n of selectedNodesUnderParent) {
            this._selectNodeHandler.removeFromSelection(n);
        }
    }

    private _doLoadData(data: NodeData[] | null, parentNode: Node | null): void {
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

    private _doLoadDataFromUrl(
        urlInfoParam: JQuery.AjaxSettings | null | string,
        parentNode: Node | null,
        onFinished: HandleFinishedLoading | null,
    ): void {
        const urlInfo = urlInfoParam ?? this._getDataUrlInfo(parentNode);

        this._dataLoader.loadFromUrl(urlInfo, parentNode, onFinished);
    }

    private _doSelectNode(
        node: Node | null,
        optionsParam?: SelectNodeOptions,
    ): void {
        const saveState = (): void => {
            if (this.options.saveState) {
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

    private _getAutoOpenMaxLevel(): number {
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

    private _getDataUrlInfo(node: Node | null): JQuery.AjaxSettings | null {
        const getUrlFromString = (url: string): JQuery.AjaxSettings => {
            const urlInfo: JQuery.AjaxSettings = { url };

            setUrlInfoData(urlInfo);

            return urlInfo;
        };

        const setUrlInfoData = (urlInfo: JQuery.AjaxSettings): void => {
            if (node?.id) {
                // Load on demand of a subtree; add node parameter
                const data = { node: node.id };
                urlInfo.data = data;
            } else {
                // Add selected_node parameter
                const selectedNodeId = this._getNodeIdToBeSelected();
                if (selectedNodeId) {
                    const data = { selected_node: selectedNodeId };
                    urlInfo.data = data;
                }
            }
        };

        const dataUrl = this.options.dataUrl;
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

    private _getDefaultClosedIcon(): string {
        if (this.options.rtl) {
            // triangle to the left
            return "&#x25c0;";
        } else {
            // triangle to the right
            return "&#x25ba;";
        }
    }

    private _getNode(element: HTMLElement): Node | null {
        const liElement = element.closest("li.jqtree_common");

        if (liElement) {
            return jQuery(liElement).data("node") as Node;
        } else {
            return null;
        }
    }

    private _getNodeElement(element: HTMLElement): NodeElement | null {
        const node = this._getNode(element);
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
        if (this.options.saveState) {
            return this._saveStateHandler.getNodeIdToBeSelected();
        } else {
            return null;
        }
    }

    private _initData(): void {
        if (this.options.data) {
            this._doLoadData(this.options.data, null);
        } else {
            const dataUrl = this._getDataUrlInfo(null);

            if (dataUrl) {
                this._doLoadDataFromUrl(null, null, null);
            } else {
                this._doLoadData([], null);
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

        this._tree = new this.options.nodeClass(
            null,
            true,
            this.options.nodeClass,
        );

        this._selectNodeHandler.clear();

        this._tree.loadFromData(data);

        const mustLoadOnDemand = this._setInitialState();

        this._refreshElements(null);

        if (mustLoadOnDemand) {
            // Load data on demand and then init the tree
            this._setInitialStateOnDemand(doInit);
        } else {
            doInit();
        }
    }

    // Does an element in the tree have the focus?
    private _isFocusOnTree(): boolean {
        const activeElement = document.activeElement;

        if (!activeElement) {
            return false;
        }

        // The keyboard must still work for input elements.
        const tagName = activeElement.tagName;
        if (tagName !== "A" && tagName !== "SPAN") {
            return false;
        }

        const node = this._getNode(activeElement as HTMLElement);
        return node?.tree === this._tree;
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
        slide = true,
        onFinished?: OnFinishOpenNode,
    ): void {
        node.is_loading = true;

        this._doLoadDataFromUrl(null, node, () => {
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
        if (this.options.dragAndDrop) {
            return this._dndHandler.mouseCapture(positionInfo);
        } else {
            return false;
        }
    }

    private _mouseDrag(positionInfo: PositionInfo): boolean {
        if (this.options.dragAndDrop) {
            const result = this._dndHandler.mouseDrag(positionInfo);

            this._scrollHandler.checkScrolling(positionInfo);
            return result;
        } else {
            return false;
        }
    }

    private _mouseStart(positionInfo: PositionInfo): boolean {
        if (this.options.dragAndDrop) {
            return this._dndHandler.mouseStart(positionInfo);
        } else {
            return false;
        }
    }

    private _mouseStop(positionInfo: PositionInfo): boolean {
        if (this.options.dragAndDrop) {
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
                this.options.animationSpeed,
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
        if (this.options.saveState) {
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
            if (!this.options.saveState) {
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
            if (this.options.autoOpen === false) {
                return false;
            }

            const maxLevel = this._getAutoOpenMaxLevel();
            let mustLoadOnDemand = false;

            this._tree.iterate((node: Node, level: number) => {
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
                this._tree.iterate((node: Node, level: number) => {
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

    private _triggerEvent(
        eventName: string,
        values?: Record<string, unknown>,
    ): boolean {
        const event = jQuery.Event(eventName, values);
        this._element.trigger(event);
        return !event.isDefaultPrevented();
    }
}

SimpleWidget.register(JqTreeWidget, "tree");
