import { connect } from "react-redux";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import { ObservationsHolder } from "avni-models";
import {
  updateObs,
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
    observations: enrolmentState.programEnrolment.observations,
    obsHolder: new ObservationsHolder(enrolmentState.programEnrolment.observations),
    title: `New Enrolment`,
    saved: enrolmentState.saved,
    onSaveGoto: "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid,
    staticValidationResults: enrolmentState.enrolDateValidation && [
      enrolmentState.enrolDateValidation
    ],
    validationResults: enrolmentState.validationResults,
    message: `${enrolmentState.programEnrolment.program.name} Enrolment Saved`,
    filteredFormElements: enrolmentState.filteredFormElements,
    entity: enrolmentState.programEnrolment,
    formElementGroup: enrolmentState.formElementGroup
  };
};

const mapFormDispatchToProps = {
  updateObs,
  onSave: () => saveProgramEnrolment(false),
  setValidationResults,
  setFilteredFormElements,
  onNext
};

const ProgramEnrolmentForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default ProgramEnrolmentForm;
