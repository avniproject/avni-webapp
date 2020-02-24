import React from 'react'
import { getTranslation } from "./dataEntryApp/reducers/TranslationReducers";
import { call, put, take, takeLatest } from "redux-saga/effects";

export const translationComp = () =>{
}


  export default function*() {
    yield put(getTranslation());
  }

  