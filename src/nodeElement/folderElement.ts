import { OnFinishOpenNode, TriggerEvent } from "../jqtreeMethodTypes";
import { Position } from "../position";
import NodeElement, { NodeElementParams } from "./index";

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
        treeElement,
        triggerEvent,
    }: FolderElementParams) {
        super({
            getScrollLeft,
            node,
            tabIndex,
            treeElement,
        });

        this.closedIconElement = closedIconElement;
        this.openedIconElement = openedIconElement;
        this.triggerEvent = triggerEvent;
    }

    protected mustShowBorderDropHint(position: Position): boolean {
        return !this.node.is_open && position === Position.Inside;
    }

    private getButton(): HTMLLinkElement {
        return this.element.querySelector(
            ":scope > .jqtree-element > a.jqtree-toggler",
        ) as HTMLLinkElement;
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
}

export default FolderElement;
