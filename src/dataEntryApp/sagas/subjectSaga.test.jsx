import { updateObsWorker } from "dataEntryApp/sagas/subjectSaga";
import {
  updateEnrolmentObsWorker,
  updateExitEnrolmentObsWorker
} from "dataEntryApp/sagas/enrolmentSaga";
import enrolmentReducer from "dataEntryApp/reducers/programEnrolReducer";
import { expectSaga } from "redux-saga-test-plan";
import mockData from "dataEntryApp/sagas/subjectSaga.mock";
import registrationReducer from "dataEntryApp/reducers/registrationReducer";
import { map } from "lodash";

describe("subjectSaga", () => {
  test("updates the enrolment exit observations", async () => {
    const { programEnrolment, formElement1, formElementGroup1 } = mockData(
      10,
      true
    );
    const initialState = {
      dataEntry: {
        enrolmentReducer: { programEnrolment, validationResults: [] }
      }
    };
    const args = { formElement: formElement1, value: 5 };

    const { storeState } = await expectSaga(updateExitEnrolmentObsWorker, args)
      .withReducer(enrolmentReducer, initialState)
      .run();

    const matchingObservation = storeState.programEnrolment.programExitObservations.find(
      obs => obs.concept.name === "a1"
    ).valueJSON.value;

    expect(storeState.filteredFormElements.length).toEqual(
      formElementGroup1.getFormElements().length
    );
    expect(map(storeState.filteredFormElements, ({ uuid }) => uuid)).toEqual(
      map(formElementGroup1.getFormElements(), ({ uuid }) => uuid)
    );
    expect(matchingObservation).toBe(5);
    expect(storeState.validationResults).toEqual([]);
  });

  test("updates the enrolment observations", async () => {
    const { programEnrolment, formElement1, formElementGroup1 } = mockData(
      10,
      false
    );
    const initialState = {
      dataEntry: {
        enrolmentReducer: { programEnrolment, validationResults: [] }
      }
    };
    const args = { formElement: formElement1, value: 5 };

    const { storeState } = await expectSaga(updateEnrolmentObsWorker, args)
      .withReducer(enrolmentReducer, initialState)
      .run();

    const matchingObservation = storeState.programEnrolment.observations.find(
      obs => obs.concept.name === "a1"
    ).valueJSON.value;

    expect(storeState.filteredFormElements.length).toEqual(
      formElementGroup1.getFormElements().length
    );
    expect(map(storeState.filteredFormElements, ({ uuid }) => uuid)).toEqual(
      map(formElementGroup1.getFormElements(), ({ uuid }) => uuid)
    );
    expect(matchingObservation).toBe(5);
    expect(storeState.validationResults).toEqual([]);
  });

  test("updates the subject observations", async () => {
    const { subject, formElement1, formElementGroup1 } = mockData(10, false);
    const initialState = {
      dataEntry: { registration: { subject, validationResults: [] } }
    };
    const args = { formElement: formElement1, value: 5 };

    const { storeState } = await expectSaga(updateObsWorker, args)
      .withReducer(registrationReducer, initialState)
      .run();

    const matchingObservation = storeState.subject.observations.find(
      obs => obs.concept.name === "a1"
    ).valueJSON.value;

    expect(storeState.filteredFormElements.length).toEqual(
      formElementGroup1.getFormElements().length
    );
    expect(map(storeState.filteredFormElements, ({ uuid }) => uuid)).toEqual(
      map(formElementGroup1.getFormElements(), ({ uuid }) => uuid)
    );
    expect(matchingObservation).toBe(5);
    expect(storeState.validationResults).toEqual([]);
  });
});
