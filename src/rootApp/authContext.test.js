import { assert } from "chai";
import { authContext } from "./authContext";

describe("authContext", () => {
  it("initialise authContext", function() {
    const userInfo = {
      username: "abcd",
      idToken: "deui3rehd32ouih23iou34o82ud"
    };
    authContext.init(userInfo);
    const contextObj = authContext.get();
    assert.isObject(contextObj);
    assert.deepEqual(contextObj, {
      username: "abcd",
      token: "deui3rehd32ouih23iou34o82ud"
    });
  });

  it("initialising authContext twice gets ignored", function() {
    const userInfo = { username: "efgh", idToken: "cfdc38fu34f87y34fif" };
    const userInfo2 = {
      username: "abcd",
      idToken: "deui3rehd32ouih23iou34o82ud"
    };
    authContext.init(userInfo, true);
    authContext.init(userInfo2);
    assert.deepEqual(authContext.get(), {
      username: "efgh",
      token: "cfdc38fu34f87y34fif"
    });
  });
});
