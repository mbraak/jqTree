"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _util = require("./util");
class SaveStateHandler {
  constructor(treeWidget) {
    this.treeWidget = treeWidget;
  }
  saveState() {
    const state = JSON.stringify(this.getState());
    if (this.treeWidget.options.onSetStateFromStorage) {
      this.treeWidget.options.onSetStateFromStorage(state);
    } else if (this.supportsLocalStorage()) {
      localStorage.setItem(this.getKeyName(), state);
    }
  }
  getStateFromStorage() {
    const jsonData = this.loadFromStorage();
    if (jsonData) {
      return this.parseState(jsonData);
    } else {
      return null;
    }
  }
  getState() {
    const getOpenNodeIds = () => {
      const openNodes = [];
      this.treeWidget.tree.iterate(node => {
        if (node.is_open && node.id && node.hasChildren()) {
          openNodes.push(node.id);
        }
        return true;
      });
      return openNodes;
    };
    const getSelectedNodeIds = () => {
      const selectedNodeIds = [];
      this.treeWidget.getSelectedNodes().forEach(node => {
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
  setInitialState(state) {
    if (!state) {
      return false;
    } else {
      let mustLoadOnDemand = false;
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
  setInitialStateOnDemand(state, cbFinished) {
    if (state) {
      this.doSetInitialStateOnDemand(state.open_nodes, state.selected_node, cbFinished);
    } else {
      cbFinished();
    }
  }
  getNodeIdToBeSelected() {
    const state = this.getStateFromStorage();
    if (state && state.selected_node) {
      return state.selected_node[0] || null;
    } else {
      return null;
    }
  }
  parseState(jsonData) {
    const state = JSON.parse(jsonData);

    // Check if selected_node is an int (instead of an array)
    if (state && state.selected_node && (0, _util.isInt)(state.selected_node)) {
      // Convert to array
      state.selected_node = [state.selected_node];
    }
    return state;
  }
  loadFromStorage() {
    if (this.treeWidget.options.onGetStateFromStorage) {
      return this.treeWidget.options.onGetStateFromStorage();
    } else if (this.supportsLocalStorage()) {
      return localStorage.getItem(this.getKeyName());
    } else {
      return null;
    }
  }
  openInitialNodes(nodeIds) {
    let mustLoadOnDemand = false;
    for (const nodeId of nodeIds) {
      const node = this.treeWidget.getNodeById(nodeId);
      if (node) {
        if (!node.load_on_demand) {
          node.is_open = true;
        } else {
          mustLoadOnDemand = true;
        }
      }
    }
    return mustLoadOnDemand;
  }
  selectInitialNodes(nodeIds) {
    let selectCount = 0;
    for (const nodeId of nodeIds) {
      const node = this.treeWidget.getNodeById(nodeId);
      if (node) {
        selectCount += 1;
        this.treeWidget.selectNodeHandler.addToSelection(node);
      }
    }
    return selectCount !== 0;
  }
  resetSelection() {
    const selectNodeHandler = this.treeWidget.selectNodeHandler;
    const selectedNodes = selectNodeHandler.getSelectedNodes();
    selectedNodes.forEach(node => {
      selectNodeHandler.removeFromSelection(node);
    });
  }
  doSetInitialStateOnDemand(nodeIdsParam, selectedNodes, cbFinished) {
    let loadingCount = 0;
    let nodeIds = nodeIdsParam;
    const openNodes = () => {
      const newNodesIds = [];
      for (const nodeId of nodeIds) {
        const node = this.treeWidget.getNodeById(nodeId);
        if (!node) {
          newNodesIds.push(nodeId);
        } else {
          if (!node.is_loading) {
            if (node.load_on_demand) {
              loadAndOpenNode(node);
            } else {
              this.treeWidget._openNode(node, false, null);
            }
          }
        }
      }
      nodeIds = newNodesIds;
      if (this.selectInitialNodes(selectedNodes)) {
        this.treeWidget._refreshElements(null);
      }
      if (loadingCount === 0) {
        cbFinished();
      }
    };
    const loadAndOpenNode = node => {
      loadingCount += 1;
      this.treeWidget._openNode(node, false, () => {
        loadingCount -= 1;
        openNodes();
      });
    };
    openNodes();
  }
  getKeyName() {
    if (typeof this.treeWidget.options.saveState === "string") {
      return this.treeWidget.options.saveState;
    } else {
      return "tree";
    }
  }
  supportsLocalStorage() {
    const testSupport = () => {
      // Is local storage supported?
      if (localStorage == null) {
        return false;
      } else {
        // Check if it's possible to store an item. Safari does not allow this in private browsing mode.
        try {
          const key = "_storage_test";
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
}
exports.default = SaveStateHandler;