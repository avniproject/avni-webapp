import { DEFAULT_SUBJECT_ICON_URL, isProfilePictureEnabled, resolveDefaultIconUrl, resolveSubjectType } from "./SubjectProfilePictureUtil";
import { assert } from "chai";

const personType = { type: "Person", name: "Mother", allowProfilePicture: true };
const householdType = { type: "Household", name: "House", allowProfilePicture: false };

describe("SubjectProfilePictureUtil", () => {
  describe("resolveSubjectType", () => {
    it("returns the preferred subject type when it carries a type", () => {
      assert.strictEqual(resolveSubjectType(personType, householdType), personType);
    });

    it("falls back to the second argument when the preferred is null", () => {
      assert.strictEqual(resolveSubjectType(null, householdType), householdType);
    });

    it("falls back to the second argument when the preferred is undefined", () => {
      assert.strictEqual(resolveSubjectType(undefined, householdType), householdType);
    });

    it("falls back when the preferred subject type lacks a type field (avni-webapp#1542)", () => {
      // mapSubjectType(undefined) returns a fresh SubjectType with type === undefined.
      // This is the exact shape the embedded individualB on a relationship carries.
      const emptySubjectType = { name: undefined, uuid: undefined, type: undefined };
      assert.strictEqual(resolveSubjectType(emptySubjectType, householdType), householdType);
    });

    it("returns null when neither preferred nor fallback have a usable type", () => {
      assert.isNull(resolveSubjectType(null, null));
      assert.isNull(resolveSubjectType(undefined, undefined));
      assert.isNull(resolveSubjectType({ type: undefined }, { type: null }));
    });

    it("does not treat an empty-string type as usable", () => {
      assert.strictEqual(resolveSubjectType({ type: "" }, householdType), householdType);
    });
  });

  describe("resolveDefaultIconUrl", () => {
    it("returns the lower-cased type icon", () => {
      assert.strictEqual(resolveDefaultIconUrl(personType), "/icons/person.png");
      assert.strictEqual(resolveDefaultIconUrl(householdType), "/icons/household.png");
      assert.strictEqual(resolveDefaultIconUrl({ type: "Group" }), "/icons/group.png");
    });

    it("returns the person fallback when the subject type is null (avni-webapp#1542)", () => {
      assert.strictEqual(resolveDefaultIconUrl(null), DEFAULT_SUBJECT_ICON_URL);
    });

    it("returns the person fallback when the subject type is undefined", () => {
      assert.strictEqual(resolveDefaultIconUrl(undefined), DEFAULT_SUBJECT_ICON_URL);
    });

    it("returns the person fallback when the subject type has no type field", () => {
      assert.strictEqual(resolveDefaultIconUrl({}), DEFAULT_SUBJECT_ICON_URL);
      assert.strictEqual(resolveDefaultIconUrl({ name: "Mother" }), DEFAULT_SUBJECT_ICON_URL);
    });
  });

  describe("isProfilePictureEnabled", () => {
    it("returns true when allowProfilePicture is true", () => {
      assert.isTrue(isProfilePictureEnabled(personType));
    });

    it("returns false when allowProfilePicture is false", () => {
      assert.isFalse(isProfilePictureEnabled(householdType));
    });

    it("returns false when the subject type is null or undefined", () => {
      assert.isFalse(isProfilePictureEnabled(null));
      assert.isFalse(isProfilePictureEnabled(undefined));
    });

    it("returns false when allowProfilePicture is missing", () => {
      assert.isFalse(isProfilePictureEnabled({ type: "Person" }));
    });
  });
});
