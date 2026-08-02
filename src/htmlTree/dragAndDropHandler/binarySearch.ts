function binarySearch<T>(items: T[], compareFn: (a: T) => number): null | T {
    let low = 0;
    let high = items.length;

    while (low < high) {
        const mid = (low + high) >> 1;
        const item = items[mid];

        if (item === undefined) {
            return null;
        }

        const compareResult = compareFn(item);

        if (compareResult > 0) {
            high = mid;
        } else if (compareResult < 0) {
            low = mid + 1;
        } else {
            return item;
        }
    }

    return null;
}

export default binarySearch;
