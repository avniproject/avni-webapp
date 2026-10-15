import { assert } from "chai";
import { AxiosError } from "axios";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { all, call, select, takeEvery } from "redux-saga/effects";
import { forkRestartingOnNetworkError, restartOnNetworkError } from "./restartOnNetworkError";
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

describe("forkRestartingOnNetworkError", () => {
  const networkError = new AxiosError("Network Error", AxiosError.ERR_NETWORK);
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

  beforeEach(() => jest.spyOn(console, "warn").mockImplementation(() => {}));
  afterEach(() => console.warn.mockRestore());

  it("keeps a sibling watcher's save going when another watcher fails for lack of network, and restarts the failed one", async () => {
    let finishSave;
    const saveResponse = new Promise((resolve) => (finishSave = resolve));
    const completedSaves = [];
    let loadAttempts = 0;

    function* saveWatcher() {
      yield takeEvery("SAVE", function* () {
        yield call(() => saveResponse);
        completedSaves.push("saved");
      });
    }
    function* loadWatcher() {
      yield takeEvery("LOAD", function* () {
        loadAttempts++;
        yield call(() => Promise.reject(networkError));
      });
    }
    function* rootSaga() {
      yield all([saveWatcher, loadWatcher].map(forkRestartingOnNetworkError));
    }

    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(() => ({ app: { appInitialised: true } }), applyMiddleware(sagaMiddleware));
    sagaMiddleware.run(rootSaga);

    store.dispatch({ type: "SAVE" });
    store.dispatch({ type: "LOAD" });
    await flush();
    finishSave();
    await flush();
    store.dispatch({ type: "LOAD" });
    await flush();

    assert.deepEqual(completedSaves, ["saved"]);
    assert.equal(loadAttempts, 2);
  });
});
