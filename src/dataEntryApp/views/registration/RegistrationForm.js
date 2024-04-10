import {
  onNext,
  onPrevious,
  saveSubject,
  selectRegistrationState,
  setValidationResults,
  updateObs,
  addNewQuestionGroup,
  removeQuestionGroup
} from "dataEntryApp/reducers/registrationReducer";
import { ObservationsHolder } from "openchs-models";
import { connect } from "react-redux";
import FormWizard from "dataEntryApp/views/registration/FormWizard";

const mapFormStateToProps = state => {
  const registrationState = selectRegistrationState(state);
  return {
    form: registrationState.registrationForm,
    obsHolder: new ObservationsHolder(registrationState.subject.observations),
    observations: registrationState.subject.observations,
    saved: registrationState.saved,
    subject: registrationState.subject,
    onSaveGoto: `/app/subject?uuid=${registrationState.subject.uuid}`,
    validationResults: registrationState.validationResults,
    registrationFlow: true,
    filteredFormElements: registrationState.filteredFormElements,
    entity: registrationState.subject,
    formElementGroup: registrationState.formElementGroup,
    onSummaryPage: registrationState.onSummaryPage,
    wizard: registrationState.wizard
  };
};

const mapFormDispatchToProps = {
  updateObs,
  addNewQuestionGroup,
  removeQuestionGroup,
  onSave: saveSubject,
  setValidationResults,
  onNext,
  onPrevious
};

const RegistrationForm = connect(
  mapFormStateToProps,
  mapFormDispatchToProps
)(FormWizard);

export default RegistrationForm;
