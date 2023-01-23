import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import {
  types,
  setMsgsSent,
  setMsgsSentAvailable,
  setMsgsNotYetSent,
  setMsgsNotYetSentAvailable
} from "../reducers/messagesReducer";
import API from "../api";
import { orderBy, size } from "lodash";

export default function*() {
  yield all([fetchMsgsForSubjectWatcher, fetchMessagesNotYetSentForSubjectWatcher].map(fork));
}

export function* fetchMsgsForSubjectWatcher() {
  yield takeLatest(types.GET_MSGS_SENT, fetchMsgsForSubjectWorker);
}

export function* fetchMessagesNotYetSentForSubjectWatcher() {
  yield takeLatest(types.GET_MSGS_NOT_YET_SENT, fetchMessagesNotYetSentForSubjectWorker);
}

export function* fetchMsgsForSubjectWorker({ subjectID }) {
  let msgsForSubject = [];
  try {
    msgsForSubject = yield call(API.getAllMessagesForSubject, subjectID);
  } catch (error) {
    console.log("Error encountered while fetching All Messages to Subject ", subjectID);
  }
  yield put.resolve(setMsgsSentAvailable(size(msgsForSubject) > 0));
  const orderedMsgs = orderBy(msgsForSubject, "insertedAt", "desc");
  yield put(setMsgsSent(orderedMsgs));
}

export function* fetchMessagesNotYetSentForSubjectWorker({ subjectID }) {
  let msgsNotYetSentForSubject = [];
  try {
    msgsNotYetSentForSubject = yield call(API.getAllMessagesNotYetSentForSubject, subjectID);
  } catch (error) {
    console.log("Error encountered while fetching Messages not yet sent to Subject ", subjectID);
  }
  yield put.resolve(setMsgsNotYetSentAvailable(size(msgsNotYetSentForSubject) > 0));
  const orderedMsgsNotYetSent = orderBy(msgsNotYetSentForSubject, "scheduledDateTime", "desc");
  yield put(setMsgsNotYetSent(orderedMsgsNotYetSent));
}
