import { useSelector, useDispatch } from "react-redux";
import { format, isValid } from "date-fns";
import { ObservationsHolder } from "avni-models";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import {
  updateObs,
  saveProgramEncounter,
  setValidationResults,
  onNext,
  onPrevious,
  addNewQuestionGroup,
  removeQuestionGroup
} from "dataEntryApp/reducers/programEncounterReducer";

const ProgramEncounterForm = () => {
  const dispatch = useDispatch();

  const form = useSelector(state => state.dataEntry.programEncounterReducer.programEncounterForm);
  const subject = useSelector(state => state.dataEntry.subjectProfile.subjectProfile);
  const observations = useSelector(state => state.dataEntry.programEncounterReducer.programEncounter.observations);
  const obsHolder = useSelector(state => new ObservationsHolder(state.dataEntry.programEncounterReducer.programEncounter.observations));
  const saved = useSelector(state => state.dataEntry.programEncounterReducer.saved);
  const onSaveGoto = useSelector(state => "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid);
  const validationResults = useSelector(state => state.dataEntry.programEncounterReducer.validationResults);
  const message = useSelector(state =>
    state.dataEntry.programEncounterReducer.programEncounter.name
      ? `${state.dataEntry.programEncounterReducer.programEncounter.name} Encounter Saved`
      : `Encounter Saved`
  );
  const additionalRows = useSelector(state => [
    {
      label: "visitDate",
      value:
        state.dataEntry.programEncounterReducer.programEncounter.encounterDateTime &&
        isValid(new Date(state.dataEntry.programEncounterReducer.programEncounter.encounterDateTime))
          ? format(new Date(state.dataEntry.programEncounterReducer.programEncounter.encounterDateTime), "dd-MMM-yyyy")
          : "-"
    }
  ]);
  const filteredFormElements = useSelector(state => state.dataEntry.programEncounterReducer.filteredFormElements);
  const entity = useSelector(state => state.dataEntry.programEncounterReducer.programEncounter);
  const formElementGroup = useSelector(state => state.dataEntry.programEncounterReducer.formElementGroup);
  const onSummaryPage = useSelector(state => state.dataEntry.programEncounterReducer.onSummaryPage);
  const wizard = useSelector(state => state.dataEntry.programEncounterReducer.wizard);
  const saveErrorMessageKey = useSelector(state => state.dataEntry.programEncounterReducer.encounterSaveErrorKey);

  const formProps = {
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
    addNewQuestionGroup: (formElement, questionGroupIndex) => dispatch(addNewQuestionGroup(formElement, questionGroupIndex)),
    removeQuestionGroup: (formElement, questionGroupIndex) => dispatch(removeQuestionGroup(formElement, questionGroupIndex)),
    onSave: () => dispatch(saveProgramEncounter(false)),
    setValidationResults: validationResults => dispatch(setValidationResults(validationResults)),
    onNext: () => dispatch(onNext(false)),
    onPrevious: () => dispatch(onPrevious(false))
  };

  return <FormWizard {...formProps} />;
};

export default ProgramEncounterForm;
