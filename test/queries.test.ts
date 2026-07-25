import { getTreeButton, getTreeListElement } from "./support/queries";

// Create the html for a tree node:
//
//   <li>
//     <div class="jqtree-element">
//       <span class="jqtree-title" role="treeitem"></span>
//     </div>
//   </li>
const createNode = () => {
    const li = document.createElement("li");

    const nodeElement = document.createElement("div");
    nodeElement.className = "jqtree-element";
    li.append(nodeElement);

    const treeElement = document.createElement("span");
    treeElement.className = "jqtree-title";
    treeElement.setAttribute("role", "treeitem");
    nodeElement.append(treeElement);

    return { li, nodeElement, treeElement };
};

const createTogglerElement = () => {
    const toggler = document.createElement("a");
    toggler.className = "jqtree-toggler";
    return toggler;
};

describe("getTreeButton", () => {
    it("returns the toggler element", () => {
        const { nodeElement, treeElement } = createNode();
        const toggler = createTogglerElement();
        nodeElement.append(toggler);

        expect(getTreeButton(treeElement)).toBe(toggler);
    });

    it("only returns a toggler element that is a sibling of the tree element", () => {
        const { nodeElement, treeElement } = createNode();
        const toggler = createTogglerElement();
        nodeElement.append(toggler);

        // A nested toggler (e.g. in a child node) should be ignored.
        treeElement.append(createTogglerElement());

        expect(getTreeButton(treeElement)).toBe(toggler);
    });

    it("throws when the element doesn't have role treeitem", () => {
        const { nodeElement, treeElement } = createNode();
        nodeElement.append(createTogglerElement());
        treeElement.removeAttribute("role");

        expect(() => getTreeButton(treeElement)).toThrow(
            "Element must have role treeitem",
        );
    });

    it("throws when the tree element doesn't have a parent", () => {
        const { nodeElement, treeElement } = createNode();
        treeElement.remove();
        nodeElement.append(createTogglerElement());

        expect(() => getTreeButton(treeElement)).toThrow(
            "Tree element must have a parent",
        );
    });

    it("throws when the toggler element is missing", () => {
        const { treeElement } = createNode();

        expect(() => getTreeButton(treeElement)).toThrow(
            "Unable to find tree button element",
        );
    });

    it("throws when there are multiple toggler elements", () => {
        const { nodeElement, treeElement } = createNode();

        for (let i = 0; i < 2; i++) {
            nodeElement.append(createTogglerElement());
        }

        expect(() => getTreeButton(treeElement)).toThrow(
            "Found multiple tree button elements",
        );
    });
});

describe("getTreeListElement", () => {
    it("returns the list element of the tree element", () => {
        const { li, treeElement } = createNode();

        expect(getTreeListElement(treeElement)).toBe(li);
    });

    it("throws when the element doesn't have role treeitem", () => {
        const { treeElement } = createNode();
        treeElement.removeAttribute("role");

        expect(() => getTreeListElement(treeElement)).toThrow(
            "Element must have role treeitem",
        );
    });

    it("throws when the tree element doesn't have a parent", () => {
        const { treeElement } = createNode();
        treeElement.remove();

        expect(() => getTreeListElement(treeElement)).toThrow(
            "Tree element must have a parent",
        );
    });

    it("throws when the parent of the tree element doesn't have a parent", () => {
        const { nodeElement, treeElement } = createNode();
        nodeElement.remove();

        expect(() => getTreeListElement(treeElement)).toThrow(
            "Tree element must have a parent",
        );
    });

    it("throws when the element isn't in a list element", () => {
        const { nodeElement, treeElement } = createNode();
        const div = document.createElement("div");
        div.append(nodeElement);

        expect(() => getTreeListElement(treeElement)).toThrow(
            "Must be a list element",
        );
    });
});
