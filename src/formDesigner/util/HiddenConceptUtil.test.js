import { HIDDEN_KEY, isConceptHidden, isHiddenKeyValues, withHiddenKeyValue } from "./HiddenConceptUtil";

describe("HiddenConceptUtil", () => {
  describe("isHiddenKeyValues", () => {
    it("reads a boolean true as hidden", () => {
      expect(isHiddenKeyValues([{ key: "hidden", value: true }])).toBe(true);
    });

    it("reads the string true as hidden, as the field app does", () => {
      expect(isHiddenKeyValues([{ key: "hidden", value: "true" }])).toBe(true);
    });

    it.each([false, "false", "True", "yes", 1, "", null, undefined, {}])("reads %p as not hidden, as the field app does", (value) => {
      expect(isHiddenKeyValues([{ key: "hidden", value }])).toBe(false);
    });

    it("reads a concept without the key as not hidden", () => {
      expect(isHiddenKeyValues([{ key: "verifyPhoneNumber", value: true }])).toBe(false);
    });

    it("reads missing key-values as not hidden", () => {
      expect(isHiddenKeyValues(undefined)).toBe(false);
      expect(isHiddenKeyValues(null)).toBe(false);
      expect(isHiddenKeyValues([])).toBe(false);
    });

    it("reads the first entry when the key appears twice, as the field app does", () => {
      expect(
        isHiddenKeyValues([
          { key: "hidden", value: false },
          { key: "hidden", value: true },
        ]),
      ).toBe(false);
    });
  });

  describe("isConceptHidden", () => {
    it("reads the marker off a concept", () => {
      expect(isConceptHidden({ keyValues: [{ key: "hidden", value: true }] })).toBe(true);
    });

    it("treats a missing concept or missing key-values as not hidden", () => {
      expect(isConceptHidden(undefined)).toBe(false);
      expect(isConceptHidden(null)).toBe(false);
      expect(isConceptHidden({})).toBe(false);
      expect(isConceptHidden({ keyValues: null })).toBe(false);
    });
  });

  describe("withHiddenKeyValue", () => {
    const others = [
      { key: "verifyPhoneNumber", value: false },
      { key: "unit", value: "kg" },
    ];

    it("adds the marker as a boolean true and keeps every other entry", () => {
      expect(withHiddenKeyValue(others, true)).toEqual([...others, { key: HIDDEN_KEY, value: true }]);
    });

    it("replaces a marker stored with another value", () => {
      expect(withHiddenKeyValue([{ key: "hidden", value: "yes" }, ...others], true)).toEqual([...others, { key: "hidden", value: true }]);
    });

    it("does not duplicate a marker that is already there", () => {
      const result = withHiddenKeyValue([{ key: "hidden", value: true }], true);
      expect(result).toEqual([{ key: "hidden", value: true }]);
    });

    it("removes the marker when unticked", () => {
      expect(withHiddenKeyValue([...others, { key: "hidden", value: true }], false)).toEqual(others);
    });

    it("removes every copy of the marker when unticked", () => {
      expect(withHiddenKeyValue([{ key: "hidden", value: true }, ...others, { key: "hidden", value: "true" }], false)).toEqual(others);
    });

    it("works on missing key-values", () => {
      expect(withHiddenKeyValue(undefined, true)).toEqual([{ key: "hidden", value: true }]);
      expect(withHiddenKeyValue(null, false)).toEqual([]);
    });

    it("does not change the array it was given", () => {
      const input = [...others];
      withHiddenKeyValue(input, true);
      expect(input).toEqual(others);
    });
  });
});
