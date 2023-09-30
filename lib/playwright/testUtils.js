"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectNode = exports.moveMouseToNode = exports.getTreeStructure = exports.findNodeElement = exports.dragAndDrop = void 0;
const locateTitle = (page, title) => page.locator(".jqtree-title", {
  hasText: title
});
const findNodeElement = async (page, title) => {
  const titleElement = await locateTitle(page, title).elementHandle();
  if (!titleElement) {
    throw new Error(`Title element not found: ${title}`);
  }
  const nodeElement = await titleElement.evaluateHandle(el => {
    const li = el.closest("li");
    if (!li) {
      throw Error("Node element not found");
    }
    return li;
  });
  return nodeElement;
};
exports.findNodeElement = findNodeElement;
const selectNode = async nodeElement => {
  const titleHandle = await nodeElement.$(".jqtree-title");
  if (!titleHandle) {
    throw new Error("Could not select: title element not found");
  }
  await titleHandle.click();
};
exports.selectNode = selectNode;
const getRect = async elementHandle => {
  const boundingBox = await elementHandle.boundingBox();
  if (!boundingBox) {
    throw "No bounding box";
  }
  return boundingBox;
};
const getTreeStructure = async page => {
  const structure = await page.evaluate(`
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
  return JSON.parse(structure);
};
exports.getTreeStructure = getTreeStructure;
const getNodeRect = async (page, title) => {
  const titleElement = await locateTitle(page, title).elementHandle();
  if (!titleElement) {
    throw Error("Element not found");
  }
  const rect = await getRect(titleElement);
  return rect;
};
const moveMouseToNode = async (page, title) => {
  const rect = await getNodeRect(page, title);
  await page.mouse.move(rect.x + 10, rect.y + rect.height / 2);
};
exports.moveMouseToNode = moveMouseToNode;
const dragAndDrop = async (page, fromTitle, toTitle) => {
  await moveMouseToNode(page, fromTitle);
  await page.mouse.down();

  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(200);
  await moveMouseToNode(page, toTitle);
  await page.mouse.up();
};
exports.dragAndDrop = dragAndDrop;