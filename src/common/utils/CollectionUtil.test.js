import CollectionUtil from "./CollectionUtil";
import { assert } from "chai";

it("should convert to object", function() {
  const object = CollectionUtil.toObject(
    [{ a: "field1", b: "2" }, { a: "field2", b: "20" }],
    "a",
    "b"
  );
  assert.equal(object["field1"], "2");
  assert.equal(object["field2"], "20");
});
