import { useSelector, useDispatch } from "react-redux";
import { format, isValid } from "date-fns";
import { ObservationsHolder } from "avni-models";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import { updateCancelObs, saveEncounter, setValidationResults, onNext, onPrevious } from "dataEntryApp/reducers/encounterReducer";

const CancelEncounterForm = () => {
  const dispatch = useDispatch();

  const encounter = useSelector(state => state.dataEntry.encounterReducer.encounter);
  const form = useSelector(state => state.dataEntry.encounterReducer.encounterForm);
  const subject = useSelector(state => state.dataEntry.subjectProfile.subjectProfile);
  const observations = useSelector(state => state.dataEntry.encounterReducer.encounter.cancelObservations);
  const obsHolder = new ObservationsHolder(observations);
  const saved = useSelector(state => state.dataEntry.encounterReducer.saved);
  const onSaveGoto = "/app/subject?uuid=" + subject.uuid;
  const validationResults = useSelector(state => state.dataEntry.encounterReducer.validationResults);
  const message = encounter.name
    ? `${encounter.name} Encounter Canceled`
    : encounter.encounterType.name
    ? `${encounter.encounterType.name} Encounter Canceled`
    : `Encounter Canceled`;
  const additionalRows = [
    {
      label: "Cancel Date",
      value:
        encounter.cancelDateTime && isValid(new Date(encounter.cancelDateTime))
          ? format(new Date(encounter.cancelDateTime), "dd-MMM-yyyy")
          : "-"
    }
  ];
  const filteredFormElements = useSelector(state => state.dataEntry.encounterReducer.filteredFormElements);
  const entity = encounter;
  const formElementGroup = useSelector(state => state.dataEntry.encounterReducer.formElementGroup);
  const onSummaryPage = useSelector(state => state.dataEntry.encounterReducer.onSummaryPage);
  const wizard = useSelector(state => state.dataEntry.encounterReducer.wizard);
  const saveErrorMessageKey = useSelector(state => state.dataEntry.encounterReducer.encounterSaveErrorKey);

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
    updateObs: (formElement, value) => dispatch(updateCancelObs(formElement, value)),
    onSave: () => dispatch(saveEncounter(true)),
    setValidationResults: validationResults => dispatch(setValidationResults(validationResults)),
    onNext: () => dispatch(onNext(true)),
    onPrevious: () => dispatch(onPrevious(true))
  };

  return <FormWizard {...formProps} />;
};

export default CancelEncounterForm;
