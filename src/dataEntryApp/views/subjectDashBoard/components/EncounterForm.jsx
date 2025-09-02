import { useSelector, useDispatch } from "react-redux";
import { format, isValid } from "date-fns";
import { ObservationsHolder } from "avni-models";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import {
  updateObs,
  saveEncounter,
  setValidationResults,
  onNext,
  onPrevious,
  addNewQuestionGroup,
  removeQuestionGroup,
} from "dataEntryApp/reducers/encounterReducer";

const EncounterForm = ({ children }) => {
  const dispatch = useDispatch();

  const form = useSelector(
    (state) => state.dataEntry.encounterReducer.encounterForm,
  );
  const subject = useSelector(
    (state) => state.dataEntry.subjectProfile.subjectProfile,
  );
  const observations = useSelector(
    (state) => state.dataEntry.encounterReducer.encounter.observations,
  );
  const obsHolder = useSelector(
    (state) =>
      new ObservationsHolder(
        state.dataEntry.encounterReducer.encounter.observations,
      ),
  );
  const saved = useSelector((state) => state.dataEntry.encounterReducer.saved);
  const onSaveGoto = useSelector(
    (state) =>
      "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid,
  );
  const validationResults = useSelector(
    (state) => state.dataEntry.encounterReducer.validationResults,
  );
  const message = useSelector((state) =>
    state.dataEntry.encounterReducer.encounter.name
      ? `${state.dataEntry.encounterReducer.encounter.name} Encounter Saved`
      : state.dataEntry.encounterReducer.encounter.encounterType.name
        ? `${
            state.dataEntry.encounterReducer.encounter.encounterType.name
          } Encounter Saved`
        : `Encounter Saved`,
  );
  const additionalRows = useSelector((state) => [
    {
      label: "visitDate",
      value:
        state.dataEntry.encounterReducer.encounter.encounterDateTime &&
        isValid(
          new Date(
            state.dataEntry.encounterReducer.encounter.encounterDateTime,
          ),
        )
          ? format(
              new Date(
                state.dataEntry.encounterReducer.encounter.encounterDateTime,
              ),
              "dd-MMM-yyyy",
            )
          : "-",
    },
  ]);
  const filteredFormElements = useSelector(
    (state) => state.dataEntry.encounterReducer.filteredFormElements,
  );
  const entity = useSelector(
    (state) => state.dataEntry.encounterReducer.encounter,
  );
  const formElementGroup = useSelector(
    (state) => state.dataEntry.encounterReducer.formElementGroup,
  );
  const onSummaryPage = useSelector(
    (state) => state.dataEntry.encounterReducer.onSummaryPage,
  );
  const wizard = useSelector(
    (state) => state.dataEntry.encounterReducer.wizard,
  );
  const saveErrorMessageKey = useSelector(
    (state) => state.dataEntry.encounterReducer.encounterSaveErrorKey,
  );

  const formProps = {
    children,
    form,
    subject,
    observations,
    obsHolder,
    saved,
    onSaveGoto,
    validationResults,
    message,
    additionalRows,
    filteredFormElements,
    entity,
    formElementGroup,
    onSummaryPage,
    wizard,
    saveErrorMessageKey,
    updateObs: (formElement, value) => dispatch(updateObs(formElement, value)),
    addNewQuestionGroup: (formElement, questionGroupIndex) =>
      dispatch(addNewQuestionGroup(formElement, questionGroupIndex)),
    removeQuestionGroup: (formElement, questionGroupIndex) =>
      dispatch(removeQuestionGroup(formElement, questionGroupIndex)),
    onSave: () => dispatch(saveEncounter(false)),
    setValidationResults: (validationResults) =>
      dispatch(setValidationResults(validationResults)),
    onNext: () => dispatch(onNext(false)),
    onPrevious: () => dispatch(onPrevious(false)),
  };

  return <FormWizard {...formProps} />;
};

export default EncounterForm;
