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
  private _isAbsolute: boolean;
  private _url: URL;

  constructor(inputUrl: string) {
    if (isAbsoluteUrl(inputUrl)) {
      this._url = new URL(inputUrl);
      this._isAbsolute = true;
    } else {
      this._url = new URL(inputUrl, LOCALHOST);
      this._isAbsolute = false;
    }
  }

  setSearchParam(key: string, value: string) {
    this._url.searchParams.set(key, value);
  }

  toString() {
    if (this._isAbsolute) {
      return this._url.href;
    } else {
      return this._url.href.slice(LOCALHOST.length);
    }
  }
}

export default RequestUrl;