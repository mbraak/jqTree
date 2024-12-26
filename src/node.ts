import { isNodeRecordWithChildren } from "./nodeUtils";

export type Position = "after" | "before" | "inside" | "none";

type IterateCallback = (node: Node, level: number) => boolean;

export class Node implements INode {
    [key: string]: unknown;

    public children: Node[];
    public element?: HTMLElement;
    public id?: NodeId;
    public idMapping: Map<NodeId, Node>;
    public is_loading: boolean;
    public is_open: boolean;
    public isEmptyFolder: boolean;
    public load_on_demand: boolean;
    public name: string;
    public nodeClass?: typeof Node;
    public parent: Node | null;
    public tree?: Node;

    constructor(
        nodeData: NodeData | null = null,
        isRoot = false,
        nodeClass = Node,
    ) {
        this.name = "";
        this.load_on_demand = false;

        this.isEmptyFolder =
            nodeData != null &&
            isNodeRecordWithChildren(nodeData) &&
            nodeData.children.length === 0;

        this.setData(nodeData);

        this.children = [];
        this.parent = null;

        if (isRoot) {
            this.idMapping = new Map<NodeId, Node>();
            this.tree = this;
            this.nodeClass = nodeClass;
        }
    }

    public addAfter(nodeInfo: NodeData): Node | null {
        if (!this.parent) {
            return null;
        } else {
            const node = this.createNode(nodeInfo);

            const childIndex = this.parent.getChildIndex(this);
            this.parent.addChildAtPosition(node, childIndex + 1);

            node.loadChildrenFromData(nodeInfo);
            return node;
        }
    }

    public addBefore(nodeInfo: NodeData): Node | null {
        if (!this.parent) {
            return null;
        } else {
            const node = this.createNode(nodeInfo);

            const childIndex = this.parent.getChildIndex(this);
            this.parent.addChildAtPosition(node, childIndex);

            node.loadChildrenFromData(nodeInfo);
            return node;
        }
    }

    /*
    Add child.

    tree.addChild(
        new Node('child1')
    );
    */
    public addChild(node: Node): void {
        this.children.push(node);
        node.setParent(this);
    }

    /*
    Add child at position. Index starts at 0.

    tree.addChildAtPosition(
        new Node('abc'),
        1
    );
    */
    public addChildAtPosition(node: Node, index: number): void {
        this.children.splice(index, 0, node);
        node.setParent(this);
    }

    public addNodeToIndex(node: Node): void {
        if (node.id != null) {
            this.idMapping.set(node.id, node);
        }
    }

    public addParent(nodeInfo: NodeData): Node | null {
        if (!this.parent) {
            return null;
        } else {
            const newParent = this.createNode(nodeInfo);

            if (this.tree) {
                newParent.setParent(this.tree);
            }
            const originalParent = this.parent;

            for (const child of originalParent.children) {
                newParent.addChild(child);
            }

            originalParent.children = [];
            originalParent.addChild(newParent);
            return newParent;
        }
    }

    public append(nodeInfo: NodeData): Node {
        const node = this.createNode(nodeInfo);
        this.addChild(node);

        node.loadChildrenFromData(nodeInfo);
        return node;
    }

    public filter(f: (node: Node) => boolean): Node[] {
        const result: Node[] = [];

        this.iterate((node: Node) => {
            if (f(node)) {
                result.push(node);
            }

            return true;
        });

        return result;
    }

    /*
    Get child index.

    var index = getChildIndex(node);
    */
    public getChildIndex(node: Node): number {
        return this.children.indexOf(node);
    }

    /*
    Get the tree as data.
    */
    public getData(includeParent = false): NodeRecord[] {
        const getDataFromNodes = (nodes: Node[]): Record<string, unknown>[] => {
            return nodes.map((node) => {
                const tmpNode: Record<string, unknown> = {};

                for (const k in node) {
                    if (
                        [
                            "parent",
                            "children",
                            "element",
                            "idMapping",
                            "load_on_demand",
                            "nodeClass",
                            "tree",
                            "isEmptyFolder",
                        ].indexOf(k) === -1 &&
                        Object.prototype.hasOwnProperty.call(node, k)
                    ) {
                        const v = node[k];
                        tmpNode[k] = v;
                    }
                }

                if (node.hasChildren()) {
                    tmpNode.children = getDataFromNodes(node.children);
                }

                return tmpNode;
            });
        };

        if (includeParent) {
            return getDataFromNodes([this]);
        } else {
            return getDataFromNodes(this.children);
        }
    }

    public getLastChild(): Node | null {
        if (!this.hasChildren()) {
            return null;
        } else {
            const lastChild = this.children[this.children.length - 1];

            if (!lastChild) {
                return null;
            }

            if (!(lastChild.hasChildren() && lastChild.is_open)) {
                return lastChild;
            } else {
                return lastChild.getLastChild();
            }
        }
    }

