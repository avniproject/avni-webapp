import { httpClient } from "common/utils/httpClient";
import api from "./index";

jest.mock("common/utils/httpClient", () => ({
  httpClient: { fetchJson: jest.fn() },
}));

const httpError = (status) => Object.assign(new Error(`HTTP ${status}`), { status });

describe("api.fetchEligibleEncounterTypes", () => {
  it("passes on a 404 so the page can say the subject was not found", async () => {
    httpClient.fetchJson.mockRejectedValue(httpError(404));

    await expect(api.fetchEligibleEncounterTypes("unknown")).rejects.toMatchObject({ status: 404 });
  });

  it("still returns no visit types on other errors, as before", async () => {
    httpClient.fetchJson.mockRejectedValue(httpError(500));

    await expect(api.fetchEligibleEncounterTypes("s1")).resolves.toEqual([]);
  });
});
