import { connect } from "react-redux";
import Form from "dataEntryApp/views/registration/SubjectRegistrationForm";
import { ObservationsHolder, Individual, SubjectType } from "avni-models";
import { updateObs } from "dataEntryApp/reducers/programEnrolReducer";
import { withRouter } from "react-router-dom";

let subject = Individual.createEmptyInstance();
subject.subjectType = SubjectType.create("Individual");

const mapFormStateToProps = state => ({
  form: state.dataEntry.enrolmentReducer.enrolForm,
  subject: subject,
  obs: new ObservationsHolder(null),
  title: `New Enrolment`,
  saved: state.dataEntry.enrolmentReducer.saved,
  onSaveGoto: "/app/search"
});

const mapFormDispatchToProps = {
  updateObs,
  onSave: null
};

const ProgramEnrolmentForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(Form)
);

export default ProgramEnrolmentForm;
