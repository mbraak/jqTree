import { Node } from "../node";

interface Options {
    handleAfterOpenFolder: (node: Node, nextNode: Node | null) => void;
    handleClosedFolder: (
        node: Node,
        nextNode: Node | null,
        element: HTMLElement,
    ) => void;
    handleFirstNode: (node: Node) => void;
    handleNode: (
        node: Node,
        nextNode: Node | null,
        element: HTMLElement,
    ) => void;

    /*
    override
    return
        - true: continue iterating
        - false: stop iterating
    */
    handleOpenFolder: (node: Node, element: HTMLElement) => boolean;
}

const iterateVisibleNodes = (
    tree: Node,
    {
        handleAfterOpenFolder,
        handleClosedFolder,
        handleFirstNode,
        handleNode,
        handleOpenFolder,
    }: Options,
) => {
    let isFirstNode = true;

    const iterate = (node: Node, nextNode: Node | null): void => {
        let mustIterateInside =
            (node.is_open || !node.element) && node.hasChildren();

        let element: HTMLElement | null = null;

        // Is the element visible?
        if (node.element?.offsetParent) {
            element = node.element;

            if (isFirstNode) {
                handleFirstNode(node);
                isFirstNode = false;
            }

            if (!node.hasChildren()) {
                handleNode(node, nextNode, node.element);
            } else if (node.is_open) {
                if (!handleOpenFolder(node, node.element)) {
                    mustIterateInside = false;
                }
            } else {
                handleClosedFolder(node, nextNode, element);
            }
        }

        if (mustIterateInside) {
            const childrenLength = node.children.length;
            node.children.forEach((_, i) => {
                const child = node.children[i];

                if (child) {
                    if (i === childrenLength - 1) {
                        iterate(child, null);
                    } else {
                        const nextChild = node.children[i + 1];

                        if (nextChild) {
                            iterate(child, nextChild);
                        }
                    }
                }
            });

            if (node.is_open && element) {
                handleAfterOpenFolder(node, nextNode);
            }
        }
    };

    iterate(tree, null);
};

export default iterateVisibleNodes;
