import { all, call, fork, put, select, takeLatest } from "redux-saga/effects";
import {
  selectCommentState,
  setActiveThread,
  setComments,
  setCommentError,
  setCommentThreads,
  setLoadCommentListing,
  setLoading,
  setNewCommentText,
  types,
} from "../reducers/CommentReducer";
import API from "../api";
import { find, get, map } from "lodash";
import { getAPIErrorMessage } from "./sagaUtils";

export default function* () {
  yield all(
    [
      fetchCommentWatcher,
      newCommentThreadWatcher,
      resolveThreadWatcher,
      threadReplyWatcher,
      newCommentWatcher,
      commentDeleteWatcher,
      commentEditWatcher,
    ].map(fork),
  );
}

function* fetchCommentWatcher() {
  yield takeLatest(types.GET_COMMENT_THREADS, fetchCommentWorker);
}

function* newCommentThreadWatcher() {
  yield takeLatest(types.ON_NEW_THREAD, newCommentThreadWorker);
}

function* resolveThreadWatcher() {
  yield takeLatest(types.ON_RESOLVE, resolveThreadWorker);
}

function* threadReplyWatcher() {
  yield takeLatest(types.ON_REPLY, threadReplyWorker);
}

function* newCommentWatcher() {
  yield takeLatest(types.ON_NEW_COMMENT, newCommentWorker);
}

function* commentDeleteWatcher() {
  yield takeLatest(types.ON_DELETE, commentDeleteWorker);
}

function* commentEditWatcher() {
  yield takeLatest(types.ON_EDIT, commentEditWorker);
}

export function* fetchCommentWorker({ subjectUUID }) {
  yield put.resolve(setLoadCommentListing(false));
  yield put.resolve(setLoading(true));
  const commentThreads = yield call(API.fetchCommentThreads, subjectUUID);
  yield put(setCommentThreads(commentThreads));
  yield put.resolve(setLoading(false));
}

export function* newCommentThreadWorker({ text, subjectUUID }) {
  try {
    yield put.resolve(setLoadCommentListing(false));
    const payload = { comments: [{ text, subjectUUID }] };
    yield call(API.newCommentThread, payload);
    const commentThreads = yield call(API.fetchCommentThreads, subjectUUID);
    yield put(setCommentThreads(commentThreads));
    yield put.resolve(setNewCommentText(""));
  } catch (e) {
    yield put(setCommentError(getAPIErrorMessage(e)));
  }
}

export function* resolveThreadWorker() {
  yield put.resolve(setLoadCommentListing(false));
  const state = yield select(selectCommentState);
  const resolvedThread = yield call(API.resolveThread, get(state, "activeThread.id"));
  const commentThreads = map(state.commentThreads, (thread) => (thread.uuid === resolvedThread.uuid ? resolvedThread : thread));
  yield put(setCommentThreads(commentThreads));
}

export function* threadReplyWorker({ threadId }) {
  yield put.resolve(setLoadCommentListing(true));
  const state = yield select(selectCommentState);
  const thread = find(state.commentThreads, ({ id }) => id === threadId);
  yield put.resolve(setActiveThread(thread));
  yield put(setComments(get(thread, "comments", [])));
}

export function* newCommentWorker({ subjectUUID }) {
  const { comments, activeThread, newCommentText } = yield select(selectCommentState);
  const payload = { text: newCommentText, subjectUUID, commentThreadUUID: activeThread.uuid };
  const newComment = yield call(API.newComment, payload);
  const newComments = [...comments, newComment];
  yield put.resolve(setNewCommentText(""));
  yield put(setComments(newComments));
}

export function* commentDeleteWorker({ commentId }) {
  const { activeThread } = yield select(selectCommentState);
  yield call(API.deleteComment, commentId);
  const newComments = yield call(API.fetchCommentsForThread, activeThread.id);
  yield put(setComments(newComments));
}

export function* commentEditWorker({ comment, newCommentText }) {
  const { activeThread } = yield select(selectCommentState);
  const payload = { ...comment, text: newCommentText };
  yield call(API.editComment, payload);
  const newComments = yield call(API.fetchCommentsForThread, activeThread.id);
  yield put.resolve(setNewCommentText(""));
  yield put(setComments(newComments));
}
