// Url class for absolute and relative urls.

const isAbsoluteUrl = (inputUrl: string) => {
  try {
    new URL(inputUrl);
    return true;
  } catch {
    return false;
  }
}

const LOCALHOST = "http://localhost";

class RequestUrl {
  private isAbsolute: boolean;
  private url: URL;

  constructor(inputUrl: string) {
    if (isAbsoluteUrl(inputUrl)) {
      this.url = new URL(inputUrl);
      this.isAbsolute = true;
    } else {
      this.url = new URL(inputUrl, LOCALHOST);
      this.isAbsolute = false;
    }
  }

  setSearchParam(key: string, value: string) {
    this.url.searchParams.set(key, value);
  }

  toString() {
    if (this.isAbsolute) {
      return this.url.href;
    } else {
      return this.url.href.slice(LOCALHOST.length);
    }
  }
}

export default RequestUrl;