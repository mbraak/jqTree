import DataLoader, { HandleFinishedLoading } from "./dataLoader";
import { DragAndDropHandler } from "./dragAndDropHandler";
import ElementsRenderer from "./elementsRenderer";
import { OnFinishOpenNode } from "./jqtreeMethodTypes";
import { JQTreeOptions } from "./jqtreeOptions";
import KeyHandler from "./keyHandler";
import MouseHandler from "./mouseHandler";
import { PositionInfo } from "./mouseUtils";
import { Node, Position } from "./node";
import NodeElement from "./nodeElement";
import FolderElement from "./nodeElement/folderElement";
import SaveStateHandler, { SavedState } from "./saveStateHandler";
import ScrollHandler from "./scrollHandler";
import SelectNodeHandler from "./selectNodeHandler";
import SimpleWidget from "./simple.widget";
import { getOffsetTop, isFunction } from "./util";
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

    private dataLoader: DataLoader;
    private dndHandler: DragAndDropHandler;
    private element: JQuery;

    private isInitialized: boolean;
    private keyHandler: KeyHandler;
    private mouseHandler: MouseHandler;
    private renderer: ElementsRenderer;
    private saveStateHandler: SaveStateHandler;
    private scrollHandler: ScrollHandler;
    private selectNodeHandler: SelectNodeHandler;
    private tree: Node;

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

    public addNodeBefore(
        newNodeInfo: NodeData,
        existingNode?: Node,
    ): Node | null {
        if (!existingNode) {
            throw Error(PARAM_IS_EMPTY + "existingNode");
        }

        const newNode = existingNode.addBefore(newNodeInfo);

        if (newNode) {
            this.refreshElements(existingNode.parent);
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
            this.refreshElements(newNode.parent);
        }

        return newNode;
    }

    public addToSelection(node?: Node, mustSetFocus?: boolean): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this.selectNodeHandler.addToSelection(node);
        this.openParents(node);

        this.getNodeElementForNode(node).select(mustSetFocus ?? true);

        this.saveState();

        return this.element;
    }

    public appendNode(newNodeInfo: NodeData, parentNodeParam?: Node): Node {
        const parentNode = parentNodeParam ?? this.tree;

        const node = parentNode.append(newNodeInfo);

        this.refreshElements(parentNode);

        return node;
    }

    public closeNode(node?: Node, slideParam?: boolean | null): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const slide = slideParam ?? this.options.slide;

        if (node.isFolder() || node.isEmptyFolder) {
            this.createFolderElement(node).close(
                slide,
                this.options.animationSpeed,
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

        this.tree = new Node({}, true);

        super.deinit();
    }

    public getNodeByCallback(callback: (node: Node) => boolean): Node | null {
        return this.tree.getNodeByCallback(callback);
    }

    public getNodeByHtmlElement(
        inputElement: HTMLElement | JQuery,
    ): Node | null {
        const element =
            inputElement instanceof HTMLElement
                ? inputElement
                : inputElement[0];

        if (!element) {
            return null;
        }

        return this.getNode(element);
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
        super.init();

        this.element = this.$el;
        this.isInitialized = false;

        this.options.rtl = this.getRtlOption();

        if (this.options.closedIcon == null) {
            this.options.closedIcon = this.getDefaultClosedIcon();
        }

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

        return this.selectNodeHandler.isNodeSelected(node);
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

        this.tree.moveNode(node, targetNode, position);
        this.refreshElements(null);

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

            if (isFunction(param1)) {
                onFinished = param1 as OnFinishOpenNode;
                slide = null;
            } else {
                slide = param1 as boolean;
                onFinished = param2 as OnFinishOpenNode;
            }

            if (slide == null) {
                slide = this.options.slide;
            }

            return [slide, onFinished];
        };

        const [slide, onFinished] = parseParams();

        this.openNodeInternal(node, slide, onFinished);
        return this.element;
    }

    public prependNode(newNodeInfo: NodeData, parentNodeParam?: Node): Node {
        const parentNode = parentNodeParam ?? this.tree;

        const node = parentNode.prepend(newNodeInfo);

        this.refreshElements(parentNode);

        return node;
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

        this.selectNodeHandler.removeFromSelection(node);

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

        this.selectNodeHandler.removeFromSelection(node, true); // including children

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
        (this.options as unknown as Record<string, unknown>)[option] = value;
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

        const slide = slideParam ?? this.options.slide;

        if (node.is_open) {
            this.closeNode(node, slide);
        } else {
            this.openNode(node, slide);
        }

        return this.element;
    }

    public toJson(): string {
        return JSON.stringify(this.tree.getData());
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
                node.loadFromData(data.children as Node[]);
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
        const $treeElement = this.element;
        const treeElement = this.element.get(0) as HTMLElement;
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
            $element: $treeElement,
            autoEscape,
            buttonLeft,
            closedIcon,
            dragAndDrop,
            getTree,
            isNodeSelected,
            onCreateLi,
            openedIcon,
            rtl,
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
            onClickTitle: this.doSelectNode.bind(this),
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

    private containsElement(element: HTMLElement): boolean {
        const node = this.getNode(element);

        return node != null && node.tree === this.tree;
    }

    private createFolderElement(node: Node) {
        const closedIconElement = this.renderer.closedIconElement;
        const getScrollLeft = this.scrollHandler.getScrollLeft.bind(
            this.scrollHandler,
        );
        const openedIconElement = this.renderer.openedIconElement;
        const tabIndex = this.options.tabIndex;
        const treeElement = this.element.get(0) as HTMLElement;
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

    private createNodeElement(node: Node) {
        const getScrollLeft = this.scrollHandler.getScrollLeft.bind(
            this.scrollHandler,
        );
        const tabIndex = this.options.tabIndex;
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
            this.selectNodeHandler.getSelectedNodesUnder(parentNode);
        for (const n of selectedNodesUnderParent) {
            this.selectNodeHandler.removeFromSelection(n);
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

        this.triggerEvent("tree.load_data", {
            parent_node: parentNode,
            tree_data: data,
        });
    }

    private doLoadDataFromUrl(
        urlInfoParam: JQuery.AjaxSettings | null | string,
        parentNode: Node | null,
        onFinished: HandleFinishedLoading | null,
    ): void {
        const urlInfo = urlInfoParam ?? this.getDataUrlInfo(parentNode);

        this.dataLoader.loadFromUrl(urlInfo, parentNode, onFinished);
    }

    private doSelectNode(
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

    private getAutoOpenMaxLevel(): number {
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

    private getDataUrlInfo(node: Node | null): JQuery.AjaxSettings | null {
        const dataUrl =
            this.options.dataUrl ?? (this.element.data("url") as null | string);

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
                const selectedNodeId = this.getNodeIdToBeSelected();
                if (selectedNodeId) {
                    const data = { selected_node: selectedNodeId };
                    urlInfo.data = data;
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

    private getDefaultClosedIcon(): string {
        if (this.options.rtl) {
            // triangle to the left
            return "&#x25c0;";
        } else {
            // triangle to the right
            return "&#x25ba;";
        }
    }

    private getNode(element: HTMLElement): Node | null {
        const liElement = element.closest("li.jqtree_common");

        if (liElement) {
            return jQuery(liElement).data("node") as Node;
        } else {
            return null;
        }
    }

    private getNodeElement(element: HTMLElement): NodeElement | null {
        const node = this.getNode(element);
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
        if (this.options.saveState) {
            return this.saveStateHandler.getNodeIdToBeSelected();
        } else {
            return null;
        }
    }

    private getRtlOption(): boolean {
        if (this.options.rtl != null) {
            return this.options.rtl;
        } else {
            const dataRtl = this.element.data("rtl") as unknown;

            if (
                dataRtl !== null &&
                dataRtl !== false &&
                dataRtl !== undefined
            ) {
                return true;
            } else {
                return false;
            }
        }
    }

    private initData(): void {
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

    private initTree(data: NodeData[]): void {
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

    private isFocusOnTree(): boolean {
        const activeElement = document.activeElement;

        return Boolean(
            activeElement &&
                activeElement.tagName === "SPAN" &&
                this.containsElement(activeElement as HTMLElement),
        );
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
        if (this.options.dragAndDrop) {
            return this.dndHandler.mouseCapture(positionInfo);
        } else {
            return false;
        }
    }

    private mouseDrag(positionInfo: PositionInfo): boolean {
        if (this.options.dragAndDrop) {
            const result = this.dndHandler.mouseDrag(positionInfo);

            this.scrollHandler.checkScrolling(positionInfo);
            return result;
        } else {
            return false;
        }
    }

    private mouseStart(positionInfo: PositionInfo): boolean {
        if (this.options.dragAndDrop) {
            return this.dndHandler.mouseStart(positionInfo);
        } else {
            return false;
        }
    }

    private mouseStop(positionInfo: PositionInfo): boolean {
        if (this.options.dragAndDrop) {
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

    private saveState(): void {
        if (this.options.saveState) {
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
    private setInitialStateOnDemand(cbFinished: () => void): void {
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

    private triggerEvent(
        eventName: string,
        values?: Record<string, unknown>,
    ): JQuery.Event {
        const event = jQuery.Event(eventName, values);
        this.element.trigger(event);
        return event;
    }
}

SimpleWidget.register(JqTreeWidget, "tree");
