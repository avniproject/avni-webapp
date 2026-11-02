import { httpClient } from "common/utils/httpClient";
import SubjectSearchService from "./SubjectSearchService";

jest.mock("common/utils/httpClient", () => ({
  httpClient: { post: jest.fn() },
}));

describe("SubjectSearchService.search", () => {
  it("sends the user's time zone with the search, as Find Relative and the other subject pickers use it", async () => {
    httpClient.post.mockResolvedValue({ data: { listOfRecords: [] } });

    await SubjectSearchService.search({ name: "Asha", subjectType: "st-person" });

    expect(httpClient.post).toHaveBeenCalledWith("/web/searchAPI/v2", {
      name: "Asha",
      subjectType: "st-person",
      pageElement: { numberOfRecordPerPage: 20 },
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  });
});
