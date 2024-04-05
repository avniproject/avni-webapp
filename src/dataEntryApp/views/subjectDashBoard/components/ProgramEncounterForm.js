import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import moment from "moment";
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

const mapFormStateToProps = state => ({
  form: state.dataEntry.programEncounterReducer.programEncounterForm,
  subject: state.dataEntry.subjectProfile.subjectProfile,
  observations: state.dataEntry.programEncounterReducer.programEncounter.observations,
  obsHolder: new ObservationsHolder(
    state.dataEntry.programEncounterReducer.programEncounter.observations
  ),
  saved: state.dataEntry.programEncounterReducer.saved,
  onSaveGoto: "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid,
  validationResults: state.dataEntry.programEncounterReducer.validationResults,
  message: state.dataEntry.programEncounterReducer.programEncounter.name
    ? `${state.dataEntry.programEncounterReducer.programEncounter.name} Encounter Saved`
    : `Encounter Saved`,
  additionalRows: [
    {
      label: "visitDate",
      value: moment(
        state.dataEntry.programEncounterReducer.programEncounter.encounterDateTime
      ).format("DD-MMM-YYYY")
    }
  ],
  filteredFormElements: state.dataEntry.programEncounterReducer.filteredFormElements,
  entity: state.dataEntry.programEncounterReducer.programEncounter,
  formElementGroup: state.dataEntry.programEncounterReducer.formElementGroup,
  onSummaryPage: state.dataEntry.programEncounterReducer.onSummaryPage,
  wizard: state.dataEntry.programEncounterReducer.wizard
});

const mapFormDispatchToProps = {
  updateObs,
  addNewQuestionGroup,
  removeQuestionGroup,
  onSave: () => saveProgramEncounter(false),
  setValidationResults,
  onNext: () => onNext(false),
  onPrevious: () => onPrevious(false)
};

const ProgramEncounterForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default ProgramEncounterForm;
