import { useSelector, useDispatch } from "react-redux";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import { ObservationsHolder } from "avni-models";
import {
  updateObs,
  saveProgramEnrolment,
  setValidationResults,
  selectProgramEnrolmentState,
  onNext,
  onPrevious,
  addNewQuestionGroup,
  removeQuestionGroup
} from "dataEntryApp/reducers/programEnrolReducer";

const ProgramEnrolmentForm = () => {
  const dispatch = useDispatch();

  const enrolmentState = useSelector(selectProgramEnrolmentState);
  const subjectProfile = useSelector(state => state.dataEntry.subjectProfile.subjectProfile);

  const formProps = {
    form: enrolmentState.enrolForm,
    subject: subjectProfile,
    observations: enrolmentState.programEnrolment.observations,
    obsHolder: new ObservationsHolder(enrolmentState.programEnrolment.observations),
    title: `New Enrolment`,
    saved: enrolmentState.saved,
    onSaveGoto: "/app/subject?uuid=" + subjectProfile.uuid,
    validationResults: enrolmentState.validationResults,
    message: `${enrolmentState.programEnrolment.program.name} Enrolment Saved`,
    filteredFormElements: enrolmentState.filteredFormElements,
    entity: enrolmentState.programEnrolment,
    formElementGroup: enrolmentState.formElementGroup,
    onSummaryPage: enrolmentState.onSummaryPage,
    wizard: enrolmentState.wizard,
    saveErrorMessageKey: enrolmentState.enrolmentSaveErrorKey,
    updateObs: (formElement, value) => dispatch(updateObs(formElement, value)),
    addNewQuestionGroup: (formElement, questionGroup) => dispatch(addNewQuestionGroup(formElement, questionGroup)),
    removeQuestionGroup: (formElement, questionGroupIndex) => dispatch(removeQuestionGroup(formElement, questionGroupIndex)),
    onSave: () => dispatch(saveProgramEnrolment(false)),
    setValidationResults: validationResults => dispatch(setValidationResults(validationResults)),
    onNext: () => dispatch(onNext(false)),
    onPrevious: () => dispatch(onPrevious(false))
  };

  return <FormWizard {...formProps} />;
};

export default ProgramEnrolmentForm;
