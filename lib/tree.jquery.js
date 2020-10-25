"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
exports.JqTreeWidget = void 0;
var version_1 = require("./version");
var jQueryProxy = require("jquery");
var dragAndDropHandler_1 = require("./dragAndDropHandler");
var elementsRenderer_1 = require("./elementsRenderer");
var dataLoader_1 = require("./dataLoader");
var keyHandler_1 = require("./keyHandler");
var mouse_widget_1 = require("./mouse.widget");
var saveStateHandler_1 = require("./saveStateHandler");
var scrollHandler_1 = require("./scrollHandler");
var selectNodeHandler_1 = require("./selectNodeHandler");
var simple_widget_1 = require("./simple.widget");
var node_1 = require("./node");
var util_1 = require("./util");
var nodeElement_1 = require("./nodeElement");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
var jQuery = jQueryProxy["default"] || jQueryProxy;
var NODE_PARAM_IS_EMPTY = "Node parameter is empty";
var PARAM_IS_EMPTY = "Parameter is empty: ";
var JqTreeWidget = /** @class */ (function (_super) {
    __extends(JqTreeWidget, _super);
    function JqTreeWidget() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleClick = function (e) {
            var clickTarget = _this.getClickTarget(e.target);
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
                        click_event: e
                    });
                    if (!event_1.isDefaultPrevented()) {
                        _this.doSelectNode(node);
                    }
                }
            }
        };
        _this.handleDblclick = function (e) {
            var clickTarget = _this.getClickTarget(e.target);
            if ((clickTarget === null || clickTarget === void 0 ? void 0 : clickTarget.type) === "label") {
                _this._triggerEvent("tree.dblclick", {
                    node: clickTarget.node,
                    click_event: e
                });
            }
        };
        _this.handleContextmenu = function (e) {
            var $div = jQuery(e.target).closest("ul.jqtree-tree .jqtree-element");
            if ($div.length) {
                var node = _this.getNode($div);
                if (node) {
                    e.preventDefault();
                    e.stopPropagation();
                    _this._triggerEvent("tree.contextmenu", {
                        node: node,
                        click_event: e
                    });
                    return false;
                }
            }
            return null;
        };
        return _this;
    }
    JqTreeWidget.prototype.toggle = function (node, slideParam) {
        if (slideParam === void 0) { slideParam = null; }
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        var slide = slideParam !== null && slideParam !== void 0 ? slideParam : this.options.slide;
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
        this.doSelectNode(node, optionsParam);
        return this.element;
    };
    JqTreeWidget.prototype.getSelectedNode = function () {
        return this.selectNodeHandler.getSelectedNode();
    };
    JqTreeWidget.prototype.toJson = function () {
        return JSON.stringify(this.tree.getData());
    };
    JqTreeWidget.prototype.loadData = function (data, parentNode) {
        this.doLoadData(data, parentNode);
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
            this.doLoadDataFromUrl(param1, param2, param3 !== null && param3 !== void 0 ? param3 : null);
        }
        else {
            // first parameter is not url
            this.doLoadDataFromUrl(null, param1, param2);
        }
        return this.element;
    };
    JqTreeWidget.prototype.reload = function (onFinished) {
        this.doLoadDataFromUrl(null, null, onFinished);
        return this.element;
    };
    JqTreeWidget.prototype.getNodeById = function (nodeId) {
        return this.tree.getNodeById(nodeId);
    };
    JqTreeWidget.prototype.getNodeByName = function (name) {
        return this.tree.getNodeByName(name);
    };
    JqTreeWidget.prototype.getNodeByNameMustExist = function (name) {
        return this.tree.getNodeByNameMustExist(name);
    };
    JqTreeWidget.prototype.getNodesByProperty = function (key, value) {
        return this.tree.getNodesByProperty(key, value);
    };
    JqTreeWidget.prototype.getNodeByHtmlElement = function (element) {
        return this.getNode(jQuery(element));
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
            var _a;
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
                slide = (_a = _this.options.slide) !== null && _a !== void 0 ? _a : false;
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
        var slide = slideParam !== null && slideParam !== void 0 ? slideParam : this.options.slide;
        if (node.isFolder() || node.isEmptyFolder) {
            new nodeElement_1.FolderElement(node, this).close(slide, this.options.animationSpeed);
            this.saveState();
        }
        return this.element;
    };
    JqTreeWidget.prototype.isDragging = function () {
        return this.dndHandler.isDragging;
    };
    JqTreeWidget.prototype.refreshHitAreas = function () {
        this.dndHandler.refresh();
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
    JqTreeWidget.prototype.removeNode = function (node) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        if (!node.parent) {
            throw Error("Node has no parent");
        }
        this.selectNodeHandler.removeFromSelection(node, true); // including children
        var parent = node.parent;
        node.remove();
        this._refreshElements(parent);
        return this.element;
    };
    JqTreeWidget.prototype.appendNode = function (newNodeInfo, parentNodeParam) {
        var parentNode = parentNodeParam || this.tree;
        var node = parentNode.append(newNodeInfo);
        this._refreshElements(parentNode);
        return node;
    };
    JqTreeWidget.prototype.prependNode = function (newNodeInfo, parentNodeParam) {
        var parentNode = parentNodeParam !== null && parentNodeParam !== void 0 ? parentNodeParam : this.tree;
        var node = parentNode.prepend(newNodeInfo);
        this._refreshElements(parentNode);
        return node;
    };
    JqTreeWidget.prototype.updateNode = function (node, data) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        var idIsChanged = typeof data === "object" && data.id && data.id !== node.id;
        if (idIsChanged) {
            this.tree.removeNodeFromIndex(node);
        }
        node.setData(data);
        if (idIsChanged) {
            this.tree.addNodeToIndex(node);
        }
        if (typeof data === "object" &&
            data["children"] &&
            data["children"] instanceof Array) {
            node.removeChildren();
            if (data.children.length) {
                node.loadFromData(data.children);
            }
        }
        var mustSetFocus = this.selectNodeHandler.isFocusOnTree();
        var mustSelect = this.isSelectedNodeInSubtree(node);
        this._refreshElements(node);
        if (mustSelect) {
            this.selectCurrentNode(mustSetFocus);
        }
        return this.element;
    };
    JqTreeWidget.prototype.isSelectedNodeInSubtree = function (subtree) {
        var selectedNode = this.getSelectedNode();
        if (!selectedNode) {
            return false;
        }
        else {
            return subtree === selectedNode || subtree.isParentOf(selectedNode);
        }
    };
    JqTreeWidget.prototype.moveNode = function (node, targetNode, position) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        if (!targetNode) {
            throw Error(PARAM_IS_EMPTY + "targetNode");
        }
        var positionIndex = node_1.getPosition(position);
        if (positionIndex !== undefined) {
            this.tree.moveNode(node, targetNode, positionIndex);
            this._refreshElements(null);
        }
        return this.element;
    };
    JqTreeWidget.prototype.getStateFromStorage = function () {
        return this.saveStateHandler.getStateFromStorage();
    };
    JqTreeWidget.prototype.addToSelection = function (node, mustSetFocus) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        this.selectNodeHandler.addToSelection(node);
        this._getNodeElementForNode(node).select(mustSetFocus === undefined ? true : mustSetFocus);
        this.saveState();
        return this.element;
    };
    JqTreeWidget.prototype.getSelectedNodes = function () {
        return this.selectNodeHandler.getSelectedNodes();
    };
    JqTreeWidget.prototype.isNodeSelected = function (node) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        return this.selectNodeHandler.isNodeSelected(node);
    };
    JqTreeWidget.prototype.removeFromSelection = function (node) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        this.selectNodeHandler.removeFromSelection(node);
        this._getNodeElementForNode(node).deselect();
        this.saveState();
        return this.element;
    };
    JqTreeWidget.prototype.scrollToNode = function (node) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        var nodeOffset = jQuery(node.element).offset();
        var nodeTop = nodeOffset ? nodeOffset.top : 0;
        var treeOffset = this.$el.offset();
        var treeTop = treeOffset ? treeOffset.top : 0;
        var top = nodeTop - treeTop;
        this.scrollHandler.scrollToY(top);
        return this.element;
    };
    JqTreeWidget.prototype.getState = function () {
        return this.saveStateHandler.getState();
    };
    JqTreeWidget.prototype.setState = function (state) {
        this.saveStateHandler.setInitialState(state);
        this._refreshElements(null);
        return this.element;
    };
    JqTreeWidget.prototype.setOption = function (option, value) {
        this.options[option] = value;
        return this.element;
    };
    JqTreeWidget.prototype.moveDown = function () {
        var selectedNode = this.getSelectedNode();
        if (selectedNode) {
            this.keyHandler.moveDown(selectedNode);
        }
        return this.element;
    };
    JqTreeWidget.prototype.moveUp = function () {
        var selectedNode = this.getSelectedNode();
        if (selectedNode) {
            this.keyHandler.moveUp(selectedNode);
        }
        return this.element;
    };
    JqTreeWidget.prototype.getVersion = function () {
        return version_1["default"];
    };
    JqTreeWidget.prototype._triggerEvent = function (eventName, values) {
        var event = jQuery.Event(eventName, values);
        this.element.trigger(event);
        return event;
    };
    JqTreeWidget.prototype._openNode = function (node, slide, onFinished) {
        var _this = this;
        if (slide === void 0) { slide = true; }
        var doOpenNode = function (_node, _slide, _onFinished) {
            var folderElement = new nodeElement_1.FolderElement(_node, _this);
            folderElement.open(_onFinished, _slide, _this.options.animationSpeed);
        };
        if (node.isFolder() || node.isEmptyFolder) {
            if (node.load_on_demand) {
                this.loadFolderOnDemand(node, slide, onFinished);
            }
            else {
                var parent_1 = node.parent;
                while (parent_1) {
                    // nb: do not open root element
                    if (parent_1.parent) {
                        doOpenNode(parent_1, false, null);
                    }
                    parent_1 = parent_1.parent;
                }
                doOpenNode(node, slide, onFinished);
                this.saveState();
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
            return new nodeElement_1.FolderElement(node, this);
        }
        else {
            return new nodeElement_1.NodeElement(node, this);
        }
    };
    JqTreeWidget.prototype._getNodeElement = function ($element) {
        var node = this.getNode($element);
        if (node) {
            return this._getNodeElementForNode(node);
        }
        else {
            return null;
        }
    };
    JqTreeWidget.prototype._containsElement = function (element) {
        var node = this.getNode(jQuery(element));
        return node != null && node.tree === this.tree;
    };
    JqTreeWidget.prototype._getScrollLeft = function () {
        return this.scrollHandler.getScrollLeft();
    };
    JqTreeWidget.prototype.init = function () {
        _super.prototype.init.call(this);
        this.element = this.$el;
        this.mouseDelay = 300;
        this.isInitialized = false;
        this.options.rtl = this.getRtlOption();
        if (this.options.closedIcon == null) {
            this.options.closedIcon = this.getDefaultClosedIcon();
        }
        this.renderer = new elementsRenderer_1["default"](this);
        this.dataLoader = new dataLoader_1["default"](this);
        this.saveStateHandler = new saveStateHandler_1["default"](this);
        this.selectNodeHandler = new selectNodeHandler_1["default"](this);
        this.dndHandler = new dragAndDropHandler_1.DragAndDropHandler(this);
        this.scrollHandler = new scrollHandler_1["default"](this);
        this.keyHandler = new keyHandler_1["default"](this);
        this.initData();
        this.element.on("click", this.handleClick);
        this.element.on("dblclick", this.handleDblclick);
        if (this.options.useContextMenu) {
            this.element.on("contextmenu", this.handleContextmenu);
        }
    };
    JqTreeWidget.prototype.deinit = function () {
        this.element.empty();
        this.element.off();
        this.keyHandler.deinit();
        this.tree = new node_1.Node({}, true);
        _super.prototype.deinit.call(this);
    };
    JqTreeWidget.prototype.mouseCapture = function (positionInfo) {
        if (this.options.dragAndDrop) {
            return this.dndHandler.mouseCapture(positionInfo);
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype.mouseStart = function (positionInfo) {
        if (this.options.dragAndDrop) {
            return this.dndHandler.mouseStart(positionInfo);
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype.mouseDrag = function (positionInfo) {
        if (this.options.dragAndDrop) {
            var result = this.dndHandler.mouseDrag(positionInfo);
            this.scrollHandler.checkScrolling();
            return result;
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype.mouseStop = function (positionInfo) {
        if (this.options.dragAndDrop) {
            return this.dndHandler.mouseStop(positionInfo);
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype.initData = function () {
        if (this.options.data) {
            this.doLoadData(this.options.data, null);
        }
        else {
            var dataUrl = this.getDataUrlInfo(null);
            if (dataUrl) {
                this.doLoadDataFromUrl(null, null, null);
            }
            else {
                this.doLoadData([], null);
            }
        }
    };
    JqTreeWidget.prototype.getDataUrlInfo = function (node) {
        var _this = this;
        var dataUrl = this.options.dataUrl || this.element.data("url");
        var getUrlFromString = function (url) {
            var urlInfo = { url: url };
            setUrlInfoData(urlInfo);
            return urlInfo;
        };
        var setUrlInfoData = function (urlInfo) {
            if (node === null || node === void 0 ? void 0 : node.id) {
                // Load on demand of a subtree; add node parameter
                var data = { node: node.id };
                urlInfo["data"] = data;
            }
            else {
                // Add selected_node parameter
                var selectedNodeId = _this.getNodeIdToBeSelected();
                if (selectedNodeId) {
                    var data = { selected_node: selectedNodeId };
                    urlInfo["data"] = data;
                }
            }
        };
        if (typeof dataUrl === "function") {
            return dataUrl(node);
        }
        else if (typeof dataUrl === "string") {
            return getUrlFromString(dataUrl);
        }
        else if (dataUrl && typeof dataUrl === "object") {
            setUrlInfoData(dataUrl);
            return dataUrl;
        }
        else {
            return null;
        }
    };
    JqTreeWidget.prototype.getNodeIdToBeSelected = function () {
        if (this.options.saveState) {
            return this.saveStateHandler.getNodeIdToBeSelected();
        }
        else {
            return null;
        }
    };
    JqTreeWidget.prototype.initTree = function (data) {
        var _this = this;
        var doInit = function () {
            if (!_this.isInitialized) {
                _this.isInitialized = true;
                _this._triggerEvent("tree.init");
            }
        };
        if (!this.options.nodeClass) {
            return;
        }
        this.tree = new this.options.nodeClass(null, true, this.options.nodeClass);
        this.selectNodeHandler.clear();
        this.tree.loadFromData(data);
        var mustLoadOnDemand = this.setInitialState();
        this._refreshElements(null);
        if (!mustLoadOnDemand) {
            doInit();
        }
        else {
            // Load data on demand and then init the tree
            this.setInitialStateOnDemand(doInit);
        }
    };
    // Set initial state, either by restoring the state or auto-opening nodes
    // result: must load nodes on demand?
    JqTreeWidget.prototype.setInitialState = function () {
        var _this = this;
        var restoreState = function () {
            // result: is state restored, must load on demand?
            if (!_this.options.saveState) {
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
            var maxLevel = _this.getAutoOpenMaxLevel();
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
                    node.is_open = true;
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
    JqTreeWidget.prototype.setInitialStateOnDemand = function (cbFinished) {
        var _this = this;
        var restoreState = function () {
            if (!_this.options.saveState) {
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
            var maxLevel = _this.getAutoOpenMaxLevel();
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
    JqTreeWidget.prototype.getAutoOpenMaxLevel = function () {
        if (this.options.autoOpen === true) {
            return -1;
        }
        else if (typeof this.options.autoOpen === "number") {
            return this.options.autoOpen;
        }
        else if (typeof this.options.autoOpen === "string") {
            return parseInt(this.options.autoOpen, 10);
        }
        else {
            return 0;
        }
    };
    JqTreeWidget.prototype.getClickTarget = function (element) {
        var $target = jQuery(element);
        var $button = $target.closest(".jqtree-toggler");
        if ($button.length) {
            var node = this.getNode($button);
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
                var node = this.getNode($el);
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
    JqTreeWidget.prototype.getNode = function ($element) {
        var $li = $element.closest("li.jqtree_common");
        if ($li.length === 0) {
            return null;
        }
        else {
            return $li.data("node");
        }
    };
    JqTreeWidget.prototype.saveState = function () {
        if (this.options.saveState) {
            this.saveStateHandler.saveState();
        }
    };
    JqTreeWidget.prototype.selectCurrentNode = function (mustSetFocus) {
        var node = this.getSelectedNode();
        if (node) {
            var nodeElement = this._getNodeElementForNode(node);
            if (nodeElement) {
                nodeElement.select(mustSetFocus);
            }
        }
    };
    JqTreeWidget.prototype.deselectCurrentNode = function () {
        var node = this.getSelectedNode();
        if (node) {
            this.removeFromSelection(node);
        }
    };
    JqTreeWidget.prototype.getDefaultClosedIcon = function () {
        if (this.options.rtl) {
            // triangle to the left
            return "&#x25c0;";
        }
        else {
            // triangle to the right
            return "&#x25ba;";
        }
    };
    JqTreeWidget.prototype.getRtlOption = function () {
        if (this.options.rtl != null) {
            return this.options.rtl;
        }
        else {
            var dataRtl = this.element.data("rtl");
            if (dataRtl !== null &&
                dataRtl !== false &&
                dataRtl !== undefined) {
                return true;
            }
            else {
                return false;
            }
        }
    };
    JqTreeWidget.prototype.doSelectNode = function (node, optionsParam) {
        var _this = this;
        var saveState = function () {
            if (_this.options.saveState) {
                _this.saveStateHandler.saveState();
            }
        };
        if (!node) {
            // Called with empty node -> deselect current node
            this.deselectCurrentNode();
            saveState();
            return;
        }
        var defaultOptions = { mustSetFocus: true, mustToggle: true };
        var selectOptions = __assign(__assign({}, defaultOptions), (optionsParam || {}));
        var canSelect = function () {
            if (_this.options.onCanSelectNode) {
                return (_this.options.selectable === true &&
                    _this.options.onCanSelectNode(node));
            }
            else {
                return _this.options.selectable === true;
            }
        };
        var openParents = function () {
            var parent = node.parent;
            if (parent && parent.parent && !parent.is_open) {
                _this.openNode(parent, false);
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
                    previous_node: node
                });
            }
        }
        else {
            var deselectedNode = this.getSelectedNode() || null;
            this.deselectCurrentNode();
            this.addToSelection(node, selectOptions.mustSetFocus);
            this._triggerEvent("tree.select", {
                node: node,
                deselected_node: deselectedNode
            });
            openParents();
        }
        saveState();
    };
    JqTreeWidget.prototype.doLoadData = function (data, parentNode) {
        if (!data) {
            return;
        }
        else {
            this._triggerEvent("tree.load_data", { tree_data: data });
            if (parentNode) {
                this.deselectNodes(parentNode);
                this.loadSubtree(data, parentNode);
            }
            else {
                this.initTree(data);
            }
            if (this.isDragging()) {
                this.dndHandler.refresh();
            }
        }
    };
    JqTreeWidget.prototype.deselectNodes = function (parentNode) {
        var selectedNodesUnderParent = this.selectNodeHandler.getSelectedNodesUnder(parentNode);
        for (var _i = 0, selectedNodesUnderParent_1 = selectedNodesUnderParent; _i < selectedNodesUnderParent_1.length; _i++) {
            var n = selectedNodesUnderParent_1[_i];
            this.selectNodeHandler.removeFromSelection(n);
        }
    };
    JqTreeWidget.prototype.loadSubtree = function (data, parentNode) {
        parentNode.loadFromData(data);
        parentNode.load_on_demand = false;
        parentNode.is_loading = false;
        this._refreshElements(parentNode);
    };
    JqTreeWidget.prototype.doLoadDataFromUrl = function (urlInfoParam, parentNode, onFinished) {
        var urlInfo = urlInfoParam || this.getDataUrlInfo(parentNode);
        this.dataLoader.loadFromUrl(urlInfo, parentNode, onFinished);
    };
    JqTreeWidget.prototype.loadFolderOnDemand = function (node, slide, onFinished) {
        var _this = this;
        if (slide === void 0) { slide = true; }
        node.is_loading = true;
        this.doLoadDataFromUrl(null, node, function () {
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
        slide: true,
        nodeClass: node_1.Node,
        dataFilter: undefined,
        keyboardSupport: true,
        openFolderDelay: 500,
        rtl: undefined,
        onDragMove: undefined,
        onDragStop: undefined,
        buttonLeft: true,
        onLoading: undefined,
        showEmptyFolder: false,
        tabIndex: 0
    };
    return JqTreeWidget;
}(mouse_widget_1["default"]));
exports.JqTreeWidget = JqTreeWidget;
simple_widget_1["default"].register(JqTreeWidget, "tree");
