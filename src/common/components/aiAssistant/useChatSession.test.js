import { assert } from "chai";
import { backendErrorMessage, clearErrorWithCode, withoutLocalMessage } from "./useChatSession";

const httpError = (status, body) => {
  const err = new Error(`HTTP ${status}: ${body}`);
  err.status = status;
  err.body = body;
  return err;
};

describe("backendErrorMessage", () => {
  it("shows the backend's own error text", () => {
    const body = JSON.stringify({
      detail: { error: "Nothing was uploaded: 'old.xls' is not an .xlsx workbook.", code: "E_BAD_FILE_TYPE" },
    });
    assert.equal(backendErrorMessage(httpError(400, body)), "Nothing was uploaded: 'old.xls' is not an .xlsx workbook.");
  });

  it("falls back to the HTTP error when the body has no error text", () => {
    assert.equal(backendErrorMessage(httpError(502, "Bad Gateway")), "HTTP 502: Bad Gateway");
    assert.equal(backendErrorMessage(httpError(500, JSON.stringify({ detail: "boom" }))), 'HTTP 500: {"detail":"boom"}');
  });

  it("uses the message of an error without a body", () => {
    assert.equal(backendErrorMessage(new Error("Failed to fetch")), "Failed to fetch");
  });
});

describe("clearErrorWithCode", () => {
  const uploadError = { code: "E_UPLOAD", message: "Nothing was uploaded", recoverable: true };

  it("clears the banner left by the same action", () => {
    assert.isNull(clearErrorWithCode("E_UPLOAD")(uploadError));
  });

  it("keeps a banner from another source", () => {
    const setupError = { code: "E_SETUP_NOT_LOADED", message: "setup not loaded", recoverable: true };
    assert.strictEqual(clearErrorWithCode("E_UPLOAD")(setupError), setupError);
    assert.isNull(clearErrorWithCode("E_UPLOAD")(null));
  });
});

describe("withoutLocalMessage", () => {
  it("takes out only the message added for a request that failed", () => {
    const reply = { type: "text", role: "assistant", content: "Hi" };
    const sent = { type: "text", role: "user", content: "add a field", localId: "local-2" };
    const earlier = { type: "text", role: "user", content: "hello", localId: "local-1" };
    assert.deepEqual(withoutLocalMessage([earlier, sent, reply], "local-2"), [earlier, reply]);
  });
});
