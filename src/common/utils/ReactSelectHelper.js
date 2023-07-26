class ReactSelectHelper {
  label;
  value;

  static toReactSelectItem(x) {
    return { label: x.name, value: x };
  }

  static getCurrentValues(reactSelectItems) {
    return reactSelectItems.map(x => x.value);
  }
}

export default ReactSelectHelper;
