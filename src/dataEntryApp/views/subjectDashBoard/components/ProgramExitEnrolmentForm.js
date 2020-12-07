import { connect } from "react-redux";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import { ObservationsHolder } from "avni-models";
import {
  updateExitObs as updateObs,
  saveProgramEnrolment,
  setValidationResults,
  selectProgramEnrolmentState,
  onNext
} from "dataEntryApp/reducers/programEnrolReducer";
import { withRouter } from "react-router-dom";
import { setFilteredFormElements } from "../../../reducers/RulesReducer";

const mapFormStateToProps = state => {
  const enrolmentState = selectProgramEnrolmentState(state);
  return {
    form: enrolmentState.enrolForm,
    subject: state.dataEntry.subjectProfile.subjectProfile,
    observations: enrolmentState.programEnrolment.programExitObservations,
    obsHolder: new ObservationsHolder(enrolmentState.programEnrolment.programExitObservations),
    title: `New Enrolment`,
    saved: enrolmentState.saved,
    onSaveGoto: "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid,
    validationResults: enrolmentState.validationResults,
    filteredFormElements: enrolmentState.filteredFormElements,
    entity: enrolmentState.programEnrolment,
    staticValidationResults: enrolmentState.enrolDateValidation && [
      enrolmentState.enrolDateValidation
    ],
    formElementGroup: enrolmentState.formElementGroup
  };
};

const mapFormDispatchToProps = {
  updateObs,
  onSave: () => saveProgramEnrolment(true),
  setValidationResults,
  setFilteredFormElements,
  onNext
};

const ProgramExitEnrolmentForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default ProgramExitEnrolmentForm;
