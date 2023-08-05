"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _util = require("./util");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var SaveStateHandler = /*#__PURE__*/function () {
  function SaveStateHandler(treeWidget) {
    _classCallCheck(this, SaveStateHandler);
    _defineProperty(this, "treeWidget", void 0);
    _defineProperty(this, "_supportsLocalStorage", void 0);
    this.treeWidget = treeWidget;
  }
  _createClass(SaveStateHandler, [{
    key: "saveState",
    value: function saveState() {
      var state = JSON.stringify(this.getState());
      if (this.treeWidget.options.onSetStateFromStorage) {
        this.treeWidget.options.onSetStateFromStorage(state);
      } else if (this.supportsLocalStorage()) {
        localStorage.setItem(this.getKeyName(), state);
      }
    }
  }, {
    key: "getStateFromStorage",
    value: function getStateFromStorage() {
      var jsonData = this.loadFromStorage();
      if (jsonData) {
        return this.parseState(jsonData);
      } else {
        return null;
      }
    }
  }, {
    key: "getState",
    value: function getState() {
      var _this = this;
      var getOpenNodeIds = function getOpenNodeIds() {
        var openNodes = [];
        _this.treeWidget.tree.iterate(function (node) {
          if (node.is_open && node.id && node.hasChildren()) {
            openNodes.push(node.id);
          }
          return true;
        });
        return openNodes;
      };
      var getSelectedNodeIds = function getSelectedNodeIds() {
        var selectedNodeIds = [];
        _this.treeWidget.getSelectedNodes().forEach(function (node) {
          if (node.id != null) {
            selectedNodeIds.push(node.id);
          }
        });
        return selectedNodeIds;
      };
      return {
        open_nodes: getOpenNodeIds(),
        selected_node: getSelectedNodeIds()
      };
    }

    /*
    Set initial state
    Don't handle nodes that are loaded on demand
     result: must load on demand
    */
  }, {
    key: "setInitialState",
    value: function setInitialState(state) {
      if (!state) {
        return false;
      } else {
        var mustLoadOnDemand = false;
        if (state.open_nodes) {
          mustLoadOnDemand = this.openInitialNodes(state.open_nodes);
        }
        if (state.selected_node) {
          this.resetSelection();
          this.selectInitialNodes(state.selected_node);
        }
        return mustLoadOnDemand;
      }
    }
  }, {
    key: "setInitialStateOnDemand",
    value: function setInitialStateOnDemand(state, cbFinished) {
      if (state) {
        this.doSetInitialStateOnDemand(state.open_nodes, state.selected_node, cbFinished);
      } else {
        cbFinished();
      }
    }
  }, {
    key: "getNodeIdToBeSelected",
    value: function getNodeIdToBeSelected() {
      var state = this.getStateFromStorage();
      if (state && state.selected_node) {
        return state.selected_node[0] || null;
      } else {
        return null;
      }
    }
  }, {
    key: "parseState",
    value: function parseState(jsonData) {
      var state = JSON.parse(jsonData);

      // Check if selected_node is an int (instead of an array)
      if (state && state.selected_node && (0, _util.isInt)(state.selected_node)) {
        // Convert to array
        state.selected_node = [state.selected_node];
      }
      return state;
    }
  }, {
    key: "loadFromStorage",
    value: function loadFromStorage() {
      if (this.treeWidget.options.onGetStateFromStorage) {
        return this.treeWidget.options.onGetStateFromStorage();
      } else if (this.supportsLocalStorage()) {
        return localStorage.getItem(this.getKeyName());
      } else {
        return null;
      }
    }
  }, {
    key: "openInitialNodes",
    value: function openInitialNodes(nodeIds) {
      var mustLoadOnDemand = false;
      var _iterator = _createForOfIteratorHelper(nodeIds),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var nodeId = _step.value;
          var node = this.treeWidget.getNodeById(nodeId);
          if (node) {
            if (!node.load_on_demand) {
              node.is_open = true;
            } else {
              mustLoadOnDemand = true;
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return mustLoadOnDemand;
    }
  }, {
    key: "selectInitialNodes",
    value: function selectInitialNodes(nodeIds) {
      var selectCount = 0;
      var _iterator2 = _createForOfIteratorHelper(nodeIds),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var nodeId = _step2.value;
          var node = this.treeWidget.getNodeById(nodeId);
          if (node) {
            selectCount += 1;
            this.treeWidget.selectNodeHandler.addToSelection(node);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return selectCount !== 0;
    }
  }, {
    key: "resetSelection",
    value: function resetSelection() {
      var selectNodeHandler = this.treeWidget.selectNodeHandler;
      var selectedNodes = selectNodeHandler.getSelectedNodes();
      selectedNodes.forEach(function (node) {
        selectNodeHandler.removeFromSelection(node);
      });
    }
  }, {
    key: "doSetInitialStateOnDemand",
    value: function doSetInitialStateOnDemand(nodeIdsParam, selectedNodes, cbFinished) {
      var _this2 = this;
      var loadingCount = 0;
      var nodeIds = nodeIdsParam;
      var openNodes = function openNodes() {
        var newNodesIds = [];
        var _iterator3 = _createForOfIteratorHelper(nodeIds),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var nodeId = _step3.value;
            var node = _this2.treeWidget.getNodeById(nodeId);
            if (!node) {
              newNodesIds.push(nodeId);
            } else {
              if (!node.is_loading) {
                if (node.load_on_demand) {
                  loadAndOpenNode(node);
                } else {
                  _this2.treeWidget._openNode(node, false, null);
                }
              }
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        nodeIds = newNodesIds;
        if (_this2.selectInitialNodes(selectedNodes)) {
          _this2.treeWidget._refreshElements(null);
        }
        if (loadingCount === 0) {
          cbFinished();
        }
      };
      var loadAndOpenNode = function loadAndOpenNode(node) {
        loadingCount += 1;
        _this2.treeWidget._openNode(node, false, function () {
          loadingCount -= 1;
          openNodes();
        });
      };
      openNodes();
    }
  }, {
    key: "getKeyName",
    value: function getKeyName() {
      if (typeof this.treeWidget.options.saveState === "string") {
        return this.treeWidget.options.saveState;
      } else {
        return "tree";
      }
    }
  }, {
    key: "supportsLocalStorage",
    value: function supportsLocalStorage() {
      var testSupport = function testSupport() {
        // Is local storage supported?
        if (localStorage == null) {
          return false;
        } else {
          // Check if it's possible to store an item. Safari does not allow this in private browsing mode.
          try {
            var key = "_storage_test";
            sessionStorage.setItem(key, "value");
            sessionStorage.removeItem(key);
          } catch (error) {
            return false;
          }
          return true;
        }
      };
      if (this._supportsLocalStorage == null) {
        this._supportsLocalStorage = testSupport();
      }
      return this._supportsLocalStorage;
    }
  }]);
  return SaveStateHandler;
}();
exports["default"] = SaveStateHandler;