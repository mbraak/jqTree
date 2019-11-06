"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var version_1 = require("./version");
var jQuery = require("jquery");
var drag_and_drop_handler_1 = require("./drag_and_drop_handler");
var elements_renderer_1 = require("./elements_renderer");
var data_loader_1 = require("./data_loader");
var key_handler_1 = require("./key_handler");
var mouse_widget_1 = require("./mouse.widget");
var save_state_handler_1 = require("./save_state_handler");
var scroll_handler_1 = require("./scroll_handler");
var select_node_handler_1 = require("./select_node_handler");
var simple_widget_1 = require("./simple.widget");
var node_1 = require("./node");
var util_1 = require("./util");
var node_element_1 = require("./node_element");
var NODE_PARAM_IS_EMPTY = "Node parameter is empty";
var PARAM_IS_EMPTY = "Parameter is empty: ";
var JqTreeWidget = /** @class */ (function (_super) {
    __extends(JqTreeWidget, _super);
    function JqTreeWidget() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._handleClick = function (e) {
            var clickTarget = _this._getClickTarget(e.target);
            if (clickTarget) {
                if (clickTarget.type === "button") {
                    _this.toggle(clickTarget.node, _this.options.slide);
                    e.preventDefault();
                    e.stopPropagation();
                }
                else if (clickTarget.type === "label") {
                    var node = clickTarget.node;
                    var event_1 = _this._triggerEvent("tree.click", {
                        node: node,
                        click_event: e // eslint-disable-line @typescript-eslint/camelcase
                    });
                    if (!event_1.isDefaultPrevented()) {
                        _this._selectNode(node);
                    }
                }
            }
        };
        _this._handleDblclick = function (e) {
            var clickTarget = _this._getClickTarget(e.target);
            if (clickTarget && clickTarget.type === "label") {
                _this._triggerEvent("tree.dblclick", {
                    node: clickTarget.node,
                    click_event: e // eslint-disable-line @typescript-eslint/camelcase
                });
            }
        };
        _this._handleContextmenu = function (e) {
            var $div = jQuery(e.target).closest("ul.jqtree-tree .jqtree-element");
            if ($div.length) {
                var node = _this._getNode($div);
                if (node) {
                    e.preventDefault();
                    e.stopPropagation();
                    _this._triggerEvent("tree.contextmenu", {
                        node: node,
                        click_event: e // eslint-disable-line @typescript-eslint/camelcase
                    });
                    return false;
                }
            }
            return null;
        };
        return _this;
    }
    JqTreeWidget.prototype.toggle = function (node, slideParam) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        var slide = slideParam == null ? this.options.slide : slideParam;
        if (node.is_open) {
            this.closeNode(node, slide);
        }
        else {
            this.openNode(node, slide);
        }
        return this.element;
    };
    JqTreeWidget.prototype.getTree = function () {
        return this.tree;
    };
    JqTreeWidget.prototype.selectNode = function (node, optionsParam) {
        this._selectNode(node, optionsParam);
        return this.element;
    };
    JqTreeWidget.prototype.getSelectedNode = function () {
        if (this.selectNodeHandler) {
            return this.selectNodeHandler.getSelectedNode();
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype.toJson = function () {
        return JSON.stringify(this.tree.getData());
    };
    JqTreeWidget.prototype.loadData = function (data, parentNode) {
        this._loadData(data, parentNode);
        return this.element;
    };
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
    JqTreeWidget.prototype.loadDataFromUrl = function (param1, param2, param3) {
        if (typeof param1 === "string") {
            // first parameter is url
            this._loadDataFromUrl(param1, param2, param3);
        }
        else {
            // first parameter is not url
            this._loadDataFromUrl(null, param1, param2);
        }
        return this.element;
    };
    JqTreeWidget.prototype.reload = function (onFinished) {
        this._loadDataFromUrl(null, null, onFinished);
        return this.element;
    };
    JqTreeWidget.prototype.getNodeById = function (nodeId) {
        return this.tree.getNodeById(nodeId);
    };
    JqTreeWidget.prototype.getNodeByName = function (name) {
        return this.tree.getNodeByName(name);
    };
    JqTreeWidget.prototype.getNodesByProperty = function (key, value) {
        return this.tree.getNodesByProperty(key, value);
    };
    JqTreeWidget.prototype.getNodeByHtmlElement = function (element) {
        return this._getNode(jQuery(element));
    };
    JqTreeWidget.prototype.getNodeByCallback = function (callback) {
        return this.tree.getNodeByCallback(callback);
    };
    JqTreeWidget.prototype.openNode = function (node, param1, param2) {
        var _this = this;
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        var parseParams = function () {
            var onFinished;
            var slide;
            if (util_1.isFunction(param1)) {
                onFinished = param1;
                slide = null;
            }
            else {
                slide = param1;
                onFinished = param2;
            }
            if (slide == null) {
                slide = _this.options.slide;
            }
            return [slide, onFinished];
        };
        var _a = parseParams(), slide = _a[0], onFinished = _a[1];
        this._openNode(node, slide, onFinished);
        return this.element;
    };
    JqTreeWidget.prototype.closeNode = function (node, slideParam) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        var slide = slideParam == null ? this.options.slide : slideParam;
        if (node.isFolder() || node.isEmptyFolder) {
            new node_element_1.FolderElement(node, this).close(slide, this.options.animationSpeed);
            this._saveState();
        }
        return this.element;
    };
    JqTreeWidget.prototype.isDragging = function () {
        if (this.dndHandler) {
            return this.dndHandler.isDragging;
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype.refreshHitAreas = function () {
        if (this.dndHandler) {
            this.dndHandler.refresh();
        }
        return this.element;
    };
    JqTreeWidget.prototype.addNodeAfter = function (newNodeInfo, existingNode) {
        var newNode = existingNode.addAfter(newNodeInfo);
        if (newNode) {
            this._refreshElements(existingNode.parent);
        }
        return newNode;
    };
    JqTreeWidget.prototype.addNodeBefore = function (newNodeInfo, existingNode) {
        if (!existingNode) {
            throw Error(PARAM_IS_EMPTY + "existingNode");
        }
        var newNode = existingNode.addBefore(newNodeInfo);
        if (newNode) {
            this._refreshElements(existingNode.parent);
        }
        return newNode;
    };
    JqTreeWidget.prototype.addParentNode = function (newNodeInfo, existingNode) {
        if (!existingNode) {
            throw Error(PARAM_IS_EMPTY + "existingNode");
        }
        var newNode = existingNode.addParent(newNodeInfo);
        if (newNode) {
            this._refreshElements(newNode.parent);
        }
        return newNode;
    };
    JqTreeWidget.prototype.removeNode = function (inode) {
        if (!inode) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        var node = inode;
        if (node.parent && this.selectNodeHandler) {
            this.selectNodeHandler.removeFromSelection(node, true); // including children
            var parent_1 = node.parent;
            node.remove();
            this._refreshElements(parent_1);
        }
        return this.element;
    };
    JqTreeWidget.prototype.appendNode = function (newNodeInfo, parentNodeParam) {
        var parentNode = parentNodeParam || this.tree;
        var node = parentNode.append(newNodeInfo);
        this._refreshElements(parentNode);
        return node;
    };
    JqTreeWidget.prototype.prependNode = function (newNodeInfo, parentNodeParam) {
        var parentNode = !parentNodeParam ? this.tree : parentNodeParam;
        var node = parentNode.prepend(newNodeInfo);
        this._refreshElements(parentNode);
        return node;
    };
    JqTreeWidget.prototype.updateNode = function (node, data) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        var idIsChanged = data.id && data.id !== node.id;
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
    };
    JqTreeWidget.prototype.moveNode = function (node, targetNode, position) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        if (!targetNode) {
            throw Error(PARAM_IS_EMPTY + "targetNode");
        }
        var positionIndex = node_1.getPosition(position);
        this.tree.moveNode(node, targetNode, positionIndex);
        this._refreshElements(null);
        return this.element;
    };
    JqTreeWidget.prototype.getStateFromStorage = function () {
        if (this.saveStateHandler) {
            return this.saveStateHandler.getStateFromStorage();
        }
    };
    JqTreeWidget.prototype.addToSelection = function (inode, mustSetFocus) {
        if (!inode) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        var node = inode;
        if (this.selectNodeHandler) {
            this.selectNodeHandler.addToSelection(node);
            this._getNodeElementForNode(node).select(mustSetFocus === undefined ? true : mustSetFocus);
            this._saveState();
        }
        return this.element;
    };
    JqTreeWidget.prototype.getSelectedNodes = function () {
        if (!this.selectNodeHandler) {
            return [];
        }
        else {
            return this.selectNodeHandler.getSelectedNodes();
        }
    };
    JqTreeWidget.prototype.isNodeSelected = function (node) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        if (!this.selectNodeHandler) {
            return false;
        }
        else {
            return this.selectNodeHandler.isNodeSelected(node);
        }
    };
    JqTreeWidget.prototype.removeFromSelection = function (node) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        if (this.selectNodeHandler) {
            this.selectNodeHandler.removeFromSelection(node);
            this._getNodeElementForNode(node).deselect();
            this._saveState();
        }
        return this.element;
    };
    JqTreeWidget.prototype.scrollToNode = function (node) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        if (this.scrollHandler) {
            var nodeOffset = jQuery(node.element).offset();
            var nodeTop = nodeOffset ? nodeOffset.top : 0;
            var treeOffset = this.$el.offset();
            var treeTop = treeOffset ? treeOffset.top : 0;
            var top_1 = nodeTop - treeTop;
            this.scrollHandler.scrollToY(top_1);
        }
        return this.element;
    };
    JqTreeWidget.prototype.getState = function () {
        if (this.saveStateHandler) {
            return this.saveStateHandler.getState();
        }
    };
    JqTreeWidget.prototype.setState = function (state) {
        if (this.saveStateHandler) {
            this.saveStateHandler.setInitialState(state);
            this._refreshElements(null);
        }
        return this.element;
    };
    JqTreeWidget.prototype.setOption = function (option, value) {
        this.options[option] = value;
        return this.element;
    };
    JqTreeWidget.prototype.moveDown = function () {
        if (this.keyHandler) {
            this.keyHandler.moveDown();
        }
        return this.element;
    };
    JqTreeWidget.prototype.moveUp = function () {
        if (this.keyHandler) {
            this.keyHandler.moveUp();
        }
        return this.element;
    };
    JqTreeWidget.prototype.getVersion = function () {
        return version_1["default"];
    };
    JqTreeWidget.prototype.testGenerateHitAreas = function (movingNode) {
        if (!this.dndHandler) {
            return [];
        }
        else {
            this.dndHandler.currentItem = this._getNodeElementForNode(movingNode);
            this.dndHandler.generateHitAreas();
            return this.dndHandler.hitAreas;
        }
    };
    JqTreeWidget.prototype._triggerEvent = function (eventName, values) {
        var event = jQuery.Event(eventName);
        jQuery.extend(event, values);
        this.element.trigger(event);
        return event;
    };
    JqTreeWidget.prototype._openNode = function (node, slide, onFinished) {
        var _this = this;
        if (slide === void 0) { slide = true; }
        var doOpenNode = function (_node, _slide, _onFinished) {
            var folderElement = new node_element_1.FolderElement(_node, _this);
            folderElement.open(_onFinished, _slide, _this.options.animationSpeed);
        };
        if (node.isFolder() || node.isEmptyFolder) {
            if (node.load_on_demand) {
                this._loadFolderOnDemand(node, slide, onFinished);
            }
            else {
                var parent_2 = node.parent;
                while (parent_2) {
                    // nb: do not open root element
                    if (parent_2.parent) {
                        doOpenNode(parent_2, false, null);
                    }
                    parent_2 = parent_2.parent;
                }
                doOpenNode(node, slide, onFinished);
                this._saveState();
            }
        }
    };
    /*
    Redraw the tree or part of the tree.
     from_node: redraw this subtree
    */
    JqTreeWidget.prototype._refreshElements = function (fromNode) {
        this.renderer.render(fromNode);
        this._triggerEvent("tree.refresh");
    };
    JqTreeWidget.prototype._getNodeElementForNode = function (node) {
        if (node.isFolder()) {
            return new node_element_1.FolderElement(node, this);
        }
        else {
            return new node_element_1.NodeElement(node, this);
        }
    };
    JqTreeWidget.prototype._getNodeElement = function ($element) {
        var node = this._getNode($element);
        if (node) {
            return this._getNodeElementForNode(node);
        }
        else {
            return null;
        }
    };
    JqTreeWidget.prototype._containsElement = function (element) {
        var node = this._getNode(jQuery(element));
        return node != null && node.tree === this.tree;
    };
    JqTreeWidget.prototype._getScrollLeft = function () {
        return (this.scrollHandler && this.scrollHandler.getScrollLeft()) || 0;
    };
    JqTreeWidget.prototype._init = function () {
        _super.prototype._init.call(this);
        this.element = this.$el;
        this.mouseDelay = 300;
        this.isInitialized = false;
        this.options.rtl = this._getRtlOption();
        if (this.options.closedIcon === null) {
            this.options.closedIcon = this._getDefaultClosedIcon();
        }
        this.renderer = new elements_renderer_1["default"](this);
        this.dataLoader = new data_loader_1["default"](this);
        if (save_state_handler_1["default"] != null) {
            this.saveStateHandler = new save_state_handler_1["default"](this);
        }
        else {
            this.options.saveState = false;
        }
        if (select_node_handler_1["default"] != null) {
            this.selectNodeHandler = new select_node_handler_1["default"](this);
        }
        if (drag_and_drop_handler_1.DragAndDropHandler != null) {
            this.dndHandler = new drag_and_drop_handler_1.DragAndDropHandler(this);
        }
        else {
            this.options.dragAndDrop = false;
        }
        if (scroll_handler_1["default"] != null) {
            this.scrollHandler = new scroll_handler_1["default"](this);
        }
        if (key_handler_1["default"] != null && select_node_handler_1["default"] != null) {
            this.keyHandler = new key_handler_1["default"](this);
        }
        this._initData();
        this.element.click(this._handleClick);
        this.element.dblclick(this._handleDblclick);
        if (this.options.useContextMenu) {
            this.element.on("contextmenu", this._handleContextmenu);
        }
    };
    JqTreeWidget.prototype._deinit = function () {
        this.element.empty();
        this.element.off();
        if (this.keyHandler) {
            this.keyHandler.deinit();
        }
        this.tree = new node_1.Node({}, true);
        _super.prototype._deinit.call(this);
    };
    JqTreeWidget.prototype._mouseCapture = function (positionInfo) {
        if (this.options.dragAndDrop && this.dndHandler) {
            return this.dndHandler.mouseCapture(positionInfo);
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype._mouseStart = function (positionInfo) {
        if (this.options.dragAndDrop && this.dndHandler) {
            return this.dndHandler.mouseStart(positionInfo);
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype._mouseDrag = function (positionInfo) {
        if (this.options.dragAndDrop && this.dndHandler) {
            var result = this.dndHandler.mouseDrag(positionInfo);
            if (this.scrollHandler) {
                this.scrollHandler.checkScrolling();
            }
            return result;
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype._mouseStop = function (positionInfo) {
        if (this.options.dragAndDrop && this.dndHandler) {
            return this.dndHandler.mouseStop(positionInfo);
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype._initData = function () {
        if (this.options.data) {
            this._loadData(this.options.data, null);
        }
        else {
            var dataUrl = this._getDataUrlInfo(null);
            if (dataUrl) {
                this._loadDataFromUrl(null, null, null);
            }
            else {
                this._loadData([], null);
            }
        }
    };
    JqTreeWidget.prototype._getDataUrlInfo = function (node) {
        var _this = this;
        var dataUrl = this.options.dataUrl || this.element.data("url");
        var getUrlFromString = function () {
            var urlInfo = { url: dataUrl };
            setUrlInfoData(urlInfo);
            return urlInfo;
        };
        var setUrlInfoData = function (urlInfo) {
            if (node && node.id) {
                // Load on demand of a subtree; add node parameter
                var data = { node: node.id };
                urlInfo["data"] = data;
            }
            else {
                // Add selected_node parameter
                var selectedNodeId = _this._getNodeIdToBeSelected();
                if (selectedNodeId) {
                    var data = { selected_node: selectedNodeId }; // eslint-disable-line @typescript-eslint/camelcase
                    urlInfo["data"] = data;
                }
            }
        };
        if (typeof dataUrl === "function") {
            return dataUrl(node);
        }
        else if (typeof dataUrl === "string") {
            return getUrlFromString();
        }
        else if (typeof dataUrl === "object") {
            setUrlInfoData(dataUrl);
            return dataUrl;
        }
        else {
            return dataUrl;
        }
    };
    JqTreeWidget.prototype._getNodeIdToBeSelected = function () {
        if (this.options.saveState && this.saveStateHandler) {
            return this.saveStateHandler.getNodeIdToBeSelected();
        }
        else {
            return null;
        }
    };
    JqTreeWidget.prototype._initTree = function (data) {
        var _this = this;
        var doInit = function () {
            if (!_this.isInitialized) {
                _this.isInitialized = true;
                _this._triggerEvent("tree.init");
            }
        };
        this.tree = new this.options.nodeClass(null, true, this.options.nodeClass);
        if (this.selectNodeHandler) {
            this.selectNodeHandler.clear();
        }
        this.tree.loadFromData(data);
        var mustLoadOnDemand = this._setInitialState();
        this._refreshElements(null);
        if (!mustLoadOnDemand) {
            doInit();
        }
        else {
            // Load data on demand and then init the tree
            this._setInitialStateOnDemand(doInit);
        }
    };
    // Set initial state, either by restoring the state or auto-opening nodes
    // result: must load nodes on demand?
    JqTreeWidget.prototype._setInitialState = function () {
        var _this = this;
        var restoreState = function () {
            // result: is state restored, must load on demand?
            if (!(_this.options.saveState && _this.saveStateHandler)) {
                return [false, false];
            }
            else {
                var state = _this.saveStateHandler.getStateFromStorage();
                if (!state) {
                    return [false, false];
                }
                else {
                    var mustLoadOnDemand_1 = _this.saveStateHandler.setInitialState(state);
                    // return true: the state is restored
                    return [true, mustLoadOnDemand_1];
                }
            }
        };
        var autoOpenNodes = function () {
            // result: must load on demand?
            if (_this.options.autoOpen === false) {
                return false;
            }
            var maxLevel = _this._getAutoOpenMaxLevel();
            var mustLoadOnDemand = false;
            _this.tree.iterate(function (node, level) {
                if (node.load_on_demand) {
                    mustLoadOnDemand = true;
                    return false;
                }
                else if (!node.hasChildren()) {
                    return false;
                }
                else {
                    node.is_open = true; // eslint-disable-line @typescript-eslint/camelcase
                    return level !== maxLevel;
                }
            });
            return mustLoadOnDemand;
        };
        var _a = restoreState(), isRestored = _a[0], mustLoadOnDemand = _a[1]; // eslint-disable-line prefer-const
        if (!isRestored) {
            mustLoadOnDemand = autoOpenNodes();
        }
        return mustLoadOnDemand;
    };
    // Set the initial state for nodes that are loaded on demand
    // Call cb_finished when done
    JqTreeWidget.prototype._setInitialStateOnDemand = function (cbFinished) {
        var _this = this;
        var restoreState = function () {
            if (!(_this.options.saveState && _this.saveStateHandler)) {
                return false;
            }
            else {
                var state = _this.saveStateHandler.getStateFromStorage();
                if (!state) {
                    return false;
                }
                else {
                    _this.saveStateHandler.setInitialStateOnDemand(state, cbFinished);
                    return true;
                }
            }
        };
        var autoOpenNodes = function () {
            var maxLevel = _this._getAutoOpenMaxLevel();
            var loadingCount = 0;
            var loadAndOpenNode = function (node) {
                loadingCount += 1;
                _this._openNode(node, false, function () {
                    loadingCount -= 1;
                    openNodes();
                });
            };
            var openNodes = function () {
                _this.tree.iterate(function (node, level) {
                    if (node.load_on_demand) {
                        if (!node.is_loading) {
                            loadAndOpenNode(node);
                        }
                        return false;
                    }
                    else {
                        _this._openNode(node, false, null);
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
    };
    JqTreeWidget.prototype._getAutoOpenMaxLevel = function () {
        if (this.options.autoOpen === true) {
            return -1;
        }
        else {
            return parseInt(this.options.autoOpen, 10);
        }
    };
    JqTreeWidget.prototype._getClickTarget = function (element) {
        var $target = jQuery(element);
        var $button = $target.closest(".jqtree-toggler");
        if ($button.length) {
            var node = this._getNode($button);
            if (node) {
                return {
                    type: "button",
                    node: node
                };
            }
        }
        else {
            var $el = $target.closest(".jqtree-element");
            if ($el.length) {
                var node = this._getNode($el);
                if (node) {
                    return {
                        type: "label",
                        node: node
                    };
                }
            }
        }
        return null;
    };
    JqTreeWidget.prototype._getNode = function ($element) {
        var $li = $element.closest("li.jqtree_common");
        if ($li.length === 0) {
            return null;
        }
        else {
            return $li.data("node");
        }
    };
    JqTreeWidget.prototype._saveState = function () {
        if (this.options.saveState && this.saveStateHandler) {
            this.saveStateHandler.saveState();
        }
    };
    JqTreeWidget.prototype._selectCurrentNode = function () {
        var node = this.getSelectedNode();
        if (node) {
            var nodeElement = this._getNodeElementForNode(node);
            if (nodeElement) {
                nodeElement.select(true);
            }
        }
    };
    JqTreeWidget.prototype._deselectCurrentNode = function () {
        var node = this.getSelectedNode();
        if (node) {
            this.removeFromSelection(node);
        }
    };
    JqTreeWidget.prototype._getDefaultClosedIcon = function () {
        if (this.options.rtl) {
            // triangle to the left
            return "&#x25c0;";
        }
        else {
            // triangle to the right
            return "&#x25ba;";
        }
    };
    JqTreeWidget.prototype._getRtlOption = function () {
        if (this.options.rtl != null) {
            return this.options.rtl;
        }
        else {
            var dataRtl = this.element.data("rtl");
            if (dataRtl != null && dataRtl !== false) {
                return true;
            }
            else {
                return false;
            }
        }
    };
    JqTreeWidget.prototype._selectNode = function (inode, optionsParam) {
        var _this = this;
        if (!this.selectNodeHandler) {
            return;
        }
        var defaultOptions = { mustSetFocus: true, mustToggle: true };
        var selectOptions = __assign(__assign({}, defaultOptions), (optionsParam || {}));
        var canSelect = function () {
            if (_this.options.onCanSelectNode) {
                return _this.options.selectable && _this.options.onCanSelectNode(inode);
            }
            else {
                return _this.options.selectable;
            }
        };
        var openParents = function () {
            var parent = inode.parent;
            if (parent && parent.parent && !parent.is_open) {
                _this.openNode(parent, false);
            }
        };
        var saveState = function () {
            if (_this.options.saveState && _this.saveStateHandler) {
                _this.saveStateHandler.saveState();
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
        var node = inode;
        if (this.selectNodeHandler.isNodeSelected(node)) {
            if (selectOptions.mustToggle) {
                this._deselectCurrentNode();
                this._triggerEvent("tree.select", {
                    node: null,
                    previous_node: node // eslint-disable-line @typescript-eslint/camelcase
                });
            }
        }
        else {
            var deselectedNode = this.getSelectedNode();
            this._deselectCurrentNode();
            this.addToSelection(node, selectOptions.mustSetFocus);
            this._triggerEvent("tree.select", {
                node: node,
                deselected_node: deselectedNode // eslint-disable-line @typescript-eslint/camelcase
            });
            openParents();
        }
        saveState();
    };
    JqTreeWidget.prototype._loadData = function (data, parentNode) {
        if (!data) {
            return;
        }
        else {
            this._triggerEvent("tree.load_data", { tree_data: data }); // eslint-disable-line @typescript-eslint/camelcase
            if (parentNode) {
                this._deselectNodes(parentNode);
                this._loadSubtree(data, parentNode);
            }
            else {
                this._initTree(data);
            }
            if (this.isDragging() && this.dndHandler) {
                this.dndHandler.refresh();
            }
        }
    };
    JqTreeWidget.prototype._deselectNodes = function (parentNode) {
        if (this.selectNodeHandler) {
            var selectedNodesUnderParent = this.selectNodeHandler.getSelectedNodesUnder(parentNode);
            for (var _i = 0, selectedNodesUnderParent_1 = selectedNodesUnderParent; _i < selectedNodesUnderParent_1.length; _i++) {
                var n = selectedNodesUnderParent_1[_i];
                this.selectNodeHandler.removeFromSelection(n);
            }
        }
    };
    JqTreeWidget.prototype._loadSubtree = function (data, parentNode) {
        parentNode.loadFromData(data);
        parentNode.load_on_demand = false; // eslint-disable-line @typescript-eslint/camelcase
        parentNode.is_loading = false; // eslint-disable-line @typescript-eslint/camelcase
        this._refreshElements(parentNode);
    };
    JqTreeWidget.prototype._loadDataFromUrl = function (urlInfoParam, parentNode, onFinished) {
        var urlInfo = urlInfoParam || this._getDataUrlInfo(parentNode);
        this.dataLoader.loadFromUrl(urlInfo, parentNode, onFinished);
    };
    JqTreeWidget.prototype._loadFolderOnDemand = function (node, slide, onFinished) {
        var _this = this;
        if (slide === void 0) { slide = true; }
        node.is_loading = true; // eslint-disable-line @typescript-eslint/camelcase
        this._loadDataFromUrl(null, node, function () {
            _this._openNode(node, slide, onFinished);
        });
    };
    JqTreeWidget.defaults = {
        animationSpeed: "fast",
        autoOpen: false,
        saveState: false,
        dragAndDrop: false,
        selectable: true,
        useContextMenu: true,
        onCanSelectNode: null,
        onSetStateFromStorage: null,
        onGetStateFromStorage: null,
        onCreateLi: null,
        onIsMoveHandle: null,
        // Can this node be moved?
        onCanMove: null,
        // Can this node be moved to this position? function(moved_node, target_node, position)
        onCanMoveTo: null,
        onLoadFailed: null,
        autoEscape: true,
        dataUrl: null,
        // The symbol to use for a closed node - ► BLACK RIGHT-POINTING POINTER
        // http://www.fileformat.info/info/unicode/char/25ba/index.htm
        closedIcon: null,
        // The symbol to use for an open node - ▼ BLACK DOWN-POINTING TRIANGLE
        // http://www.fileformat.info/info/unicode/char/25bc/index.htm
        openedIcon: "&#x25bc;",
        slide: true,
        nodeClass: node_1.Node,
        dataFilter: null,
        keyboardSupport: true,
        openFolderDelay: 500,
        rtl: false,
        onDragMove: null,
        onDragStop: null,
        buttonLeft: true,
        onLoading: null,
        showEmptyFolder: false,
        tabIndex: 0
    };
    return JqTreeWidget;
}(mouse_widget_1["default"]));
simple_widget_1["default"].register(JqTreeWidget, "tree");
