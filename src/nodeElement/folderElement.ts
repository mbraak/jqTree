import type { AnimationSpeed } from "../animation";
import type { OnFinishOpenNode, TriggerEvent } from "../jqtreeMethodTypes";
import type { Position } from "../node";
import type { NodeElementParams } from "./index";

import { slideDown, slideUp } from "../animation";
import NodeElement from "./index";

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

    public close(slide: boolean, animationSpeed: AnimationSpeed): void {
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

        const ul = this.getUl();

        if (slide) {
            slideUp(this.getUl(), animationSpeed, doClose);
        } else {
            ul.style.display = "none";
            doClose();
        }
    }

    public open(
        onFinished: OnFinishOpenNode | undefined,
        slide: boolean,
        animationSpeed: AnimationSpeed,
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

        const ul = this.getUl();

        if (slide) {
            slideDown(this.getUl(), animationSpeed, doOpen);
        } else {
            ul.style.display = "block";
            doOpen();
        }
    }

    protected mustShowBorderDropHint(position: Position): boolean {
        return !this.node.is_open && position === "inside";
    }

    private getButton(): HTMLLinkElement {
        return this.element.querySelector(
            ":scope > .jqtree-element > a.jqtree-toggler",
        ) as HTMLLinkElement;
    }
}

export default FolderElement;
