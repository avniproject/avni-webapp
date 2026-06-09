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
        "user-name": "abcd",
      }),
    );
  });

  describe("fetchJson error body", () => {
    let originalFetch;

    const stubFetch = ({ status, statusText = "", body }) => {
      global.fetch = () =>
        Promise.resolve({
          status,
          statusText,
          headers: new Headers(),
          text: () => Promise.resolve(body),
        });
    };

    beforeEach(() => {
      originalFetch = global.fetch;
      const noAuthSession = new NoAuthSession();
      noAuthSession.userInfoUpdate([], "abcd", "ABCD");
      httpClient.initAuthSession(noAuthSession);
      httpClient.setIdp(IdpFactory.createIdp(IdpDetails.none, {}));
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it("preserves a plain-text error body even when statusText is empty", async () => {
      const message = "User does not have privilege of type: EditSubject or RegisterSubject";
      stubFetch({ status: 403, body: message });
      try {
        await httpClient.fetchJson("/web/individuals", { method: "POST", body: "{}" });
        assert.fail("expected fetchJson to reject");
      } catch (error) {
        assert.equal(error.status, 403);
        assert.equal(error.body, message);
        assert.equal(error.message, message);
      }
    });

    it("keeps a JSON error body as an object and uses its message", async () => {
      const message = "subject not found";
      stubFetch({ status: 404, body: JSON.stringify({ message }) });
      try {
        await httpClient.fetchJson("/web/individual/abc");
        assert.fail("expected fetchJson to reject");
      } catch (error) {
        assert.equal(error.status, 404);
        assert.deepEqual(error.body, { message });
        assert.equal(error.message, message);
      }
    });

    it("resolves with parsed json on success", async () => {
      stubFetch({ status: 200, body: JSON.stringify({ uuid: "abc" }) });
      const response = await httpClient.fetchJson("/web/individual/abc");
      assert.equal(response.status, 200);
      assert.deepEqual(response.json, { uuid: "abc" });
    });
  });
});
