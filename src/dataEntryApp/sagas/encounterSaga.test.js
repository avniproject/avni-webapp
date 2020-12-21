import { expectSaga } from "redux-saga-test-plan";
import mockData from "dataEntryApp/sagas/subjectSaga.mock";
import encounterReducer from "dataEntryApp/reducers/encounterReducer";
import {
  updateEncounterObsWorker,
  updateCancelEncounterObsWorker
} from "dataEntryApp/sagas/encounterSaga";

describe("encounterSaga", () => {
  test("updates the encounter observations", async () => {
    const { encounter, formElement1, formElementGroup1 } = mockData(10, { isCancel: false });
    const initialState = {
      dataEntry: { encounterReducer: { encounter, validationResults: [] } }
    };
    const args = { formElement: formElement1, value: 5 };

    const { storeState } = await expectSaga(updateEncounterObsWorker, args)
      .withReducer(encounterReducer, initialState)
      .run();

    const matchingObservation = storeState.encounter.observations.find(
      obs => obs.concept.name === "a1"
    ).valueJSON.value;

    expect(storeState.filteredFormElements).toEqual(formElementGroup1.getFormElements());
    expect(matchingObservation).toBe(5);
    expect(storeState.validationResults).toEqual([]);
  });

  test("updates the encounter cancel observations", async () => {
    const { encounter, formElement1, formElementGroup1 } = mockData(10, { isCancel: true });
    const initialState = {
      dataEntry: { encounterReducer: { encounter, validationResults: [] } }
    };
    const args = { formElement: formElement1, value: 5 };

    const { storeState } = await expectSaga(updateCancelEncounterObsWorker, args)
      .withReducer(encounterReducer, initialState)
      .run();

    const matchingObservation = storeState.encounter.cancelObservations.find(
      obs => obs.concept.name === "a1"
    ).valueJSON.value;

    expect(storeState.filteredFormElements).toEqual(formElementGroup1.getFormElements());
    expect(matchingObservation).toBe(5);
    expect(storeState.validationResults).toEqual([]);
  });
});
