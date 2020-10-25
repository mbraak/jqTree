import __version__ from "./version";
import * as jQueryProxy from "jquery";
import { DragAndDropHandler } from "./dragAndDropHandler";
import ElementsRenderer from "./elementsRenderer";
import DataLoader, { HandleFinishedLoading } from "./dataLoader";
import KeyHandler from "./keyHandler";
import MouseWidget from "./mouse.widget";
import { PositionInfo } from "./types";
import SaveStateHandler from "./saveStateHandler";
import ScrollHandler from "./scrollHandler";
import SelectNodeHandler from "./selectNodeHandler";
import SimpleWidget from "./simple.widget";
import { Node, NodeId, getPosition, NodeData } from "./node";
import { isFunction } from "./util";
import { FolderElement, NodeElement, OnFinishOpenNode } from "./nodeElement";
import { JQTreeOptions } from "./jqtreeOptions";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const jQuery: JQueryStatic = (<any>jQueryProxy).default || jQueryProxy;

interface ClickTarget {
    node: Node;
    type: "button" | "label";
}

interface SelectNodeOptions {
    mustToggle?: boolean;
    mustSetFocus?: boolean;
}

const NODE_PARAM_IS_EMPTY = "Node parameter is empty";
const PARAM_IS_EMPTY = "Parameter is empty: ";

export class JqTreeWidget extends MouseWidget<JQTreeOptions> {
    protected static defaults: JQTreeOptions = {
        animationSpeed: "fast",
        autoOpen: false, // true / false / int (open n levels starting at 0)
        saveState: false, // true / false / string (cookie name)
        dragAndDrop: false,
        selectable: true,
        useContextMenu: true,
        onCanSelectNode: undefined,
        onSetStateFromStorage: undefined,
        onGetStateFromStorage: undefined,
        onCreateLi: undefined,
        onIsMoveHandle: undefined,

        // Can this node be moved?
        onCanMove: undefined,

        // Can this node be moved to this position? function(moved_node, target_node, position)
        onCanMoveTo: undefined,
        onLoadFailed: undefined,
        autoEscape: true,
        dataUrl: undefined,

        // The symbol to use for a closed node - ► BLACK RIGHT-POINTING POINTER
        // http://www.fileformat.info/info/unicode/char/25ba/index.htm
        closedIcon: undefined,

        // The symbol to use for an open node - ▼ BLACK DOWN-POINTING TRIANGLE
        // http://www.fileformat.info/info/unicode/char/25bc/index.htm
        openedIcon: "&#x25bc;",
        slide: true, // must display slide animation?
        nodeClass: Node,
        dataFilter: undefined,
        keyboardSupport: true,
        openFolderDelay: 500, // The delay for opening a folder during drag and drop; the value is in milliseconds
        rtl: undefined, // right-to-left support; true / false (default)
        onDragMove: undefined,
        onDragStop: undefined,
        buttonLeft: true,
        onLoading: undefined,
        showEmptyFolder: false,
        tabIndex: 0,
    };

    public element: JQuery;
    public tree: Node;
    public dndHandler: DragAndDropHandler;
    public renderer: ElementsRenderer;
    public dataLoader: DataLoader;
    public scrollHandler: ScrollHandler;
    public selectNodeHandler: SelectNodeHandler;

    private isInitialized: boolean;
    private saveStateHandler: SaveStateHandler;
    private keyHandler: KeyHandler;

