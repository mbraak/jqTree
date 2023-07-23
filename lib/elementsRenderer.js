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
var ElementsRenderer = /*#__PURE__*/function () {
  function ElementsRenderer(treeWidget) {
    _classCallCheck(this, ElementsRenderer);
    _defineProperty(this, "openedIconElement", void 0);
    _defineProperty(this, "closedIconElement", void 0);
    _defineProperty(this, "treeWidget", void 0);
    this.treeWidget = treeWidget;
    this.openedIconElement = this.createButtonElement(treeWidget.options.openedIcon || "+");
    this.closedIconElement = this.createButtonElement(treeWidget.options.closedIcon || "-");
  }
  _createClass(ElementsRenderer, [{
    key: "render",
    value: function render(fromNode) {
      if (fromNode && fromNode.parent) {
        this.renderFromNode(fromNode);
      } else {
        this.renderFromRoot();
      }
    }
  }, {
    key: "renderFromRoot",
    value: function renderFromRoot() {
      var $element = this.treeWidget.element;
      $element.empty();
      if ($element[0]) {
        this.createDomElements($element[0], this.treeWidget.tree.children, true, 1);
      }
    }
  }, {
    key: "renderFromNode",
    value: function renderFromNode(node) {
      // remember current li
      var $previousLi = jQuery(node.element);

      // create element
      var li = this.createLi(node, node.getLevel());
      this.attachNodeData(node, li);

      // add element to dom
      $previousLi.after(li);

      // remove previous li
      $previousLi.remove();

      // create children
      if (node.children) {
        this.createDomElements(li, node.children, false, node.getLevel() + 1);
      }
    }
  }, {
    key: "createDomElements",
    value: function createDomElements(element, children, isRootNode, level) {
      var ul = this.createUl(isRootNode);
      element.appendChild(ul);
      var _iterator = _createForOfIteratorHelper(children),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var child = _step.value;
          var li = this.createLi(child, level);
          ul.appendChild(li);
          this.attachNodeData(child, li);
          if (child.hasChildren()) {
            this.createDomElements(li, child.children, false, level + 1);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "attachNodeData",
    value: function attachNodeData(node, li) {
      node.element = li;
      jQuery(li).data("node", node);
    }
  }, {
    key: "createUl",
    value: function createUl(isRootNode) {
      var classString;
      var role;
      if (!isRootNode) {
        classString = "";
        role = "group";
      } else {
        classString = "jqtree-tree";
        role = "tree";
        if (this.treeWidget.options.rtl) {
          classString += " jqtree-rtl";
        }
      }
      if (this.treeWidget.options.dragAndDrop) {
        classString += " jqtree-dnd";
      }
      var ul = document.createElement("ul");
      ul.className = "jqtree_common ".concat(classString);
      ul.setAttribute("role", role);
      return ul;
    }
  }, {
    key: "createLi",
    value: function createLi(node, level) {
      var isSelected = Boolean(this.treeWidget.selectNodeHandler.isNodeSelected(node));
      var mustShowFolder = node.isFolder() || node.isEmptyFolder && this.treeWidget.options.showEmptyFolder;
      var li = mustShowFolder ? this.createFolderLi(node, level, isSelected) : this.createNodeLi(node, level, isSelected);
      if (this.treeWidget.options.onCreateLi) {
        this.treeWidget.options.onCreateLi(node, jQuery(li), isSelected);
      }
      return li;
    }
  }, {
    key: "setTreeItemAriaAttributes",
    value: function setTreeItemAriaAttributes(li, node, level, isSelected) {
      li.setAttribute("aria-label", node.name);
      li.setAttribute("aria-level", "".concat(level));
      li.setAttribute("aria-selected", (0, _util.getBoolString)(isSelected));
      li.setAttribute("role", "treeitem");
    }
  }, {
    key: "createFolderLi",
    value: function createFolderLi(node, level, isSelected) {
      var buttonClasses = this.getButtonClasses(node);
      var folderClasses = this.getFolderClasses(node, isSelected);
      var iconElement = node.is_open ? this.openedIconElement : this.closedIconElement;

      // li
      var li = document.createElement("li");
      li.className = "jqtree_common ".concat(folderClasses);
      this.setTreeItemAriaAttributes(li, node, level, isSelected);
      li.setAttribute("aria-expanded", (0, _util.getBoolString)(node.is_open));

      // div
      var div = document.createElement("div");
      div.className = "jqtree-element jqtree_common";
      div.setAttribute("role", "none");
      li.appendChild(div);

      // button link
      var buttonLink = document.createElement("a");
      buttonLink.className = buttonClasses;
      buttonLink.setAttribute("aria-hidden", "true");
      if (iconElement) {
        buttonLink.appendChild(iconElement.cloneNode(true));
      }
      if (this.treeWidget.options.buttonLeft) {
        div.appendChild(buttonLink);
      }

      // title span
      div.appendChild(this.createTitleSpan(node.name, isSelected, true));
      if (!this.treeWidget.options.buttonLeft) {
        div.appendChild(buttonLink);
      }
      return li;
    }
  }, {
    key: "createNodeLi",
    value: function createNodeLi(node, level, isSelected) {
      var liClasses = ["jqtree_common"];
      if (isSelected) {
        liClasses.push("jqtree-selected");
      }
      var classString = liClasses.join(" ");

      // li
      var li = document.createElement("li");
      li.className = classString;
      this.setTreeItemAriaAttributes(li, node, level, isSelected);

      // div
      var div = document.createElement("div");
      div.className = "jqtree-element jqtree_common";
      div.setAttribute("role", "none");
      li.appendChild(div);

      // title span
      div.appendChild(this.createTitleSpan(node.name, isSelected, false));
      return li;
    }
  }, {
    key: "createTitleSpan",
    value: function createTitleSpan(nodeName, isSelected, isFolder) {
      var titleSpan = document.createElement("span");
      var classes = "jqtree-title jqtree_common";
      if (isFolder) {
        classes += " jqtree-title-folder";
      }
      classes += " jqtree-title-button-".concat(this.treeWidget.options.buttonLeft ? "left" : "right");
      titleSpan.className = classes;
      if (isSelected) {
        var tabIndex = this.treeWidget.options.tabIndex;
        if (tabIndex !== undefined) {
          titleSpan.setAttribute("tabindex", "".concat(tabIndex));
        }
      }
      if (this.treeWidget.options.autoEscape) {
        titleSpan.textContent = nodeName;
      } else {
        titleSpan.innerHTML = nodeName;
      }
      return titleSpan;
    }
  }, {
    key: "getButtonClasses",
    value: function getButtonClasses(node) {
      var classes = ["jqtree-toggler", "jqtree_common"];
      if (!node.is_open) {
        classes.push("jqtree-closed");
      }
      if (this.treeWidget.options.buttonLeft) {
        classes.push("jqtree-toggler-left");
      } else {
        classes.push("jqtree-toggler-right");
      }
      return classes.join(" ");
    }
  }, {
    key: "getFolderClasses",
    value: function getFolderClasses(node, isSelected) {
      var classes = ["jqtree-folder"];
      if (!node.is_open) {
        classes.push("jqtree-closed");
      }
      if (isSelected) {
        classes.push("jqtree-selected");
      }
      if (node.is_loading) {
        classes.push("jqtree-loading");
      }
      return classes.join(" ");
    }
  }, {
    key: "createButtonElement",
    value: function createButtonElement(value) {
      if (typeof value === "string") {
        // convert value to html
        var div = document.createElement("div");
        div.innerHTML = value;
        return document.createTextNode(div.innerHTML);
      } else {
        return jQuery(value)[0];
      }
    }
  }]);
  return ElementsRenderer;
}();
exports["default"] = ElementsRenderer;