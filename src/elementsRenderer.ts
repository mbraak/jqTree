import type { GetTree, IsNodeSelected } from "./jqtreeMethodTypes";
import type { IconElement, OnCreateLi } from "./jqtreeOptions";
import type { Node } from "./node";

import { getBoolString } from "./util";

interface ElementsRendererParams {
    autoEscape: boolean;
    buttonLeft: boolean;
    closedIcon?: IconElement;
    dragAndDrop: boolean;
    getTree: GetTree;
    htmlElement: HTMLElement;
    isNodeSelected: IsNodeSelected;
    onCreateLi?: OnCreateLi;
    openedIcon?: IconElement;
    rtl?: boolean;
    setNodeElement: (element: HTMLElement, node: Node) => void;
    showEmptyFolder: boolean;
    tabIndex?: number;
}

export default class ElementsRenderer {
    public closedIconElement?: HTMLElement | Text;
    public openedIconElement?: HTMLElement | Text;
    private _autoEscape: boolean;
    private _buttonLeft: boolean;
    private _dragAndDrop: boolean;
    private _getTree: GetTree;
    private _htmlElement: HTMLElement;
    private _isNodeSelected: IsNodeSelected;
    private _onCreateLi?: OnCreateLi;
    private _rtl?: boolean;
    private _setNodeElement: (element: HTMLElement, node: Node) => void;
    private _showEmptyFolder: boolean;
    private _tabIndex?: number;

    constructor({
        autoEscape,
        buttonLeft,
        closedIcon,
        dragAndDrop,
        getTree,
        htmlElement,
        isNodeSelected,
        onCreateLi,
        openedIcon,
        rtl,
        setNodeElement,
        showEmptyFolder,
        tabIndex,
    }: ElementsRendererParams) {
        this._autoEscape = autoEscape;
        this._buttonLeft = buttonLeft;
        this._dragAndDrop = dragAndDrop;
        this._getTree = getTree;
        this._htmlElement = htmlElement;
        this._isNodeSelected = isNodeSelected;
        this._onCreateLi = onCreateLi;
        this._rtl = rtl;
        this._setNodeElement = setNodeElement;
        this._showEmptyFolder = showEmptyFolder;
        this._tabIndex = tabIndex;
        this.openedIconElement = this._createButtonElement(openedIcon ?? "+");
        this.closedIconElement = this._createButtonElement(closedIcon ?? "-");
    }

    public render(fromNode: Node | null): void {
        if (fromNode?.parent) {
            this.renderFromNode(fromNode);
        } else {
            this.renderFromRoot();
        }
    }

    public renderFromNode(node: Node): void {
        if (!node.element) {
            return;
        }

        const currentLi = node.element;
        const newLi = this._createLi(node, node.getLevel());
        currentLi.replaceWith(newLi);

        // create children
        this._createDomElements(newLi, node.children, false, node.getLevel() + 1);
    }

    public renderFromRoot(): void {
        this._htmlElement.textContent = '';

        const tree = this._getTree();

        if (tree) {
            this._createDomElements(this._htmlElement, tree.children, true, 1);
        }
    }

    private _attachNodeData(node: Node, li: HTMLElement): void {
        node.element = li;
        this._setNodeElement(li, node);
    }

    private _createButtonElement(
        value: IconElement,
    ): HTMLElement | Text | undefined {
        if (typeof value === "string") {
            // convert value to html
            const div = document.createElement("div");
            div.innerHTML = value;

            return document.createTextNode(div.innerHTML);
        } else if (value.nodeType) {
            return value;
        } else {
            return undefined;
        }
    }

    private _createDomElements(
        element: Element,
        children: Node[],
        isRootNode: boolean,
        level: number,
    ): void {
        const ul = this._createUl(isRootNode);
        element.appendChild(ul);

        for (const child of children) {
            const li = this._createLi(child, level);
            ul.appendChild(li);

            if (child.hasChildren()) {
                this._createDomElements(li, child.children, false, level + 1);
            }
        }
    }

