import { assert } from "chai";
import { httpClient } from "common/utils/httpClient";
import NoAuthSession from "../../rootApp/security/NoAuthSession";

describe("httpClient", () => {
  it("set headers", () => {
    httpClient.initAuthSession(new NoAuthSession("abcd"));
    const params = {};
    httpClient.setHeaders(params);
    assert.deepEqual(
      params.headers,
      new Headers({
        accept: "application/json",
        "content-type": "application/json",
        "user-name": "abcd"
      })
    );
  });
});
