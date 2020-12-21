import { expectSaga } from "redux-saga-test-plan";
import mockData from "dataEntryApp/sagas/subjectSaga.mock";
import programEncounterReducer from "dataEntryApp/reducers/programEncounterReducer";
import {
  updateEncounterObsWorker,
  updateEncounterCancelObsWorker
} from "dataEntryApp/sagas/programEncounterSaga";

describe("programEncounterSaga", () => {
  test("updates the encounter observations", async () => {
    const { programEncounter, formElement1, formElementGroup1 } = mockData(10, { isCancel: false });
    const initialState = {
      dataEntry: { programEncounterReducer: { programEncounter, validationResults: [] } }
    };
    const args = { formElement: formElement1, value: 5 };

    const { storeState } = await expectSaga(updateEncounterObsWorker, args)
      .withReducer(programEncounterReducer, initialState)
      .run();

    const matchingObservation = storeState.programEncounter.observations.find(
      obs => obs.concept.name === "a1"
    ).valueJSON.value;

    expect(storeState.filteredFormElements).toEqual(formElementGroup1.getFormElements());
    expect(matchingObservation).toBe(5);
    expect(storeState.validationResults).toEqual([]);
  });

  test("updates the encounter cancel observations", async () => {
    const { programEncounter, formElement1, formElementGroup1 } = mockData(10, { isCancel: true });
    const initialState = {
      dataEntry: { programEncounterReducer: { programEncounter, validationResults: [] } }
    };
    const args = { formElement: formElement1, value: 5 };

    const { storeState } = await expectSaga(updateEncounterCancelObsWorker, args)
      .withReducer(programEncounterReducer, initialState)
      .run();

    const matchingObservation = storeState.programEncounter.cancelObservations.find(
      obs => obs.concept.name === "a1"
    ).valueJSON.value;

    expect(storeState.filteredFormElements).toEqual(formElementGroup1.getFormElements());
    expect(matchingObservation).toBe(5);
    expect(storeState.validationResults).toEqual([]);
  });
});
