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
    const workingItems = [...array];
    let removedElement;
    array.forEach((mapping, index) => {
      if (index === startIndex) {
        removedElement = _.pullAt(workingItems, index)[0];
      }
    });

    array.forEach((mapping, index) => {
      if (index === endIndex) {
        workingItems.splice(index, 0, removedElement);
      }
    });

    workingItems.forEach((item, index) => {
      item[fieldToUpdate] = index + 1;
    });

    array.splice(0, array.length, ...workingItems);
  }
}

export default CollectionUtil;
