"use strict";
exports.__esModule = true;
var util_1 = require("./util");
var ElementsRenderer = /** @class */ (function () {
    function ElementsRenderer(tree_widget) {
        this.tree_widget = tree_widget;
        this.opened_icon_element = this.createButtonElement(tree_widget.options.openedIcon);
        this.closed_icon_element = this.createButtonElement(tree_widget.options.closedIcon);
    }
    ElementsRenderer.prototype.render = function (from_node) {
        if (from_node && from_node.parent) {
            this.renderFromNode(from_node);
        }
        else {
            this.renderFromRoot();
        }
    };
    ElementsRenderer.prototype.renderFromRoot = function () {
        var $element = this.tree_widget.element;
        $element.empty();
        this.createDomElements($element[0], this.tree_widget.tree.children, true, 1);
    };
    ElementsRenderer.prototype.renderFromNode = function (node) {
        // remember current li
        var $previous_li = $(node.element);
        // create element
        var li = this.createLi(node, node.getLevel());
        this.attachNodeData(node, li);
        // add element to dom
        $previous_li.after(li);
        // remove previous li
        $previous_li.remove();
        // create children
        if (node.children) {
            this.createDomElements(li, node.children, false, node.getLevel() + 1);
        }
    };
    ElementsRenderer.prototype.createDomElements = function (element, children, is_root_node, level) {
        var ul = this.createUl(is_root_node);
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
        $(li).data("node", node);
    };
    ElementsRenderer.prototype.createUl = function (is_root_node) {
        var class_string;
        var role;
        if (!is_root_node) {
            class_string = "";
            role = "group";
        }
        else {
            class_string = "jqtree-tree";
            role = "tree";
            if (this.tree_widget.options.rtl) {
                class_string += " jqtree-rtl";
            }
        }
        var ul = document.createElement("ul");
        ul.className = "jqtree_common " + class_string;
        ul.setAttribute("role", role);
        return ul;
    };
    ElementsRenderer.prototype.createLi = function (node, level) {
        var is_selected = Boolean(this.tree_widget.select_node_handler &&
            this.tree_widget.select_node_handler.isNodeSelected(node));
        var li = node.isFolder()
            ? this.createFolderLi(node, level, is_selected)
            : this.createNodeLi(node, level, is_selected);
        if (this.tree_widget.options.onCreateLi) {
            this.tree_widget.options.onCreateLi(node, $(li), is_selected);
        }
        return li;
    };
    ElementsRenderer.prototype.createFolderLi = function (node, level, is_selected) {
        var button_classes = this.getButtonClasses(node);
        var folder_classes = this.getFolderClasses(node, is_selected);
        var icon_element = node.is_open
            ? this.opened_icon_element
            : this.closed_icon_element;
        // li
        var li = document.createElement("li");
        li.className = "jqtree_common " + folder_classes;
        li.setAttribute("role", "presentation");
        // div
        var div = document.createElement("div");
        div.className = "jqtree-element jqtree_common";
        div.setAttribute("role", "presentation");
        li.appendChild(div);
        // button link
        var button_link = document.createElement("a");
        button_link.className = button_classes;
        button_link.appendChild(icon_element.cloneNode(true));
        button_link.setAttribute("role", "presentation");
        button_link.setAttribute("aria-hidden", "true");
        if (this.tree_widget.options.buttonLeft) {
            div.appendChild(button_link);
        }
        // title span
        div.appendChild(this.createTitleSpan(node.name, level, is_selected, node.is_open, true));
        if (!this.tree_widget.options.buttonLeft) {
            div.appendChild(button_link);
        }
        return li;
    };
    ElementsRenderer.prototype.createNodeLi = function (node, level, is_selected) {
        var li_classes = ["jqtree_common"];
        if (is_selected) {
            li_classes.push("jqtree-selected");
        }
        var class_string = li_classes.join(" ");
        // li
        var li = document.createElement("li");
        li.className = class_string;
        li.setAttribute("role", "presentation");
        // div
        var div = document.createElement("div");
        div.className = "jqtree-element jqtree_common";
        div.setAttribute("role", "presentation");
        li.appendChild(div);
        // title span
        div.appendChild(this.createTitleSpan(node.name, level, is_selected, node.is_open, false));
        return li;
    };
    ElementsRenderer.prototype.createTitleSpan = function (node_name, level, is_selected, is_open, is_folder) {
        var title_span = document.createElement("span");
        var classes = "jqtree-title jqtree_common";
        if (is_folder) {
            classes += " jqtree-title-folder";
        }
        title_span.className = classes;
        title_span.setAttribute("role", "treeitem");
        title_span.setAttribute("aria-level", "" + level);
        title_span.setAttribute("aria-selected", util_1.getBoolString(is_selected));
        title_span.setAttribute("aria-expanded", util_1.getBoolString(is_open));
        if (is_selected) {
            title_span.setAttribute("tabindex", this.tree_widget.options.tabIndex);
        }
        title_span.innerHTML = this.escapeIfNecessary(node_name);
        return title_span;
    };
    ElementsRenderer.prototype.getButtonClasses = function (node) {
        var classes = ["jqtree-toggler", "jqtree_common"];
        if (!node.is_open) {
            classes.push("jqtree-closed");
        }
        if (this.tree_widget.options.buttonLeft) {
            classes.push("jqtree-toggler-left");
        }
        else {
            classes.push("jqtree-toggler-right");
        }
        return classes.join(" ");
    };
    ElementsRenderer.prototype.getFolderClasses = function (node, is_selected) {
        var classes = ["jqtree-folder"];
        if (!node.is_open) {
            classes.push("jqtree-closed");
        }
        if (is_selected) {
            classes.push("jqtree-selected");
        }
        if (node.is_loading) {
            classes.push("jqtree-loading");
        }
        return classes.join(" ");
    };
    ElementsRenderer.prototype.escapeIfNecessary = function (value) {
        if (this.tree_widget.options.autoEscape) {
            return util_1.html_escape(value);
        }
        else {
            return value;
        }
    };
    ElementsRenderer.prototype.createButtonElement = function (value) {
        if (typeof value === "string") {
            // convert value to html
            var div = document.createElement("div");
            div.innerHTML = value;
            return document.createTextNode(div.innerHTML);
        }
        else {
            return $(value)[0];
        }
    };
    return ElementsRenderer;
}());
exports["default"] = ElementsRenderer;
