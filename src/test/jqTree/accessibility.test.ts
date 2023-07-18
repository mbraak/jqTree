import { axe, toHaveNoViolations } from "jest-axe";
import "../../tree.jquery";
import exampleData from "../support/exampleData";

expect.extend(toHaveNoViolations);

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

afterEach(() => {
    const $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
});

it("has an accessible ui", async () => {
    const $tree = $("#tree1");
    $tree.tree({
        data: exampleData,
    });
    const element = $tree.get()[0] as HTMLElement;

    expect(await axe(element)).toHaveNoViolations();
});
