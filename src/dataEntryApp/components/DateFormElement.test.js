import { assert } from "chai";
import { isDateValid, getDateValidationError } from "./DateFormElement";

describe("DateFormElement Date Validation", () => {
  it("should validate dates within 2000 years as valid", function () {
    assert.isTrue(isDateValid(new Date()));
    assert.isTrue(isDateValid(new Date("2024-01-01")));
    assert.isTrue(isDateValid(null));
    assert.isTrue(isDateValid(undefined));
  });

  it("should validate dates over 2000 years as invalid", function () {
    assert.isFalse(isDateValid(new Date("0024-01-01")));
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2001);
    assert.isFalse(isDateValid(futureDate));
  });

  it("should validate boundary cases correctly", function () {
    const currentYear = new Date().getFullYear();
    const exactlyTwoThousandYearsAgo = new Date();
    exactlyTwoThousandYearsAgo.setFullYear(currentYear - 2000);
    assert.isTrue(isDateValid(exactlyTwoThousandYearsAgo));

    const exactlyTwoThousandYearsFuture = new Date();
    exactlyTwoThousandYearsFuture.setFullYear(currentYear + 2000);
    assert.isTrue(isDateValid(exactlyTwoThousandYearsFuture));

    const overTwoThousandYearsAgo = new Date();
    overTwoThousandYearsAgo.setFullYear(currentYear - 2001);
    assert.isFalse(isDateValid(overTwoThousandYearsAgo));
  });

  it("should return validation error for invalid dates", function () {
    const result = getDateValidationError(new Date("0024-01-01"));
    assert.isNotNull(result);
    assert.equal(result.messageKey, "invalidDate");
  });

  it("should return null for valid dates", function () {
    const result = getDateValidationError(new Date("2024-01-01"));
    assert.isNull(result);
  });

  it("should return null when no date value exists", function () {
    const result = getDateValidationError(null);
    assert.isNull(result);
  });
});
