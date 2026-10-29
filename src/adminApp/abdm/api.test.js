// DEMO-ONLY abdm-hackathon
// How the ABDM page words a failed call (AVNI-20: on 29 Oct Eka's refusal of an approval showed as raw JSON).
import { errorMessage } from "./api";

jest.mock("../../common/utils/httpClient", () => ({
  __esModule: true,
  httpClient: {},
  default: {},
}));

const failure = (data) => ({ response: { data } });

describe("errorMessage", () => {
  it("reads Eka's refusal as its hint, with the technical reason after", () => {
    expect(
      errorMessage(
        failure({
          ok: false,
          httpStatus: 491,
          abdmCode: null,
          error: "Eka POST /abdm/v1/consents/approve refused with HTTP 491",
          hint: "The patient's ABHA session at Eka has lapsed: log the patient in again (ABHA login or session verify), then approve",
        }),
      ),
    ).toBe(
      "The patient's ABHA session at Eka has lapsed: log the patient in again (ABHA login or session verify), then approve (Eka POST /abdm/v1/consents/approve refused with HTTP 491)",
    );
  });

  it("reads an error with no hint, and adds ABDM's code", () => {
    expect(errorMessage(failure({ ok: false, error: "refused", abdmCode: "ABDM-1080" }))).toBe("refused (ABDM-1080)");
  });

  it("reads the server's own {code, message} as before", () => {
    expect(errorMessage(failure({ code: "X", message: "Not an ABHA address" }))).toBe("Not an ABHA address");
    expect(errorMessage(failure("Bad"))).toBe("Bad");
    expect(errorMessage(new Error("Network Error"))).toBe("Network Error");
    expect(errorMessage(failure({ a: 1 }))).toBe('{"a":1}');
  });

  // Deliberate: Spring's default error body used to show as a JSON dump.
  it("reads Spring's own error body by its reason", () => {
    expect(errorMessage(failure({ timestamp: "t", status: 403, error: "Forbidden", path: "/web/abdm/x" }))).toBe("Forbidden");
  });
});
