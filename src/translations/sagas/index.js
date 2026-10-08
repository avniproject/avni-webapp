import onLoadSaga from "./onLoadSaga";
import { all, fork } from "redux-saga/effects";

export default function* rootSaga() {
  yield all([onLoadSaga].map(fork));
}