    public getLevel(): number {
        let level = 0;
        let node: Node = this; // eslint-disable-line @typescript-eslint/no-this-alias

        while (node.parent) {
            level += 1;
            node = node.parent;
        }

        return level;
    }

    public getNextNode(includeChildren = true): Node | null {
        if (includeChildren && this.hasChildren()) {
            return this.children[0] ?? null;
        } else if (!this.parent) {
            return null;
        } else {
            const nextSibling = this.getNextSibling();

            if (nextSibling) {
                return nextSibling;
            } else {
                return this.parent.getNextNode(false);
            }
        }
    }

    public getNextSibling(): Node | null {
        if (!this.parent) {
            return null;
        } else {
            const nextIndex = this.parent.getChildIndex(this) + 1;
            if (nextIndex < this.parent.children.length) {
                return this.parent.children[nextIndex] ?? null;
            } else {
                return null;
            }
        }
    }

    public getNextVisibleNode(): Node | null {
        if (this.hasChildren() && this.is_open) {
            // First child
            return this.children[0] ?? null;
        } else {
            if (!this.parent) {
                return null;
            } else {
                const nextSibling = this.getNextSibling();
                if (nextSibling) {
                    // Next sibling
                    return nextSibling;
                } else {
                    // Next node of parent
                    return this.parent.getNextNode(false);
                }
            }
        }
    }

    public getNodeByCallback(callback: (node: Node) => boolean): Node | null {
        let result: Node | null = null;

        this.iterate((node: Node) => {
            if (result) {
                return false;
            } else if (callback(node)) {
                result = node;
                return false;
            } else {
                return true;
            }
        });

        return result;
    }

    public getNodeById(nodeId: NodeId): Node | null {
        return this.idMapping.get(nodeId) ?? null;
    }

    public getNodeByName(name: string): Node | null {
        return this.getNodeByCallback((node: Node) => node.name === name);
    }

    public getNodeByNameMustExist(name: string): Node {
        const node = this.getNodeByCallback((n: Node) => n.name === name);

        if (!node) {
            throw new Error(`Node with name ${name} not found`);
        }

        return node;
    }

    public getNodesByProperty(key: string, value: unknown): Node[] {
        return this.filter((node: Node) => node[key] === value);
    }

    public getParent(): Node | null {
        // Return parent except if it is the root node
        if (!this.parent) {
            return null;
        } else if (!this.parent.parent) {
            // Root node -> null
            return null;
        } else {
            return this.parent;
        }
    }

    public getPreviousNode(): Node | null {
        if (!this.parent) {
            return null;
        } else {
            const previousSibling = this.getPreviousSibling();

            if (!previousSibling) {
                return this.getParent();
            } else if (previousSibling.hasChildren()) {
                return previousSibling.getLastChild();
            } else {
                return previousSibling;
            }
        }
    }

    public getPreviousSibling(): Node | null {
        if (!this.parent) {
            return null;
        } else {
            const previousIndex = this.parent.getChildIndex(this) - 1;
            if (previousIndex >= 0) {
                return this.parent.children[previousIndex] ?? null;
            } else {
                return null;
            }
        }
    }

    public getPreviousVisibleNode(): Node | null {
        if (!this.parent) {
            return null;
        } else {
            const previousSibling = this.getPreviousSibling();

            if (!previousSibling) {
                return this.getParent();
            } else if (
                !previousSibling.hasChildren() ||
                !previousSibling.is_open
            ) {
                // Previous sibling
                return previousSibling;
            } else {
                // Last child of previous sibling
                return previousSibling.getLastChild();
            }
        }
    }

    /*
    Does the tree have children?

    if (tree.hasChildren()) {
        //
    }
    */
    public hasChildren(): boolean {
        return this.children.length !== 0;
    }

    // Init Node from data without making it the root of the tree
    public initFromData(data: NodeData): void {
        const addNode = (nodeData: NodeData): void => {
            this.setData(nodeData);

            if (
                isNodeRecordWithChildren(nodeData) &&
                nodeData.children.length
            ) {
                addChildren(nodeData.children);
            }
        };

        const addChildren = (childrenData: NodeData[]): void => {
            for (const child of childrenData) {
                const node = this.createNode();
                node.initFromData(child);
                this.addChild(node);
            }
        };

        addNode(data);
    }

    public isFolder(): boolean {
        return this.hasChildren() || this.load_on_demand;
    }

    public isParentOf(node: Node): boolean {
        let parent = node.parent;

        while (parent) {
            if (parent === this) {
                return true;
            }

            parent = parent.parent;
        }

        return false;
    }

