import { connect } from "react-redux";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import { ObservationsHolder, Individual, SubjectType } from "avni-models";
//import { updateObs, saveProgramEnrolment } from "dataEntryApp/reducers/programEnrolReducer";
import { updateObs, saveProgramEncounter } from "dataEntryApp/reducers/programReducer";
import { withRouter } from "react-router-dom";
import { setValidationResults } from "dataEntryApp/reducers/registrationReducer";

let subject = Individual.createEmptyInstance();
subject.subjectType = SubjectType.create("Individual");

const mapFormStateToProps = state => ({
  form: state.programs.programEncounterForm,
  subject: state.dataEntry.subjectProgram.subjectProgram,
  observations: state.programs.programEncounter && state.programs.programEncounter.observations,
  obsHolder:
    state.programs.programEncounter &&
    new ObservationsHolder(state.programs.programEncounter.observations),

  //   observations: state.dataEntry.enrolmentReducer.programEnrolment.observations,
  //   obsHolder: new ObservationsHolder(state.dataEntry.enrolmentReducer.programEnrolment.observations),
  title: `New Encounter`,
  //   saved: state.dataEntry.enrolmentReducer.saved,
  //   onSaveGoto: "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid,
  validationResults: state.dataEntry.registration.validationResults
});

const mapFormDispatchToProps = {
  updateObs,
  onSave: saveProgramEncounter,
  setValidationResults
};

const ProgramEncounterForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default ProgramEncounterForm;
