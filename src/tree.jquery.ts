import __version__ from "./version";
import * as jQuery from "jquery";
import { DragAndDropHandler } from "./drag_and_drop_handler";
import ElementsRenderer from "./elements_renderer";
import DataLoader, { HandleFinishedLoading } from "./data_loader";
import KeyHandler from "./key_handler";
import MouseWidget from "./mouse.widget";
import { IPositionInfo } from "./imouse_widget";
import SaveStateHandler from "./save_state_handler";
import ScrollHandler from "./scroll_handler";
import SelectNodeHandler from "./select_node_handler";
import SimpleWidget from "./simple.widget";
import { Node, NodeId, getPosition } from "./node";
import { isFunction } from "./util";
import { FolderElement, NodeElement } from "./node_element";
import { INodeElement, IHitArea, OnFinishOpenNode } from "./itree_widget";

type CanSelectNode = (node: INode) => boolean;
type SetFromStorage = (data: string) => void;
type GetFromStorage = () => any;
type CreateLi = (node: INode, el: JQuery, isSelected: boolean) => void;
type IsMoveHandler = (el: JQuery) => boolean;
type CanMoveNode = CanSelectNode;
type CanMoveNodeTo = (node: INode, targetNode: INode, positionName: string) => void;
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

class JqTreeWidget extends MouseWidget {
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
        dataUrl: null as any,

        // The symbol to use for a closed node - ► BLACK RIGHT-POINTING POINTER
        // http://www.fileformat.info/info/unicode/char/25ba/index.htm
        closedIcon: null as string | Element | null,

        // The symbol to use for an open node - ▼ BLACK DOWN-POINTING TRIANGLE
        // http://www.fileformat.info/info/unicode/char/25bc/index.htm
        openedIcon: "&#x25bc;" as string | Element | null,
        slide: true, // must display slide animation?
        nodeClass: Node,
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

    public toggle(node: INode, slideParam?: boolean): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const slide = slideParam == null ? this.options.slide : slideParam;

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

    public selectNode(node: INode | null, optionsParam?: ISelectNodeOptions): JQuery {
        this._selectNode(node, optionsParam);
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
        this._loadData(data, parentNode);
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
            this._loadDataFromUrl(param1, param2, param3);
        } else {
            // first parameter is not url
            this._loadDataFromUrl(null, param1, param2);
        }

