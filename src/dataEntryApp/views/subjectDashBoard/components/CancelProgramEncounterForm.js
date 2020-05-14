import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { ObservationsHolder } from "avni-models";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import {
  updateCancelObs,
  saveProgramEncounter,
  setValidationResults
} from "dataEntryApp/reducers/programEncounterReducer";

const mapFormStateToProps = state => ({
  form: state.dataEntry.programEncounterReducer.cancelProgramEncounterForm,
  subject: state.dataEntry.subjectProfile.subjectProfile,
  observations: state.dataEntry.programEncounterReducer.programEncounter.cancelObservations,
  obsHolder: new ObservationsHolder(
    state.dataEntry.programEncounterReducer.programEncounter.cancelObservations
  ),
  saved: state.dataEntry.programEncounterReducer.saved,
  onSaveGoto: "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid,
  //   staticValidationResults: state.dataEntry.programEncounterReducer.enconterDateValidation,
  validationResults: state.dataEntry.programEncounterReducer.validationResults
  //   message: state.dataEntry.programEncounterReducer.programEncounter.name
  //     ? `${state.dataEntry.programEncounterReducer.programEncounter.name} Encounter Saved`
  //     : `Encounter Saved`
});

const mapFormDispatchToProps = {
  updateObs: updateCancelObs,
  onSave: saveProgramEncounter,
  setValidationResults
};

const CancelProgramEncounterForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default CancelProgramEncounterForm;
