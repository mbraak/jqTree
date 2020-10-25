import { DefaultRecord, Node, NodeData } from "./node";
import { JqTreeWidget } from "./tree.jquery";

export type HandleFinishedLoading = () => void;

export default class DataLoader {
    private treeWidget: JqTreeWidget;

    constructor(treeWidget: JqTreeWidget) {
        this.treeWidget = treeWidget;
    }

    public loadFromUrl(
        urlInfo: string | JQuery.AjaxSettings | null,
        parentNode: Node | null,
        onFinished: HandleFinishedLoading | null
    ): void {
        if (!urlInfo) {
            return;
        }

        const $el = this.getDomElement(parentNode);
        this.addLoadingClass($el);
        this.notifyLoading(true, parentNode, $el);

        const stopLoading = (): void => {
            this.removeLoadingClass($el);
            this.notifyLoading(false, parentNode, $el);
        };

        const handleSuccess = (data: any): void => {
            stopLoading();
            this.treeWidget.loadData(this.parseData(data), parentNode);

            if (onFinished && typeof onFinished === "function") {
                onFinished();
            }
        };

        const handleError = (jqXHR: JQuery.jqXHR): void => {
            stopLoading();

            if (this.treeWidget.options.onLoadFailed) {
                this.treeWidget.options.onLoadFailed(jqXHR);
            }
        };

        this.submitRequest(urlInfo, handleSuccess, handleError);
    }

    private addLoadingClass($el: JQuery<HTMLElement>): void {
        if ($el) {
            $el.addClass("jqtree-loading");
        }
    }

    private removeLoadingClass($el: JQuery<HTMLElement>): void {
        if ($el) {
            $el.removeClass("jqtree-loading");
        }
    }

    private getDomElement(parentNode: Node | null): JQuery<HTMLElement> {
        if (parentNode) {
            return jQuery(parentNode.element);
        } else {
            return this.treeWidget.element;
        }
    }

    private notifyLoading(
        isLoading: boolean,
        node: Node | null,
        $el: JQuery
    ): void {
        if (this.treeWidget.options.onLoading) {
            this.treeWidget.options.onLoading(isLoading, node, $el);
        }

        this.treeWidget._triggerEvent("tree.loading_data", {
            isLoading,
            node,
            $el,
        });
    }

    private submitRequest(
        urlInfoInput: string | JQuery.AjaxSettings,
        handleSuccess: JQuery.Ajax.SuccessCallback<any>,
        handleError: JQuery.Ajax.ErrorCallback<any>
    ): void {
        const urlInfo =
            typeof urlInfoInput === "string"
                ? { url: urlInfoInput }
                : urlInfoInput;

        const ajaxSettings: JQuery.AjaxSettings = {
            method: "GET",
            cache: false,
            dataType: "json",
            success: handleSuccess,
            error: handleError,
            ...urlInfo,
        };

        ajaxSettings.method = ajaxSettings.method?.toUpperCase() || "GET";

        void jQuery.ajax(ajaxSettings);
    }

    private parseData(data: NodeData): NodeData[] {
        const { dataFilter } = this.treeWidget.options;

        const getParsedData = (): unknown => {
            if (typeof data === "string") {
                return JSON.parse(data) as unknown;
            } else {
                return data;
            }
        };

        const parsedData = getParsedData();

        if (dataFilter) {
            return dataFilter(parsedData);
        } else {
            return parsedData as DefaultRecord[];
        }
    }
}
