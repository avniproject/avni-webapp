import {
  addUsernameSuffix,
  doesNotContainAt,
  doesNotHaveWhitespaces,
  doesNotStartOrEndWithWhitespaces,
  normalizeWhitespace,
  validateDisplayName,
  validateUserName,
} from "./UserHelper";

const firstError = (validators, value) => validators.map((validate) => validate(value)).find(Boolean);
const errorMessage = (error) => (typeof error === "string" ? error : error && error.message);

describe("admin user field validation", () => {
  test.each([" John", "John ", " John "])("rejects LoginID with leading or trailing whitespace: %j", (value) => {
    expect(errorMessage(firstError(validateUserName, value))).toBe("This field should not start or end with whitespaces");
  });

  test("rejects internal LoginID whitespace without normalizing it", () => {
    expect(errorMessage(firstError(validateUserName, "john smith"))).toBe("This field should not contain whitespaces");
    expect(normalizeWhitespace("john   smith")).toBe("john smith");
  });

  test("rejects @ in LoginID before the organization suffix is added", () => {
    expect(errorMessage(firstError(validateUserName, "john@team"))).toBe("This field should not contain @");
    expect(addUsernameSuffix({ username: "john@team" }, "organisation")).toEqual({ username: "john@team@organisation" });
  });

  test("accepts a valid LoginID", () => {
    expect(firstError(validateUserName, "john.smith")).toBeUndefined();
  });

  test.each([" John", "John ", " John "])("shows the edge-whitespace error for Name: %j", (value) => {
    expect(errorMessage(firstError(validateDisplayName, value))).toBe("This field should not start or end with whitespaces");
  });

  test("normalizes repeated Name whitespace while preserving edge whitespace for validation", () => {
    expect(normalizeWhitespace("  John\t   Smith  ")).toBe(" John Smith ");
    expect(errorMessage(firstError(validateDisplayName, normalizeWhitespace("John   Smith")))).toBe(undefined);
  });

  test("keeps required validation for empty fields", () => {
    expect(errorMessage(firstError(validateUserName, ""))).toBe("This field is required");
    expect(errorMessage(firstError(validateDisplayName, ""))).toBe("This field is required");
  });

  test("doesNotContainAt and doesNotHaveWhitespaces remain independently strict", () => {
    expect(errorMessage(doesNotContainAt("john@team"))).toBe("This field should not contain @");
    expect(errorMessage(doesNotHaveWhitespaces("john smith"))).toBe("This field should not contain whitespaces");
    expect(doesNotStartOrEndWithWhitespaces("john")).toBeUndefined();
  });
});
