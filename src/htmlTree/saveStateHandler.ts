import type {
    AddToSelection,
    GetNodeById,
    GetSelectedNodes,
    GetTree,
    OpenNode,
    RefreshElements,
    RemoveFromSelection,
} from "./methodTypes";
import type { Node, NodeId } from "./node";
import type { OnGetStateFromStorage, OnSetStateFromStorage } from "./options";

import { isInt } from "./util";

export interface SavedState {
    open_nodes?: NodeId[];
    selected_node?: NodeId[];
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
    private _addToSelection: AddToSelection;
    private _getNodeById: GetNodeById;
    private _getSelectedNodes: GetSelectedNodes;
    private _getTree: GetTree;
    private _onGetStateFromStorage?: OnGetStateFromStorage;
    private _onSetStateFromStorage?: OnSetStateFromStorage;
    private _openNode: OpenNode;
    private _refreshElements: RefreshElements;
    private _removeFromSelection: RemoveFromSelection;
    private _saveStateOption: boolean | string;

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
        this._addToSelection = addToSelection;
        this._getNodeById = getNodeById;
        this._getSelectedNodes = getSelectedNodes;
        this._getTree = getTree;
        this._onGetStateFromStorage = onGetStateFromStorage;
        this._onSetStateFromStorage = onSetStateFromStorage;
        this._openNode = openNode;
        this._refreshElements = refreshElements;
        this._removeFromSelection = removeFromSelection;
        this._saveStateOption = saveState;
    }

    public getNodeIdToBeSelected(): NodeId | null {
        const state = this.getStateFromStorage();

        if (state?.selected_node) {
            return state.selected_node[0] ?? null;
        } else {
            return null;
        }
    }

    public getState(): SavedState {
        const getOpenNodeIds = (): NodeId[] => {
            const openNodes: NodeId[] = [];

            this._getTree()?.iterate((node: Node) => {
                if (node.is_open && node.id && node.hasChildren()) {
                    openNodes.push(node.id);
                }
                return true;
            });

            return openNodes;
        };

        const getSelectedNodeIds = (): NodeId[] => {
            const selectedNodeIds: NodeId[] = [];

            this._getSelectedNodes().forEach((node) => {
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

    public getStateFromStorage(): null | SavedState {
        const jsonData = this._loadFromStorage();

        if (jsonData) {
            return this._parseState(jsonData);
        } else {
            return null;
        }
    }

    public saveState(): void {
        const state = JSON.stringify(this.getState());

        if (this._onSetStateFromStorage) {
            this._onSetStateFromStorage(state);
        } else {
            localStorage.setItem(this._getKeyName(), state);
        }
    }

    /*
    Set initial state
    Don't handle nodes that are loaded on demand

    result: must load on demand (boolean)
    */
    public setInitialState(state: SavedState): boolean {
        let mustLoadOnDemand = false;

        if (state.open_nodes) {
            mustLoadOnDemand = this._openInitialNodes(state.open_nodes);
        }

        this._resetSelection();

        if (state.selected_node) {
            this._selectInitialNodes(state.selected_node);
        }

        return mustLoadOnDemand;
    }

    public setInitialStateOnDemand(
        state: SavedState,
        cbFinished: () => void,
    ): void {
        let loadingCount = 0;
        let nodeIds = state.open_nodes;

        const openNodes = (): void => {
            if (!nodeIds) {
                return;
            }

            const newNodesIds = [];

            for (const nodeId of nodeIds) {
                const node = this._getNodeById(nodeId);

                if (!node) {
                    newNodesIds.push(nodeId);
                } else {
                    if (!node.is_loading) {
                        if (node.load_on_demand) {
                            loadAndOpenNode(node);
                        } else {
                            this._openNode(node, false);
                        }
                    }
                }
            }

            nodeIds = newNodesIds;

            if (state.selected_node) {
                if (this._selectInitialNodes(state.selected_node)) {
                    this._refreshElements(null);
                }
            }

            if (loadingCount === 0) {
                cbFinished();
            }
        };

        const loadAndOpenNode = (node: Node): void => {
            loadingCount += 1;
            this._openNode(node, false, () => {
                loadingCount -= 1;
                openNodes();
            });
        };

        openNodes();
    }

    private _getKeyName(): string {
        if (typeof this._saveStateOption === "string") {
            return this._saveStateOption;
        } else {
            return "tree";
        }
    }

    private _loadFromStorage(): null | string {
        if (this._onGetStateFromStorage) {
            return this._onGetStateFromStorage();
        } else {
            return localStorage.getItem(this._getKeyName());
        }
    }

    private _openInitialNodes(nodeIds: NodeId[]): boolean {
        let mustLoadOnDemand = false;

        for (const nodeId of nodeIds) {
            const node = this._getNodeById(nodeId);

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

    private _parseState(jsonData: string): SavedState {
        const state = JSON.parse(jsonData) as Record<string, unknown>;

        // Check if selected_node is an int (instead of an array)
        if (state.selected_node && isInt(state.selected_node)) {
            // Convert to array
            state.selected_node = [state.selected_node];
        }

        return state;
    }

    private _resetSelection(): void {
        const selectedNodes = this._getSelectedNodes();

        selectedNodes.forEach((node) => {
            this._removeFromSelection(node);
        });
    }

    private _selectInitialNodes(nodeIds: NodeId[]): boolean {
        let selectCount = 0;

        for (const nodeId of nodeIds) {
            const node = this._getNodeById(nodeId);

            if (node) {
                selectCount += 1;

                this._addToSelection(node);
            }
        }

        return selectCount !== 0;
    }
}
