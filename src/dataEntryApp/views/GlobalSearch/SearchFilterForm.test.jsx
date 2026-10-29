import { isValid } from "date-fns";
import { toConceptPickerValue } from "./SearchFilterForm";

describe("toConceptPickerValue", () => {
  it("turns a saved date back into a local date for the date picker", () => {
    const value = toConceptPickerValue("Date", "2026-01-15");

    expect(isValid(value)).toBe(true);
    expect([value.getFullYear(), value.getMonth(), value.getDate()]).toEqual([
      2026, 0, 15,
    ]);
  });

  it("turns a saved date-time back into a date", () => {
    expect(isValid(toConceptPickerValue("DateTime", "2026-01-15"))).toBe(true);
  });

  it("leaves values of other data types alone", () => {
    expect(toConceptPickerValue("Numeric", "20")).toBe("20");
    expect(toConceptPickerValue("Time", "09:30")).toBe("09:30");
  });

  it("leaves empty and unreadable values alone", () => {
    expect(toConceptPickerValue("Date", null)).toBeNull();
    expect(toConceptPickerValue("Date", undefined)).toBeUndefined();
    expect(toConceptPickerValue("Date", "not a date")).toBe("not a date");
  });
});
