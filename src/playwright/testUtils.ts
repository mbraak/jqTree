import { ElementHandle, Locator, Page } from "@playwright/test";

interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const sleep = async (page: Page, timeout: number) =>
    await page.waitForTimeout(timeout); // eslint-disable-line playwright/no-wait-for-timeout

export const locateTitle = (page: Page, title: string) =>
    page.locator(".jqtree-title", {
        hasText: title,
    });

export const findNodeElement = async (page: Page, title: string) => {
    const titleElement = await locateTitle(page, title).elementHandle();

    if (!titleElement) {
        throw new Error(`Title element not found: ${title}`);
    }

    const nodeElement = await titleElement.evaluateHandle((el) => {
        const li = el.closest("li");

        if (!li) {
            throw Error("Node element not found");
        }

        return li;
    });

    return nodeElement;
};

export const selectNode = async (nodeElement: ElementHandle) => {
    const titleHandle = await nodeElement.$(".jqtree-title");

    if (!titleHandle) {
        throw new Error("Could not select: title element not found");
    }

    await titleHandle.click();
};

export const boundingBox = async (locator: Locator) => {
    const result = await locator.boundingBox();

    if (!result) {
        throw new Error("Empty boundingBox");
    }

    return result;
};

const getRect = async (
    elementHandle: ElementHandle<HTMLElement>,
): Promise<BoundingBox> => {
    const boundingBox = await elementHandle.boundingBox();

    if (!boundingBox) {
        throw "No bounding box";
    }

    return boundingBox;
};

export const getTreeStructure = async (page: Page) => {
    const structure = await page.evaluate<string>(`
    ;
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
    }

    function getChildren($ul) {
        return $ul
            .children("li.jqtree_common")
            .map((_, li) => {
                return getTreeNode(jQuery(li));
            })
            .get();
    }

    JSON.stringify(window.getChildren(jQuery("ul.jqtree-tree")));
`);

    return JSON.parse(structure) as JQTreeMatchers.TreeStructure;
};

const getNodeRect = async (page: Page, title: string): Promise<BoundingBox> => {
    const titleElement = await locateTitle(page, title).elementHandle();

    if (!titleElement) {
        throw Error("Element not found");
    }

    const rect = await getRect(titleElement as ElementHandle<HTMLElement>);
    return rect;
};

export const moveMouseToNode = async (page: Page, title: string) => {
    const rect = await getNodeRect(page, title);

    await page.mouse.move(rect.x + 10, rect.y + rect.height / 2);
};

export const dragAndDrop = async (
    page: Page,
    fromTitle: string,
    toTitle: string,
): Promise<void> => {
    await moveMouseToNode(page, fromTitle);
    await page.mouse.down();

    await sleep(page, 200);

    await moveMouseToNode(page, toTitle);
    await page.mouse.up();
};
