"use strict";
exports.__esModule = true;
var util_1 = require("./util");
var SaveStateHandler = /** @class */ (function () {
    function SaveStateHandler(tree_widget) {
        this.tree_widget = tree_widget;
    }
    SaveStateHandler.prototype.saveState = function () {
        var state = JSON.stringify(this.getState());
        if (this.tree_widget.options.onSetStateFromStorage) {
            this.tree_widget.options.onSetStateFromStorage(state);
        }
        else if (this.supportsLocalStorage()) {
            localStorage.setItem(this.getKeyName(), state);
        }
    };
    SaveStateHandler.prototype.getStateFromStorage = function () {
        var json_data = this._loadFromStorage();
        if (json_data) {
            return this._parseState(json_data);
        }
        else {
            return null;
        }
    };
    SaveStateHandler.prototype.getState = function () {
        var _this = this;
        var getOpenNodeIds = function () {
            var open_nodes = [];
            _this.tree_widget.tree.iterate(function (node) {
                if (node.is_open && node.id && node.hasChildren()) {
                    open_nodes.push(node.id);
                }
                return true;
            });
            return open_nodes;
        };
        var getSelectedNodeIds = function () {
            return _this.tree_widget.getSelectedNodes().map(function (n) { return n.id; });
        };
        return {
            open_nodes: getOpenNodeIds(),
            selected_node: getSelectedNodeIds()
        };
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
            var must_load_on_demand = false;
            if (state.open_nodes) {
                must_load_on_demand = this._openInitialNodes(state.open_nodes);
            }
            if (state.selected_node) {
                this._resetSelection();
                this._selectInitialNodes(state.selected_node);
            }
            return must_load_on_demand;
        }
    };
    SaveStateHandler.prototype.setInitialStateOnDemand = function (state, cb_finished) {
        if (state) {
            this._setInitialStateOnDemand(state.open_nodes, state.selected_node, cb_finished);
        }
        else {
            cb_finished();
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
    SaveStateHandler.prototype._parseState = function (json_data) {
        var state = $.parseJSON(json_data);
        // Check if selected_node is an int (instead of an array)
        if (state && state.selected_node && util_1.isInt(state.selected_node)) {
            // Convert to array
            state.selected_node = [state.selected_node];
        }
        return state;
    };
    SaveStateHandler.prototype._loadFromStorage = function () {
        if (this.tree_widget.options.onGetStateFromStorage) {
            return this.tree_widget.options.onGetStateFromStorage();
        }
        else if (this.supportsLocalStorage()) {
            return localStorage.getItem(this.getKeyName());
        }
    };
    SaveStateHandler.prototype._openInitialNodes = function (node_ids) {
        var must_load_on_demand = false;
        for (var _i = 0, node_ids_1 = node_ids; _i < node_ids_1.length; _i++) {
            var node_id = node_ids_1[_i];
            var node = this.tree_widget.getNodeById(node_id);
            if (node) {
                if (!node.load_on_demand) {
                    node.is_open = true;
                }
                else {
                    must_load_on_demand = true;
                }
            }
        }
        return must_load_on_demand;
    };
    SaveStateHandler.prototype._selectInitialNodes = function (node_ids) {
        var select_count = 0;
        for (var _i = 0, node_ids_2 = node_ids; _i < node_ids_2.length; _i++) {
            var node_id = node_ids_2[_i];
            var node = this.tree_widget.getNodeById(node_id);
            if (node) {
                select_count += 1;
                if (this.tree_widget.select_node_handler) {
                    this.tree_widget.select_node_handler.addToSelection(node);
                }
            }
        }
        return select_count !== 0;
    };
    SaveStateHandler.prototype._resetSelection = function () {
        var select_node_handler = this.tree_widget.select_node_handler;
        if (select_node_handler) {
            var selected_nodes = select_node_handler.getSelectedNodes();
            selected_nodes.forEach(function (node) {
                select_node_handler.removeFromSelection(node);
            });
        }
    };
    SaveStateHandler.prototype._setInitialStateOnDemand = function (node_ids_param, selected_nodes, cb_finished) {
        var _this = this;
        var loading_count = 0;
        var node_ids = node_ids_param;
        var openNodes = function () {
            var new_nodes_ids = [];
            for (var _i = 0, node_ids_3 = node_ids; _i < node_ids_3.length; _i++) {
                var node_id = node_ids_3[_i];
                var node = _this.tree_widget.getNodeById(node_id);
                if (!node) {
                    new_nodes_ids.push(node_id);
                }
                else {
                    if (!node.is_loading) {
                        if (node.load_on_demand) {
                            loadAndOpenNode(node);
                        }
                        else {
                            _this.tree_widget._openNode(node, false, null);
                        }
                    }
                }
            }
            node_ids = new_nodes_ids;
            if (_this._selectInitialNodes(selected_nodes)) {
                _this.tree_widget._refreshElements(null);
            }
            if (loading_count === 0) {
                cb_finished();
            }
        };
        var loadAndOpenNode = function (node) {
            loading_count += 1;
            _this.tree_widget._openNode(node, false, function () {
                loading_count -= 1;
                openNodes();
            });
        };
        openNodes();
    };
    SaveStateHandler.prototype.getKeyName = function () {
        if (typeof this.tree_widget.options.saveState === "string") {
            return this.tree_widget.options.saveState;
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
