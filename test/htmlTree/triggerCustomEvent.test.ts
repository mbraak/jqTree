import triggerCustomEvent from "app/htmlTree/triggerCustomEvent";

describe("triggerCustomEvent", () => {
    let element: HTMLElement;

    beforeEach(() => {
        element = document.createElement("div");
        document.body.append(element);
    });

    afterEach(() => {
        element.remove();
    });

    it("dispatches an event with the given name", () => {
        const listener = vi.fn();
        element.addEventListener("tree.test", listener);

        triggerCustomEvent(element, "tree.test");

        expect(listener).toHaveBeenCalledOnce();
    });

    it("returns true when the event is not cancelled", () => {
        expect(triggerCustomEvent(element, "tree.test")).toBe(true);
    });

    it("returns false when a listener calls preventDefault", () => {
        element.addEventListener("tree.test", (e) => {
            e.preventDefault();
        });

        expect(triggerCustomEvent(element, "tree.test")).toBe(false);
    });

    it("passes the values as the event detail", () => {
        const values = { node: "test", index: 1 };
        let detail: unknown;
        element.addEventListener("tree.test", (e) => {
            detail = (e as CustomEvent).detail;
        });

        triggerCustomEvent(element, "tree.test", values);

        expect(detail).toEqual(values);
    });

    it("bubbles to ancestor elements", () => {
        const parent = document.createElement("div");
        parent.append(element);
        const listener = vi.fn();
        parent.addEventListener("tree.test", listener);

        triggerCustomEvent(element, "tree.test");

        expect(listener).toHaveBeenCalledOnce();
    });
});
