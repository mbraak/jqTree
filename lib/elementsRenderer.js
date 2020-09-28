"use strict";
exports.__esModule = true;
var util_1 = require("./util");
var ElementsRenderer = /** @class */ (function () {
    function ElementsRenderer(treeWidget) {
        this.treeWidget = treeWidget;
        this.openedIconElement = this.createButtonElement(treeWidget.options.openedIcon || "+");
        this.closedIconElement = this.createButtonElement(treeWidget.options.closedIcon || "-");
    }
    ElementsRenderer.prototype.render = function (fromNode) {
        if (fromNode && fromNode.parent) {
            this.renderFromNode(fromNode);
        }
        else {
            this.renderFromRoot();
        }
    };
    ElementsRenderer.prototype.renderFromRoot = function () {
        var $element = this.treeWidget.element;
        $element.empty();
        this.createDomElements($element[0], this.treeWidget.tree.children, true, 1);
    };
    ElementsRenderer.prototype.renderFromNode = function (node) {
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
    };
    ElementsRenderer.prototype.createDomElements = function (element, children, isRootNode, level) {
        var ul = this.createUl(isRootNode);
        element.appendChild(ul);
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var child = children_1[_i];
            var li = this.createLi(child, level);
            ul.appendChild(li);
            this.attachNodeData(child, li);
            if (child.hasChildren()) {
                this.createDomElements(li, child.children, false, level + 1);
            }
        }
    };
    ElementsRenderer.prototype.attachNodeData = function (node, li) {
        node.element = li;
        jQuery(li).data("node", node);
    };
    ElementsRenderer.prototype.createUl = function (isRootNode) {
        var classString;
        var role;
        if (!isRootNode) {
            classString = "";
            role = "group";
        }
        else {
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
        ul.className = "jqtree_common " + classString;
        ul.setAttribute("role", role);
        return ul;
    };
    ElementsRenderer.prototype.createLi = function (node, level) {
        var isSelected = Boolean(this.treeWidget.selectNodeHandler.isNodeSelected(node));
        var mustShowFolder = node.isFolder() ||
            (node.isEmptyFolder && this.treeWidget.options.showEmptyFolder);
        var li = mustShowFolder
            ? this.createFolderLi(node, level, isSelected)
            : this.createNodeLi(node, level, isSelected);
        if (this.treeWidget.options.onCreateLi) {
            this.treeWidget.options.onCreateLi(node, jQuery(li), isSelected);
        }
        return li;
    };
    ElementsRenderer.prototype.createFolderLi = function (node, level, isSelected) {
        var buttonClasses = this.getButtonClasses(node);
        var folderClasses = this.getFolderClasses(node, isSelected);
        var iconElement = node.is_open
            ? this.openedIconElement
            : this.closedIconElement;
        // li
        var li = document.createElement("li");
        li.className = "jqtree_common " + folderClasses;
        li.setAttribute("role", "presentation");
        // div
        var div = document.createElement("div");
        div.className = "jqtree-element jqtree_common";
        div.setAttribute("role", "presentation");
        li.appendChild(div);
        // button link
        var buttonLink = document.createElement("a");
        buttonLink.className = buttonClasses;
        buttonLink.appendChild(iconElement.cloneNode(true));
        buttonLink.setAttribute("role", "presentation");
        buttonLink.setAttribute("aria-hidden", "true");
        if (this.treeWidget.options.buttonLeft) {
            div.appendChild(buttonLink);
        }
        // title span
        div.appendChild(this.createTitleSpan(node.name, level, isSelected, node.is_open, true));
        if (!this.treeWidget.options.buttonLeft) {
            div.appendChild(buttonLink);
        }
        return li;
    };
    ElementsRenderer.prototype.createNodeLi = function (node, level, isSelected) {
        var liClasses = ["jqtree_common"];
        if (isSelected) {
            liClasses.push("jqtree-selected");
        }
        var classString = liClasses.join(" ");
        // li
        var li = document.createElement("li");
        li.className = classString;
        li.setAttribute("role", "presentation");
        // div
        var div = document.createElement("div");
        div.className = "jqtree-element jqtree_common";
        div.setAttribute("role", "presentation");
        li.appendChild(div);
        // title span
        div.appendChild(this.createTitleSpan(node.name, level, isSelected, node.is_open, false));
        return li;
    };
    ElementsRenderer.prototype.createTitleSpan = function (nodeName, level, isSelected, isOpen, isFolder) {
        var titleSpan = document.createElement("span");
        var classes = "jqtree-title jqtree_common";
        if (isFolder) {
            classes += " jqtree-title-folder";
        }
        titleSpan.className = classes;
        titleSpan.setAttribute("role", "treeitem");
        titleSpan.setAttribute("aria-level", "" + level);
        titleSpan.setAttribute("aria-selected", util_1.getBoolString(isSelected));
        titleSpan.setAttribute("aria-expanded", util_1.getBoolString(isOpen));
        if (isSelected) {
            var tabIndex = this.treeWidget.options.tabIndex;
            if (tabIndex !== undefined) {
                titleSpan.setAttribute("tabindex", "" + tabIndex);
            }
        }
        if (this.treeWidget.options.autoEscape) {
            titleSpan.textContent = nodeName;
        }
        else {
            titleSpan.innerHTML = nodeName;
        }
        return titleSpan;
    };
    ElementsRenderer.prototype.getButtonClasses = function (node) {
        var classes = ["jqtree-toggler", "jqtree_common"];
        if (!node.is_open) {
            classes.push("jqtree-closed");
        }
        if (this.treeWidget.options.buttonLeft) {
            classes.push("jqtree-toggler-left");
        }
        else {
            classes.push("jqtree-toggler-right");
        }
        return classes.join(" ");
    };
    ElementsRenderer.prototype.getFolderClasses = function (node, isSelected) {
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
    };
    ElementsRenderer.prototype.createButtonElement = function (value) {
        if (typeof value === "string") {
            // convert value to html
            var div = document.createElement("div");
            div.innerHTML = value;
            return document.createTextNode(div.innerHTML);
        }
        else {
            return jQuery(value)[0];
        }
    };
    return ElementsRenderer;
}());
exports["default"] = ElementsRenderer;
