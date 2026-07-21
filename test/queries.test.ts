import { getTitleElement, getTogglerElement } from "./support/queries";

const createNode = () => {
    const li = document.createElement("li");
    const nodeElement = document.createElement("div");
    nodeElement.className = "jqtree-element";
    li.append(nodeElement);
    return { li, nodeElement };
};

describe("getTitleElement", () => {
    it("returns the title element", () => {
        const { li, nodeElement } = createNode();
        const title = document.createElement("span");
        title.className = "jqtree-title";
        nodeElement.append(title);

        expect(getTitleElement(li)).toBe(title);
    });

    it("only returns a title element that is a direct child of the node element", () => {
        const { li, nodeElement } = createNode();
        const title = document.createElement("span");
        title.className = "jqtree-title";
        nodeElement.append(title);

        // A nested title (e.g. in a child node) should be ignored.
        const nestedTitle = document.createElement("span");
        nestedTitle.className = "jqtree-title";
        title.append(nestedTitle);

        expect(getTitleElement(li)).toBe(title);
    });

    it("throws when the node element is missing", () => {
        const li = document.createElement("li");

        expect(() => getTitleElement(li)).toThrow("Unable to find node element");
    });

    it("throws when there are multiple node elements", () => {
        const li = document.createElement("li");

        for (let i = 0; i < 2; i++) {
            const nodeElement = document.createElement("div");
            nodeElement.className = "jqtree-element";
            li.append(nodeElement);
        }

        expect(() => getTitleElement(li)).toThrow("Found multiple node elements");
    });

    it("throws when the title element is missing", () => {
        const { li } = createNode();

        expect(() => getTitleElement(li)).toThrow(
            "Unable to find title element",
        );
    });

    it("throws when there are multiple title elements", () => {
        const { li, nodeElement } = createNode();

        for (let i = 0; i < 2; i++) {
            const title = document.createElement("span");
            title.className = "jqtree-title";
            nodeElement.append(title);
        }

        expect(() => getTitleElement(li)).toThrow(
            "Found multiple title elements",
        );
    });
});

describe("getTogglerElement", () => {
    it("returns the toggler element", () => {
        const { li, nodeElement } = createNode();
        const toggler = document.createElement("a");
        toggler.className = "jqtree-toggler";
        nodeElement.append(toggler);

        expect(getTogglerElement(li)).toBe(toggler);
    });

    it("only returns a toggler element that is a direct child of the node element", () => {
        const { li, nodeElement } = createNode();
        const toggler = document.createElement("a");
        toggler.className = "jqtree-toggler";
        nodeElement.append(toggler);

        // A nested toggler (e.g. in a child node) should be ignored.
        const nestedToggler = document.createElement("a");
        nestedToggler.className = "jqtree-toggler";
        toggler.append(nestedToggler);

        expect(getTogglerElement(li)).toBe(toggler);
    });

    it("throws when the node element is missing", () => {
        const li = document.createElement("li");

        expect(() => getTogglerElement(li)).toThrow(
            "Unable to find node element",
        );
    });

    it("throws when the toggler element is missing", () => {
        const { li } = createNode();

        expect(() => getTogglerElement(li)).toThrow(
            "Unable to find toggler element",
        );
    });

    it("throws when there are multiple toggler elements", () => {
        const { li, nodeElement } = createNode();

        for (let i = 0; i < 2; i++) {
            const toggler = document.createElement("a");
            toggler.className = "jqtree-toggler";
            nodeElement.append(toggler);
        }

        expect(() => getTogglerElement(li)).toThrow(
            "Found multiple toggler elements",
        );
    });
});
