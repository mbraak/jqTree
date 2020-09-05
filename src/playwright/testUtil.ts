import { ElementHandle } from "playwright";

interface ElementHandleBoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const expectToBeSelected = async (
    handle: ElementHandle<HTMLElement>
): Promise<void> => {
    const isSelected = await isNodeSelected(handle);
    expect(isSelected).toBe(true);
};

export const expectToBeOpen = async (
    handle: ElementHandle<HTMLElement>
): Promise<void> => {
    const isOpen = await isNodeOpen(handle);
    expect(isOpen).toBe(true);
};

export const expectToBeClosed = async (
    handle: ElementHandle<HTMLElement>
): Promise<void> => {
    const isOpen = await isNodeOpen(handle);
    expect(isOpen).toBe(false);
};

export const findTitleElement = async (
    title: string
): Promise<ElementHandle<HTMLElement>> =>
    await findElement(`css=.jqtree-title >> text="${title}"`);

export const findNodeElement = async (
    title: string
): Promise<ElementHandle<HTMLElement>> => {
    const titleElement = await findTitleElement(title);
    return await titleElement.evaluateHandle((el) => {
        const li = el.closest("li");

        if (!li) {
            throw Error("Node element not found");
        }

        return li;
    });
};

export const openNode = async (
    handle: ElementHandle<HTMLElement>
): Promise<void> => {
    const toggler = await findToggler(handle);
    await toggler.click();
};

const findToggler = async (
    handle: ElementHandle<HTMLElement>
): Promise<ElementHandle<HTMLElement>> => {
    const toggler = await handle.$(".jqtree-toggler");

    if (!toggler) {
        throw Error("Toggler button not found");
    }

    return toggler as ElementHandle<HTMLElement>;
};

const findElement = async (
    selector: string
): Promise<ElementHandle<HTMLElement>> => {
    const element = await page.$(selector);

    if (!element) {
        throw Error(`Element not found: ${selector}`);
    }

    return element as ElementHandle<HTMLElement>;
};

const isNodeOpen = async (
    handle: ElementHandle<HTMLElement>
): Promise<boolean> =>
    handle.evaluate((el) => !el.classList.contains("jqtree-closed"));

const isNodeSelected = async (
    handle: ElementHandle<HTMLElement>
): Promise<boolean> =>
    handle.evaluate((el) => el.classList.contains("jqtree-selected"));

export const selectNode = async (
    handle: ElementHandle<HTMLElement>
): Promise<void> => {
    const titleHandle = await handle.$(".jqtree-title");
    await titleHandle?.click();
};

export const getTreeStructure = async (): Promise<
    JQTreeMatchers.TreeStructure
> =>
    await page
        .evaluate(
            `
        function getTreeNode($li) {
            const $div = $li.children("div.jqtree-element");
            const $span = $div.children("span.jqtree-title");
            const name = $span.text();
            const selected = $li.hasClass("jqtree-selected");

            if ($li.hasClass("jqtree-folder")) {
                const $ul = $li.children("ul.jqtree_common");

                return {
                    nodeType: "folder",
                    children: getChildren($ul),
                    name,
                    open: !$li.hasClass("jqtree-closed"),
                    selected,
                };
            } else {
                return {
                    nodeType: "child",
                    name,
                    selected,
                };
            }
        };

        function getChildren($ul) {
            return $ul
                .children("li.jqtree_common")
                .map((_, li) => {
                    return getTreeNode(jQuery(li))
                })
                .get();
        };

        JSON.stringify(window.getChildren(jQuery("ul.jqtree-tree")))
        `
        )
        .then((s) => JSON.parse(s as string) as JQTreeMatchers.TreeStructure);

const getRect = async (
    handle: ElementHandle<HTMLElement>
): Promise<ElementHandleBoundingBox> => {
    const boundingBox = await handle.boundingBox();

    if (!boundingBox) {
        throw "No bounding box";
    }

    return boundingBox;
};

export const dragAndDrop = async (from: string, to: string): Promise<void> => {
    const fromRect = await findTitleElement(from).then(getRect);
    const toRect = await findTitleElement(to).then(getRect);

    await page.mouse.move(
        fromRect.x + fromRect.width / 2,
        fromRect.y + fromRect.height / 2
    );
    await page.mouse.down();
    await page.waitForTimeout(200);
    await page.mouse.move(
        toRect.x + toRect.width / 2,
        toRect.y + toRect.height / 2
    );
    await page.mouse.up();
};
