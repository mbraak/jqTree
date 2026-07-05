import type { LoadData, TriggerEvent } from "./jqtreeMethodTypes";
import type { DataFilter, OnLoadFailed, OnLoading } from "./jqtreeOptions";
import type { Node } from "./node";

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

    public loadFromUrl(
        url: string,
        parentNode: Node | null,
        onFinished: HandleFinishedLoading | null,
    ): void {
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

        const handleError = (response: Response): void => {
            stopLoading();

            if (this.onLoadFailed) {
                this.onLoadFailed(response);
            }
        };

        void this.submitRequest(url, handleSuccess, handleError);
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

    private async submitRequest(
        url: string,
        handleSuccess: HandleSuccess,
        handleError: OnLoadFailed,
    ): Promise<void> {
        const headers = { "Content-Type": "application/json" };

        const response = await fetch(url, { headers });

        if (response.ok) {
            const data = await response.json() as NodeData[];
            handleSuccess(data);
        } else {
            handleError(response);
        }
    }
}
