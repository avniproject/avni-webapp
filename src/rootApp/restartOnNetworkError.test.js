import { assert } from "chai";
import { AxiosError } from "axios";
import { call, select } from "redux-saga/effects";
import { restartOnNetworkError } from "./restartOnNetworkError";
import { selectIsAppInitialised } from "./ducks";
import { networkErrorNotifier } from "../common/utils/networkErrorNotifier";

describe("restartOnNetworkError", () => {
  function* watcher() {}

  const networkError = new AxiosError("Network Error", AxiosError.ERR_NETWORK);

  it("runs the saga and stops when it finishes", () => {
    const saga = restartOnNetworkError(watcher);

    assert.deepEqual(saga.next().value, call(watcher));
    assert.isTrue(saga.next().done);
  });

  it("tells the user and restarts the saga after a network failure once the app is up", () => {
    const saga = restartOnNetworkError(watcher);
    saga.next();

    assert.deepEqual(saga.throw(networkError).value, select(selectIsAppInitialised));
    assert.deepEqual(saga.next(true).value, call([networkErrorNotifier, networkErrorNotifier.notify]));
    assert.deepEqual(saga.next().value, call(watcher));
  });

  it("lets a network failure through while the app is still loading, so the error page can offer a reload", () => {
    const saga = restartOnNetworkError(watcher);
    saga.next();
    saga.throw(networkError);

    assert.throws(() => saga.next(false), networkError);
  });

  it("lets any other error through so real bugs still reach the error page", () => {
    const saga = restartOnNetworkError(watcher);
    const bug = new Error("boom");
    saga.next();
    saga.throw(bug);

    assert.throws(() => saga.next(true), bug);
  });
});
