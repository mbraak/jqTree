var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const expectToBeSelected = (handle) => __awaiter(void 0, void 0, void 0, function* () {
    const isSelected = yield isNodeSelected(handle);
    expect(isSelected).toBe(true);
});
export const expectToBeOpen = (handle) => __awaiter(void 0, void 0, void 0, function* () {
    const isOpen = yield isNodeOpen(handle);
    expect(isOpen).toBe(true);
});
export const expectToBeClosed = (handle) => __awaiter(void 0, void 0, void 0, function* () {
    const isOpen = yield isNodeOpen(handle);
    expect(isOpen).toBe(false);
});
export const findTitleElement = (title) => __awaiter(void 0, void 0, void 0, function* () { return yield findElement(`css=.jqtree-title >> text="${title}"`); });
export const findNodeElement = (title) => __awaiter(void 0, void 0, void 0, function* () {
    const titleElement = yield findTitleElement(title);
    return yield titleElement.evaluateHandle((el) => {
        const li = el.closest("li");
        if (!li) {
            throw Error("Node element not found");
        }
        return li;
    });
});
export const openNode = (handle) => __awaiter(void 0, void 0, void 0, function* () {
    const toggler = yield findToggler(handle);
    yield toggler.click();
});
const findToggler = (handle) => __awaiter(void 0, void 0, void 0, function* () {
    const toggler = yield handle.$(".jqtree-toggler");
    if (!toggler) {
        throw Error("Toggler button not found");
    }
    return toggler;
});
const findElement = (selector) => __awaiter(void 0, void 0, void 0, function* () {
    const element = yield page.$(selector);
    if (!element) {
        throw Error(`Element not found: ${selector}`);
    }
    return element;
});
const isNodeOpen = (handle) => __awaiter(void 0, void 0, void 0, function* () { return handle.evaluate((el) => !el.classList.contains("jqtree-closed")); });
const isNodeSelected = (handle) => __awaiter(void 0, void 0, void 0, function* () { return handle.evaluate((el) => el.classList.contains("jqtree-selected")); });
export const selectNode = (handle) => __awaiter(void 0, void 0, void 0, function* () {
    const titleHandle = yield handle.$(".jqtree-title");
    yield (titleHandle === null || titleHandle === void 0 ? void 0 : titleHandle.click());
});
export const getTreeStructure = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield page
        .evaluate(`
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
        `)
        .then((s) => JSON.parse(s));
});
const getRect = (handle) => __awaiter(void 0, void 0, void 0, function* () {
    const boundingBox = yield handle.boundingBox();
    if (!boundingBox) {
        throw "No bounding box";
    }
    return boundingBox;
});
export const dragAndDrop = (from, to) => __awaiter(void 0, void 0, void 0, function* () {
    const fromRect = yield findTitleElement(from).then(getRect);
    const toRect = yield findTitleElement(to).then(getRect);
    yield page.mouse.move(fromRect.x + fromRect.width / 2, fromRect.y + fromRect.height / 2);
    yield page.mouse.down();
    yield page.waitForTimeout(200);
    yield page.mouse.move(toRect.x + toRect.width / 2, toRect.y + toRect.height / 2);
    yield page.mouse.up();
});
