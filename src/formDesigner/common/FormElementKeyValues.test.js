import { keyValueObjectToRows, EXCLUDED_FE_KEYVALUE_KEYS } from "./FormElementKeyValues";

describe("keyValueObjectToRows", () => {
  it("converts an object to key/value rows in insertion order", () => {
    const rows = keyValueObjectToRows({ guidedCamera: "true", foo: "bar" }, []);
    expect(rows).toEqual([
      { key: "guidedCamera", value: "true" },
      { key: "foo", value: "bar" },
    ]);
  });

  it("omits excluded keys", () => {
    const rows = keyValueObjectToRows({ imageQuality: "0.5", guidedCamera: "true" }, ["imageQuality"]);
    expect(rows).toEqual([{ key: "guidedCamera", value: "true" }]);
  });

  it("returns empty array for nullish input", () => {
    expect(keyValueObjectToRows(undefined, [])).toEqual([]);
  });

  it("EXCLUDED_FE_KEYVALUE_KEYS includes the known dedicated-control keys", () => {
    expect(EXCLUDED_FE_KEYVALUE_KEYS).toEqual(expect.arrayContaining(["imageQuality", "unique", "editable", "IdSourceUUID"]));
  });
});
