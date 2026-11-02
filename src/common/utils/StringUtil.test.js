/**
 * avniproject/avni-client#1635: an entity type name saved with leading/trailing spaces broke rules
 * that compare by name. The server now trims; App Designer trims before save so the admin sees
 * the name as it is stored, and an all-spaces name counts as empty.
 */
import StringUtil from "./StringUtil";

describe("StringUtil.trimName (#1635)", () => {
  it("removes leading and trailing spaces", () => {
    expect(StringUtil.trimName("  Person  ")).toBe("Person");
  });
  it("keeps inner spaces", () => {
    expect(StringUtil.trimName(" Mother  Child ")).toBe("Mother  Child");
  });
  it("turns an all-spaces name into an empty one", () => {
    expect(StringUtil.trimName("   ")).toBe("");
  });
  it("leaves a missing name missing", () => {
    expect(StringUtil.trimName(undefined)).toBeUndefined();
    expect(StringUtil.trimName(null)).toBeNull();
  });
});
