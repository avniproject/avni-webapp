class StubbedLocalStorage {
  constructor(itemMap: Map) {
    this.itemMap = itemMap;
  }

  getItem(item) {
    return this.itemMap.get(item);
  }
}

export default StubbedLocalStorage;
