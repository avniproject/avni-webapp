import React from 'react'
import { getTranslation } from "/home/persistent/avni/avni-webapp/src/rootApp/ducks";
import { call, put, take, takeLatest } from "redux-saga/effects";

export default function translationComp() {
    debugger;
    console.log("hfjkd");
   setUserDetails();
}

function* setUserDetails() {
    yield put(getTranslation());
  }
  