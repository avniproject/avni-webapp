import { connect } from "react-redux";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import { ObservationsHolder } from "avni-models";
import { updateObs, saveProgramEnrolment } from "dataEntryApp/reducers/programEnrolReducer";
import { withRouter } from "react-router-dom";
import { setValidationResults } from "dataEntryApp/reducers/registrationReducer";
import { setFilteredFormElements } from "../../../reducers/RulesReducer";

const mapFormStateToProps = state => ({
  form: state.dataEntry.enrolmentReducer.enrolForm,
  subject: state.dataEntry.subjectProfile.subjectProfile,
  observations: state.dataEntry.enrolmentReducer.programEnrolment.observations,
  obsHolder: new ObservationsHolder(state.dataEntry.enrolmentReducer.programEnrolment.observations),
  title: `New Enrolment`,
  saved: state.dataEntry.enrolmentReducer.saved,
  onSaveGoto: "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid,
  staticValidationResults: state.dataEntry.enrolmentReducer.enrolDateValidation,
  validationResults: state.dataEntry.registration.validationResults,
  message: `${state.dataEntry.enrolmentReducer.programEnrolment.program.name} Enrolment Saved`,
  filteredFormElements: state.dataEntry.rulesReducer.filteredFormElements,
  entity: state.dataEntry.enrolmentReducer.programEnrolment
});

const mapFormDispatchToProps = {
  updateObs,
  onSave: () => saveProgramEnrolment(false),
  setValidationResults,
  setFilteredFormElements
};

const ProgramEnrolmentForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default ProgramEnrolmentForm;
