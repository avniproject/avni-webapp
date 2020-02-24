import { all, call, fork, put, takeEvery, takeLatest} from "redux-saga/effects";
import {types,getTranslation, setTranslation} from "../reducers/TranslationReducers"
import httpClient from "common/utils/httpClient";
import  {storeDispachObservations}  from "../../common/utils/reduxStoreUtilty";
import api from "../api";



// // let tranlationApi;
// // export function defaultLanguage(userDetails){
//  const tranlationApi = { fetchTranslationDetails: () => 
//   http.fetchJson(`/web/translations`).then(response => response.json)}
// // }



export default function*() {
  yield all([translationWatcher].map(fork));
}

export function* translationWatcher() {
    yield takeLatest(types.GET_TRANSLATION, setTranslationDetails);
  }

export function* setTranslationDetails(){
  alert("set Details")
    const translationsData = yield call(api.fetchTranslationDetails);
    storeDispachObservations(types.TRANSLATION_DATA,translationsData);
    yield put(setTranslation(translationsData));
  }

