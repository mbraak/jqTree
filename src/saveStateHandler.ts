import { isInt } from "./util";
import { Node } from "./node";
import { OnGetStateFromStorage, OnSetStateFromStorage } from "./jqtreeOptions";
import {
    AddToSelection,
    GetNodeById,
    GetSelectedNodes,
    GetTree,
    OpenNode,
    RefreshElements,
    RemoveFromSelection,
} from "./jqtreeMethodTypes";

export interface SavedState {
    open_nodes: NodeId[];
    selected_node: NodeId[];
}

interface SaveStateHandlerParams {
    addToSelection: AddToSelection;
    getNodeById: GetNodeById;
    getSelectedNodes: GetSelectedNodes;
    getTree: GetTree;
    onGetStateFromStorage?: OnGetStateFromStorage;
    onSetStateFromStorage?: OnSetStateFromStorage;
    openNode: OpenNode;
    refreshElements: RefreshElements;
    removeFromSelection: RemoveFromSelection;
    saveState: boolean | string;
}

export default class SaveStateHandler {
    private addToSelection: AddToSelection;
    private getNodeById: GetNodeById;
    private getSelectedNodes: GetSelectedNodes;
    private getTree: GetTree;
    private onGetStateFromStorage?: OnGetStateFromStorage;
    private onSetStateFromStorage?: OnSetStateFromStorage;
    private openNode: OpenNode;
    private refreshElements: RefreshElements;
    private removeFromSelection: RemoveFromSelection;
    private saveStateOption: boolean | string;
    private _supportsLocalStorage: boolean | null;

    constructor({
        addToSelection,
        getNodeById,
        getSelectedNodes,
        getTree,
        onGetStateFromStorage,
        onSetStateFromStorage,
        openNode,
        refreshElements,
        removeFromSelection,
        saveState,
    }: SaveStateHandlerParams) {
        this.addToSelection = addToSelection;
        this.getNodeById = getNodeById;
        this.getSelectedNodes = getSelectedNodes;
        this.getTree = getTree;
        this.onGetStateFromStorage = onGetStateFromStorage;
        this.onSetStateFromStorage = onSetStateFromStorage;
        this.openNode = openNode;
        this.refreshElements = refreshElements;
        this.removeFromSelection = removeFromSelection;
        this.saveStateOption = saveState;
    }

    public saveState(): void {
        const state = JSON.stringify(this.getState());

        if (this.onSetStateFromStorage) {
            this.onSetStateFromStorage(state);
        } else if (this.supportsLocalStorage()) {
            localStorage.setItem(this.getKeyName(), state);
        }
    }

    public getStateFromStorage(): SavedState | null {
        const jsonData = this.loadFromStorage();

        if (jsonData) {
            return this.parseState(jsonData) as unknown as SavedState;
        } else {
            return null;
        }
    }

    public getState(): SavedState {
        const getOpenNodeIds = (): NodeId[] => {
            const openNodes: NodeId[] = [];

            this.getTree()?.iterate((node: Node) => {
                if (node.is_open && node.id && node.hasChildren()) {
                    openNodes.push(node.id);
                }
                return true;
            });

            return openNodes;
        };

        const getSelectedNodeIds = (): NodeId[] => {
            const selectedNodeIds: NodeId[] = [];

            this.getSelectedNodes().forEach((node) => {
                if (node.id != null) {
                    selectedNodeIds.push(node.id);
                }
            });

            return selectedNodeIds;
        };

        return {
            open_nodes: getOpenNodeIds(),
            selected_node: getSelectedNodeIds(),
        };
    }

    /*
    Set initial state
    Don't handle nodes that are loaded on demand

    result: must load on demand
    */
    public setInitialState(state: SavedState): boolean {
        if (!state) {
            return false;
        } else {
            let mustLoadOnDemand = false;

            if (state.open_nodes) {
                mustLoadOnDemand = this.openInitialNodes(state.open_nodes);
            }

            if (state.selected_node) {
                this.resetSelection();
                this.selectInitialNodes(state.selected_node);
            }

            return mustLoadOnDemand;
        }
    }

