import { getBoolString } from "./util";
export default class ElementsRenderer {
    constructor(treeWidget) {
        this.treeWidget = treeWidget;
        this.openedIconElement = this.createButtonElement(treeWidget.options.openedIcon || "+");
        this.closedIconElement = this.createButtonElement(treeWidget.options.closedIcon || "-");
    }
    render(fromNode) {
        if (fromNode && fromNode.parent) {
            this.renderFromNode(fromNode);
        }
        else {
            this.renderFromRoot();
        }
    }
    renderFromRoot() {
        const $element = this.treeWidget.element;
        $element.empty();
        this.createDomElements($element[0], this.treeWidget.tree.children, true, 1);
    }
    renderFromNode(node) {
        // remember current li
        const $previousLi = jQuery(node.element);
        // create element
        const li = this.createLi(node, node.getLevel());
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
    createDomElements(element, children, isRootNode, level) {
        const ul = this.createUl(isRootNode);
        element.appendChild(ul);
        for (const child of children) {
            const li = this.createLi(child, level);
            ul.appendChild(li);
            this.attachNodeData(child, li);
            if (child.hasChildren()) {
                this.createDomElements(li, child.children, false, level + 1);
            }
        }
    }
    attachNodeData(node, li) {
        node.element = li;
        jQuery(li).data("node", node);
    }
    createUl(isRootNode) {
        let classString;
        let role;
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
        const ul = document.createElement("ul");
        ul.className = `jqtree_common ${classString}`;
        ul.setAttribute("role", role);
        return ul;
    }
    createLi(node, level) {
        const isSelected = Boolean(this.treeWidget.selectNodeHandler.isNodeSelected(node));
        const mustShowFolder = node.isFolder() ||
            (node.isEmptyFolder && this.treeWidget.options.showEmptyFolder);
        const li = mustShowFolder
            ? this.createFolderLi(node, level, isSelected)
            : this.createNodeLi(node, level, isSelected);
        if (this.treeWidget.options.onCreateLi) {
            this.treeWidget.options.onCreateLi(node, jQuery(li), isSelected);
        }
        return li;
    }
    createFolderLi(node, level, isSelected) {
        const buttonClasses = this.getButtonClasses(node);
        const folderClasses = this.getFolderClasses(node, isSelected);
        const iconElement = node.is_open
            ? this.openedIconElement
            : this.closedIconElement;
        // li
        const li = document.createElement("li");
        li.className = `jqtree_common ${folderClasses}`;
        li.setAttribute("role", "presentation");
        // div
        const div = document.createElement("div");
        div.className = "jqtree-element jqtree_common";
        div.setAttribute("role", "presentation");
        li.appendChild(div);
        // button link
        const buttonLink = document.createElement("a");
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
    }
    createNodeLi(node, level, isSelected) {
        const liClasses = ["jqtree_common"];
        if (isSelected) {
            liClasses.push("jqtree-selected");
        }
        const classString = liClasses.join(" ");
        // li
        const li = document.createElement("li");
        li.className = classString;
        li.setAttribute("role", "presentation");
        // div
        const div = document.createElement("div");
        div.className = "jqtree-element jqtree_common";
        div.setAttribute("role", "presentation");
        li.appendChild(div);
        // title span
        div.appendChild(this.createTitleSpan(node.name, level, isSelected, node.is_open, false));
        return li;
    }
    createTitleSpan(nodeName, level, isSelected, isOpen, isFolder) {
        const titleSpan = document.createElement("span");
        let classes = "jqtree-title jqtree_common";
        if (isFolder) {
            classes += " jqtree-title-folder";
        }
        titleSpan.className = classes;
        titleSpan.setAttribute("role", "treeitem");
        titleSpan.setAttribute("aria-level", `${level}`);
        titleSpan.setAttribute("aria-selected", getBoolString(isSelected));
        titleSpan.setAttribute("aria-expanded", getBoolString(isOpen));
        if (isSelected) {
            const tabIndex = this.treeWidget.options.tabIndex;
            if (tabIndex !== undefined) {
                titleSpan.setAttribute("tabindex", `${tabIndex}`);
            }
        }
        if (this.treeWidget.options.autoEscape) {
            titleSpan.textContent = nodeName;
        }
        else {
            titleSpan.innerHTML = nodeName;
        }
        return titleSpan;
    }
    getButtonClasses(node) {
        const classes = ["jqtree-toggler", "jqtree_common"];
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
    }
    getFolderClasses(node, isSelected) {
        const classes = ["jqtree-folder"];
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
    createButtonElement(value) {
        if (typeof value === "string") {
            // convert value to html
            const div = document.createElement("div");
            div.innerHTML = value;
            return document.createTextNode(div.innerHTML);
        }
        else {
            return jQuery(value)[0];
        }
    }
}
