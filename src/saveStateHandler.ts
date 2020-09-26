import { isInt } from "./util";
import { JqTreeWidget } from "./tree.jquery";
import { Node, NodeId } from "./node";

export default class SaveStateHandler {
    private treeWidget: JqTreeWidget;
    private _supportsLocalStorage: boolean | null;

    constructor(treeWidget: JqTreeWidget) {
        this.treeWidget = treeWidget;
    }

    public saveState(): void {
        const state = JSON.stringify(this.getState());

        if (this.treeWidget.options.onSetStateFromStorage) {
            this.treeWidget.options.onSetStateFromStorage(state);
        } else if (this.supportsLocalStorage()) {
            localStorage.setItem(this.getKeyName(), state);
        }
    }

    public getStateFromStorage(): SavedState | null {
        const jsonData = this.loadFromStorage();

        if (jsonData) {
            return (this.parseState(jsonData) as unknown) as SavedState;
        } else {
            return null;
        }
    }

    public getState(): SavedState {
        const getOpenNodeIds = (): NodeId[] => {
            const openNodes: NodeId[] = [];

            this.treeWidget.tree.iterate((node: Node) => {
                if (node.is_open && node.id && node.hasChildren()) {
                    openNodes.push(node.id);
                }
                return true;
            });

            return openNodes;
        };

        const getSelectedNodeIds = (): NodeId[] => {
            const selectedNodeIds: NodeId[] = [];

            this.treeWidget.getSelectedNodes().forEach((node) => {
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
        cbFinished: () => void
    ): void {
        if (state) {
            this.doSetInitialStateOnDemand(
                state.open_nodes,
                state.selected_node,
                cbFinished
            );
        } else {
            cbFinished();
        }
    }

    public getNodeIdToBeSelected(): NodeId | null {
        const state = this.getStateFromStorage();

        if (state && state.selected_node) {
            return state.selected_node[0];
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

        return (state as unknown) as SavedState;
    }

    private loadFromStorage(): string | null {
        if (this.treeWidget.options.onGetStateFromStorage) {
            return this.treeWidget.options.onGetStateFromStorage();
        } else if (this.supportsLocalStorage()) {
            return localStorage.getItem(this.getKeyName());
        } else {
            return null;
        }
    }

    private openInitialNodes(nodeIds: any[]): boolean {
        let mustLoadOnDemand = false;

        for (const nodeDd of nodeIds) {
            const node = this.treeWidget.getNodeById(nodeDd);

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
            const node = this.treeWidget.getNodeById(nodeId);

            if (node) {
                selectCount += 1;

                this.treeWidget.selectNodeHandler.addToSelection(node);
            }
        }

        return selectCount !== 0;
    }

    private resetSelection(): void {
        const selectNodeHandler = this.treeWidget.selectNodeHandler;

        const selectedNodes = selectNodeHandler.getSelectedNodes();

        selectedNodes.forEach((node) => {
            selectNodeHandler.removeFromSelection(node);
        });
    }

    private doSetInitialStateOnDemand(
        nodeIdsParam: NodeId[],
        selectedNodes: NodeId[],
        cbFinished: () => void
    ): void {
        let loadingCount = 0;
        let nodeIds = nodeIdsParam;

        const openNodes = (): void => {
            const newNodesIds = [];

            for (const nodeId of nodeIds) {
                const node = this.treeWidget.getNodeById(nodeId);

                if (!node) {
                    newNodesIds.push(nodeId);
                } else {
                    if (!node.is_loading) {
                        if (node.load_on_demand) {
                            loadAndOpenNode(node);
                        } else {
                            this.treeWidget._openNode(node, false, null);
                        }
                    }
                }
            }

            nodeIds = newNodesIds;

            if (this.selectInitialNodes(selectedNodes)) {
                this.treeWidget._refreshElements(null);
            }

            if (loadingCount === 0) {
                cbFinished();
            }
        };

        const loadAndOpenNode = (node: Node): void => {
            loadingCount += 1;
            this.treeWidget._openNode(node, false, () => {
                loadingCount -= 1;
                openNodes();
            });
        };

        openNodes();
    }

    private getKeyName(): string {
        if (typeof this.treeWidget.options.saveState === "string") {
            return this.treeWidget.options.saveState;
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
