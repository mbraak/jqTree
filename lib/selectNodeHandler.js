"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SelectNodeHandler = /*#__PURE__*/function () {
  function SelectNodeHandler(treeWidget) {
    _classCallCheck(this, SelectNodeHandler);

    _defineProperty(this, "treeWidget", void 0);

    _defineProperty(this, "selectedNodes", void 0);

    _defineProperty(this, "selectedSingleNode", void 0);

    this.treeWidget = treeWidget;
    this.selectedNodes = new Set();
    this.clear();
  }

  _createClass(SelectNodeHandler, [{
    key: "getSelectedNode",
    value: function getSelectedNode() {
      var selectedNodes = this.getSelectedNodes();

      if (selectedNodes.length) {
        return selectedNodes[0];
      } else {
        return false;
      }
    }
  }, {
    key: "getSelectedNodes",
    value: function getSelectedNodes() {
      var _this = this;

      if (this.selectedSingleNode) {
        return [this.selectedSingleNode];
      } else {
        var selectedNodes = [];
        this.selectedNodes.forEach(function (id) {
          var node = _this.treeWidget.getNodeById(id);

          if (node) {
            selectedNodes.push(node);
          }
        });
        return selectedNodes;
      }
    }
  }, {
    key: "getSelectedNodesUnder",
    value: function getSelectedNodesUnder(parent) {
      if (this.selectedSingleNode) {
        if (parent.isParentOf(this.selectedSingleNode)) {
          return [this.selectedSingleNode];
        } else {
          return [];
        }
      } else {
        var selectedNodes = [];

        for (var id in this.selectedNodes) {
          if (Object.prototype.hasOwnProperty.call(this.selectedNodes, id)) {
            var node = this.treeWidget.getNodeById(id);

            if (node && parent.isParentOf(node)) {
              selectedNodes.push(node);
            }
          }
        }

        return selectedNodes;
      }
    }
  }, {
    key: "isNodeSelected",
    value: function isNodeSelected(node) {
      if (node.id != null) {
        return this.selectedNodes.has(node.id);
      } else if (this.selectedSingleNode) {
        return this.selectedSingleNode.element === node.element;
      } else {
        return false;
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this.selectedNodes.clear();
      this.selectedSingleNode = null;
    }
  }, {
    key: "removeFromSelection",
    value: function removeFromSelection(node) {
      var _this2 = this;

      var includeChildren = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (node.id == null) {
        if (this.selectedSingleNode && node.element === this.selectedSingleNode.element) {
          this.selectedSingleNode = null;
        }
      } else {
        this.selectedNodes["delete"](node.id);

        if (includeChildren) {
          node.iterate(function () {
            if (node.id != null) {
              _this2.selectedNodes["delete"](node.id);
            }

            return true;
          });
        }
      }
    }
  }, {
    key: "addToSelection",
    value: function addToSelection(node) {
      if (node.id != null) {
        this.selectedNodes.add(node.id);
      } else {
        this.selectedSingleNode = node;
      }
    }
  }, {
    key: "isFocusOnTree",
    value: function isFocusOnTree() {
      var activeElement = document.activeElement;
      return Boolean(activeElement && activeElement.tagName === "SPAN" && this.treeWidget._containsElement(activeElement));
    }
  }]);

  return SelectNodeHandler;
}();

exports["default"] = SelectNodeHandler;