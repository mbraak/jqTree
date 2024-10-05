import { LoadData, TriggerEvent } from "./jqtreeMethodTypes";
import { DataFilter, OnLoadFailed, OnLoading } from "./jqtreeOptions";
import { Node } from "./node";

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
    private dataFilter?: DataFilter;
    private loadData: LoadData;
    private onLoadFailed?: OnLoadFailed;
    private onLoading?: OnLoading;
    private treeElement: HTMLElement;
    private triggerEvent: TriggerEvent;

    constructor({
        dataFilter,
        loadData,
        onLoadFailed,
        onLoading,
        treeElement,
        triggerEvent,
    }: DataLoaderParams) {
        this.dataFilter = dataFilter;
        this.loadData = loadData;
        this.onLoadFailed = onLoadFailed;
        this.onLoading = onLoading;
        this.treeElement = treeElement;
        this.triggerEvent = triggerEvent;
    }

    private addLoadingClass(element: HTMLElement): void {
        element.classList.add("jqtree-loading");
    }

    private getDomElement(parentNode: Node | null): HTMLElement {
        if (parentNode?.element) {
            return parentNode.element;
        } else {
            return this.treeElement;
        }
    }

    private notifyLoading(
        isLoading: boolean,
        node: Node | null,
        element: HTMLElement,
    ): void {
        const $el = jQuery(element);

        if (this.onLoading) {
            this.onLoading(isLoading, node, $el);
        }

        this.triggerEvent("tree.loading_data", {
            $el,
            isLoading,
            node,
        });
    }

    private parseData(data: NodeData[] | string): NodeData[] {
        const getParsedData = () => {
            if (typeof data === "string") {
                return JSON.parse(data) as NodeData[];
            } else {
                return data;
            }
        };

        const parsedData = getParsedData();

        if (this.dataFilter) {
            return this.dataFilter(parsedData);
        } else {
            return parsedData;
        }
    }

    private removeLoadingClass(element: HTMLElement): void {
        element.classList.remove("jqtree-loading");
    }

    private submitRequest(
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

    public loadFromUrl(
        urlInfo: JQuery.AjaxSettings | null | string,
        parentNode: Node | null,
        onFinished: HandleFinishedLoading | null,
    ): void {
        if (!urlInfo) {
            return;
        }

        const element = this.getDomElement(parentNode);
        this.addLoadingClass(element);
        this.notifyLoading(true, parentNode, element);

        const stopLoading = (): void => {
            this.removeLoadingClass(element);
            this.notifyLoading(false, parentNode, element);
        };

        const handleSuccess = (data: NodeData[] | string): void => {
            stopLoading();
            this.loadData(this.parseData(data), parentNode);

            if (onFinished && typeof onFinished === "function") {
                onFinished();
            }
        };

        const handleError = (jqXHR: JQuery.jqXHR): void => {
            stopLoading();

            if (this.onLoadFailed) {
                this.onLoadFailed(jqXHR);
            }
        };

        this.submitRequest(urlInfo, handleSuccess, handleError);
    }
}
