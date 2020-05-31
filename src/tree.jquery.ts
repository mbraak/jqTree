import __version__ from "./version";
import * as jQuery from "jquery";
import { DragAndDropHandler } from "./dragAndDropHandler";
import ElementsRenderer from "./elementsRenderer";
import DataLoader, { HandleFinishedLoading } from "./dataLoader";
import KeyHandler from "./keyHandler";
import MouseWidget from "./mouse.widget";
import { IPositionInfo } from "./imouseWidget";
import SaveStateHandler from "./saveStateHandler";
import ScrollHandler from "./scrollHandler";
import SelectNodeHandler from "./selectNodeHandler";
import SimpleWidget from "./simple.widget";
import { Node, NodeId, getPosition } from "./node";
import { isFunction } from "./util";
import { FolderElement, NodeElement } from "./nodeElement";
import { INodeElement, IHitArea, OnFinishOpenNode } from "./itreeWidget";

type CanSelectNode = (node: INode) => boolean;
type SetFromStorage = (data: string) => void;
type GetFromStorage = () => any;
type CreateLi = (node: INode, el: JQuery, isSelected: boolean) => void;
type IsMoveHandler = (el: JQuery) => boolean;
type CanMoveNode = CanSelectNode;
type CanMoveNodeTo = (
    node: INode,
    targetNode: INode,
    positionName: string
) => void;
type HandleLoadFailed = (response: any) => void;
type HandleDataFilter = (data: any) => any;
type HandleDrag = (node: INode, event: JQueryEventObject | Touch) => void;
type HandleLoadData = (isLoading: boolean, node: INode, $el: JQuery) => void;

interface ISelectNodeOptions {
    mustToggle?: boolean;
    mustSetFocus?: boolean;
}

const NODE_PARAM_IS_EMPTY = "Node parameter is empty";
const PARAM_IS_EMPTY = "Parameter is empty: ";

class JqTreeWidget extends MouseWidget<IJQTreeOptions> {
    protected static defaults = {
        animationSpeed: "fast",
        autoOpen: false, // true / false / int (open n levels starting at 0)
        saveState: false, // true / false / string (cookie name)
        dragAndDrop: false,
        selectable: true,
        useContextMenu: true,
        onCanSelectNode: null as CanSelectNode | null,
        onSetStateFromStorage: null as SetFromStorage | null,
        onGetStateFromStorage: null as GetFromStorage | null,
        onCreateLi: null as CreateLi | null,
        onIsMoveHandle: null as IsMoveHandler | null,

        // Can this node be moved?
        onCanMove: null as CanMoveNode | null,

        // Can this node be moved to this position? function(moved_node, target_node, position)
        onCanMoveTo: null as CanMoveNodeTo | null,
        onLoadFailed: null as HandleLoadFailed | null,
        autoEscape: true,
        dataUrl: null as (DataUrl | null),

        // The symbol to use for a closed node - ► BLACK RIGHT-POINTING POINTER
        // http://www.fileformat.info/info/unicode/char/25ba/index.htm
        closedIcon: null as string | Element | null,

        // The symbol to use for an open node - ▼ BLACK DOWN-POINTING TRIANGLE
        // http://www.fileformat.info/info/unicode/char/25bc/index.htm
        openedIcon: "&#x25bc;" as string | Element | null,
        slide: true, // must display slide animation?
        nodeClass: typeof Node,
        dataFilter: null as HandleDataFilter | null,
        keyboardSupport: true,
        openFolderDelay: 500, // The delay for opening a folder during drag and drop; the value is in milliseconds
        rtl: false, // right-to-left support; true / false (default)
        onDragMove: null as HandleDrag | null,
        onDragStop: null as HandleDrag | null,
        buttonLeft: true,
        onLoading: null as HandleLoadData | null,
        showEmptyFolder: false,
        tabIndex: 0
    };

    public element: JQuery;
    public tree: Node;
    public dndHandler: DragAndDropHandler | null;
    public renderer: ElementsRenderer;
    public dataLoader: DataLoader;
    public scrollHandler: ScrollHandler | null;
    public selectNodeHandler: SelectNodeHandler | null;

    private isInitialized: boolean;
    private saveStateHandler: SaveStateHandler | null;
    private keyHandler: KeyHandler | null;

