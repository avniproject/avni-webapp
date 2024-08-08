import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import moment from "moment";
import { ObservationsHolder } from "avni-models";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import {
  updateCancelObs,
  saveProgramEncounter,
  setValidationResults,
  onNext,
  onPrevious
} from "dataEntryApp/reducers/programEncounterReducer";

const mapFormStateToProps = state => ({
  form: state.dataEntry.programEncounterReducer.programEncounterForm,
  subject: state.dataEntry.subjectProfile.subjectProfile,
  observations: state.dataEntry.programEncounterReducer.programEncounter.cancelObservations,
  obsHolder: new ObservationsHolder(state.dataEntry.programEncounterReducer.programEncounter.cancelObservations),
  saved: state.dataEntry.programEncounterReducer.saved,
  onSaveGoto: "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid,
  validationResults: state.dataEntry.programEncounterReducer.validationResults,
  message: state.dataEntry.programEncounterReducer.programEncounter.name
    ? `${state.dataEntry.programEncounterReducer.programEncounter.name} Encounter Canceled`
    : `Encounter Canceled`,
  additionalRows: [
    {
      label: "Cancel Date",
      value: moment(state.dataEntry.programEncounterReducer.programEncounter.cancelDateTime).format("DD-MMM-YYYY")
    }
  ],
  filteredFormElements: state.dataEntry.programEncounterReducer.filteredFormElements,
  entity: state.dataEntry.programEncounterReducer.programEncounter,
  formElementGroup: state.dataEntry.programEncounterReducer.formElementGroup,
  onSummaryPage: state.dataEntry.programEncounterReducer.onSummaryPage,
  wizard: state.dataEntry.programEncounterReducer.wizard,
  saveErrorMessageKey: state.dataEntry.programEncounterReducer.encounterSaveErrorKey
});

const mapFormDispatchToProps = {
  updateObs: updateCancelObs,
  onSave: () => saveProgramEncounter(true),
  setValidationResults,
  onNext: () => onNext(true),
  onPrevious: () => onPrevious(true)
};

const CancelProgramEncounterForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default CancelProgramEncounterForm;
