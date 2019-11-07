import { isInt } from "./util";
import { ITreeWidget } from "./itree_widget";
import { Node, NodeId } from "./node";

export default class SaveStateHandler {
    private treeWidget: ITreeWidget;
    private _supportsLocalStorage: boolean | null;

    constructor(treeWidget: ITreeWidget) {
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

    public getStateFromStorage(): any {
        const jsonData = this._loadFromStorage();

        if (jsonData) {
            return this._parseState(jsonData);
        } else {
            return null;
        }
    }

    public getState(): any {
        const getOpenNodeIds = (): NodeId[] => {
            const openNodes: NodeId[] = [];

            this.treeWidget.tree.iterate((node: INode) => {
                if (node.is_open && node.id && node.hasChildren()) {
                    openNodes.push(node.id);
                }
                return true;
            });

            return openNodes;
        };

        const getSelectedNodeIds = (): NodeId[] => this.treeWidget.getSelectedNodes().map((n: Node) => n.id);

        /* eslint-disable @typescript-eslint/camelcase */
        return {
            open_nodes: getOpenNodeIds(),
            selected_node: getSelectedNodeIds()
        };
        /* eslint-enable @typescript-eslint/camelcase */
    }

    /*
    Set initial state
    Don't handle nodes that are loaded on demand

    result: must load on demand
    */
    public setInitialState(state: any): boolean {
        if (!state) {
            return false;
        } else {
            let mustLoadOnDemand = false;

            if (state.open_nodes) {
                mustLoadOnDemand = this._openInitialNodes(state.open_nodes);
            }

            if (state.selected_node) {
                this._resetSelection();
                this._selectInitialNodes(state.selected_node);
            }

            return mustLoadOnDemand;
        }
    }

    public setInitialStateOnDemand(state: any, cbFinished: () => void): void {
        if (state) {
            this._setInitialStateOnDemand(state.open_nodes, state.selected_node, cbFinished);
        } else {
            cbFinished();
        }
    }

    public getNodeIdToBeSelected(): any {
        const state = this.getStateFromStorage();

        if (state && state.selected_node) {
            return state.selected_node[0];
        } else {
            return null;
        }
    }

    private _parseState(jsonData: any): any {
        const state = jQuery.parseJSON(jsonData);

        // Check if selected_node is an int (instead of an array)
        if (state && state.selected_node && isInt(state.selected_node)) {
            // Convert to array
            state.selected_node = [state.selected_node]; // eslint-disable-line @typescript-eslint/camelcase
        }

        return state;
    }

    private _loadFromStorage(): any {
        if (this.treeWidget.options.onGetStateFromStorage) {
            return this.treeWidget.options.onGetStateFromStorage();
        } else if (this.supportsLocalStorage()) {
            return localStorage.getItem(this.getKeyName());
        }
    }

    private _openInitialNodes(nodeIds: any[]): boolean {
        let mustLoadOnDemand = false;

        for (const nodeDd of nodeIds) {
            const node = this.treeWidget.getNodeById(nodeDd);

            if (node) {
                if (!node.load_on_demand) {
                    node.is_open = true; // eslint-disable-line @typescript-eslint/camelcase
                } else {
                    mustLoadOnDemand = true;
                }
            }
        }

        return mustLoadOnDemand;
    }

    private _selectInitialNodes(nodeIds: NodeId[]): boolean {
        let selectCount = 0;

        for (const nodeId of nodeIds) {
            const node = this.treeWidget.getNodeById(nodeId);

            if (node) {
                selectCount += 1;

                if (this.treeWidget.selectNodeHandler) {
                    this.treeWidget.selectNodeHandler.addToSelection(node);
                }
            }
        }

        return selectCount !== 0;
    }

    private _resetSelection(): void {
        const selectNodeHandler = this.treeWidget.selectNodeHandler;

        if (selectNodeHandler) {
            const selectedNodes = selectNodeHandler.getSelectedNodes();

            selectedNodes.forEach(node => {
                selectNodeHandler.removeFromSelection(node);
            });
        }
    }

    private _setInitialStateOnDemand(nodeIdsParam: NodeId[], selectedNodes: NodeId[], cbFinished: () => void): void {
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

            if (this._selectInitialNodes(selectedNodes)) {
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