    public toggle(node: INode, slideParam: null | boolean = null): JQuery {
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

    public getTree(): INode {
        return this.tree as INode;
    }

    public selectNode(
        node: INode | null,
        optionsParam?: ISelectNodeOptions
    ): JQuery {
        this.doSelectNode(node, optionsParam);
        return this.element;
    }

    public getSelectedNode(): Node | false {
        if (this.selectNodeHandler) {
            return this.selectNodeHandler.getSelectedNode();
        } else {
            return false;
        }
    }

    public toJson(): string {
        return JSON.stringify(this.tree.getData());
    }

    public loadData(data: any, parentNode: Node | null): JQuery {
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
    public loadDataFromUrl(param1?: any, param2?: any, param3?: any): JQuery {
        if (typeof param1 === "string") {
            // first parameter is url
            this.doLoadDataFromUrl(param1, param2, param3);
        } else {
            // first parameter is not url
            this.doLoadDataFromUrl(null, param1, param2);
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

    public getNodesByProperty(key: string, value: any): Node[] {
        return this.tree.getNodesByProperty(key, value);
    }

    public getNodeByHtmlElement(element: Element | JQuery): Node | null {
        return this.getNode(jQuery(element));
    }

    public getNodeByCallback(callback: (node: Node) => boolean): Node | null {
        return this.tree.getNodeByCallback(callback);
    }

    public openNode(node: INode, param1?: boolean | OnFinishOpenNode, param2?: any): JQuery {
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
                onFinished = param2 as OnFinishOpenNode | null;
            }

            if (slide == null) {
                slide = this.options.slide ?? false;
            }

            return [slide, onFinished];
        };

        const [slide, onFinished] = parseParams();

        this._openNode(node as Node, slide, onFinished);
        return this.element;
    }

    public closeNode(node: INode, slideParam?: null | boolean): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const slide = slideParam ?? this.options.slide;

        if (node.isFolder() || node.isEmptyFolder) {
            new FolderElement(node as Node, this).close(
                slide,
                this.options.animationSpeed
            );

            this.saveState();
        }

        return this.element;
    }

    public isDragging(): boolean {
        if (this.dndHandler) {
            return this.dndHandler.isDragging;
        } else {
            return false;
        }
    }

    public refreshHitAreas(): JQuery {
        if (this.dndHandler) {
            this.dndHandler.refresh();
        }
        return this.element;
    }

    public addNodeAfter(newNodeInfo: any, existingNode: Node): Node | null {
        const newNode = existingNode.addAfter(newNodeInfo);

        if (newNode) {
            this._refreshElements(existingNode.parent);
        }

        return newNode;
    }

    public addNodeBefore(newNodeInfo: any, existingNode: Node): Node | null {
        if (!existingNode) {
            throw Error(PARAM_IS_EMPTY + "existingNode");
        }

        const newNode = existingNode.addBefore(newNodeInfo);

        if (newNode) {
            this._refreshElements(existingNode.parent);
        }

        return newNode;
    }

    public addParentNode(newNodeInfo: any, existingNode: Node): Node | null {
        if (!existingNode) {
            throw Error(PARAM_IS_EMPTY + "existingNode");
        }

        const newNode = existingNode.addParent(newNodeInfo);

        if (newNode) {
            this._refreshElements(newNode.parent);
        }

        return newNode;
    }

    public removeNode(inode: INode): JQuery {
        if (!inode) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const node = inode as Node;

        if (node.parent && this.selectNodeHandler) {
            this.selectNodeHandler.removeFromSelection(node, true); // including children

            const parent = node.parent;
            node.remove();
            this._refreshElements(parent);
        }

        return this.element;
    }

    public appendNode(newNodeInfo: any, parentNodeParam?: Node): INode {
        const parentNode = parentNodeParam || this.tree;

        const node = parentNode.append(newNodeInfo);

        this._refreshElements(parentNode);

        return node;
    }

    public prependNode(newNodeInfo: any, parentNodeParam?: INode): INode {
        const parentNode = !parentNodeParam
            ? this.tree
            : (parentNodeParam as Node);

        const node = parentNode.prepend(newNodeInfo);

        this._refreshElements(parentNode);

        return node;
    }

    public updateNode(node: Node, data: Record<string, unknown>): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const idIsChanged = data.id && data.id !== node.id;

        if (idIsChanged) {
            this.tree.removeNodeFromIndex(node);
        }

        node.setData(data);

        if (idIsChanged) {
            this.tree.addNodeToIndex(node);
        }

        if (
            typeof data === "object" &&
            data['children'] &&
            data["children"] instanceof Array
        ) {
            node.removeChildren();

            if (data.children.length) {
                node.loadFromData(data.children);
            }
        }

        this._refreshElements(node);
        this.selectCurrentNode();

        return this.element;
    }

