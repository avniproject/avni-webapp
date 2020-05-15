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
    httpClient.setOrganisationUUID("bf4fdf86-85e9-4b1f-a873-36d097a60e64");
    httpClient.setHeaders(params);
    assert.deepEqual(
      params.headers,
      new Headers({
        accept: "application/json",
        "content-type": "application/json",
        "user-name": "abcd",
        "auth-token": idToken,
        "ORGANISATION-UUID": "bf4fdf86-85e9-4b1f-a873-36d097a60e64"
      })
    );
  });
});
