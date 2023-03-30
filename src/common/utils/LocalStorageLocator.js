class LocalStorageLocator {
  constructor() {
    this.localStorage = localStorage;
  }

  setLocalStorage(x) {
    this.localStorage = x;
  }

  getLocalStorage() {
    return this.localStorage;
  }
}

export default new LocalStorageLocator();
