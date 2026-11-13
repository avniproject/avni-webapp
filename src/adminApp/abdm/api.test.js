import { errorMessage } from "./api";
import * as api from "./api";

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

  it("does not repeat ABDM's code the reason already names", () => {
    expect(errorMessage(failure({ ok: false, error: "refused with HTTP 400 ABDM-1080: bad id", abdmCode: "ABDM-1080" }))).toBe(
      "refused with HTTP 400 ABDM-1080: bad id",
    );
  });

  it("reads an error object by its message", () => {
    expect(errorMessage(failure({ error: { code: "INVALID_REQUEST", message: "already registered" } }))).toBe("already registered");
  });

  it("reads the server's own {code, message} as before", () => {
    expect(errorMessage(failure({ code: "X", message: "Not an ABHA address" }))).toBe("Not an ABHA address");
    expect(errorMessage(failure("Bad"))).toBe("Bad");
    expect(errorMessage(new Error("Network Error"))).toBe("Network Error");
    expect(errorMessage(failure({ a: 1 }))).toBe('{"a":1}');
  });

  it("reads Spring's own error body by its reason", () => {
    expect(errorMessage(failure({ timestamp: "t", status: 403, error: "Forbidden", path: "/web/abdm/x" }))).toBe("Forbidden");
  });
});

describe("a 403", () => {
  it("reads as a missing privilege, not the server's raw words", () => {
    expect(errorMessage({ response: { status: 403, data: { message: "User does not have privilege ShareAbdmRecords" } } })).toBe(
      "You do not have the privilege for this",
    );
    expect(errorMessage({ response: { status: 403, data: "Forbidden" } })).toBe("You do not have the privilege for this");
  });
});

describe("requeueFailed", () => {
  it("posts to the requeue endpoint and returns the count", async () => {
    const { httpClient } = require("../../common/utils/httpClient");
    httpClient.postJson = jest.fn(() => Promise.resolve({ data: { requeued: 3 } }));
    await expect(api.requeueFailed()).resolves.toEqual({ requeued: 3 });
    expect(httpClient.postJson).toHaveBeenCalledWith("/web/abdm/hip/requeue-failed", {});
  });
});

describe("a 404", () => {
  // The server's gate answers an organisation without record sharing (or without an HIU ID) 404 {message: "Not found"}.
  it("from the server's gate reads as record sharing being off", () => {
    expect(errorMessage({ response: { status: 404, data: { message: "Not found" } } })).toBe(
      "ABDM record sharing is off for this organisation",
    );
  });

  it("naming what was not found shows that, not that record sharing is off", () => {
    expect(errorMessage({ response: { status: 404, data: { message: "Subject not found" } } })).toBe("Subject not found");
    expect(errorMessage({ response: { status: 404, data: { message: "Consent request not found" } } })).toBe("Consent request not found");
  });

  it("from anything but the gate shows its own reason", () => {
    expect(errorMessage({ response: { status: 404, data: { error: "Not Found", path: "/web/abdm/x" } } })).toBe("Not Found");
  });
});

describe("the calls that remain", () => {
  it("leave out everything the demo had", () => {
    for (const gone of ["getMessages", "addSampleRecords", "approveConsentEka", "resetDemo", "setAutoLink"]) {
      expect(api[gone]).toBeUndefined();
    }
  });
});
