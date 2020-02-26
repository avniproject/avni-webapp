import { all, call, fork, put, takeEvery, takeLatest} from "redux-saga/effects";
import {types,getTranslation, setTranslation} from "./TranslationReducers"
import  {storeDispachObservations}  from "../common/utils/reduxStoreUtilty";
import api from "./api";



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
    const translationsData = yield call(api.fetchTranslationDetails);
    storeDispachObservations(types.TRANSLATION_DATA,translationsData);
    yield put(setTranslation(translationsData));
  }

