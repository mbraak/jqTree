import { html_escape, getBoolString } from "./util";
import { Node } from "./node";
import { ITreeWidget, IconElement } from "./itree_widget";

export default class ElementsRenderer {
    public opened_icon_element: IconElement;
    public closed_icon_element: IconElement;
    private tree_widget: ITreeWidget;

    constructor(tree_widget: ITreeWidget) {
        this.tree_widget = tree_widget;

        this.opened_icon_element = this.createButtonElement(
            tree_widget.options.openedIcon
        );
        this.closed_icon_element = this.createButtonElement(
            tree_widget.options.closedIcon
        );
    }

    public render(from_node: Node | null) {
        if (from_node && from_node.parent) {
            this.renderFromNode(from_node);
        } else {
            this.renderFromRoot();
        }
    }

    public renderFromRoot() {
        const $element = this.tree_widget.element;
        $element.empty();

        this.createDomElements(
            $element[0],
            this.tree_widget.tree.children,
            true,
            1
        );
    }

    public renderFromNode(node: Node) {
        // remember current li
        const $previous_li = $(node.element);

        // create element
        const li = this.createLi(node, node.getLevel());
        this.attachNodeData(node, li);

        // add element to dom
        $previous_li.after(li);

        // remove previous li
        $previous_li.remove();

        // create children
        if (node.children) {
            this.createDomElements(
                li,
                node.children,
                false,
                node.getLevel() + 1
            );
        }
    }

    private createDomElements(
        element: Element,
        children: Node[],
        is_root_node: boolean,
        level: number
    ) {
        const ul = this.createUl(is_root_node);
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

    private attachNodeData(node: Node, li: Element) {
        node.element = li;
        $(li).data("node", node);
    }

    private createUl(is_root_node: boolean) {
        let class_string;
        let role;

        if (!is_root_node) {
            class_string = "";
            role = "group";
        } else {
            class_string = "jqtree-tree";
            role = "tree";

            if (this.tree_widget.options.rtl) {
                class_string += " jqtree-rtl";
            }
        }

        const ul = document.createElement("ul");
        ul.className = `jqtree_common ${class_string}`;

        ul.setAttribute("role", role);

        return ul;
    }

    private createLi(node: Node, level: number) {
        const is_selected = Boolean(
            this.tree_widget.select_node_handler &&
                this.tree_widget.select_node_handler.isNodeSelected(node)
        );

        const li = node.isFolder()
            ? this.createFolderLi(node, level, is_selected)
            : this.createNodeLi(node, level, is_selected);

        if (this.tree_widget.options.onCreateLi) {
            this.tree_widget.options.onCreateLi(node, $(li), is_selected);
        }

        return li;
    }

    private createFolderLi(node: Node, level: number, is_selected: boolean) {
        const button_classes = this.getButtonClasses(node);
        const folder_classes = this.getFolderClasses(node, is_selected);

        const icon_element = node.is_open
            ? this.opened_icon_element
            : this.closed_icon_element;

        // li
        const li = document.createElement("li");
        li.className = `jqtree_common ${folder_classes}`;
        li.setAttribute("role", "presentation");

        // div
        const div = document.createElement("div");
        div.className = "jqtree-element jqtree_common";
        div.setAttribute("role", "presentation");

        li.appendChild(div);

        // button link
        const button_link = document.createElement("a");
        button_link.className = button_classes;

        button_link.appendChild(icon_element.cloneNode(true));

        button_link.setAttribute("role", "presentation");
        button_link.setAttribute("aria-hidden", "true");

        if (this.tree_widget.options.buttonLeft) {
            div.appendChild(button_link);
        }

        // title span
        div.appendChild(
            this.createTitleSpan(
                node.name,
                level,
                is_selected,
                node.is_open,
                true
            )
        );

        if (!this.tree_widget.options.buttonLeft) {
            div.appendChild(button_link);
        }

        return li;
    }

    private createNodeLi(node: Node, level: number, is_selected: boolean) {
        const li_classes = ["jqtree_common"];

        if (is_selected) {
            li_classes.push("jqtree-selected");
        }

        const class_string = li_classes.join(" ");

        // li
        const li = document.createElement("li");
        li.className = class_string;
        li.setAttribute("role", "presentation");

        // div
        const div = document.createElement("div");
        div.className = "jqtree-element jqtree_common";
        div.setAttribute("role", "presentation");

        li.appendChild(div);

        // title span
        div.appendChild(
            this.createTitleSpan(
                node.name,
                level,
                is_selected,
                node.is_open,
                false
            )
        );

        return li;
    }

    private createTitleSpan(
        node_name: string,
        level: number,
        is_selected: boolean,
        is_open: boolean,
        is_folder: boolean
    ) {
        const title_span = document.createElement("span");

        let classes = "jqtree-title jqtree_common";

        if (is_folder) {
            classes += " jqtree-title-folder";
        }

        title_span.className = classes;

        title_span.setAttribute("role", "treeitem");
        title_span.setAttribute("aria-level", `${level}`);

        title_span.setAttribute("aria-selected", getBoolString(is_selected));
        title_span.setAttribute("aria-expanded", getBoolString(is_open));

        if (is_selected) {
            title_span.setAttribute(
                "tabindex",
                this.tree_widget.options.tabIndex
            );
        }

        title_span.innerHTML = this.escapeIfNecessary(node_name);

        return title_span;
    }

    private getButtonClasses(node: Node) {
        const classes = ["jqtree-toggler", "jqtree_common"];

        if (!node.is_open) {
            classes.push("jqtree-closed");
        }

        if (this.tree_widget.options.buttonLeft) {
            classes.push("jqtree-toggler-left");
        } else {
            classes.push("jqtree-toggler-right");
        }

        return classes.join(" ");
    }

    private getFolderClasses(node: Node, is_selected: boolean): string {
        const classes = ["jqtree-folder"];

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
    }

    private escapeIfNecessary(value: string): string {
        if (this.tree_widget.options.autoEscape) {
            return html_escape(value);
        } else {
            return value;
        }
    }

    private createButtonElement(value: string | Element) {
        if (typeof value === "string") {
            // convert value to html
            const div = document.createElement("div");
            div.innerHTML = value;

            return document.createTextNode(div.innerHTML);
        } else {
            return $(value)[0];
        }
    }
}
