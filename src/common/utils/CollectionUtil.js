import _ from "lodash";

class CollectionUtil {
  static toObject(collection, keyKey, valueKey) {
    return _.reduce(
      collection,
      (result, x) => {
        result[x[keyKey]] = x[valueKey];
        return result;
      },
      {}
    );
  }
}

export default CollectionUtil;
