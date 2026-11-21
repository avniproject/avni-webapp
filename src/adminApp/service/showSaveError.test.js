import { assert } from "chai";
import { AxiosError } from "axios";
import { showSaveError } from "./showSaveError";
import { NETWORK_ERROR_MESSAGE } from "../../common/utils/networkError";

describe("showSaveError", () => {
  let shownError;
  let shownMessageRuleError;
  const setters = {
    setError: (message) => (shownError = message),
    setMsgError: (message) => (shownMessageRuleError = message),
  };

  beforeEach(() => {
    shownError = undefined;
    shownMessageRuleError = undefined;
  });

  it("shows a network failure in the error line every screen draws", () => {
    showSaveError(new AxiosError("Network Error", AxiosError.ERR_NETWORK), setters);

    assert.equal(shownError, NETWORK_ERROR_MESSAGE);
    assert.isUndefined(shownMessageRuleError);
  });

  it("shows the server's message in the error line", () => {
    const error = new AxiosError(
      "Request failed",
      AxiosError.ERR_BAD_REQUEST,
      {},
      {},
      { status: 400, data: { message: "Name already exists" } },
    );

    showSaveError(error, setters);

    assert.equal(shownError, "Name already exists");
    assert.isUndefined(shownMessageRuleError);
  });

  it("leaves a server error without a message to the message rules section, as before", () => {
    const error = new AxiosError(
      "Request failed",
      AxiosError.ERR_BAD_RESPONSE,
      {},
      {},
      { status: 500, data: "javax.persistence.PersistenceException: broken" },
    );

    showSaveError(error, setters);

    assert.isUndefined(shownError);
    assert.equal(shownMessageRuleError, "broken");
  });
});
