import onLoadSaga from "./onLoadSaga";
import { all } from "redux-saga/effects";
import { forkRestartingOnNetworkError } from "../../rootApp/restartOnNetworkError";

export default function* rootSaga() {
  yield all([onLoadSaga].map(forkRestartingOnNetworkError));
}
