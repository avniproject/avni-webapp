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

  static switchItemPosition(array, startIndex, endIndex, fieldToUpdate) {
    const workingItems = _.sortBy(array, [fieldToUpdate]);
    if (_.inRange(startIndex, 0, array.length) && _.inRange(endIndex, 0, array.length)) {
      let removedElement = _.pullAt(workingItems, startIndex)[0];
      workingItems.splice(endIndex, 0, removedElement);
    }
    workingItems.forEach((item, index) => {
      item[fieldToUpdate] = index + 1;
    });
    array.splice(0, array.length, ...workingItems);
  }
}

export default CollectionUtil;
