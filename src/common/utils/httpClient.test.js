import { assert } from "chai";
import { httpClient } from "common/utils/httpClient";
import NoAuthSession from "../../rootApp/security/NoAuthSession";
import IdpFactory from "../../rootApp/security/IdpFactory";
import IdpDetails from "../../rootApp/security/IdpDetails";

describe("httpClient", () => {
  it("set headers", () => {
    const noAuthSession = new NoAuthSession();
    noAuthSession.userInfoUpdate([], "abcd", "ABCD");
    httpClient.initAuthSession(noAuthSession);
    const params = {};
    httpClient.setIdp(IdpFactory.createIdp(IdpDetails.none, {}));
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
