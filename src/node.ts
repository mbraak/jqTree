export type NodeId = number | string;

export enum Position {
    Before = 1,
    After,
    Inside,
    None
}

interface IPositions {
    [key: string]: Position;
}

const positionNames: IPositions = {
    before: Position.Before,
    after: Position.After,
    inside: Position.Inside,
    none: Position.None
};

type IterateCallback = (node: INode, level: number) => boolean;

export const getPositionName = (position: Position): string => {
    for (const name in positionNames) {
        if (positionNames.hasOwnProperty(name)) {
            if (positionNames[name] === position) {
                return name;
            }
        }
    }

    return "";
};

export const getPosition = (name: string): Position => positionNames[name];

export class Node {
    public id: NodeId;
    public name: string;
    public children: Node[];
    public parent: Node | null;
    public idMapping: any;
    public tree: Node;
    public nodeClass: any;
    public load_on_demand: boolean;
    public is_open: boolean;
    public element: Element;
    public is_loading: boolean;
    public isEmptyFolder: boolean;

    [key: string]: any;

    constructor(o: object | string, isRoot = false, nodeClass = Node) {
        this.name = "";
        this.isEmptyFolder = false;

        this.setData(o);

        this.children = [];
        this.parent = null;

        if (isRoot) {
            this.idMapping = {};
            this.tree = this;
            this.nodeClass = nodeClass;
        }
    }

