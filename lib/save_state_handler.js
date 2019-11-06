"use strict";
exports.__esModule = true;
var util_1 = require("./util");
var SaveStateHandler = /** @class */ (function () {
    function SaveStateHandler(treeWidget) {
        this.treeWidget = treeWidget;
    }
    SaveStateHandler.prototype.saveState = function () {
        var state = JSON.stringify(this.getState());
        if (this.treeWidget.options.onSetStateFromStorage) {
            this.treeWidget.options.onSetStateFromStorage(state);
        }
        else if (this.supportsLocalStorage()) {
            localStorage.setItem(this.getKeyName(), state);
        }
    };
    SaveStateHandler.prototype.getStateFromStorage = function () {
        var jsonData = this._loadFromStorage();
        if (jsonData) {
            return this._parseState(jsonData);
        }
        else {
            return null;
        }
    };
    SaveStateHandler.prototype.getState = function () {
        var _this = this;
        var getOpenNodeIds = function () {
            var openNodes = [];
            _this.treeWidget.tree.iterate(function (node) {
                if (node.is_open && node.id && node.hasChildren()) {
                    openNodes.push(node.id);
                }
                return true;
            });
            return openNodes;
        };
        var getSelectedNodeIds = function () { return _this.treeWidget.getSelectedNodes().map(function (n) { return n.id; }); };
        /* eslint-disable @typescript-eslint/camelcase */
        return {
            open_nodes: getOpenNodeIds(),
            selected_node: getSelectedNodeIds()
        };
        /* eslint-enable @typescript-eslint/camelcase */
    };
    /*
    Set initial state
    Don't handle nodes that are loaded on demand

    result: must load on demand
    */
    SaveStateHandler.prototype.setInitialState = function (state) {
        if (!state) {
            return false;
        }
        else {
            var mustLoadOnDemand = false;
            if (state.open_nodes) {
                mustLoadOnDemand = this._openInitialNodes(state.open_nodes);
            }
            if (state.selected_node) {
                this._resetSelection();
                this._selectInitialNodes(state.selected_node);
            }
            return mustLoadOnDemand;
        }
    };
    SaveStateHandler.prototype.setInitialStateOnDemand = function (state, cbFinished) {
        if (state) {
            this._setInitialStateOnDemand(state.open_nodes, state.selected_node, cbFinished);
        }
        else {
            cbFinished();
        }
    };
    SaveStateHandler.prototype.getNodeIdToBeSelected = function () {
        var state = this.getStateFromStorage();
        if (state && state.selected_node) {
            return state.selected_node[0];
        }
        else {
            return null;
        }
    };
    SaveStateHandler.prototype._parseState = function (jsonData) {
        var state = jQuery.parseJSON(jsonData);
        // Check if selected_node is an int (instead of an array)
        if (state && state.selected_node && util_1.isInt(state.selected_node)) {
            // Convert to array
            state.selected_node = [state.selected_node]; // eslint-disable-line @typescript-eslint/camelcase
        }
        return state;
    };
    SaveStateHandler.prototype._loadFromStorage = function () {
        if (this.treeWidget.options.onGetStateFromStorage) {
            return this.treeWidget.options.onGetStateFromStorage();
        }
        else if (this.supportsLocalStorage()) {
            return localStorage.getItem(this.getKeyName());
        }
    };
    SaveStateHandler.prototype._openInitialNodes = function (nodeIds) {
        var mustLoadOnDemand = false;
        for (var _i = 0, nodeIds_1 = nodeIds; _i < nodeIds_1.length; _i++) {
            var nodeDd = nodeIds_1[_i];
            var node = this.treeWidget.getNodeById(nodeDd);
            if (node) {
                if (!node.load_on_demand) {
                    node.is_open = true; // eslint-disable-line @typescript-eslint/camelcase
                }
                else {
                    mustLoadOnDemand = true;
                }
            }
        }
        return mustLoadOnDemand;
    };
    SaveStateHandler.prototype._selectInitialNodes = function (nodeIds) {
        var selectCount = 0;
        for (var _i = 0, nodeIds_2 = nodeIds; _i < nodeIds_2.length; _i++) {
            var nodeId = nodeIds_2[_i];
            var node = this.treeWidget.getNodeById(nodeId);
            if (node) {
                selectCount += 1;
                if (this.treeWidget.selectNodeHandler) {
                    this.treeWidget.selectNodeHandler.addToSelection(node);
                }
            }
        }
        return selectCount !== 0;
    };
    SaveStateHandler.prototype._resetSelection = function () {
        var selectNodeHandler = this.treeWidget.selectNodeHandler;
        if (selectNodeHandler) {
            var selectedNodes = selectNodeHandler.getSelectedNodes();
            selectedNodes.forEach(function (node) {
                selectNodeHandler.removeFromSelection(node);
            });
        }
    };
    SaveStateHandler.prototype._setInitialStateOnDemand = function (nodeIdsParam, selectedNodes, cbFinished) {
        var _this = this;
        var loadingCount = 0;
        var nodeIds = nodeIdsParam;
        var openNodes = function () {
            var newNodesIds = [];
            for (var _i = 0, nodeIds_3 = nodeIds; _i < nodeIds_3.length; _i++) {
                var nodeId = nodeIds_3[_i];
                var node = _this.treeWidget.getNodeById(nodeId);
                if (!node) {
                    newNodesIds.push(nodeId);
                }
                else {
                    if (!node.is_loading) {
                        if (node.load_on_demand) {
                            loadAndOpenNode(node);
                        }
                        else {
                            _this.treeWidget._openNode(node, false, null);
                        }
                    }
                }
            }
            nodeIds = newNodesIds;
            if (_this._selectInitialNodes(selectedNodes)) {
                _this.treeWidget._refreshElements(null);
            }
            if (loadingCount === 0) {
                cbFinished();
            }
        };
        var loadAndOpenNode = function (node) {
            loadingCount += 1;
            _this.treeWidget._openNode(node, false, function () {
                loadingCount -= 1;
                openNodes();
            });
        };
        openNodes();
    };
    SaveStateHandler.prototype.getKeyName = function () {
        if (typeof this.treeWidget.options.saveState === "string") {
            return this.treeWidget.options.saveState;
        }
        else {
            return "tree";
        }
    };
    SaveStateHandler.prototype.supportsLocalStorage = function () {
        var testSupport = function () {
            // Is local storage supported?
            if (localStorage == null) {
                return false;
            }
            else {
                // Check if it's possible to store an item. Safari does not allow this in private browsing mode.
                try {
                    var key = "_storage_test";
                    sessionStorage.setItem(key, "value");
                    sessionStorage.removeItem(key);
                }
                catch (error) {
                    return false;
                }
                return true;
            }
        };
        if (this._supportsLocalStorage == null) {
            this._supportsLocalStorage = testSupport();
        }
        return this._supportsLocalStorage;
    };
    return SaveStateHandler;
}());
exports["default"] = SaveStateHandler;
