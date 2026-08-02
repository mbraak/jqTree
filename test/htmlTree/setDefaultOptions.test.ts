import { Node } from "htmlTree/node";
import setDefaultOptions from "htmlTree/setDefaultOptions";

describe("setDefaultOptions", () => {
    describe("defaults", () => {
        it("applies the default options", () => {
            const element = document.createElement("div");

            const options = setDefaultOptions(element, {});

            expect(options).toMatchObject({
                autoEscape: true,
                dragAndDrop: false,
                nodeClass: Node,
                openedIcon: "&#x25bc;",
                saveState: false,
                selectable: true,
            });
        });

        it("keeps options that are set in the input options", () => {
            const element = document.createElement("div");

            const options = setDefaultOptions(element, {
                autoEscape: false,
                dragAndDrop: true,
            });

            expect(options).toMatchObject({
                autoEscape: false,
                dragAndDrop: true,
            });
        });
    });

    describe("rtl", () => {
        it("sets rtl to false when there is no data-rtl attribute", () => {
            const element = document.createElement("div");

            const options = setDefaultOptions(element, {});

            expect(options.rtl).toBeFalse();
        });

        it("sets rtl to true when the element has a data-rtl attribute", () => {
            const element = document.createElement("div");
            element.dataset.rtl = "true";

            const options = setDefaultOptions(element, {});

            expect(options.rtl).toBeTrue();
        });

        it("keeps rtl when it is set in the options", () => {
            const element = document.createElement("div");
            element.dataset.rtl = "true";

            const options = setDefaultOptions(element, { rtl: false });

            expect(options.rtl).toBeFalse();
        });
    });

    describe("closedIcon", () => {
        it("sets closedIcon to a triangle to the right when rtl is false", () => {
            const element = document.createElement("div");

            const options = setDefaultOptions(element, {});

            expect(options.closedIcon).toBe("&#x25ba;");
        });

        it("sets closedIcon to a triangle to the left when rtl is true", () => {
            const element = document.createElement("div");

            const options = setDefaultOptions(element, { rtl: true });

            expect(options.closedIcon).toBe("&#x25c0;");
        });

        it("keeps closedIcon when it is set in the options", () => {
            const element = document.createElement("div");

            const options = setDefaultOptions(element, {
                closedIcon: "closed",
            });

            expect(options.closedIcon).toBe("closed");
        });
    });
});
