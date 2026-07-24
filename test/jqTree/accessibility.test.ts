import axe from "axe-core";

import "app/tree.jquery";

import exampleData from "../support/exampleData";

describe("accessibility", () => {
    beforeEach(() => {
        document.title = 'Test title';
        document.body.innerHTML = '<main><div id="tree1"></div></main>';
        document.documentElement.setAttribute('lang', 'en');
    });

    afterEach(() => {
        const $tree = $("#tree1");
        $tree.tree("destroy");
        document.body.innerHTML = "";
    });

    it("has an accessible ui", async () => {
        const $tree = $("#tree1");
        $tree.tree({
            data: exampleData,
        });

        const rules = axe.getRules(["cat.color"]).map(({ ruleId: id }) => ({
            enabled: false,
            id,
        }));

        axe.configure({ rules })

        const results = await axe.run();

        expect(results.violations).toBeEmpty();
    });
});
