import type { JQTreeOptions } from "app/jqtreeOptions";

import setDefaultOptions from "app/htmlTree/setDefaultOptions";

describe("setDefaultOptions", () => {
    describe("rtl", () => {
        it("sets rtl to false when there is no data-rtl attribute", () => {
            const element = document.createElement("div");
            const options = {} as JQTreeOptions;

            setDefaultOptions(element, options);

            expect(options.rtl).toBeFalse();
        });

        it("sets rtl to true when the element has a data-rtl attribute", () => {
            const element = document.createElement("div");
            element.dataset.rtl = "true";
            const options = {} as JQTreeOptions;

            setDefaultOptions(element, options);

            expect(options.rtl).toBeTrue();
        });

        it("keeps rtl when it is set in the options", () => {
            const element = document.createElement("div");
            element.dataset.rtl = "true";
            const options = { rtl: false } as JQTreeOptions;

            setDefaultOptions(element, options);

            expect(options.rtl).toBeFalse();
        });
    });

    describe("closedIcon", () => {
        it("sets closedIcon to a triangle to the right when rtl is false", () => {
            const element = document.createElement("div");
            const options = {} as JQTreeOptions;

            setDefaultOptions(element, options);

            expect(options.closedIcon).toBe("&#x25ba;");
        });

        it("sets closedIcon to a triangle to the left when rtl is true", () => {
            const element = document.createElement("div");
            const options = { rtl: true } as JQTreeOptions;

            setDefaultOptions(element, options);

            expect(options.closedIcon).toBe("&#x25c0;");
        });

        it("keeps closedIcon when it is set in the options", () => {
            const element = document.createElement("div");
            const options = { closedIcon: "closed" } as JQTreeOptions;

            setDefaultOptions(element, options);

            expect(options.closedIcon).toBe("closed");
        });
    });
});
