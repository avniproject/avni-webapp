import { withUserTimeZone } from "./SearchRequestUtil";

describe("withUserTimeZone", () => {
  it("adds the browser's time zone to the search request", () => {
    const request = { name: "Asha", pageElement: { numberOfRecordPerPage: 20 } };

    expect(withUserTimeZone(request)).toEqual({
      ...request,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  });

  it("leaves the caller's request unchanged", () => {
    const request = { name: "Asha" };
    withUserTimeZone(request);

    expect(request).toEqual({ name: "Asha" });
  });
});
