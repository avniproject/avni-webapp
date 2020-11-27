import { connect } from "react-redux";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import { ObservationsHolder } from "avni-models";
import {
  updateExitObs as updateObs,
  saveProgramEnrolment
} from "dataEntryApp/reducers/programEnrolReducer";
import { withRouter } from "react-router-dom";
import { setValidationResults } from "dataEntryApp/reducers/registrationReducer";
import { setFilteredFormElements } from "../../../reducers/RulesReducer";

const mapFormStateToProps = state => ({
  form: state.dataEntry.enrolmentReducer.enrolForm,
  subject: state.dataEntry.subjectProfile.subjectProfile,
  observations: state.dataEntry.enrolmentReducer.programEnrolment.programExitObservations,
  obsHolder: new ObservationsHolder(
    state.dataEntry.enrolmentReducer.programEnrolment.programExitObservations
  ),
  title: `New Enrolment`,
  saved: state.dataEntry.enrolmentReducer.saved,
  onSaveGoto: "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid,
  validationResults: state.dataEntry.registration.validationResults,
  filteredFormElements: state.dataEntry.rulesReducer.filteredFormElements,
  entity: state.dataEntry.enrolmentReducer.programEnrolment,
  staticValidationResults: state.dataEntry.enrolmentReducer.enrolDateValidation && [
    state.dataEntry.enrolmentReducer.enrolDateValidation
  ]
});

const mapFormDispatchToProps = dispatch => {
  return {
    updateObs: (formElement, value) => dispatch(updateObs(formElement, value)),
    onSave: () => dispatch(saveProgramEnrolment(true)),
    setValidationResults: validationResults => dispatch(setValidationResults(validationResults)),
    setFilteredFormElements: filteredFormElements =>
      dispatch(setFilteredFormElements(filteredFormElements))
  };
};

const ProgramExitEnrolmentForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default ProgramExitEnrolmentForm;
