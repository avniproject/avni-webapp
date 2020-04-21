import { connect } from "react-redux";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import { ObservationsHolder, Individual, SubjectType } from "avni-models";
import { updateObs, saveProgramEnrolment } from "dataEntryApp/reducers/programEnrolReducer";
import { withRouter } from "react-router-dom";

let subject = Individual.createEmptyInstance();
subject.subjectType = SubjectType.create("Individual");

const mapFormStateToProps = state => ({
  form: state.dataEntry.enrolmentReducer.enrolForm,
  subject: state.dataEntry.subjectProfile.subjectProfile,
  observations: state.dataEntry.enrolmentReducer.programEnrolment.observations,
  obsHolder: new ObservationsHolder(state.dataEntry.enrolmentReducer.programEnrolment.observations),
  title: `New Enrolment`,
  saved: state.dataEntry.enrolmentReducer.saved,
  onSaveGoto: "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid,
  validationResults: state.dataEntry.registration.validationResults
});

const mapFormDispatchToProps = {
  updateObs,
  onSave: saveProgramEnrolment
};

const ProgramEnrolmentForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default ProgramEnrolmentForm;
