import { getBoolString } from "./util";
import { Node } from "./node";
import { IconElement, OnCreateLi } from "./jqtreeOptions";
import { GetTree, IsNodeSelected } from "./jqtreeMethodTypes";

interface ElementsRendererParams {
    autoEscape: boolean;
    buttonLeft: boolean;
    closedIcon?: IconElement;
    dragAndDrop: boolean;
    $element: JQuery;
    getTree: GetTree;
    isNodeSelected: IsNodeSelected;
    onCreateLi?: OnCreateLi;
    openedIcon?: IconElement;
    rtl?: boolean;
    showEmptyFolder: boolean;
    tabIndex?: number;
}

export default class ElementsRenderer {
    public openedIconElement?: HTMLElement | Text;
    public closedIconElement?: HTMLElement | Text;
    private autoEscape: boolean;
    private buttonLeft: boolean;
    private dragAndDrop: boolean;
    private $element: JQuery;
    private getTree: GetTree;
    private isNodeSelected: IsNodeSelected;
    private onCreateLi?: OnCreateLi;
    private rtl?: boolean;
    private showEmptyFolder: boolean;
    private tabIndex?: number;

    constructor({
        autoEscape,
        buttonLeft,
        closedIcon,
        onCreateLi,
        dragAndDrop,
        $element,
        getTree,
        isNodeSelected,
        openedIcon,
        rtl,
        showEmptyFolder,
        tabIndex,
    }: ElementsRendererParams) {
        this.autoEscape = autoEscape;
        this.buttonLeft = buttonLeft;
        this.dragAndDrop = dragAndDrop;
        this.$element = $element;
        this.getTree = getTree;
        this.isNodeSelected = isNodeSelected;
        this.onCreateLi = onCreateLi;
        this.rtl = rtl;
        this.showEmptyFolder = showEmptyFolder;
        this.tabIndex = tabIndex;
        this.openedIconElement = this.createButtonElement(openedIcon ?? "+");
        this.closedIconElement = this.createButtonElement(closedIcon ?? "-");
    }

    public render(fromNode: Node | null): void {
        if (fromNode?.parent) {
            this.renderFromNode(fromNode);
        } else {
            this.renderFromRoot();
        }
    }

    public renderFromRoot(): void {
        this.$element.empty();

        const tree = this.getTree();

        if (this.$element[0] && tree) {
            this.createDomElements(this.$element[0], tree.children, true, 1);
        }
    }

    public renderFromNode(node: Node): void {
        if (!node.element) {
            return;
        }

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
        this.createDomElements(li, node.children, false, node.getLevel() + 1);
    }

    private createDomElements(
        element: Element,
        children: Node[],
        isRootNode: boolean,
        level: number,
    ): void {
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

    private attachNodeData(node: Node, li: HTMLElement): void {
        node.element = li;
        jQuery(li).data("node", node);
    }

    private createUl(isRootNode: boolean): HTMLUListElement {
        let classString;
        let role;

        if (!isRootNode) {
            classString = "";
            role = "group";
        } else {
            classString = "jqtree-tree";
            role = "tree";

            if (this.rtl) {
                classString += " jqtree-rtl";
            }
        }

        if (this.dragAndDrop) {
            classString += " jqtree-dnd";
        }

        const ul = document.createElement("ul");
        ul.className = `jqtree_common ${classString}`;

        ul.setAttribute("role", role);

        return ul;
    }

    private createLi(node: Node, level: number): HTMLLIElement {
        const isSelected = Boolean(this.isNodeSelected(node));

        const mustShowFolder =
            node.isFolder() || (node.isEmptyFolder && this.showEmptyFolder);

        const li = mustShowFolder
            ? this.createFolderLi(node, level, isSelected)
            : this.createNodeLi(node, level, isSelected);

        if (this.onCreateLi) {
            this.onCreateLi(node, jQuery(li), isSelected);
        }

        return li;
    }

    private setTreeItemAriaAttributes(
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

    private createFolderLi(
        node: Node,
        level: number,
        isSelected: boolean,
    ): HTMLLIElement {
        const buttonClasses = this.getButtonClasses(node);
        const folderClasses = this.getFolderClasses(node, isSelected);

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

        if (this.buttonLeft) {
            div.appendChild(buttonLink);
        }

        // title span
        const titleSpan = this.createTitleSpan(
            node.name,
            isSelected,
            true,
            level,
        );
        titleSpan.setAttribute("aria-expanded", getBoolString(node.is_open));
        div.appendChild(titleSpan);

        if (!this.buttonLeft) {
            div.appendChild(buttonLink);
        }

        return li;
    }

    private createNodeLi(
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
        const titleSpan = this.createTitleSpan(
            node.name,
            isSelected,
            false,
            level,
        );
        div.appendChild(titleSpan);

        return li;
    }

    private createTitleSpan(
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

        classes += ` jqtree-title-button-${this.buttonLeft ? "left" : "right"}`;

        titleSpan.className = classes;

        if (isSelected) {
            const tabIndex = this.tabIndex;

            if (tabIndex !== undefined) {
                titleSpan.setAttribute("tabindex", `${tabIndex}`);
            }
        }

        this.setTreeItemAriaAttributes(titleSpan, nodeName, level, isSelected);

        if (this.autoEscape) {
            titleSpan.textContent = nodeName;
        } else {
            titleSpan.innerHTML = nodeName;
        }

        return titleSpan;
    }

    private getButtonClasses(node: Node): string {
        const classes = ["jqtree-toggler", "jqtree_common"];

        if (!node.is_open) {
            classes.push("jqtree-closed");
        }

        if (this.buttonLeft) {
            classes.push("jqtree-toggler-left");
        } else {
            classes.push("jqtree-toggler-right");
        }

        return classes.join(" ");
    }

    private getFolderClasses(node: Node, isSelected: boolean): string {
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

    private createButtonElement(
        value: IconElement,
    ): HTMLElement | Text | undefined {
        if (typeof value === "string") {
            // convert value to html
            const div = document.createElement("div");
            div.innerHTML = value;

            return document.createTextNode(div.innerHTML);
        } else if ((value as HTMLElement).nodeType) {
            return value as HTMLElement;
        } else {
            return jQuery(value)[0];
        }
    }
}
