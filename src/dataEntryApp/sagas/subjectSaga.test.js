import { saveSubjectWorker, loadRegistrationPageWorker } from "./subjectSaga";
import { Individual } from "openchs-models";
import { assert } from "chai";

describe("subjectSaga", () => {
  it("converts subject to api response before submitting", () => {
    const subject = Individual.createEmptyInstance();
    const sagaAction = saveSubjectWorker({ subject });

    const payload = sagaAction.next().value.CALL.args[0];

    assert.deepEqual(subject.toResource, payload);
  });

  //todo
  it("raises failed event in case save does not happen", () => {});

  it("should load metadata", () => {
    const saga = loadRegistrationPageWorker({ subjectTypeName: "Individual" });
  });
});
