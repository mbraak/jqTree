export const isInt = (n: unknown): boolean =>
    typeof n === "number" && n % 1 === 0;

export const isFunction = (v: unknown): boolean => typeof v === "function";

export const getBoolString = (value: unknown): string =>
    value ? "true" : "false";

export const getOffsetTop = (element: HTMLElement) =>
    getElementPosition(element).top;

export const getElementPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();

    return {
        left: rect.x + window.scrollX,
        top: rect.y + window.scrollY,
    };
};

/* Set query parameter of an url.

# relative url
setQueryParameter('/data', 'node', '123');
=> '/data?node=123'

# absolute url
setQueryParameter('http://server/data', 'node', '123');
=> 'http://server/data?node=123'

# existing parameter
setQueryParameter('/data?param1=xyz', 'node', '123');
=> '/data?param1=xyz&node=123'
*/
export const setQueryParameter = (inputUrl: string, key: string, value: string) => {
    const isAbsolute = inputUrl.startsWith('http');
    let url: URL;
    const localhost = 'http://localhost';

    if (isAbsolute) {
        url = new URL(inputUrl)
    }
    else {
        url = new URL(inputUrl, localhost);
    }

    url.searchParams.set(key, value);

    if (isAbsolute) {
        return url.href;
    } else {
        return url.href.slice(localhost.length);
    }
};