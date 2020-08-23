import { ElementHandle } from "playwright";

export const expectToBeSelected = async (title: string): Promise<void> =>
    await findTitleElement(title)
        .then(isNodeSelected)
        .then((isSelected) => expect(isSelected).toBe(true));

export const expectToBeOpen = async (title: string): Promise<void> =>
    await findTitleElement(title)
        .then(isNodeOpen)
        .then((isOpen) => expect(isOpen).toBe(true));

export const expectToBeClosed = async (title: string): Promise<void> =>
    await findTitleElement(title)
        .then(isNodeOpen)
        .then((isOpen) => expect(isOpen).toBe(false));

export const findTitleElement = async (
    title: string
): Promise<ElementHandle<HTMLElement>> =>
    await findElement(`css=.jqtree-title >> text="${title}"`);

export const openNode = async (title: string): Promise<void> => {
    const handle = await findTitleElement(title);
    await handle.evaluate((el) =>
        el
            .closest(".jqtree-element")
            ?.querySelector<HTMLElement>(".jqtree-toggler")
            ?.click()
    );
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
    handle.evaluate(
        (el) => !el.closest("li")?.classList.contains("jqtree-closed")
    );

const isNodeSelected = async (
    handle: ElementHandle<HTMLElement>
): Promise<boolean> =>
    handle.evaluate(
        (el) => el.closest("li")?.classList.contains("jqtree-selected") ?? false
    );
