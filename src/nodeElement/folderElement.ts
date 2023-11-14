import { Position, Node } from "../node";
import NodeElement from "./index";

export type OnFinishOpenNode = (node: Node) => void;

class FolderElement extends NodeElement {
    public open(
        onFinished: OnFinishOpenNode | null,
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

        const openedIconElement = this.treeWidget.renderer.openedIconElement;

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

            this.treeWidget._triggerEvent("tree.open", {
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

        const closedIconElement = this.treeWidget.renderer.closedIconElement;

        if (closedIconElement) {
            const icon = closedIconElement.cloneNode(true);
            button.appendChild(icon);
        }

        const doClose = (): void => {
            this.element.classList.add("jqtree-closed");

            const titleSpan = this.getTitleSpan();
            titleSpan.setAttribute("aria-expanded", "false");

            this.treeWidget._triggerEvent("tree.close", {
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
