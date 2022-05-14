import { Page, ElementHandle } from "@playwright/test";

const locateTitle = (page: Page, title: string) =>
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

const getRect = async (elementHandle: ElementHandle<HTMLElement>) => {
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

const getNodeRect = async (page: Page, title: string) => {
    const titleElement = await locateTitle(page, title).elementHandle();

    if (!titleElement) {
        throw Error("Element not found");
    }

    const rect = await getRect(titleElement as ElementHandle<HTMLElement>);
    return rect;
};

export const dragAndDrop = async (
    page: Page,
    from: string,
    to: string
): Promise<void> => {
    const fromRect = await getNodeRect(page, from);
    const toRect = await getNodeRect(page, to);

    await page.mouse.move(
        fromRect.x + fromRect.width / 2,
        fromRect.y + fromRect.height / 2
    );
    await page.mouse.down();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(200);
    await page.mouse.move(
        toRect.x + toRect.width / 2,
        toRect.y + toRect.height / 2
    );
    await page.mouse.up();
};