    public setInitialStateOnDemand(
        state: SavedState,
        cbFinished: () => void,
    ): void {
        if (state) {
            this.doSetInitialStateOnDemand(
                state.open_nodes,
                state.selected_node,
                cbFinished,
            );
        } else {
            cbFinished();
        }
    }

    public getNodeIdToBeSelected(): NodeId | null {
        const state = this.getStateFromStorage();

        if (state && state.selected_node) {
            return state.selected_node[0] || null;
        } else {
            return null;
        }
    }

    private parseState(jsonData: string): SavedState {
        const state = JSON.parse(jsonData) as Record<string, unknown>;

        // Check if selected_node is an int (instead of an array)
        if (state && state.selected_node && isInt(state.selected_node)) {
            // Convert to array
            state.selected_node = [state.selected_node];
        }

        return state as unknown as SavedState;
    }

    private loadFromStorage(): string | null {
        if (this.onGetStateFromStorage) {
            return this.onGetStateFromStorage();
        } else if (this.supportsLocalStorage()) {
            return localStorage.getItem(this.getKeyName());
        } else {
            return null;
        }
    }

    private openInitialNodes(nodeIds: NodeId[]): boolean {
        let mustLoadOnDemand = false;

        for (const nodeId of nodeIds) {
            const node = this.getNodeById(nodeId);

            if (node) {
                if (!node.load_on_demand) {
                    node.is_open = true;
                } else {
                    mustLoadOnDemand = true;
                }
            }
        }

        return mustLoadOnDemand;
    }

    private selectInitialNodes(nodeIds: NodeId[]): boolean {
        let selectCount = 0;

        for (const nodeId of nodeIds) {
            const node = this.getNodeById(nodeId);

            if (node) {
                selectCount += 1;

                this.addToSelection(node);
            }
        }

        return selectCount !== 0;
    }

    private resetSelection(): void {
        const selectedNodes = this.getSelectedNodes();

        selectedNodes.forEach((node) => {
            this.removeFromSelection(node);
        });
    }

    private doSetInitialStateOnDemand(
        nodeIdsParam: NodeId[],
        selectedNodes: NodeId[],
        cbFinished: () => void,
    ): void {
        let loadingCount = 0;
        let nodeIds = nodeIdsParam;

        const openNodes = (): void => {
            const newNodesIds = [];

            for (const nodeId of nodeIds) {
                const node = this.getNodeById(nodeId);

                if (!node) {
                    newNodesIds.push(nodeId);
                } else {
                    if (!node.is_loading) {
                        if (node.load_on_demand) {
                            loadAndOpenNode(node);
                        } else {
                            this.openNode(node, false);
                        }
                    }
                }
            }

            nodeIds = newNodesIds;

            if (this.selectInitialNodes(selectedNodes)) {
                this.refreshElements(null);
            }

            if (loadingCount === 0) {
                cbFinished();
            }
        };

        const loadAndOpenNode = (node: Node): void => {
            loadingCount += 1;
            this.openNode(node, false, () => {
                loadingCount -= 1;
                openNodes();
            });
        };

        openNodes();
    }

    private getKeyName(): string {
        if (typeof this.saveStateOption === "string") {
            return this.saveStateOption;
        } else {
            return "tree";
        }
    }

    private supportsLocalStorage(): boolean {
        const testSupport = (): boolean => {
            // Is local storage supported?
            if (localStorage == null) {
                return false;
            } else {
                // Check if it's possible to store an item. Safari does not allow this in private browsing mode.
                try {
                    const key = "_storage_test";
                    sessionStorage.setItem(key, "value");
                    sessionStorage.removeItem(key);
                } catch (error) {
                    return false;
                }

                return true;
            }
        };

        if (this._supportsLocalStorage == null) {
            this._supportsLocalStorage = testSupport();
        }

        return this._supportsLocalStorage;
    }
}
