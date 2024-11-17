import BorderDropHint from "../../nodeElement/borderDropHint";

it("creates an element", () => {
    const element = document.createElement("div");

    const jqTreeElement = document.createElement("div");
    jqTreeElement.classList.add("jqtree-element");
    element.append(jqTreeElement);

    new BorderDropHint(element, 0);

    expect(jqTreeElement.children.length).toBe(1);
    expect(jqTreeElement.children[0]).toHaveClass("jqtree-border");
});

it("doesn't create an element if the node doesn't have a jqtree-element child", () => {
    const element = document.createElement("div");

    new BorderDropHint(element, 0);

    expect(element.children).toBeEmpty();
});
