import CollectionUtil from "./CollectionUtil";
import { assert } from "chai";
import _ from "lodash";

function isOrderedByAscendingDisplayOrder(arr) {
  return arr.every(function(x, i) {
    return (i === 0 && x.displayOrder == 1) || x.displayOrder === arr[i - 1].displayOrder + 1;
  });
}

function isOrderedByInputItemOrder(arr, expected) {
  return arr.every(function(x, i) {
    return x.name === expected[i];
  });
}

function validatePositionSwitch(initItems, fromIndex, toIndex, expectedOrderOfNamesAfterRound) {
  const shuffledItemsFirstRound = _.shuffle(initItems);
  CollectionUtil.switchItemPosition(shuffledItemsFirstRound, fromIndex, toIndex, "displayOrder");
  assert.isTrue(isOrderedByInputItemOrder(shuffledItemsFirstRound, expectedOrderOfNamesAfterRound));
  assert.isTrue(isOrderedByAscendingDisplayOrder(shuffledItemsFirstRound));
}

function getInitItems(initOrder) {
  return _.map(initOrder, (item, idx) => ({ name: item, displayOrder: idx + 1 }));
}

it("should convert to object", function() {
  const object = CollectionUtil.toObject([{ a: "field1", b: "2" }, { a: "field2", b: "20" }], "a", "b");
  assert.equal(object["field1"], "2");
  assert.equal(object["field2"], "20");
});

it("should reorder items as per input in ascending value of displayOrder", function() {
  const initOrder = ["item1", "item2", "item3", "item4", "item5"];
  const expectedOrderOfNamesAfterFirstRound = ["item3", "item1", "item2", "item4", "item5"];
  const expectedOrderOfNamesAfterSecondRound = ["item1", "item2", "item4", "item5", "item3"];

  const items = getInitItems(initOrder);
  validatePositionSwitch(items, 2, 0, expectedOrderOfNamesAfterFirstRound);
  validatePositionSwitch(items, 0, 4, expectedOrderOfNamesAfterSecondRound);
});
