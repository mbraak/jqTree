import { ITreeWidget } from "./itree_widget";
import { Node } from "./node";

export type HandleFinishedLoading = () => void;

export default class DataLoader {
    private treeWidget: ITreeWidget;

    constructor(treeWidget: ITreeWidget) {
        this.treeWidget = treeWidget;
    }

    public loadFromUrl(urlInfo: any, parentNode: Node | null, onFinished: HandleFinishedLoading | null): void {
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

        const handleError = (jqXHR: any): void => {
            stopLoading();

            const { onLoadFailed } = this.treeWidget.options;

            if (onLoadFailed) {
                onLoadFailed(jqXHR);
            }
        };

        this.submitRequest(urlInfo, handleSuccess, handleError);
    }

    private addLoadingClass($el: JQuery<any>): void {
        if ($el) {
            $el.addClass("jqtree-loading");
        }
    }

    private removeLoadingClass($el: JQuery<any>): void {
        if ($el) {
            $el.removeClass("jqtree-loading");
        }
    }

    private getDomElement(parentNode: Node | null): JQuery<any> {
        if (parentNode) {
            return jQuery(parentNode.element);
        } else {
            return this.treeWidget.element;
        }
    }

    private notifyLoading(isLoading: boolean, node: Node | null, $el: JQuery): void {
        const { onLoading } = this.treeWidget.options;

        if (onLoading) {
            onLoading(isLoading, node, $el);
        }

        this.treeWidget._triggerEvent("tree.loading_data", {
            isLoading,
            node,
            $el
        });
    }

    private submitRequest(
        urlInfo: any,
        handleSuccess: JQuery.Ajax.SuccessCallback<any>,
        handleError: JQuery.Ajax.ErrorCallback<any>
    ): void {
        const ajaxSettings = jQuery.extend(
            { method: "GET" },
            typeof urlInfo === "string" ? { url: urlInfo } : urlInfo,
            {
                cache: false,
                dataType: "json",
                success: handleSuccess,
                error: handleError
            }
        );

        ajaxSettings.method = ajaxSettings.method.toUpperCase();

        jQuery.ajax(ajaxSettings);
    }

    private parseData(data: any): any {
        const { dataFilter } = this.treeWidget.options;

        const parsedData =
            data instanceof Array || typeof data === "object" ? data : data != null ? jQuery.parseJSON(data) : [];

        return dataFilter ? dataFilter(parsedData) : parsedData;
    }
}
