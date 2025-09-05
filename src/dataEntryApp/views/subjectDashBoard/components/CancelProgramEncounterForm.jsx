import { useSelector, useDispatch } from "react-redux";
import { format, isValid } from "date-fns";
import { ObservationsHolder } from "avni-models";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import {
  updateCancelObs,
  saveProgramEncounter,
  setValidationResults,
  onNext,
  onPrevious,
} from "dataEntryApp/reducers/programEncounterReducer";

const CancelProgramEncounterForm = ({ children, fetchRulesResponse }) => {
  const dispatch = useDispatch();

  const formState = useSelector((state) => {
    const programEncounterState = state.dataEntry.programEncounterReducer;
    const subjectProfile = state.dataEntry.subjectProfile.subjectProfile;

    return {
      children,
      fetchRulesResponse,
      form: programEncounterState.programEncounterForm,
      subject: subjectProfile,
      observations: programEncounterState.programEncounter.cancelObservations,
      obsHolder: new ObservationsHolder(
        programEncounterState.programEncounter.cancelObservations,
      ),
      saved: programEncounterState.saved,
      onSaveGoto: "/app/subject?uuid=" + subjectProfile.uuid,
      validationResults: programEncounterState.validationResults,
      message: programEncounterState.programEncounter.name
        ? `${programEncounterState.programEncounter.name} Encounter Canceled`
        : `Encounter Canceled`,
      additionalRows: [
        {
          label: "Cancel Date",
          value:
            programEncounterState.programEncounter.cancelDateTime &&
            isValid(
              new Date(programEncounterState.programEncounter.cancelDateTime),
            )
              ? format(
                  new Date(
                    programEncounterState.programEncounter.cancelDateTime,
                  ),
                  "dd-MMM-yyyy",
                )
              : "-",
        },
      ],
      filteredFormElements: programEncounterState.filteredFormElements,
      entity: programEncounterState.programEncounter,
      formElementGroup: programEncounterState.formElementGroup,
      onSummaryPage: programEncounterState.onSummaryPage,
      wizard: programEncounterState.wizard,
      saveErrorMessageKey: programEncounterState.encounterSaveErrorKey,
    };
  });

  const formActions = {
    updateObs: (obs) => dispatch(updateCancelObs(obs)),
    onSave: () => dispatch(saveProgramEncounter(true)),
    setValidationResults: (results) => dispatch(setValidationResults(results)),
    onNext: () => dispatch(onNext(true)),
    onPrevious: () => dispatch(onPrevious(true)),
  };

  const formWizardProps = {
    ...formState,
    ...formActions,
  };

  return <FormWizard {...formWizardProps} />;
};

export default CancelProgramEncounterForm;