    /*
    Iterate over all the nodes in the tree.

    Calls callback with (node, level).

    The callback must return true to continue the iteration on current node.

    tree.iterate(
        function(node, level) {
           console.log(node.name);

           // stop iteration after level 2
           return (level <= 2);
        }
    );

    */
    public iterate(callback: IterateCallback): void {
        const _iterate = (node: Node, level: number): void => {
            for (const child of node.children) {
                const result = callback(child, level);

                if (result && child.hasChildren()) {
                    _iterate(child, level + 1);
                }
            }
        };

        _iterate(this, 0);
    }

    /*
    Create tree from data.

    Structure of data is:
    [
        {
            name: 'node1',
            children: [
                { name: 'child1' },
                { name: 'child2' }
            ]
        },
        {
            name: 'node2'
        }
    ]
    */
    public loadFromData(data: NodeData[]): this {
        this.removeChildren();

        for (const childData of data) {
            const node = this.createNode(childData);
            this.addChild(node);

            if (isNodeRecordWithChildren(childData)) {
                node.loadFromData(childData.children);
            }
        }

        return this;
    }

    /*
    Move node relative to another node.

    Argument position: Position.BEFORE, Position.AFTER or Position.Inside

    // move node1 after node2
    tree.moveNode(node1, node2, Position.AFTER);
    */
    public moveNode(
        movedNode: Node,
        targetNode: Node,
        position: Position,
    ): boolean {
        if (!movedNode.parent || movedNode.isParentOf(targetNode)) {
            // - Node is parent of target node
            // - Or, parent is empty
            return false;
        } else {
            movedNode.parent.doRemoveChild(movedNode);

            switch (position) {
                case "after": {
                    if (targetNode.parent) {
                        targetNode.parent.addChildAtPosition(
                            movedNode,
                            targetNode.parent.getChildIndex(targetNode) + 1,
                        );
                        return true;
                    }
                    return false;
                }

                case "before": {
                    if (targetNode.parent) {
                        targetNode.parent.addChildAtPosition(
                            movedNode,
                            targetNode.parent.getChildIndex(targetNode),
                        );
                        return true;
                    }
                    return false;
                }

                case "inside": {
                    // move inside as first child
                    targetNode.addChildAtPosition(movedNode, 0);
                    return true;
                }

                default:
                    return false;
            }
        }
    }

    public prepend(nodeInfo: NodeData): Node {
        const node = this.createNode(nodeInfo);
        this.addChildAtPosition(node, 0);

        node.loadChildrenFromData(nodeInfo);
        return node;
    }

    public remove(): void {
        if (this.parent) {
            this.parent.removeChild(this);
            this.parent = null;
        }
    }

    /*
    Remove child. This also removes the children of the node.

    tree.removeChild(tree.children[0]);
    */
    public removeChild(node: Node): void {
        // remove children from the index
        node.removeChildren();

        this.doRemoveChild(node);
    }

    public removeChildren(): void {
        this.iterate((child: Node) => {
            this.tree?.removeNodeFromIndex(child);
            return true;
        });

        this.children = [];
    }

    public removeNodeFromIndex(node: Node): void {
        if (node.id != null) {
            this.idMapping.delete(node.id);
        }
    }

    /*
    Set the data of this node.

    setData(string): set the name of the node
    setData(object): set attributes of the node

    Examples:
        setData('node1')

        setData({ name: 'node1', id: 1});

        setData({ name: 'node2', id: 2, color: 'green'});

    * This is an internal function; it is not in the docs
    * Does not remove existing node values
    */
    public setData(o: NodeData | null): void {
        if (!o) {
            return;
        } else if (typeof o === "string") {
            this.name = o;
        } else if (typeof o === "object") {
            for (const key in o) {
                if (Object.prototype.hasOwnProperty.call(o, key)) {
                    const value = o[key];

                    if (key === "label" || key === "name") {
                        // You can use the 'label' key instead of 'name'; this is a legacy feature
                        if (typeof value === "string") {
                            this.name = value;
                        }
                    } else if (key !== "children" && key !== "parent") {
                        // You can't update the children or the parent using this function
                        this[key] = value;
                    }
                }
            }
        }
    }

    private createNode(nodeData?: NodeData): Node {
        const nodeClass = this.getNodeClass();
        return new nodeClass(nodeData);
    }

    private doRemoveChild(node: Node): void {
        this.children.splice(this.getChildIndex(node), 1);
        this.tree?.removeNodeFromIndex(node);
    }

    private getNodeClass(): typeof Node {
        return this.nodeClass ?? this.tree?.nodeClass ?? Node;
    }

    // Load children data from nodeInfo if it has children
    private loadChildrenFromData(nodeInfo: NodeData) {
        if (isNodeRecordWithChildren(nodeInfo) && nodeInfo.children.length) {
            this.loadFromData(nodeInfo.children);
        }
    }

    private setParent(parent: Node): void {
        this.parent = parent;
        this.tree = parent.tree;
        this.tree?.addNodeToIndex(this);
    }
}
