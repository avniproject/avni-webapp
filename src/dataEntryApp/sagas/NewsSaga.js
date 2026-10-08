import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types, setNews, setIsNewsAvailable } from "../reducers/NewsReducer";
import API from "../../news/api";
import { orderBy, size } from "lodash";

export default function*() {
  yield all([fetchNewsWatcher].map(fork));
}

export function* fetchNewsWatcher() {
  yield takeLatest(types.GET_NEWS, fetchNewsWorker);
}

export function* fetchNewsWorker() {
  const news = yield call(API.getPublishedNews);
  yield put.resolve(setIsNewsAvailable(size(news) > 0));
  const orderedNews = orderBy(news, "publishedDate", "desc");
  yield put(setNews(orderedNews));
}
