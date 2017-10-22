"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var version_1 = require("./version");
var drag_and_drop_handler_1 = require("./drag_and_drop_handler");
var elements_renderer_1 = require("./elements_renderer");
var key_handler_1 = require("./key_handler");
var mouse_widget_1 = require("./mouse.widget");
var save_state_handler_1 = require("./save_state_handler");
var scroll_handler_1 = require("./scroll_handler");
var select_node_handler_1 = require("./select_node_handler");
var simple_widget_1 = require("./simple.widget");
var node_1 = require("./node");
var util_1 = require("./util");
var node_element_1 = require("./node_element");
var JqTreeWidget = /** @class */ (function (_super) {
    __extends(JqTreeWidget, _super);
    function JqTreeWidget() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    JqTreeWidget.prototype.toggle = function (node, slide_param) {
        var slide = slide_param == null ? this.options.slide : slide_param;
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
    JqTreeWidget.prototype.selectNode = function (node) {
        this._selectNode(node, false);
        return this.element;
    };
    JqTreeWidget.prototype.getSelectedNode = function () {
        if (this.select_node_handler) {
            return this.select_node_handler.getSelectedNode();
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype.toJson = function () {
        return JSON.stringify(this.tree.getData());
    };
    JqTreeWidget.prototype.loadData = function (data, parent_node) {
        this._loadData(data, parent_node);
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
        if ($.type(param1) === "string") {
            // first parameter is url
            this._loadDataFromUrl(param1, param2, param3);
        }
        else {
            // first parameter is not url
            this._loadDataFromUrl(null, param1, param2);
        }
        return this.element;
    };
    JqTreeWidget.prototype.reload = function (on_finished) {
        this._loadDataFromUrl(null, null, on_finished);
        return this.element;
    };
    JqTreeWidget.prototype.getNodeById = function (node_id) {
        return this.tree.getNodeById(node_id);
    };
    JqTreeWidget.prototype.getNodeByName = function (name) {
        return this.tree.getNodeByName(name);
    };
    JqTreeWidget.prototype.getNodesByProperty = function (key, value) {
        return this.tree.getNodesByProperty(key, value);
    };
    JqTreeWidget.prototype.getNodeByHtmlElement = function (element) {
        return this._getNode($(element));
    };
    JqTreeWidget.prototype.getNodeByCallback = function (callback) {
        return this.tree.getNodeByCallback(callback);
    };
    JqTreeWidget.prototype.openNode = function (node, param1, param2) {
        var _this = this;
        var parseParams = function () {
            var on_finished;
            var slide;
            if (util_1.isFunction(param1)) {
                on_finished = param1;
                slide = null;
            }
            else {
                slide = param1;
                on_finished = param2;
            }
            if (slide == null) {
                slide = _this.options.slide;
            }
            return [slide, on_finished];
        };
        var _a = parseParams(), slide = _a[0], on_finished = _a[1];
        if (node) {
            this._openNode(node, slide, on_finished);
        }
        return this.element;
    };
    JqTreeWidget.prototype.closeNode = function (node, slide_param) {
        var slide = slide_param == null ? this.options.slide : slide_param;
        if (node.isFolder()) {
            new node_element_1.FolderElement(node, this).close(slide, this.options.animationSpeed);
            this._saveState();
        }
        return this.element;
    };
    JqTreeWidget.prototype.isDragging = function () {
        if (this.dnd_handler) {
            return this.dnd_handler.is_dragging;
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype.refreshHitAreas = function () {
        if (this.dnd_handler) {
            this.dnd_handler.refresh();
        }
        return this.element;
    };
    JqTreeWidget.prototype.addNodeAfter = function (new_node_info, existing_node) {
        var new_node = existing_node.addAfter(new_node_info);
        if (new_node) {
            this._refreshElements(existing_node.parent);
        }
        return new_node;
    };
    JqTreeWidget.prototype.addNodeBefore = function (new_node_info, existing_node) {
        var new_node = existing_node.addBefore(new_node_info);
        if (new_node) {
            this._refreshElements(existing_node.parent);
        }
        return new_node;
    };
    JqTreeWidget.prototype.addParentNode = function (new_node_info, existing_node) {
        var new_node = existing_node.addParent(new_node_info);
        if (new_node) {
            this._refreshElements(new_node.parent);
        }
        return new_node;
    };
    JqTreeWidget.prototype.removeNode = function (node) {
        if (node.parent && this.select_node_handler) {
            this.select_node_handler.removeFromSelection(node, true); // including children
            node.remove();
            this._refreshElements(node.parent);
        }
        return this.element;
    };
    JqTreeWidget.prototype.appendNode = function (new_node_info, parent_node_param) {
        var parent_node = parent_node_param || this.tree;
        var node = parent_node.append(new_node_info);
        this._refreshElements(parent_node);
        return node;
    };
    JqTreeWidget.prototype.prependNode = function (new_node_info, parent_node_param) {
        var parent_node = !parent_node_param ? this.tree : parent_node_param;
        var node = parent_node.prepend(new_node_info);
        this._refreshElements(parent_node);
        return node;
    };
    JqTreeWidget.prototype.updateNode = function (node, data) {
        var id_is_changed = data.id && data.id !== node.id;
        if (id_is_changed) {
            this.tree.removeNodeFromIndex(node);
        }
        node.setData(data);
        if (id_is_changed) {
            this.tree.addNodeToIndex(node);
        }
        if (typeof data === "object" && data.children) {
            node.removeChildren();
            if (data.children.length) {
                node.loadFromData(data.children);
            }
        }
        this.renderer.renderFromNode(node);
        this._selectCurrentNode();
        return this.element;
    };
    JqTreeWidget.prototype.moveNode = function (node, target_node, position) {
        var position_index = node_1.getPosition(position);
        this.tree.moveNode(node, target_node, position_index);
        this._refreshElements(null);
        return this.element;
    };
    JqTreeWidget.prototype.getStateFromStorage = function () {
        if (this.save_state_handler) {
            return this.save_state_handler.getStateFromStorage();
        }
    };
    JqTreeWidget.prototype.addToSelection = function (node) {
        if (node && this.select_node_handler) {
            this.select_node_handler.addToSelection(node);
            this._getNodeElementForNode(node).select();
            this._saveState();
        }
        return this.element;
    };
    JqTreeWidget.prototype.getSelectedNodes = function () {
        if (!this.select_node_handler) {
            return [];
        }
        else {
            return this.select_node_handler.getSelectedNodes();
        }
    };
    JqTreeWidget.prototype.isNodeSelected = function (node) {
        if (!this.select_node_handler) {
            return false;
        }
        else {
            return this.select_node_handler.isNodeSelected(node);
        }
    };
    JqTreeWidget.prototype.removeFromSelection = function (node) {
        if (this.select_node_handler) {
            this.select_node_handler.removeFromSelection(node);
            this._getNodeElementForNode(node).deselect();
            this._saveState();
        }
        return this.element;
    };
    JqTreeWidget.prototype.scrollToNode = function (node) {
        if (this.scroll_handler) {
            var $element = $(node.element);
            var top_1 = $element.offset().top - this.$el.offset().top;
            this.scroll_handler.scrollTo(top_1);
        }
        return this.element;
    };
    JqTreeWidget.prototype.getState = function () {
        if (this.save_state_handler) {
            return this.save_state_handler.getState();
        }
    };
    JqTreeWidget.prototype.setState = function (state) {
        if (this.save_state_handler) {
            this.save_state_handler.setInitialState(state);
            this._refreshElements(null);
        }
        return this.element;
    };
    JqTreeWidget.prototype.setOption = function (option, value) {
        this.options[option] = value;
        return this.element;
    };
    JqTreeWidget.prototype.moveDown = function () {
        if (this.key_handler) {
            this.key_handler.moveDown();
        }
        return this.element;
    };
    JqTreeWidget.prototype.moveUp = function () {
        if (this.key_handler) {
            this.key_handler.moveUp();
        }
        return this.element;
    };
    JqTreeWidget.prototype.getVersion = function () {
        return version_1["default"];
    };
    JqTreeWidget.prototype.testGenerateHitAreas = function (moving_node) {
        if (!this.dnd_handler) {
            return [];
        }
        else {
            this.dnd_handler.current_item = this._getNodeElementForNode(moving_node);
            this.dnd_handler.generateHitAreas();
            return this.dnd_handler.hit_areas;
        }
    };
    JqTreeWidget.prototype._triggerEvent = function (event_name, values) {
        var event = $.Event(event_name);
        $.extend(event, values);
        this.element.trigger(event);
        return event;
    };
    JqTreeWidget.prototype._openNode = function (node, slide, on_finished) {
        var _this = this;
        if (slide === void 0) { slide = true; }
        var doOpenNode = function (_node, _slide, _on_finished) {
            var folder_element = new node_element_1.FolderElement(_node, _this);
            folder_element.open(_on_finished, _slide, _this.options.animationSpeed);
        };
        if (node.isFolder()) {
            if (node.load_on_demand) {
                this._loadFolderOnDemand(node, slide, on_finished);
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
                doOpenNode(node, slide, on_finished);
                this._saveState();
            }
        }
    };
    /*
    Redraw the tree or part of the tree.
     from_node: redraw this subtree
    */
    JqTreeWidget.prototype._refreshElements = function (from_node) {
        this.renderer.render(from_node);
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
        var node = this._getNode($(element));
        return node != null && node.tree === this.tree;
    };
    JqTreeWidget.prototype._init = function () {
        _super.prototype._init.call(this);
        this.element = this.$el;
        this.mouse_delay = 300;
        this.is_initialized = false;
        this.options.rtl = this._getRtlOption();
        if (this.options.closedIcon === null) {
            this.options.closedIcon = this._getDefaultClosedIcon();
        }
        this.renderer = new elements_renderer_1["default"](this);
        if (save_state_handler_1["default"] != null) {
            this.save_state_handler = new save_state_handler_1["default"](this);
        }
        else {
            this.options.saveState = false;
        }
        if (select_node_handler_1["default"] != null) {
            this.select_node_handler = new select_node_handler_1["default"](this);
        }
        if (drag_and_drop_handler_1.DragAndDropHandler != null) {
            this.dnd_handler = new drag_and_drop_handler_1.DragAndDropHandler(this);
        }
        else {
            this.options.dragAndDrop = false;
        }
        if (scroll_handler_1["default"] != null) {
            this.scroll_handler = new scroll_handler_1["default"](this);
        }
        if (key_handler_1["default"] != null && select_node_handler_1["default"] != null) {
            this.key_handler = new key_handler_1["default"](this);
        }
        this._initData();
        this.element.click($.proxy(this._click, this));
        this.element.dblclick($.proxy(this._dblclick, this));
        if (this.options.useContextMenu) {
            this.element.on("contextmenu", $.proxy(this._contextmenu, this));
        }
    };
    JqTreeWidget.prototype._deinit = function () {
        this.element.empty();
        this.element.off();
        if (this.key_handler) {
            this.key_handler.deinit();
        }
        this.tree = new node_1.Node({}, true);
        _super.prototype._deinit.call(this);
    };
    JqTreeWidget.prototype._mouseCapture = function (position_info) {
        if (this.options.dragAndDrop && this.dnd_handler) {
            return this.dnd_handler.mouseCapture(position_info);
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype._mouseStart = function (position_info) {
        if (this.options.dragAndDrop && this.dnd_handler) {
            return this.dnd_handler.mouseStart(position_info);
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype._mouseDrag = function (position_info) {
        if (this.options.dragAndDrop && this.dnd_handler) {
            var result = this.dnd_handler.mouseDrag(position_info);
            if (this.scroll_handler) {
                this.scroll_handler.checkScrolling();
            }
            return result;
        }
        else {
            return false;
        }
    };
    JqTreeWidget.prototype._mouseStop = function (position_info) {
        if (this.options.dragAndDrop && this.dnd_handler) {
            return this.dnd_handler.mouseStop(position_info);
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
            var data_url = this._getDataUrlInfo(null);
            if (data_url) {
                this._loadDataFromUrl(null, null, null);
            }
            else {
                this._loadData([], null);
            }
        }
    };
    JqTreeWidget.prototype._getDataUrlInfo = function (node) {
        var _this = this;
        var data_url = this.options.dataUrl || this.element.data("url");
        var getUrlFromString = function () {
            var url_info = { url: data_url };
            if (node && node.id) {
                // Load on demand of a subtree; add node parameter
                var data = { node: node.id };
                // tslint:disable-next-line: no-string-literal
                url_info["data"] = data;
            }
            else {
                // Add selected_node parameter
                var selected_node_id = _this._getNodeIdToBeSelected();
                if (selected_node_id) {
                    var data = { selected_node: selected_node_id };
                    // tslint:disable-next-line: no-string-literal
                    url_info["data"] = data;
                }
            }
            return url_info;
        };
        if ($.isFunction(data_url)) {
            return data_url(node);
        }
        else if ($.type(data_url) === "string") {
            return getUrlFromString();
        }
        else {
            return data_url;
        }
    };
    JqTreeWidget.prototype._getNodeIdToBeSelected = function () {
        if (this.options.saveState && this.save_state_handler) {
            return this.save_state_handler.getNodeIdToBeSelected();
        }
        else {
            return null;
        }
    };
    JqTreeWidget.prototype._initTree = function (data) {
        var _this = this;
        var doInit = function () {
            if (!_this.is_initialized) {
                _this.is_initialized = true;
                _this._triggerEvent("tree.init");
            }
        };
        this.tree = new this.options.nodeClass(null, true, this.options.nodeClass);
        if (this.select_node_handler) {
            this.select_node_handler.clear();
        }
        this.tree.loadFromData(data);
        var must_load_on_demand = this._setInitialState();
        this._refreshElements(null);
        if (!must_load_on_demand) {
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
            if (!(_this.options.saveState && _this.save_state_handler)) {
                return [false, false];
            }
            else {
                var state = _this.save_state_handler.getStateFromStorage();
                if (!state) {
                    return [false, false];
                }
                else {
                    var must_load_on_demand_1 = _this.save_state_handler.setInitialState(state);
                    // return true: the state is restored
                    return [true, must_load_on_demand_1];
                }
            }
        };
        var autoOpenNodes = function () {
            // result: must load on demand?
            if (_this.options.autoOpen === false) {
                return false;
            }
            var max_level = _this._getAutoOpenMaxLevel();
            var must_load_on_demand = false;
            _this.tree.iterate(function (node, level) {
                if (node.load_on_demand) {
                    must_load_on_demand = true;
                    return false;
                }
                else if (!node.hasChildren()) {
                    return false;
                }
                else {
                    node.is_open = true;
                    return level !== max_level;
                }
            });
            return must_load_on_demand;
        };
        // tslint:disable-next-line: prefer-const
        var _a = restoreState(), is_restored = _a[0], must_load_on_demand = _a[1];
        if (!is_restored) {
            must_load_on_demand = autoOpenNodes();
        }
        return must_load_on_demand;
    };
    // Set the initial state for nodes that are loaded on demand
    // Call cb_finished when done
    JqTreeWidget.prototype._setInitialStateOnDemand = function (cb_finished) {
        var _this = this;
        var restoreState = function () {
            if (!(_this.options.saveState && _this.save_state_handler)) {
                return false;
            }
            else {
                var state = _this.save_state_handler.getStateFromStorage();
                if (!state) {
                    return false;
                }
                else {
                    _this.save_state_handler.setInitialStateOnDemand(state, cb_finished);
                    return true;
                }
            }
        };
        var autoOpenNodes = function () {
            var max_level = _this._getAutoOpenMaxLevel();
            var loading_count = 0;
            var loadAndOpenNode = function (node) {
                loading_count += 1;
                _this._openNode(node, false, function () {
                    loading_count -= 1;
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
                        return level !== max_level;
                    }
                });
                if (loading_count === 0) {
                    cb_finished();
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
    JqTreeWidget.prototype._click = function (e) {
        var click_target = this._getClickTarget(e.target);
        if (click_target) {
            if (click_target.type === "button") {
                this.toggle(click_target.node, this.options.slide);
                e.preventDefault();
                e.stopPropagation();
            }
            else if (click_target.type === "label") {
                var node = click_target.node;
                var event_1 = this._triggerEvent("tree.click", {
                    node: node,
                    click_event: e
                });
                if (!event_1.isDefaultPrevented()) {
                    this._selectNode(node, true);
                }
            }
        }
    };
    JqTreeWidget.prototype._dblclick = function (e) {
        var click_target = this._getClickTarget(e.target);
        if (click_target && click_target.type === "label") {
            this._triggerEvent("tree.dblclick", {
                node: click_target.node,
                click_event: e
            });
        }
    };
    JqTreeWidget.prototype._getClickTarget = function (element) {
        var $target = $(element);
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
    JqTreeWidget.prototype._contextmenu = function (e) {
        var $div = $(e.target).closest("ul.jqtree-tree .jqtree-element");
        if ($div.length) {
            var node = this._getNode($div);
            if (node) {
                e.preventDefault();
                e.stopPropagation();
                this._triggerEvent("tree.contextmenu", {
                    node: node,
                    click_event: e
                });
                return false;
            }
        }
        return null;
    };
    JqTreeWidget.prototype._saveState = function () {
        if (this.options.saveState && this.save_state_handler) {
            this.save_state_handler.saveState();
        }
    };
    JqTreeWidget.prototype._selectCurrentNode = function () {
        var node = this.getSelectedNode();
        if (node) {
            var node_element = this._getNodeElementForNode(node);
            if (node_element) {
                node_element.select();
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
            var data_rtl = this.element.data("rtl");
            if (data_rtl != null && data_rtl !== false) {
                return true;
            }
            else {
                return false;
            }
        }
    };
    JqTreeWidget.prototype._notifyLoading = function (is_loading, node, $el) {
        if (this.options.onLoading) {
            this.options.onLoading(is_loading, node, $el);
        }
    };
    JqTreeWidget.prototype._selectNode = function (node, must_toggle) {
        var _this = this;
        if (must_toggle === void 0) { must_toggle = false; }
        if (!this.select_node_handler) {
            return;
        }
        var canSelect = function () {
            if (_this.options.onCanSelectNode) {
                return (_this.options.selectable &&
                    _this.options.onCanSelectNode(node));
            }
            else {
                return _this.options.selectable;
            }
        };
        var openParents = function () {
            var parent = node.parent;
            if (parent && parent.parent && !parent.is_open) {
                _this.openNode(parent, false);
            }
        };
        var saveState = function () {
            if (_this.options.saveState && _this.save_state_handler) {
                _this.save_state_handler.saveState();
            }
        };
        if (!node) {
            // Called with empty node -> deselect current node
            this._deselectCurrentNode();
            saveState();
            return;
        }
        if (!canSelect()) {
            return;
        }
        if (this.select_node_handler.isNodeSelected(node)) {
            if (must_toggle) {
                this._deselectCurrentNode();
                this._triggerEvent("tree.select", {
                    node: null,
                    previous_node: node
                });
            }
        }
        else {
            var deselected_node = this.getSelectedNode();
            this._deselectCurrentNode();
            this.addToSelection(node);
            this._triggerEvent("tree.select", {
                node: node,
                deselected_node: deselected_node
            });
            openParents();
        }
        saveState();
    };
    JqTreeWidget.prototype._loadData = function (data, parent_node) {
        if (!data) {
            return;
        }
        else {
            this._triggerEvent("tree.load_data", { tree_data: data });
            if (parent_node) {
                this._deselectNodes(parent_node);
                this._loadSubtree(data, parent_node);
            }
            else {
                this._initTree(data);
            }
            if (this.isDragging() && this.dnd_handler) {
                this.dnd_handler.refresh();
            }
        }
    };
    JqTreeWidget.prototype._deselectNodes = function (parent_node) {
        if (this.select_node_handler) {
            var selected_nodes_under_parent = this.select_node_handler.getSelectedNodesUnder(parent_node);
            for (var _i = 0, selected_nodes_under_parent_1 = selected_nodes_under_parent; _i < selected_nodes_under_parent_1.length; _i++) {
                var n = selected_nodes_under_parent_1[_i];
                this.select_node_handler.removeFromSelection(n);
            }
        }
    };
    JqTreeWidget.prototype._loadSubtree = function (data, parent_node) {
        parent_node.loadFromData(data);
        parent_node.load_on_demand = false;
        parent_node.is_loading = false;
        this._refreshElements(parent_node);
    };
    JqTreeWidget.prototype._loadDataFromUrl = function (url_info_param, parent_node, on_finished) {
        var _this = this;
        var $el = null;
        var url_info = url_info_param;
        var addLoadingClass = function () {
            $el = parent_node ? $(parent_node.element) : _this.element;
            $el.addClass("jqtree-loading");
            _this._notifyLoading(true, parent_node, $el);
        };
        var removeLoadingClass = function () {
            if ($el) {
                $el.removeClass("jqtree-loading");
                _this._notifyLoading(false, parent_node, $el);
            }
        };
        var parseUrlInfo = function () {
            if ($.type(url_info) === "string") {
                return { url: url_info };
            }
            if (!url_info.method) {
                url_info.method = "get";
            }
            return url_info;
        };
        var handeLoadData = function (data) {
            removeLoadingClass();
            _this._loadData(data, parent_node);
            if (on_finished && $.isFunction(on_finished)) {
                on_finished();
            }
        };
        var getDataFromResponse = function (response) {
            return $.isArray(response) || typeof response === "object"
                ? response
                : response != null ? $.parseJSON(response) : [];
        };
        var filterData = function (data) {
            return _this.options.dataFilter ? _this.options.dataFilter(data) : data;
        };
        var handleSuccess = function (response) {
            var data = filterData(getDataFromResponse(response));
            handeLoadData(data);
        };
        var handleError = function (response) {
            removeLoadingClass();
            if (_this.options.onLoadFailed) {
                _this.options.onLoadFailed(response);
            }
        };
        var loadDataFromUrlInfo = function () {
            var _url_info = parseUrlInfo();
            $.ajax($.extend({}, _url_info, {
                method: url_info.method != null
                    ? url_info.method.toUpperCase()
                    : "GET",
                cache: false,
                dataType: "json",
                success: handleSuccess,
                error: handleError
            }));
        };
        if (!url_info_param) {
            // Generate url for node
            url_info = this._getDataUrlInfo(parent_node);
        }
        addLoadingClass();
        if (!url_info) {
            removeLoadingClass();
            return;
        }
        else if ($.isArray(url_info)) {
            handeLoadData(url_info);
            return;
        }
        else {
            loadDataFromUrlInfo();
            return;
        }
    };
    JqTreeWidget.prototype._loadFolderOnDemand = function (node, slide, on_finished) {
        var _this = this;
        if (slide === void 0) { slide = true; }
        node.is_loading = true;
        this._loadDataFromUrl(null, node, function () {
            _this._openNode(node, slide, on_finished);
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
        tabIndex: 0
    };
    return JqTreeWidget;
}(mouse_widget_1["default"]));
simple_widget_1["default"].register(JqTreeWidget, "tree");
