import { loadRegistrationPageWorker, saveSubjectWorker } from "./subjectSaga";
import { Individual } from "avni-models";
import { assert } from "chai";
import { select, call } from "redux-saga/effects";
import { selectRegistrationSubject } from "./selectors";
import api from "../api";

describe("subjectSaga", () => {
  it("converts subject to api response before submitting", () => {
    const subject = Individual.createEmptyInstance();
    const sagaAction = saveSubjectWorker();

    assert.deepEqual(select(selectRegistrationSubject), sagaAction.next().value);

    assert.deepEqual(call(api.saveSubject, subject.toResource), sagaAction.next(subject).value);
  });

  //todo
  it("raises failed event in case save does not happen", () => {});

  it("should load metadata", () => {
    const saga = loadRegistrationPageWorker({ subjectTypeName: "Individual" });
  });
});
