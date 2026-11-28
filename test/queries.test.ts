import { getTreeButton } from "./support/queries";

// Create the html for a tree node:
//
//   <li role="treeitem">
//     <div class="jqtree-element">
//       <span class="jqtree-title"></span>
//     </div>
//   </li>
const createNode = () => {
    const treeElement = document.createElement("li");
    treeElement.setAttribute("role", "treeitem");

    const nodeElement = document.createElement("div");
    nodeElement.className = "jqtree-element";
    treeElement.append(nodeElement);

    const title = document.createElement("span");
    title.className = "jqtree-title";
    nodeElement.append(title);

    return { nodeElement, treeElement };
};

const createTogglerElement = () => {
    const toggler = document.createElement("span");
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

    it("ignores the toggler elements of child nodes", () => {
        const { nodeElement, treeElement } = createNode();
        const toggler = createTogglerElement();
        nodeElement.append(toggler);

        const ul = document.createElement("ul");
        const child = createNode();
        child.nodeElement.append(createTogglerElement());
        ul.append(child.treeElement);
        treeElement.append(ul);

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