    public moveNode(node: INode, targetNode: INode, position: string): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!targetNode) {
            throw Error(PARAM_IS_EMPTY + "targetNode");
        }

        const positionIndex = getPosition(position);

        this.tree.moveNode(node as Node, targetNode as Node, positionIndex);
        this._refreshElements(null);
        return this.element;
    }

    public getStateFromStorage(): any {
        if (this.saveStateHandler) {
            return this.saveStateHandler.getStateFromStorage();
        }
    }

    public addToSelection(inode: INode, mustSetFocus?: boolean): JQuery {
        if (!inode) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const node = inode as Node;

        if (this.selectNodeHandler) {
            this.selectNodeHandler.addToSelection(node);

            this._getNodeElementForNode(node).select(
                mustSetFocus === undefined ? true : mustSetFocus
            );

            this.saveState();
        }

        return this.element;
    }

    public getSelectedNodes(): Node[] {
        if (!this.selectNodeHandler) {
            return [];
        } else {
            return this.selectNodeHandler.getSelectedNodes();
        }
    }

    public isNodeSelected(node: Node): boolean {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (!this.selectNodeHandler) {
            return false;
        } else {
            return this.selectNodeHandler.isNodeSelected(node);
        }
    }

    public removeFromSelection(node: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (this.selectNodeHandler) {
            this.selectNodeHandler.removeFromSelection(node);

            this._getNodeElementForNode(node).deselect();
            this.saveState();
        }

        return this.element;
    }

    public scrollToNode(node: Node): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        if (this.scrollHandler) {
            const nodeOffset = jQuery(node.element).offset();
            const nodeTop = nodeOffset ? nodeOffset.top : 0;

            const treeOffset = this.$el.offset();
            const treeTop = treeOffset ? treeOffset.top : 0;

            const top = nodeTop - treeTop;

            this.scrollHandler.scrollToY(top);
        }

        return this.element;
    }

    public getState(): any {
        if (this.saveStateHandler) {
            return this.saveStateHandler.getState();
        }
    }

    public setState(state: any): JQuery {
        if (this.saveStateHandler) {
            this.saveStateHandler.setInitialState(state);
            this._refreshElements(null);
        }

        return this.element;
    }

    public setOption(option: string, value: unknown): JQuery {
        (this.options as Record<string, unknown>)[option] = value;
        return this.element;
    }

    public moveDown(): JQuery {
        if (this.keyHandler) {
            this.keyHandler.moveDown();
        }

        return this.element;
    }

    public moveUp(): JQuery {
        if (this.keyHandler) {
            this.keyHandler.moveUp();
        }

        return this.element;
    }

    public getVersion(): string {
        return __version__;
    }

    public testGenerateHitAreas(movingNode: Node): IHitArea[] {
        if (!this.dndHandler) {
            return [];
        } else {
            this.dndHandler.currentItem = this._getNodeElementForNode(
                movingNode
            );
            this.dndHandler.generateHitAreas();
            return this.dndHandler.hitAreas;
        }
    }

    public _triggerEvent(eventName: string, values?: any): JQuery.Event {
        const event = jQuery.Event(eventName);
        jQuery.extend(event, values);

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

    public _getNodeElementForNode(node: Node): INodeElement {
        if (node.isFolder()) {
            return new FolderElement(node, this);
        } else {
            return new NodeElement(node, this);
        }
    }

    public _getNodeElement($element: JQuery): INodeElement | null {
        const node = this.getNode($element);
        if (node) {
            return this._getNodeElementForNode(node);
        } else {
            return null;
        }
    }

    public _containsElement(element: Element): boolean {
        const node = this.getNode(jQuery(element));

        return node != null && node.tree === this.tree;
    }

    public _getScrollLeft(): number {
        return this?.scrollHandler?.getScrollLeft() || 0;
    }

    protected init(): void {
        super.init();

        this.element = this.$el;
        this.mouseDelay = 300;
        this.isInitialized = false;

        this.options.rtl = this.getRtlOption();

        if (this.options.closedIcon === null) {
            this.options.closedIcon = this.getDefaultClosedIcon();
        }

        this.renderer = new ElementsRenderer(this);
        this.dataLoader = new DataLoader(this);

        if (SaveStateHandler != null) {
            this.saveStateHandler = new SaveStateHandler(this);
        } else {
            this.options.saveState = false;
        }

        if (SelectNodeHandler != null) {
            this.selectNodeHandler = new SelectNodeHandler(this);
        }

        if (DragAndDropHandler != null) {
            this.dndHandler = new DragAndDropHandler(this);
        } else {
            this.options.dragAndDrop = false;
        }

        if (ScrollHandler != null) {
            this.scrollHandler = new ScrollHandler(this);
        }

        if (KeyHandler != null && SelectNodeHandler != null) {
            this.keyHandler = new KeyHandler(this);
        }

        this.initData();

        this.element.click(this.handleClick);
        this.element.dblclick(this.handleDblclick);

        if (this.options.useContextMenu) {
            this.element.on("contextmenu", this.handleContextmenu);
        }
    }

    protected deinit(): void {
        this.element.empty();
        this.element.off();

        if (this.keyHandler) {
            this.keyHandler.deinit();
        }

        this.tree = new Node({}, true);

        super.deinit();
    }

    protected mouseCapture(positionInfo: IPositionInfo): boolean | null {
        if (this.options.dragAndDrop && this.dndHandler) {
            return this.dndHandler.mouseCapture(positionInfo);
        } else {
            return false;
        }
    }

    protected mouseStart(positionInfo: IPositionInfo): boolean {
        if (this.options.dragAndDrop && this.dndHandler) {
            return this.dndHandler.mouseStart(positionInfo);
        } else {
            return false;
        }
    }

    protected mouseDrag(positionInfo: IPositionInfo): boolean {
        if (this.options.dragAndDrop && this.dndHandler) {
            const result = this.dndHandler.mouseDrag(positionInfo);

            if (this.scrollHandler) {
                this.scrollHandler.checkScrolling();
            }
            return result;
        } else {
            return false;
        }
    }

    protected mouseStop(positionInfo: IPositionInfo): boolean {
        if (this.options.dragAndDrop && this.dndHandler) {
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
        const dataUrl = this.options.dataUrl || (this.element.data("url") as string | null);

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
        if (this.options.saveState && this.saveStateHandler) {
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

        this.tree = new this.options.nodeClass(
            null,
            true,
            this.options.nodeClass
        );

        if (this.selectNodeHandler) {
            this.selectNodeHandler.clear();
        }

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
            if (!(this.options.saveState && this.saveStateHandler)) {
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

            this.tree.iterate((node: INode, level: number) => {
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
            if (!(this.options.saveState && this.saveStateHandler)) {
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
                this.tree.iterate((node: INode, level: number) => {
                    if (node.load_on_demand) {
                        if (!node.is_loading) {
                            loadAndOpenNode(node as Node);
                        }

                        return false;
                    } else {
                        this._openNode(node as Node, false, null);

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
        } else {
            return parseInt(this.options.autoOpen, 10);
        }
    }

    private handleClick = (e: JQuery.Event): void => {
        const clickTarget = this.getClickTarget((e as any).target);

        if (clickTarget) {
            if (clickTarget.type === "button") {
                this.toggle(clickTarget.node, this.options.slide);

                e.preventDefault();
                e.stopPropagation();
            } else if (clickTarget.type === "label") {
                const node = clickTarget.node;
                const event = this._triggerEvent("tree.click", {
                    node,
                    click_event: e
                });

                if (!event.isDefaultPrevented()) {
                    this.doSelectNode(node);
                }
            }
        }
    };

    private handleDblclick = (e: JQuery.Event): void => {
        const clickTarget = this.getClickTarget((e as any).target);

        if (clickTarget?.type === "label") {
            this._triggerEvent("tree.dblclick", {
                node: clickTarget.node,
                click_event: e
            });
        }
    };

    private getClickTarget(element: EventTarget): any {
        const $target = jQuery(element);

        const $button = $target.closest(".jqtree-toggler");

        if ($button.length) {
            const node = this.getNode($button);

            if (node) {
                return {
                    type: "button",
                    node
                };
            }
        } else {
            const $el = $target.closest(".jqtree-element");
            if ($el.length) {
                const node = this.getNode($el);
                if (node) {
                    return {
                        type: "label",
                        node
                    };
                }
            }
        }

        return null;
    }

    private getNode($element: JQuery<any>): null | Node {
        const $li = $element.closest("li.jqtree_common");
        if ($li.length === 0) {
            return null;
        } else {
            return $li.data("node") as Node;
        }
    }

    private handleContextmenu = (e: JQuery.Event) => {
        const $div = jQuery((e as any).target).closest(
            "ul.jqtree-tree .jqtree-element"
        );
        if ($div.length) {
            const node = this.getNode($div);
            if (node) {
                e.preventDefault();
                e.stopPropagation();

                this._triggerEvent("tree.contextmenu", {
                    node,
                    click_event: e
                });
                return false;
            }
        }

        return null;
    };

    private saveState(): void {
        if (this.options.saveState && this.saveStateHandler) {
            this.saveStateHandler.saveState();
        }
    }

    private selectCurrentNode(): void {
        const node = this.getSelectedNode();
        if (node) {
            const nodeElement = this._getNodeElementForNode(node);
            if (nodeElement) {
                nodeElement.select(true);
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

    private getRtlOption(): any {
        if (this.options.rtl != null) {
            return this.options.rtl;
        } else {
            const dataRtl = this.element.data("rtl");

            if (dataRtl !== null && dataRtl !== false) {
                return true;
            } else {
                return false;
            }
        }
    }

    private doSelectNode(
        inode: INode | null,
        optionsParam?: ISelectNodeOptions
    ): void {
        if (!this.selectNodeHandler) {
            return;
        }

        const defaultOptions = { mustSetFocus: true, mustToggle: true };
        const selectOptions = { ...defaultOptions, ...(optionsParam || {}) };

        const canSelect = (): boolean => {
            if (this.options.onCanSelectNode) {
                return (
                    this.options.selectable &&
                    this.options.onCanSelectNode(inode as Node)
                );
            } else {
                return this.options.selectable;
            }
        };

        const openParents = (): void => {
            const parent = (inode as Node).parent;

            if (parent && parent.parent && !parent.is_open) {
                this.openNode(parent, false);
            }
        };

        const saveState = (): void => {
            if (this.options.saveState && this.saveStateHandler) {
                this.saveStateHandler.saveState();
            }
        };

        if (!inode) {
            // Called with empty node -> deselect current node
            this.deselectCurrentNode();
            saveState();
            return;
        }

        if (!canSelect()) {
            return;
        }

        const node = inode as Node;

        if (this.selectNodeHandler.isNodeSelected(node)) {
            if (selectOptions.mustToggle) {
                this.deselectCurrentNode();
                this._triggerEvent("tree.select", {
                    node: null,
                    previous_node: node
                });
            }
        } else {
            const deselectedNode = this.getSelectedNode();
            this.deselectCurrentNode();
            this.addToSelection(node, selectOptions.mustSetFocus);

            this._triggerEvent("tree.select", {
                node,
                deselected_node: deselectedNode
            });
            openParents();
        }

        saveState();
    }

    private doLoadData(data: any[] | null, parentNode: Node | null): void {
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

            if (this.isDragging() && this.dndHandler) {
                this.dndHandler.refresh();
            }
        }
    }

    private deselectNodes(parentNode: Node): void {
        if (this.selectNodeHandler) {
            const selectedNodesUnderParent = this.selectNodeHandler.getSelectedNodesUnder(
                parentNode
            );
            for (const n of selectedNodesUnderParent) {
                this.selectNodeHandler.removeFromSelection(n);
            }
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