    private _createFolderLi(
        node: Node,
        level: number,
        isSelected: boolean,
    ): HTMLLIElement {
        const buttonClasses = this._getButtonClasses(node);
        const folderClasses = this._getFolderClasses(node, isSelected);

        const iconElement = node.is_open
            ? this.openedIconElement
            : this.closedIconElement;

        // li
        const li = document.createElement("li");
        li.className = `jqtree_common ${folderClasses}`;
        li.setAttribute("role", "none");

        // div
        const div = document.createElement("div");
        div.className = "jqtree-element jqtree_common";
        div.setAttribute("role", "none");

        li.appendChild(div);

        // button link
        const buttonLink = document.createElement("a");
        buttonLink.className = buttonClasses;

        if (iconElement) {
            buttonLink.appendChild(iconElement.cloneNode(true));
        }

        if (this._buttonLeft) {
            div.appendChild(buttonLink);
        }

        // title span
        const titleSpan = this._createTitleSpan(
            node.name,
            isSelected,
            true,
            level,
        );
        titleSpan.setAttribute("aria-expanded", getBoolString(node.is_open));
        div.appendChild(titleSpan);

        if (!this._buttonLeft) {
            div.appendChild(buttonLink);
        }

        return li;
    }

    /* Create the <li> element
     * Attach it to node.element.
     * Call onCreateLi
     */
    private _createLi(node: Node, level: number): HTMLLIElement {
        const isSelected = this._isNodeSelected(node);

        const mustShowFolder =
            node.isFolder() || (node.isEmptyFolder && this._showEmptyFolder);

        const li = mustShowFolder
            ? this._createFolderLi(node, level, isSelected)
            : this._createNodeLi(node, level, isSelected);

        this._attachNodeData(node, li);

        if (this._onCreateLi) {
            this._onCreateLi(node, jQuery(li), isSelected);
        }

        return li;
    }

    private _createNodeLi(
        node: Node,
        level: number,
        isSelected: boolean,
    ): HTMLLIElement {
        const liClasses = ["jqtree_common"];

        if (isSelected) {
            liClasses.push("jqtree-selected");
        }

        const classString = liClasses.join(" ");

        // li
        const li = document.createElement("li");
        li.className = classString;
        li.setAttribute("role", "none");

        // div
        const div = document.createElement("div");
        div.className = "jqtree-element jqtree_common";
        div.setAttribute("role", "none");

        li.appendChild(div);

        // title span
        const titleSpan = this._createTitleSpan(
            node.name,
            isSelected,
            false,
            level,
        );
        div.appendChild(titleSpan);

        return li;
    }

    private _createTitleSpan(
        nodeName: string,
        isSelected: boolean,
        isFolder: boolean,
        level: number,
    ): HTMLSpanElement {
        const titleSpan = document.createElement("span");

        let classes = "jqtree-title jqtree_common";

        if (isFolder) {
            classes += " jqtree-title-folder";
        }

        classes += ` jqtree-title-button-${this._buttonLeft ? "left" : "right"}`;

        titleSpan.className = classes;

        if (isSelected) {
            const tabIndex = this._tabIndex;

            if (tabIndex !== undefined) {
                titleSpan.setAttribute("tabindex", `${tabIndex}`);
            }
        }

        this._setTreeItemAriaAttributes(titleSpan, nodeName, level, isSelected);

        if (this._autoEscape) {
            titleSpan.textContent = nodeName;
        } else {
            titleSpan.innerHTML = nodeName;
        }

        return titleSpan;
    }

    private _createUl(isRootNode: boolean): HTMLUListElement {
        let classString;
        let role;

        if (!isRootNode) {
            classString = "";
            role = "group";
        } else {
            classString = "jqtree-tree";
            role = "tree";

            if (this._rtl) {
                classString += " jqtree-rtl";
            }
        }

        if (this._dragAndDrop) {
            classString += " jqtree-dnd";
        }

        const ul = document.createElement("ul");
        ul.className = `jqtree_common ${classString}`;

        ul.setAttribute("role", role);

        return ul;
    }

    private _getButtonClasses(node: Node): string {
        const classes = ["jqtree-toggler", "jqtree_common"];

        if (!node.is_open) {
            classes.push("jqtree-closed");
        }

        if (this._buttonLeft) {
            classes.push("jqtree-toggler-left");
        } else {
            classes.push("jqtree-toggler-right");
        }

        return classes.join(" ");
    }

    private _getFolderClasses(node: Node, isSelected: boolean): string {
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

    private _setTreeItemAriaAttributes(
        element: HTMLElement,
        name: string,
        level: number,
        isSelected: boolean,
    ) {
        element.setAttribute("aria-label", name);
        element.setAttribute("aria-level", `${level}`);
        element.setAttribute("aria-selected", getBoolString(isSelected));
        element.setAttribute("role", "treeitem");
    }
}
