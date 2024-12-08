import binarySearch from "../../dragAndDropHandler/binarySearch";

it("returns null when the array is empty", () => {
    const compareFn = (_item: number) => 0;

    const result = binarySearch<number>([], compareFn);
    expect(result).toBeNull();
});

it("finds a value", () => {
    const compareFn = (item: number) => item - 5;

    const result = binarySearch<number>([1, 5, 7, 9], compareFn);
    expect(result).toEqual(5);
});

it("returns null when the value doesn't exist", () => {
    const compareFn = (item: number) => item - 6;

    const result = binarySearch<number>([1, 5, 7, 9], compareFn);
    expect(result).toBeNull();
});

it("handles undefined values in the array", () => {
    const compareFn = (item: number) => item - 6;
    const array = [1, 5, 7, 9];
    (array as any)[1] = undefined; // eslint-disable-line @typescript-eslint/no-unsafe-member-access

    const result = binarySearch<number>(array, compareFn);
    expect(result).toBeNull();
});