    public toggle(node: Node, slideParam: null | boolean = null): JQuery {
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

    public getTree(): Node {
        return this.tree;
    }

    public selectNode(
        node: Node | null,
        optionsParam?: SelectNodeOptions
    ): JQuery {
        this.doSelectNode(node, optionsParam);
        return this.element;
    }

    public getSelectedNode(): Node | false {
        return this.selectNodeHandler.getSelectedNode();
    }

    public toJson(): string {
        return JSON.stringify(this.tree.getData());
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
        param1: string | null | Node,
        param2?: Node | null | HandleFinishedLoading,
        param3?: HandleFinishedLoading
    ): JQuery {
        if (typeof param1 === "string") {
            // first parameter is url
            this.doLoadDataFromUrl(
                param1,
                param2 as Node | null,
                param3 ?? null
            );
        } else {
            // first parameter is not url
            this.doLoadDataFromUrl(
                null,
                param1,
                param2 as HandleFinishedLoading | null
            );
        }

        return this.element;
    }

    public reload(onFinished: HandleFinishedLoading | null): JQuery {
        this.doLoadDataFromUrl(null, null, onFinished);
        return this.element;
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

    public getNodeByHtmlElement(
        element: HTMLElement | JQuery<HTMLElement>
    ): Node | null {
        return this.getNode(jQuery(element));
    }

    public getNodeByCallback(callback: (node: Node) => boolean): Node | null {
        return this.tree.getNodeByCallback(callback);
    }

    public openNode(
        node: Node,
        param1?: boolean | OnFinishOpenNode,
        param2?: OnFinishOpenNode
    ): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const parseParams = (): [boolean, OnFinishOpenNode | null] => {
            let onFinished: OnFinishOpenNode | null;
            let slide: boolean | null;

            if (isFunction(param1)) {
                onFinished = param1 as OnFinishOpenNode | null;
                slide = null;
            } else {
                slide = param1 as boolean;
                onFinished = param2 as OnFinishOpenNode;
            }

            if (slide == null) {
                slide = this.options.slide ?? false;
            }

            return [slide, onFinished];
        };

        const [slide, onFinished] = parseParams();

        this._openNode(node, slide, onFinished);
        return this.element;
    }

    public closeNode(node: Node, slideParam?: null | boolean): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const slide = slideParam ?? this.options.slide;

        if (node.isFolder() || node.isEmptyFolder) {
            new FolderElement(node, this).close(
                slide,
                this.options.animationSpeed
            );

            this.saveState();
        }

        return this.element;
    }

    public isDragging(): boolean {
        return this.dndHandler.isDragging;
    }

    public refreshHitAreas(): JQuery {
        this.dndHandler.refresh();
        return this.element;
    }

    public addNodeAfter(
        newNodeInfo: NodeData,
        existingNode: Node
    ): Node | null {
        const newNode = existingNode.addAfter(newNodeInfo);

        if (newNode) {
            this._refreshElements(existingNode.parent);
        }

        return newNode;
    }

    public addNodeBefore(
        newNodeInfo: NodeData,
        existingNode: Node
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
        existingNode: Node
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

    public removeNode(node: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!node.parent) {
            throw Error("Node has no parent");
        }

        this.selectNodeHandler.removeFromSelection(node, true); // including children

        const parent = node.parent;
        node.remove();
        this._refreshElements(parent);

        return this.element;
    }

    public appendNode(newNodeInfo: NodeData, parentNodeParam?: Node): Node {
        const parentNode = parentNodeParam || this.tree;

        const node = parentNode.append(newNodeInfo);

        this._refreshElements(parentNode);

        return node;
    }

    public prependNode(newNodeInfo: NodeData, parentNodeParam?: Node): Node {
        const parentNode = parentNodeParam ?? this.tree;

        const node = parentNode.prepend(newNodeInfo);

        this._refreshElements(parentNode);

        return node;
    }

