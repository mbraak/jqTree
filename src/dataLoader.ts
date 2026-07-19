import type { LoadData, TriggerEvent } from "./jqtreeMethodTypes";
import type { DataFilter, OnLoadFailed, OnLoading } from "./jqtreeOptions";
import type { Node } from "./node";
import type RequestUrl from "./requestUrl";

export type HandleFinishedLoading = () => void;

interface DataLoaderParams {
    dataFilter?: DataFilter;
    loadData: LoadData;
    onLoadFailed?: OnLoadFailed;
    onLoading?: OnLoading;
    treeElement: HTMLElement;
    triggerEvent: TriggerEvent;
}

type HandleSuccess = (data: NodeData[]) => void;

export default class DataLoader {
    private _dataFilter?: DataFilter;
    private _loadData: LoadData;
    private _onLoadFailed?: OnLoadFailed;
    private _onLoading?: OnLoading;
    private _treeElement: HTMLElement;
    private _triggerEvent: TriggerEvent;

    constructor({
        dataFilter,
        loadData,
        onLoadFailed,
        onLoading,
        treeElement,
        triggerEvent,
    }: DataLoaderParams) {
        this._dataFilter = dataFilter;
        this._loadData = loadData;
        this._onLoadFailed = onLoadFailed;
        this._onLoading = onLoading;
        this._treeElement = treeElement;
        this._triggerEvent = triggerEvent;
    }

    public loadFromUrl(
        url: RequestUrl,
        parentNode: Node | null,
        onFinished: HandleFinishedLoading | null,
    ): void {
        const element = this._getDomElement(parentNode);
        this._addLoadingClass(element);
        this._notifyLoading(true, parentNode, element);

        const stopLoading = (): void => {
            this._removeLoadingClass(element);
            this._notifyLoading(false, parentNode, element);
        };

        const handleSuccess = (data: NodeData[]): void => {
            stopLoading();
            this._loadData(this._parseData(data), parentNode);

            if (onFinished && typeof onFinished === "function") {
                onFinished();
            }
        };

        const handleError = (response: Response): void => {
            stopLoading();

            if (this._onLoadFailed) {
                this._onLoadFailed(response);
            }
        };

        void this._submitRequest(url, handleSuccess, handleError);
    }

    private _addLoadingClass(element: HTMLElement): void {
        element.classList.add("jqtree-loading");
    }

    private _getDomElement(parentNode: Node | null): HTMLElement {
        if (parentNode?.element) {
            return parentNode.element;
        } else {
            return this._treeElement;
        }
    }

    private _notifyLoading(
        isLoading: boolean,
        node: Node | null,
        element: HTMLElement,
    ): void {
        const $el = jQuery(element);

        if (this._onLoading) {
            this._onLoading(isLoading, node, $el);
        }

        this._triggerEvent("tree.loading_data", {
            $el,
            isLoading,
            node,
        });
    }

    private _parseData(data: NodeData[]): NodeData[] {
        if (this._dataFilter) {
            return this._dataFilter(data);
        } else {
            return data;
        }
    }

    private _removeLoadingClass(element: HTMLElement): void {
        element.classList.remove("jqtree-loading");
    }

    private async _submitRequest(
        url: RequestUrl,
        handleSuccess: HandleSuccess,
        handleError: OnLoadFailed,
    ): Promise<void> {
        const headers = { "Content-Type": "application/json" };

        url.setSearchParam("_", Date.now().toString());

        const response = await fetch(url.toString(), { headers });

        if (response.ok) {
            const data = await response.json() as NodeData[];
            handleSuccess(data);
        } else {
            handleError(response);
        }
    }
}
