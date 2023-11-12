import { Position, Node } from "../node";
import NodeElement, { NodeElementParams } from "./index";

export type OnFinishOpenNode = (node: Node) => void;

type TriggerEvent = (
    eventName: string,
    values?: Record<string, unknown>,
) => JQuery.Event;

interface FolderElementParams extends NodeElementParams {
    closedIconElement?: HTMLElement | Text;
    openedIconElement?: HTMLElement | Text;
    triggerEvent: TriggerEvent;
}

class FolderElement extends NodeElement {
    private closedIconElement?: HTMLElement | Text;
    private openedIconElement?: HTMLElement | Text;
    private triggerEvent: TriggerEvent;

    constructor({
        closedIconElement,
        getScrollLeft,
        node,
        openedIconElement,
        tabIndex,
        $treeElement,
        triggerEvent,
    }: FolderElementParams) {
        super({
            getScrollLeft,
            node,
            tabIndex,
            $treeElement,
        });

        this.closedIconElement = closedIconElement;
        this.openedIconElement = openedIconElement;
        this.triggerEvent = triggerEvent;
    }

    public open(
        onFinished: OnFinishOpenNode | undefined,
        slide = true,
        animationSpeed: JQuery.Duration = "fast",
    ): void {
        if (this.node.is_open) {
            return;
        }

        this.node.is_open = true;

        const button = this.getButton();
        button.classList.remove("jqtree-closed");
        button.innerHTML = "";

        const openedIconElement = this.openedIconElement;

        if (openedIconElement) {
            const icon = openedIconElement.cloneNode(true);
            button.appendChild(icon);
        }

        const doOpen = (): void => {
            this.element.classList.remove("jqtree-closed");

            const titleSpan = this.getTitleSpan();
            titleSpan.setAttribute("aria-expanded", "true");

            if (onFinished) {
                onFinished(this.node);
            }

            this.triggerEvent("tree.open", {
                node: this.node,
            });
        };

        if (slide) {
            jQuery(this.getUl()).slideDown(animationSpeed, doOpen);
        } else {
            jQuery(this.getUl()).show();
            doOpen();
        }
    }

    public close(
        slide = true,
        animationSpeed: JQuery.Duration | undefined = "fast",
    ): void {
        if (!this.node.is_open) {
            return;
        }

        this.node.is_open = false;

        const button = this.getButton();
        button.classList.add("jqtree-closed");
        button.innerHTML = "";

        const closedIconElement = this.closedIconElement;

        if (closedIconElement) {
            const icon = closedIconElement.cloneNode(true);
            button.appendChild(icon);
        }

        const doClose = (): void => {
            this.element.classList.add("jqtree-closed");

            const titleSpan = this.getTitleSpan();
            titleSpan.setAttribute("aria-expanded", "false");

            this.triggerEvent("tree.close", {
                node: this.node,
            });
        };

        if (slide) {
            jQuery(this.getUl()).slideUp(animationSpeed, doClose);
        } else {
            jQuery(this.getUl()).hide();
            doClose();
        }
    }

    protected mustShowBorderDropHint(position: Position): boolean {
        return !this.node.is_open && position === Position.Inside;
    }

    private getButton(): HTMLLinkElement {
        return this.element.querySelector(
            ":scope > .jqtree-element > a.jqtree-toggler",
        ) as HTMLLinkElement;
    }
}

export default FolderElement;
