import { Node } from "../node";

abstract class VisibleNodeIterator {
    private tree: Node;

    constructor(tree: Node) {
        this.tree = tree;
    }

    protected iterate(): void {
        let isFirstNode = true;

        const _iterateNode = (node: Node, nextNode: Node | null): void => {
            let mustIterateInside =
                (node.is_open || !node.element) && node.hasChildren();

            let $element: JQuery<HTMLElement> | null = null;

            if (node.element) {
                $element = jQuery(node.element);

                if (!$element.is(":visible")) {
                    return;
                }

                if (isFirstNode) {
                    this.handleFirstNode(node);
                    isFirstNode = false;
                }

                if (!node.hasChildren()) {
                    this.handleNode(node, nextNode, $element);
                } else if (node.is_open) {
                    if (!this.handleOpenFolder(node, $element)) {
                        mustIterateInside = false;
                    }
                } else {
                    this.handleClosedFolder(node, nextNode, $element);
                }
            }

            if (mustIterateInside) {
                const childrenLength = node.children.length;
                node.children.forEach((_, i) => {
                    const child = node.children[i];

                    if (child) {
                        if (i === childrenLength - 1) {
                            _iterateNode(child, null);
                        } else {
                            const nextChild = node.children[i + 1];

                            if (nextChild) {
                                _iterateNode(child, nextChild);
                            }
                        }
                    }
                });

                if (node.is_open && $element) {
                    this.handleAfterOpenFolder(node, nextNode);
                }
            }
        };

        _iterateNode(this.tree, null);
    }

    protected abstract handleNode(
        node: Node,
        nextNode: Node | null,
        $element: JQuery,
    ): void;

    /*
    override
    return
        - true: continue iterating
        - false: stop iterating
    */
    protected abstract handleOpenFolder(node: Node, $element: JQuery): boolean;

    protected abstract handleClosedFolder(
        node: Node,
        nextNode: Node | null,
        $element: JQuery,
    ): void;

    protected abstract handleAfterOpenFolder(
        node: Node,
        nextNode: Node | null,
    ): void;

    protected abstract handleFirstNode(node: Node): void;
}

export default VisibleNodeIterator;
