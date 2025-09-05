import { useSelector, useDispatch } from "react-redux";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import { ObservationsHolder } from "avni-models";
import {
  updateExitObs as updateObs,
  saveProgramEnrolment,
  setValidationResults,
  selectProgramEnrolmentState,
  onNext,
  onPrevious,
} from "dataEntryApp/reducers/programEnrolReducer";

const ProgramExitEnrolmentForm = ({ children, fetchRulesResponse }) => {
  const dispatch = useDispatch();
  const enrolmentState = useSelector(selectProgramEnrolmentState);
  const subjectProfile = useSelector(
    (state) => state.dataEntry.subjectProfile.subjectProfile,
  );

  const formProps = {
    children,
    fetchRulesResponse,
    form: enrolmentState.enrolForm,
    subject: subjectProfile,
    observations: enrolmentState.programEnrolment.programExitObservations,
    obsHolder: new ObservationsHolder(
      enrolmentState.programEnrolment.programExitObservations,
    ),
    title: `New Enrolment`,
    saved: enrolmentState.saved,
    onSaveGoto: "/app/subject?uuid=" + subjectProfile.uuid,
    validationResults: enrolmentState.validationResults,
    filteredFormElements: enrolmentState.filteredFormElements,
    entity: enrolmentState.programEnrolment,
    formElementGroup: enrolmentState.formElementGroup,
    onSummaryPage: enrolmentState.onSummaryPage,
    wizard: enrolmentState.wizard,
    saveErrorMessageKey: enrolmentState.enrolmentSaveErrorKey,
    updateObs: (formElement, value) => dispatch(updateObs(formElement, value)),
    onSave: () => dispatch(saveProgramEnrolment(true)),
    setValidationResults: (results) => dispatch(setValidationResults(results)),
    onNext: () => dispatch(onNext(true)),
    onPrevious: () => dispatch(onPrevious(true)),
  };

  return <FormWizard {...formProps} />;
};

export default ProgramExitEnrolmentForm;
