import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { types , setSubjectProfile } from "../reducers/subjectDashboardReducer";
import api from "../api";

export default function * (){
    yield all([
        subjectProfileFetchWatcher
    ].map(fork));
}

export function * subjectProfileFetchWatcher(){
    yield takeLatest(types.GET_SUBJECT_PROFILE, subjectProfileFetchWorker);
}

export function * subjectProfileFetchWorker({subjectUUID}){
    console.log('bit pain');
    const subjectProfile = yield call(api.fetchSubjectProfile, subjectUUID);

    console.log('asdfasdfsdf', subjectProfile);
    yield put(setSubjectProfile(subjectProfile));
}