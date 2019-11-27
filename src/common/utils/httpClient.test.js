import { assert } from "chai";
import { httpClient } from "common/utils/httpClient";

describe("httpClient", () => {
  const idToken = "deui3rehd32ouih23iou34o82ud";

  it("initialise auth context", () => {
    const userInfo = { username: "abcd", idToken };
    httpClient.initAuthContext(userInfo);
    assert.deepEqual(httpClient.authContext.get(), {
      username: "abcd",
      token: idToken
    });
  });

  it("set headers", () => {
    const params = {};
    httpClient.setHeaders(params);
    assert.deepEqual(
      params.headers,
      new Headers({
        accept: "application/json",
        "content-type": "application/json",
        "user-name": "abcd",
        "auth-token": idToken
      })
    );
  });
});
