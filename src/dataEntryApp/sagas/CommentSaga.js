import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { setCommentThreads, setLoading, types } from "../reducers/CommentReducer";
import API from "../api";

export default function*() {
  yield all([fetchCommentWatcher].map(fork));
}

export function* fetchCommentWatcher() {
  yield takeLatest(types.GET_COMMENT_THREADS, fetchCommentWorker);
}

export function* fetchCommentWorker({ subjectUUID }) {
  yield put.resolve(setLoading(true));
  const commentThreads = yield call(API.fetchCommentThreads, subjectUUID);
  yield put(setCommentThreads(commentThreads));
  yield put.resolve(setLoading(false));
}
