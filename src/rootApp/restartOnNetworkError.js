import { call, fork, select } from "redux-saga/effects";
import { selectIsAppInitialised } from "./ducks";
import { isNetworkError } from "../common/utils/networkError";
import { networkErrorNotifier } from "../common/utils/networkErrorNotifier";

export function* restartOnNetworkError(saga) {
  while (true) {
    try {
      yield call(saga);
      return;
    } catch (error) {
      const isAppInitialised = yield select(selectIsAppInitialised);
      if (!isAppInitialised || !isNetworkError(error)) throw error;
      console.warn("Network failure in a saga, restarting it", error);
      yield call([networkErrorNotifier, networkErrorNotifier.notify]);
    }
  }
}

export const forkRestartingOnNetworkError = (saga) => fork(restartOnNetworkError, saga);
