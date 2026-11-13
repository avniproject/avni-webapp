import { isValid } from "date-fns";
import {
  toConceptPickerValue,
  toConceptRequestValue,
} from "./SearchFilterForm";

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

  it("turns a saved time back into a time for the time picker", () => {
    const value = toConceptPickerValue("Time", "09:30");

    expect(isValid(value)).toBe(true);
    expect([value.getHours(), value.getMinutes()]).toEqual([9, 30]);
  });

  it("leaves values of other data types alone", () => {
    expect(toConceptPickerValue("Numeric", "20")).toBe("20");
    expect(toConceptPickerValue("Notes", "three")).toBe("three");
  });

  it("leaves empty and unreadable values alone", () => {
    expect(toConceptPickerValue("Date", null)).toBeNull();
    expect(toConceptPickerValue("Date", undefined)).toBeUndefined();
    expect(toConceptPickerValue("Date", "not a date")).toBe("not a date");
  });
});

describe("toConceptRequestValue", () => {
  it("sends a date as the date the user picked", () => {
    expect(toConceptRequestValue("Date", new Date(2026, 9, 29))).toBe(
      "2026-10-29",
    );
  });

  it("sends a date-time filter as the date picked, without a time", () => {
    expect(toConceptRequestValue("DateTime", new Date(2026, 0, 1))).toBe(
      "2026-01-01",
    );
    expect(toConceptRequestValue("DateTime", new Date(2026, 0, 1, 23, 45))).toBe(
      "2026-01-01",
    );
  });

  it("sends a date-time saved with a time, before the picker became date-only, as the user's own day", () => {
    const savedWithTime = new Date(2026, 0, 15, 0, 30).toISOString();

    expect(
      toConceptRequestValue(
        "DateTime",
        toConceptPickerValue("DateTime", savedWithTime),
      ),
    ).toBe("2026-01-15");
  });

  it("sends a time as hours and minutes", () => {
    expect(toConceptRequestValue("Time", new Date(2026, 9, 29, 9, 5))).toBe(
      "09:05",
    );
  });

  it("sends nothing for an empty or unreadable value", () => {
    expect(toConceptRequestValue("Date", null)).toBeNull();
    expect(toConceptRequestValue("Time", "not a time")).toBeNull();
  });

  it("restores what it sent", () => {
    const time = toConceptPickerValue(
      "Time",
      toConceptRequestValue("Time", new Date(2026, 9, 29, 9, 5)),
    );
    const dateTime = toConceptPickerValue(
      "DateTime",
      toConceptRequestValue("DateTime", new Date(2026, 0, 1)),
    );

    expect([time.getHours(), time.getMinutes()]).toEqual([9, 5]);
    expect(dateTime.getTime()).toBe(new Date(2026, 0, 1).getTime());
  });
});
