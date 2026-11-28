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

        // Disable rules that need a canvas, which jsdom doesn't implement:
        // - the color rules
        // - label-content-name-mismatch (measures text to detect icon ligatures)
        const disabledRuleIds = [
            ...axe.getRules(["cat.color"]).map(({ ruleId }) => ruleId),
            "label-content-name-mismatch",
        ];

        const rules = disabledRuleIds.map((id) => ({ enabled: false, id }));

        axe.configure({ rules })

        const results = await axe.run();

        expect(results.violations).toBeEmpty();
    });
});
