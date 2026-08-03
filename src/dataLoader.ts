import type { LoadData, TriggerEvent } from "./jqtreeMethodTypes";
import type { DataFilter, OnLoadFailed, OnLoading } from "./jqtreeOptions";
import type { Node, NodeData } from "./node";

export type HandleFinishedLoading = () => void;

interface DataLoaderParams {
    dataFilter?: DataFilter;
    loadData: LoadData;
    onLoadFailed?: OnLoadFailed;
    onLoading?: OnLoading;
    treeElement: HTMLElement;
    triggerEvent: TriggerEvent;
}

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
        urlInfo: JQuery.AjaxSettings | null | string,
        parentNode: Node | null,
        onFinished: HandleFinishedLoading | null,
    ): void {
        if (!urlInfo) {
            return;
        }

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

        const handleError = (jqXHR: JQuery.jqXHR): void => {
            stopLoading();

            if (this._onLoadFailed) {
                this._onLoadFailed(jqXHR);
            }
        };

        this._submitRequest(urlInfo, handleSuccess, handleError);
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

    private _submitRequest(
        urlInfoInput: JQuery.AjaxSettings | string,
        handleSuccess: JQuery.Ajax.SuccessCallback<any>,
        handleError: JQuery.Ajax.ErrorCallback<any>,
    ): void {
        const urlInfo =
            typeof urlInfoInput === "string"
                ? { url: urlInfoInput }
                : urlInfoInput;

        const ajaxSettings: JQuery.AjaxSettings = {
            cache: false,
            dataType: "json",
            error: handleError,
            method: "GET",
            success: handleSuccess,
            ...urlInfo,
        };

        ajaxSettings.method = ajaxSettings.method?.toUpperCase() ?? "GET";

        void jQuery.ajax(ajaxSettings);
    }
}