        return this.element;
    }

    public reload(onFinished: HandleFinishedLoading | null): JQuery {
        this._loadDataFromUrl(null, null, onFinished);
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
        return this._getNode(jQuery(element));
    }

    public getNodeByCallback(callback: (node: Node) => boolean): Node | null {
        return this.tree.getNodeByCallback(callback);
    }

    public openNode(node: INode, param1?: any, param2?: any): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const parseParams = (): any[] => {
            let onFinished: OnFinishOpenNode | null;
            let slide;

            if (isFunction(param1)) {
                onFinished = param1 as OnFinishOpenNode | null;
                slide = null;
            } else {
                slide = param1;
                onFinished = param2 as OnFinishOpenNode | null;
            }

            if (slide == null) {
                slide = this.options.slide;
            }

            return [slide, onFinished];
        };

        const [slide, onFinished] = parseParams();

        this._openNode(node as Node, slide, onFinished);
        return this.element;
    }

    public closeNode(node: INode, slideParam?: any): JQuery {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }

        const slide = slideParam == null ? this.options.slide : slideParam;

        if (node.isFolder() || node.isEmptyFolder) {
            new FolderElement(node as Node, this).close(slide, this.options.animationSpeed);

            this._saveState();
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
        const parentNode = !parentNodeParam ? this.tree : (parentNodeParam as Node);

        const node = parentNode.prepend(newNodeInfo);

        this._refreshElements(parentNode);

        return node;
    }

    public updateNode(node: Node, data: any): JQuery {
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

        if (typeof data === "object" && data.children) {
            node.removeChildren();

            if (data.children.length) {
                node.loadFromData(data.children);
            }
        }

        this._refreshElements(node);
        this._selectCurrentNode();

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

            this._getNodeElementForNode(node).select(mustSetFocus === undefined ? true : mustSetFocus);

            this._saveState();
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
            this._saveState();
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

    public setOption(option: string, value: any): JQuery {
        this.options[option] = value;
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
            this.dndHandler.currentItem = this._getNodeElementForNode(movingNode);
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

    public _openNode(node: Node, slide = true, onFinished: OnFinishOpenNode | null): void {
        const doOpenNode = (_node: Node, _slide: any, _onFinished: OnFinishOpenNode | null): void => {
            const folderElement = new FolderElement(_node, this);
            folderElement.open(_onFinished, _slide, this.options.animationSpeed);
        };

        if (node.isFolder() || node.isEmptyFolder) {
            if (node.load_on_demand) {
                this._loadFolderOnDemand(node, slide, onFinished);
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
                this._saveState();
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
        const node = this._getNode($element);
        if (node) {
            return this._getNodeElementForNode(node);
        } else {
            return null;
        }
    }

    public _containsElement(element: Element): boolean {
        const node = this._getNode(jQuery(element));

        return node != null && node.tree === this.tree;
    }

    public _getScrollLeft(): number {
        return (this.scrollHandler && this.scrollHandler.getScrollLeft()) || 0;
    }

    protected _init(): void {
        super._init();

        this.element = this.$el;
        this.mouseDelay = 300;
        this.isInitialized = false;

        this.options.rtl = this._getRtlOption();

        if (this.options.closedIcon === null) {
            this.options.closedIcon = this._getDefaultClosedIcon();
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

        this._initData();

        this.element.click(this._handleClick);
        this.element.dblclick(this._handleDblclick);

        if (this.options.useContextMenu) {
            this.element.on("contextmenu", this._handleContextmenu);
        }
    }

    protected _deinit(): void {
        this.element.empty();
        this.element.off();

        if (this.keyHandler) {
            this.keyHandler.deinit();
        }

        this.tree = new Node({}, true);

        super._deinit();
    }

    protected _mouseCapture(positionInfo: IPositionInfo): boolean | null {
        if (this.options.dragAndDrop && this.dndHandler) {
            return this.dndHandler.mouseCapture(positionInfo);
        } else {
            return false;
        }
    }

    protected _mouseStart(positionInfo: IPositionInfo): boolean {
        if (this.options.dragAndDrop && this.dndHandler) {
            return this.dndHandler.mouseStart(positionInfo);
        } else {
            return false;
        }
    }

    protected _mouseDrag(positionInfo: IPositionInfo): boolean {
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

    protected _mouseStop(positionInfo: IPositionInfo): boolean {
        if (this.options.dragAndDrop && this.dndHandler) {
            return this.dndHandler.mouseStop(positionInfo);
        } else {
            return false;
        }
    }

    private _initData(): void {
        if (this.options.data) {
            this._loadData(this.options.data, null);
        } else {
            const dataUrl = this._getDataUrlInfo(null);

            if (dataUrl) {
                this._loadDataFromUrl(null, null, null);
            } else {
                this._loadData([], null);
            }
        }
    }

    private _getDataUrlInfo(node: Node | null): any {
        const dataUrl = this.options.dataUrl || this.element.data("url");

        const getUrlFromString = (): any => {
            const urlInfo: any = { url: dataUrl };

            setUrlInfoData(urlInfo);

            return urlInfo;
        };

        const setUrlInfoData = (urlInfo: any): void => {
            if (node && node.id) {
                // Load on demand of a subtree; add node parameter
                const data = { node: node.id };
                urlInfo["data"] = data;
            } else {
                // Add selected_node parameter
                const selectedNodeId = this._getNodeIdToBeSelected();
                if (selectedNodeId) {
                    const data = { selected_node: selectedNodeId }; // eslint-disable-line @typescript-eslint/camelcase
                    urlInfo["data"] = data;
                }
            }
        };

        if (typeof dataUrl === "function") {
            return dataUrl(node);
        } else if (typeof dataUrl === "string") {
            return getUrlFromString();
        } else if (typeof dataUrl === "object") {
            setUrlInfoData(dataUrl);
            return dataUrl;
        } else {
            return dataUrl;
        }
    }

    private _getNodeIdToBeSelected(): NodeId | null {
        if (this.options.saveState && this.saveStateHandler) {
            return this.saveStateHandler.getNodeIdToBeSelected();
        } else {
            return null;
        }
    }

    private _initTree(data: any): void {
        const doInit = (): void => {
            if (!this.isInitialized) {
                this.isInitialized = true;
                this._triggerEvent("tree.init");
            }
        };

        this.tree = new this.options.nodeClass(null, true, this.options.nodeClass);

        if (this.selectNodeHandler) {
            this.selectNodeHandler.clear();
        }

        this.tree.loadFromData(data);

        const mustLoadOnDemand = this._setInitialState();

        this._refreshElements(null);

        if (!mustLoadOnDemand) {
            doInit();
        } else {
            // Load data on demand and then init the tree
            this._setInitialStateOnDemand(doInit);
        }
    }

    // Set initial state, either by restoring the state or auto-opening nodes
    // result: must load nodes on demand?
    private _setInitialState(): boolean {
        const restoreState = (): boolean[] => {
            // result: is state restored, must load on demand?
            if (!(this.options.saveState && this.saveStateHandler)) {
                return [false, false];
            } else {
                const state = this.saveStateHandler.getStateFromStorage();

                if (!state) {
                    return [false, false];
                } else {
                    const mustLoadOnDemand = this.saveStateHandler.setInitialState(state);

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

            this.tree.iterate((node: INode, level: number) => {
                if (node.load_on_demand) {
                    mustLoadOnDemand = true;
                    return false;
                } else if (!node.hasChildren()) {
                    return false;
                } else {
                    node.is_open = true; // eslint-disable-line @typescript-eslint/camelcase
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
            if (!(this.options.saveState && this.saveStateHandler)) {
                return false;
            } else {
                const state = this.saveStateHandler.getStateFromStorage();

                if (!state) {
                    return false;
                } else {
                    this.saveStateHandler.setInitialStateOnDemand(state, cbFinished);

                    return true;
                }
            }
        };

        const autoOpenNodes = (): void => {
            const maxLevel = this._getAutoOpenMaxLevel();
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

    private _getAutoOpenMaxLevel(): number {
        if (this.options.autoOpen === true) {
            return -1;
        } else {
            return parseInt(this.options.autoOpen, 10);
        }
    }

    private _handleClick = (e: JQuery.Event): void => {
        const clickTarget = this._getClickTarget((e as any).target);

        if (clickTarget) {
            if (clickTarget.type === "button") {
                this.toggle(clickTarget.node, this.options.slide);

                e.preventDefault();
                e.stopPropagation();
            } else if (clickTarget.type === "label") {
                const node = clickTarget.node;
                const event = this._triggerEvent("tree.click", {
                    node,
                    click_event: e // eslint-disable-line @typescript-eslint/camelcase
                });

                if (!event.isDefaultPrevented()) {
                    this._selectNode(node);
                }
            }
        }
    };

    private _handleDblclick = (e: JQuery.Event): void => {
        const clickTarget = this._getClickTarget((e as any).target);

        if (clickTarget && clickTarget.type === "label") {
            this._triggerEvent("tree.dblclick", {
                node: clickTarget.node,
                click_event: e // eslint-disable-line @typescript-eslint/camelcase
            });
        }
    };

    private _getClickTarget(element: EventTarget): any {
        const $target = jQuery(element);

        const $button = $target.closest(".jqtree-toggler");

        if ($button.length) {
            const node = this._getNode($button);

            if (node) {
                return {
                    type: "button",
                    node
                };
            }
        } else {
            const $el = $target.closest(".jqtree-element");
            if ($el.length) {
                const node = this._getNode($el);
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

    private _getNode($element: JQuery<any>): any {
        const $li = $element.closest("li.jqtree_common");
        if ($li.length === 0) {
            return null;
        } else {
            return $li.data("node");
        }
    }

    private _handleContextmenu = (e: JQuery.Event) => {
        const $div = jQuery((e as any).target).closest("ul.jqtree-tree .jqtree-element");
        if ($div.length) {
            const node = this._getNode($div);
            if (node) {
                e.preventDefault();
                e.stopPropagation();

                this._triggerEvent("tree.contextmenu", {
                    node,
                    click_event: e // eslint-disable-line @typescript-eslint/camelcase
                });
                return false;
            }
        }

        return null;
    };

    private _saveState(): void {
        if (this.options.saveState && this.saveStateHandler) {
            this.saveStateHandler.saveState();
        }
    }

    private _selectCurrentNode(): void {
        const node = this.getSelectedNode();
        if (node) {
            const nodeElement = this._getNodeElementForNode(node);
            if (nodeElement) {
                nodeElement.select(true);
            }
        }
    }

    private _deselectCurrentNode(): void {
        const node = this.getSelectedNode();
        if (node) {
            this.removeFromSelection(node);
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

    private _getRtlOption(): any {
        if (this.options.rtl != null) {
            return this.options.rtl;
        } else {
            const dataRtl = this.element.data("rtl");

            if (dataRtl != null && dataRtl !== false) {
                return true;
            } else {
                return false;
            }
        }
    }

    private _selectNode(inode: INode | null, optionsParam?: ISelectNodeOptions): void {
        if (!this.selectNodeHandler) {
            return;
        }

        const defaultOptions = { mustSetFocus: true, mustToggle: true };
        const selectOptions = { ...defaultOptions, ...(optionsParam || {}) };

        const canSelect = (): boolean => {
            if (this.options.onCanSelectNode) {
                return this.options.selectable && this.options.onCanSelectNode(inode as Node);
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
            this._deselectCurrentNode();
            saveState();
            return;
        }

        if (!canSelect()) {
            return;
        }

        const node = inode as Node;

        if (this.selectNodeHandler.isNodeSelected(node)) {
            if (selectOptions.mustToggle) {
                this._deselectCurrentNode();
                this._triggerEvent("tree.select", {
                    node: null,
                    previous_node: node // eslint-disable-line @typescript-eslint/camelcase
                });
            }
        } else {
            const deselectedNode = this.getSelectedNode();
            this._deselectCurrentNode();
            this.addToSelection(node, selectOptions.mustSetFocus);

            this._triggerEvent("tree.select", {
                node,
                deselected_node: deselectedNode // eslint-disable-line @typescript-eslint/camelcase
            });
            openParents();
        }

        saveState();
    }

    private _loadData(data: any[] | null, parentNode: Node | null): void {
        if (!data) {
            return;
        } else {
            this._triggerEvent("tree.load_data", { tree_data: data }); // eslint-disable-line @typescript-eslint/camelcase

            if (parentNode) {
                this._deselectNodes(parentNode);
                this._loadSubtree(data, parentNode);
            } else {
                this._initTree(data);
            }

            if (this.isDragging() && this.dndHandler) {
                this.dndHandler.refresh();
            }
        }
    }

    private _deselectNodes(parentNode: Node): void {
        if (this.selectNodeHandler) {
            const selectedNodesUnderParent = this.selectNodeHandler.getSelectedNodesUnder(parentNode);
            for (const n of selectedNodesUnderParent) {
                this.selectNodeHandler.removeFromSelection(n);
            }
        }
    }

    private _loadSubtree(data: any[], parentNode: Node): void {
        parentNode.loadFromData(data);

        parentNode.load_on_demand = false; // eslint-disable-line @typescript-eslint/camelcase
        parentNode.is_loading = false; // eslint-disable-line @typescript-eslint/camelcase

        this._refreshElements(parentNode);
    }

    private _loadDataFromUrl(
        urlInfoParam: any,
        parentNode: Node | null,
        onFinished: HandleFinishedLoading | null
    ): void {
        const urlInfo = urlInfoParam || this._getDataUrlInfo(parentNode);

        this.dataLoader.loadFromUrl(urlInfo, parentNode, onFinished);
    }

    private _loadFolderOnDemand(node: Node, slide = true, onFinished: OnFinishOpenNode | null): void {
        node.is_loading = true; // eslint-disable-line @typescript-eslint/camelcase

        this._loadDataFromUrl(null, node, () => {
            this._openNode(node, slide, onFinished);
        });
    }
}

SimpleWidget.register(JqTreeWidget, "tree");