    public updateNode(node: Node, data: NodeData): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
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
            data["children"] &&
            data["children"] instanceof Array
        ) {
            node.removeChildren();

            if (data.children.length) {
                node.loadFromData(data.children);
            }
        }

        const mustSetFocus = this.selectNodeHandler.isFocusOnTree();
        const mustSelect = this.isSelectedNodeInSubtree(node);

        this._refreshElements(node);

        if (mustSelect) {
            this.selectCurrentNode(mustSetFocus);
        }

        return this.element;
    }

    private isSelectedNodeInSubtree(subtree: Node): boolean {
        const selectedNode = this.getSelectedNode();

        if (!selectedNode) {
            return false;
        } else {
            return subtree === selectedNode || subtree.isParentOf(selectedNode);
        }
    }

    public moveNode(node: Node, targetNode: Node, position: string): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!targetNode) {
            throw Error(PARAM_IS_EMPTY + "targetNode");
        }

        const positionIndex = getPosition(position);

        if (positionIndex !== undefined) {
            this.tree.moveNode(node, targetNode, positionIndex);
            this._refreshElements(null);
        }

        return this.element;
    }

    public getStateFromStorage(): SavedState | null {
        return this.saveStateHandler.getStateFromStorage();
    }

    public addToSelection(node: Node, mustSetFocus?: boolean): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this.selectNodeHandler.addToSelection(node);

        this._getNodeElementForNode(node).select(
            mustSetFocus === undefined ? true : mustSetFocus
        );

        this.saveState();

        return this.element;
    }

    public getSelectedNodes(): Node[] {
        return this.selectNodeHandler.getSelectedNodes();
    }

    public isNodeSelected(node: Node): boolean {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        return this.selectNodeHandler.isNodeSelected(node);
    }

    public removeFromSelection(node: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        this.selectNodeHandler.removeFromSelection(node);

        this._getNodeElementForNode(node).deselect();
        this.saveState();

        return this.element;
    }

    public scrollToNode(node: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const nodeOffset = jQuery(node.element).offset();
        const nodeTop = nodeOffset ? nodeOffset.top : 0;

        const treeOffset = this.$el.offset();
        const treeTop = treeOffset ? treeOffset.top : 0;

        const top = nodeTop - treeTop;

        this.scrollHandler.scrollToY(top);

        return this.element;
    }

    public getState(): SavedState | null {
        return this.saveStateHandler.getState();
    }

    public setState(state: SavedState): JQuery {
        this.saveStateHandler.setInitialState(state);
        this._refreshElements(null);

        return this.element;
    }

    public setOption(option: string, value: unknown): JQuery {
        (this.options as Record<string, unknown>)[option] = value;
        return this.element;
    }

    public moveDown(): JQuery {
        const selectedNode = this.getSelectedNode();
        if (selectedNode) {
            this.keyHandler.moveDown(selectedNode);
        }

        return this.element;
    }

    public moveUp(): JQuery {
        const selectedNode = this.getSelectedNode();
        if (selectedNode) {
            this.keyHandler.moveUp(selectedNode);
        }

        return this.element;
    }

    public getVersion(): string {
        return __version__;
    }

    public _triggerEvent(
        eventName: string,
        values?: DefaultRecord
    ): JQuery.Event {
        const event = jQuery.Event(eventName, values);
        this.element.trigger(event);
        return event;
    }

    public _openNode(
        node: Node,
        slide = true,
        onFinished: OnFinishOpenNode | null
    ): void {
        const doOpenNode = (
            _node: Node,
            _slide: any,
            _onFinished: OnFinishOpenNode | null
        ): void => {
            const folderElement = new FolderElement(_node, this);
            folderElement.open(
                _onFinished,
                _slide,
                this.options.animationSpeed
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
                        doOpenNode(parent, false, null);
                    }
                    parent = parent.parent;
                }

                doOpenNode(node, slide, onFinished);
                this.saveState();
            }
        }
    }

    /*
    Redraw the tree or part of the tree.
     from_node: redraw this subtree
    */
    public _refreshElements(fromNode: Node | null): void {
        this.renderer.render(fromNode);

        this._triggerEvent("tree.refresh");
    }

    public _getNodeElementForNode(node: Node): NodeElement {
        if (node.isFolder()) {
            return new FolderElement(node, this);
        } else {
            return new NodeElement(node, this);
        }
    }

    public _getNodeElement($element: JQuery<HTMLElement>): NodeElement | null {
        const node = this.getNode($element);
        if (node) {
            return this._getNodeElementForNode(node);
        } else {
            return null;
        }
    }

    public _containsElement(element: HTMLElement): boolean {
        const node = this.getNode(jQuery(element));

        return node != null && node.tree === this.tree;
    }

    public _getScrollLeft(): number {
        return this.scrollHandler.getScrollLeft();
    }

    public init(): void {
        super.init();

        this.element = this.$el;
        this.mouseDelay = 300;
        this.isInitialized = false;

        this.options.rtl = this.getRtlOption();

        if (this.options.closedIcon == null) {
            this.options.closedIcon = this.getDefaultClosedIcon();
        }

        this.renderer = new ElementsRenderer(this);
        this.dataLoader = new DataLoader(this);
        this.saveStateHandler = new SaveStateHandler(this);
        this.selectNodeHandler = new SelectNodeHandler(this);
        this.dndHandler = new DragAndDropHandler(this);
        this.scrollHandler = new ScrollHandler(this);
        this.keyHandler = new KeyHandler(this);

        this.initData();

        this.element.on("click", this.handleClick);
        this.element.on("dblclick", this.handleDblclick);

        if (this.options.useContextMenu) {
            this.element.on("contextmenu", this.handleContextmenu);
        }
    }

    public deinit(): void {
        this.element.empty();
        this.element.off();

        this.keyHandler.deinit();

        this.tree = new Node({}, true);

        super.deinit();
    }

    protected mouseCapture(positionInfo: PositionInfo): boolean | null {
        if (this.options.dragAndDrop) {
            return this.dndHandler.mouseCapture(positionInfo);
        } else {
            return false;
        }
    }

    protected mouseStart(positionInfo: PositionInfo): boolean {
        if (this.options.dragAndDrop) {
            return this.dndHandler.mouseStart(positionInfo);
        } else {
            return false;
        }
    }

    protected mouseDrag(positionInfo: PositionInfo): boolean {
        if (this.options.dragAndDrop) {
            const result = this.dndHandler.mouseDrag(positionInfo);

            this.scrollHandler.checkScrolling();
            return result;
        } else {
            return false;
        }
    }

    protected mouseStop(positionInfo: PositionInfo): boolean {
        if (this.options.dragAndDrop) {
            return this.dndHandler.mouseStop(positionInfo);
        } else {
            return false;
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

    private getDataUrlInfo(node: Node | null): JQuery.AjaxSettings | null {
        const dataUrl =
            this.options.dataUrl || (this.element.data("url") as string | null);

        const getUrlFromString = (url: string): JQuery.AjaxSettings => {
            const urlInfo: JQuery.AjaxSettings = { url };

            setUrlInfoData(urlInfo);

            return urlInfo;
        };

        const setUrlInfoData = (urlInfo: JQuery.AjaxSettings): void => {
            if (node?.id) {
                // Load on demand of a subtree; add node parameter
                const data = { node: node.id };
                urlInfo["data"] = data;
            } else {
                // Add selected_node parameter
                const selectedNodeId = this.getNodeIdToBeSelected();
                if (selectedNodeId) {
                    const data = { selected_node: selectedNodeId };
                    urlInfo["data"] = data;
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

    private getNodeIdToBeSelected(): NodeId | null {
        if (this.options.saveState) {
            return this.saveStateHandler.getNodeIdToBeSelected();
        } else {
            return null;
        }
    }

    private initTree(data: any): void {
        const doInit = (): void => {
            if (!this.isInitialized) {
                this.isInitialized = true;
                this._triggerEvent("tree.init");
            }
        };

        if (!this.options.nodeClass) {
            return;
        }

        this.tree = new this.options.nodeClass(
            null,
            true,
            this.options.nodeClass
        );

        this.selectNodeHandler.clear();

        this.tree.loadFromData(data);

        const mustLoadOnDemand = this.setInitialState();

        this._refreshElements(null);

        if (!mustLoadOnDemand) {
            doInit();
        } else {
            // Load data on demand and then init the tree
            this.setInitialStateOnDemand(doInit);
        }
    }

    // Set initial state, either by restoring the state or auto-opening nodes
    // result: must load nodes on demand?
    private setInitialState(): boolean {
        const restoreState = (): boolean[] => {
            // result: is state restored, must load on demand?
            if (!this.options.saveState) {
                return [false, false];
            } else {
                const state = this.saveStateHandler.getStateFromStorage();

                if (!state) {
                    return [false, false];
                } else {
                    const mustLoadOnDemand = this.saveStateHandler.setInitialState(
                        state
                    );

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
                        cbFinished
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
                this._openNode(node, false, () => {
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
                        this._openNode(node, false, null);

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

    private handleClick = (e: JQuery.ClickEvent): void => {
        const clickTarget = this.getClickTarget(e.target);

        if (clickTarget) {
            if (clickTarget.type === "button") {
                this.toggle(clickTarget.node, this.options.slide);

                e.preventDefault();
                e.stopPropagation();
            } else if (clickTarget.type === "label") {
                const node = clickTarget.node;
                const event = this._triggerEvent("tree.click", {
                    node,
                    click_event: e,
                });

                if (!event.isDefaultPrevented()) {
                    this.doSelectNode(node);
                }
            }
        }
    };

    private handleDblclick = (e: JQuery.DoubleClickEvent): void => {
        const clickTarget = this.getClickTarget(e.target);

        if (clickTarget?.type === "label") {
            this._triggerEvent("tree.dblclick", {
                node: clickTarget.node,
                click_event: e,
            });
        }
    };

    private getClickTarget(element: EventTarget): ClickTarget | null {
        const $target = jQuery(element);

        const $button = $target.closest(".jqtree-toggler");

        if ($button.length) {
            const node = this.getNode($button as JQuery<HTMLElement>);

            if (node) {
                return {
                    type: "button",
                    node,
                };
            }
        } else {
            const $el = $target.closest(".jqtree-element");
            if ($el.length) {
                const node = this.getNode($el as JQuery<HTMLElement>);
                if (node) {
                    return {
                        type: "label",
                        node,
                    };
                }
            }
        }

        return null;
    }

    private getNode($element: JQuery<HTMLElement>): null | Node {
        const $li = $element.closest("li.jqtree_common");
        if ($li.length === 0) {
            return null;
        } else {
            return $li.data("node") as Node;
        }
    }

    private handleContextmenu = (e: JQuery.ContextMenuEvent) => {
        const $div = jQuery(e.target).closest("ul.jqtree-tree .jqtree-element");
        if ($div.length) {
            const node = this.getNode($div);
            if (node) {
                e.preventDefault();
                e.stopPropagation();

                this._triggerEvent("tree.contextmenu", {
                    node,
                    click_event: e,
                });
                return false;
            }
        }

        return null;
    };

    private saveState(): void {
        if (this.options.saveState) {
            this.saveStateHandler.saveState();
        }
    }

    private selectCurrentNode(mustSetFocus: boolean): void {
        const node = this.getSelectedNode();
        if (node) {
            const nodeElement = this._getNodeElementForNode(node);
            if (nodeElement) {
                nodeElement.select(mustSetFocus);
            }
        }
    }

    private deselectCurrentNode(): void {
        const node = this.getSelectedNode();
        if (node) {
            this.removeFromSelection(node);
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

    private doSelectNode(
        node: Node | null,
        optionsParam?: SelectNodeOptions
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
        const selectOptions = { ...defaultOptions, ...(optionsParam || {}) };

        const canSelect = (): boolean => {
            if (this.options.onCanSelectNode) {
                return (
                    this.options.selectable === true &&
                    this.options.onCanSelectNode(node)
                );
            } else {
                return this.options.selectable === true;
            }
        };

        const openParents = (): void => {
            const parent = node.parent;

            if (parent && parent.parent && !parent.is_open) {
                this.openNode(parent, false);
            }
        };

        if (!canSelect()) {
            return;
        }

        if (this.selectNodeHandler.isNodeSelected(node)) {
            if (selectOptions.mustToggle) {
                this.deselectCurrentNode();
                this._triggerEvent("tree.select", {
                    node: null,
                    previous_node: node,
                });
            }
        } else {
            const deselectedNode = this.getSelectedNode() || null;
            this.deselectCurrentNode();
            this.addToSelection(node, selectOptions.mustSetFocus);

            this._triggerEvent("tree.select", {
                node,
                deselected_node: deselectedNode,
            });
            openParents();
        }

        saveState();
    }

    private doLoadData(data: NodeData[] | null, parentNode: Node | null): void {
        if (!data) {
            return;
        } else {
            this._triggerEvent("tree.load_data", { tree_data: data });

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
    }

    private deselectNodes(parentNode: Node): void {
        const selectedNodesUnderParent = this.selectNodeHandler.getSelectedNodesUnder(
            parentNode
        );
        for (const n of selectedNodesUnderParent) {
            this.selectNodeHandler.removeFromSelection(n);
        }
    }

    private loadSubtree(data: any[], parentNode: Node): void {
        parentNode.loadFromData(data);

        parentNode.load_on_demand = false;
        parentNode.is_loading = false;

        this._refreshElements(parentNode);
    }

    private doLoadDataFromUrl(
        urlInfoParam: string | JQuery.AjaxSettings | null,
        parentNode: Node | null,
        onFinished: HandleFinishedLoading | null
    ): void {
        const urlInfo = urlInfoParam || this.getDataUrlInfo(parentNode);

        this.dataLoader.loadFromUrl(urlInfo, parentNode, onFinished);
    }

    private loadFolderOnDemand(
        node: Node,
        slide = true,
        onFinished: OnFinishOpenNode | null
    ): void {
        node.is_loading = true;

        this.doLoadDataFromUrl(null, node, () => {
            this._openNode(node, slide, onFinished);
        });
    }
}

SimpleWidget.register(JqTreeWidget, "tree");
