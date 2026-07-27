import type { Page } from "@playwright/test";

import type { TreeStructure } from "../test/support/treeStructure";

interface BoundingBox {
    height: number;
    width: number;
    x: number;
    y: number;
}

export const sleep = async (page: Page, timeout: number) => {
    await page.waitForTimeout(timeout); // eslint-disable-line playwright/no-wait-for-timeout
};

export const getTreeStructure = async (page: Page) => {
    const structure = await page.evaluate<string>(`
    ;
    function getTreeNode($li) {
        if ($li.hasClass("jqtree-ghost") || $li.hasClass("jqtree-border")) {
            return null;
        }

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
            .map((_, li) => getTreeNode(jQuery(li)))
            .get()
            .filter(node => node);
    }

    JSON.stringify(window.getChildren(jQuery("ul.jqtree-tree")));
`);

    return JSON.parse(structure) as TreeStructure;
};

export const getNodeRect = async (
    page: Page,
    title: string,
): Promise<BoundingBox> => {
    const treeItem = page.getByRole("treeitem", { name: title });
    const boundingBox = await treeItem.boundingBox();

    if (!boundingBox) {
        throw new Error(`Could not determine bounding box for tree element ${title}`)
    }

    return boundingBox;
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