    /*
    Set the data of this node.

    setData(string): set the name of the node
    setdata(object): set attributes of the node

    Examples:
        setdata('node1')

        setData({ name: 'node1', id: 1});

        setData({ name: 'node2', id: 2, color: 'green'});

    * This is an internal function; it is not in the docs
    * Does not remove existing node values
    */
    public setData(o: any): void {
        const setName = (name: string): void => {
            if (name != null) {
                this.name = name;
            }
        };

        if (!o) {
            return;
        } else if (typeof o !== "object") {
            setName(o);
        } else {
            for (const key in o) {
                if (o.hasOwnProperty(key)) {
                    const value = o[key];

                    if (key === "label") {
                        // You can use the 'label' key instead of 'name'; this is a legacy feature
                        setName(value);
                    } else if (key !== "children") {
                        // You can't update the children using this function
                        this[key] = value;
                    }
                }
            }
        }
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
    public loadFromData(data: any[]): void {
        this.removeChildren();

        for (const o of data) {
            const node = new this.tree.nodeClass(o);
            this.addChild(node);

            if (typeof o === "object" && o["children"]) {
                if (o["children"].length === 0) {
                    node.isEmptyFolder = true;
                } else {
                    node.loadFromData(o["children"]);
                }
            }
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
        node._setParent(this);
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
        node._setParent(this);
    }

    /*
    Remove child. This also removes the children of the node.

    tree.removeChild(tree.children[0]);
    */
    public removeChild(node: Node): void {
        // remove children from the index
        node.removeChildren();

        this._removeChild(node);
    }

    /*
    Get child index.

    var index = getChildIndex(node);
    */
    public getChildIndex(node: Node): number {
        return jQuery.inArray(node, this.children);
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

    public isFolder(): boolean {
        return this.hasChildren() || this.load_on_demand;
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
            if (node.children) {
                for (const child of node.children) {
                    const result = callback(child, level);

                    if (result && child.hasChildren()) {
                        _iterate(child, level + 1);
                    }
                }
            }
        };

        _iterate(this, 0);
    }

    /*
    Move node relative to another node.

    Argument position: Position.BEFORE, Position.AFTER or Position.Inside

    // move node1 after node2
    tree.moveNode(node1, node2, Position.AFTER);
    */
    public moveNode(movedNode: Node, targetNode: Node, position: number): void {
        if (!movedNode.parent || movedNode.isParentOf(targetNode)) {
            // - Node is parent of target node
            // - Or, parent is empty
            return;
        } else {
            movedNode.parent._removeChild(movedNode);

            if (position === Position.After) {
                if (targetNode.parent) {
                    targetNode.parent.addChildAtPosition(movedNode, targetNode.parent.getChildIndex(targetNode) + 1);
                }
            } else if (position === Position.Before) {
                if (targetNode.parent) {
                    targetNode.parent.addChildAtPosition(movedNode, targetNode.parent.getChildIndex(targetNode));
                }
            } else if (position === Position.Inside) {
                // move inside as first child
                targetNode.addChildAtPosition(movedNode, 0);
            }
        }
    }

    /*
    Get the tree as data.
    */
    public getData(includeParent = false): any[] {
        function getDataFromNodes(nodes: Node[]): any[] {
            return nodes.map(node => {
                const tmpNode: any = {};

                for (const k in node) {
                    if (
                        ["parent", "children", "element", "tree", "isEmptyFolder"].indexOf(k) === -1 &&
                        Object.prototype.hasOwnProperty.call(node, k)
                    ) {
                        const v = node[k];
                        tmpNode[k] = v;
                    }
                }

                if (node.hasChildren()) {
                    tmpNode["children"] = getDataFromNodes(node.children);
                }

                return tmpNode;
            });
        }

        if (includeParent) {
            return getDataFromNodes([this]);
        } else {
            return getDataFromNodes(this.children);
        }
    }

    public getNodeByName(name: string): Node | null {
        return this.getNodeByCallback((node: Node) => node.name === name);
    }

    public getNodeByCallback(callback: (node: Node) => boolean): Node | null {
        let result = null;

        this.iterate((node: INode) => {
            if (callback(node as Node)) {
                result = node;
                return false;
            } else {
                return true;
            }
        });

        return result;
    }

    public addAfter(nodeInfo: any): Node | null {
        if (!this.parent) {
            return null;
        } else {
            const node = new this.tree.nodeClass(nodeInfo);

            const childIndex = this.parent.getChildIndex(this);
            this.parent.addChildAtPosition(node, childIndex + 1);

            if (typeof nodeInfo === "object" && nodeInfo["children"] && nodeInfo["children"].length) {
                node.loadFromData(nodeInfo["children"]);
            }

            return node;
        }
    }

    public addBefore(nodeInfo: any): Node | null {
        if (!this.parent) {
            return null;
        } else {
            const node = new this.tree.nodeClass(nodeInfo);

            const childIndex = this.parent.getChildIndex(this);
            this.parent.addChildAtPosition(node, childIndex);

            if (typeof nodeInfo === "object" && nodeInfo["children"] && nodeInfo["children"].length) {
                node.loadFromData(nodeInfo["children"]);
            }

            return node;
        }
    }

    public addParent(nodeInfo: any): Node | null {
        if (!this.parent) {
            return null;
        } else {
            const newParent = new this.tree.nodeClass(nodeInfo);
            newParent._setParent(this.tree);
            const originalParent = this.parent;

            for (const child of originalParent.children) {
                newParent.addChild(child);
            }

            originalParent.children = [];
            originalParent.addChild(newParent);
            return newParent;
        }
    }

    public remove(): void {
        if (this.parent) {
            this.parent.removeChild(this);
            this.parent = null;
        }
    }

    public append(nodeInfo: any): Node {
        const node = new this.tree.nodeClass(nodeInfo);
        this.addChild(node);

        if (typeof nodeInfo === "object" && nodeInfo["children"] && nodeInfo["children"].length) {
            node.loadFromData(nodeInfo["children"]);
        }

        return node;
    }

    public prepend(nodeInfo: any): Node {
        const node = new this.tree.nodeClass(nodeInfo);
        this.addChildAtPosition(node, 0);

        if (typeof nodeInfo === "object" && nodeInfo["children"] && nodeInfo["children"].length) {
            node.loadFromData(nodeInfo["children"]);
        }

        return node;
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

    public getLevel(): number {
        let level = 0;
        let node: Node = this; // eslint-disable-line @typescript-eslint/no-this-alias

        while (node.parent) {
            level += 1;
            node = node.parent;
        }

        return level;
    }

    public getNodeById(nodeId: NodeId): Node | null {
        return this.idMapping[nodeId];
    }

    public addNodeToIndex(node: Node): void {
        if (node.id != null) {
            this.idMapping[node.id] = node;
        }
    }

    public removeNodeFromIndex(node: Node): void {
        if (node.id != null) {
            delete this.idMapping[node.id];
        }
    }

    public removeChildren(): void {
        this.iterate((child: INode) => {
            this.tree.removeNodeFromIndex(child as Node);
            return true;
        });

        this.children = [];
    }

    public getPreviousSibling(): Node | null {
        if (!this.parent) {
            return null;
        } else {
            const previousIndex = this.parent.getChildIndex(this) - 1;
            if (previousIndex >= 0) {
                return this.parent.children[previousIndex];
            } else {
                return null;
            }
        }
    }

    public getNextSibling(): Node | null {
        if (!this.parent) {
            return null;
        } else {
            const nextIndex = this.parent.getChildIndex(this) + 1;
            if (nextIndex < this.parent.children.length) {
                return this.parent.children[nextIndex];
            } else {
                return null;
            }
        }
    }

    public getNodesByProperty(key: string, value: any): Node[] {
        return this.filter((node: Node) => node[key] === value);
    }

    public filter(f: (node: Node) => boolean): Node[] {
        const result: Node[] = [];

        this.iterate((node: INode) => {
            if (f(node as Node)) {
                result.push(node as Node);
            }

            return true;
        });

        return result;
    }

    public getNextNode(includeChildren = true): Node | null {
        if (includeChildren && this.hasChildren() && this.is_open) {
            // First child
            return this.children[0];
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

    public getPreviousNode(): Node | null {
        if (!this.parent) {
            return null;
        } else {
            const previousSibling = this.getPreviousSibling();
            if (previousSibling) {
                if (!previousSibling.hasChildren() || !previousSibling.is_open) {
                    // Previous sibling
                    return previousSibling;
                } else {
                    // Last child of previous sibling
                    return previousSibling.getLastChild();
                }
            } else {
                return this.getParent();
            }
        }
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

    public getLastChild(): Node | null {
        if (!this.hasChildren()) {
            return null;
        } else {
            const lastChild = this.children[this.children.length - 1];
            if (!lastChild.hasChildren() || !lastChild.is_open) {
                return lastChild;
            } else {
                return lastChild.getLastChild();
            }
        }
    }

    // Init Node from data without making it the root of the tree
    public initFromData(data: any): void {
        const addNode = (nodeData: any): void => {
            this.setData(nodeData);

            if (nodeData["children"]) {
                addChildren(nodeData["children"]);
            }
        };

        const addChildren = (childrenData: any[]): void => {
            for (const child of childrenData) {
                const node = new this.tree.nodeClass("");
                node.initFromData(child);
                this.addChild(node);
            }
        };

        addNode(data);
    }

    private _setParent(parent: Node): void {
        this.parent = parent;
        this.tree = parent.tree;
        this.tree.addNodeToIndex(this);
    }

    private _removeChild(node: Node): void {
        this.children.splice(this.getChildIndex(node), 1);
        this.tree.removeNodeFromIndex(node);
    }
}
