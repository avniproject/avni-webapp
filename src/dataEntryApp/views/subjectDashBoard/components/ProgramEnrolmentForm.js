import { connect } from "react-redux";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import { ObservationsHolder, Individual, SubjectType } from "avni-models";
import { updateObs } from "dataEntryApp/reducers/programEnrolReducer";
import { withRouter } from "react-router-dom";

let subject = Individual.createEmptyInstance();
subject.subjectType = SubjectType.create("Individual");

const mapFormStateToProps = state => ({
  form: state.dataEntry.enrolmentReducer.enrolForm,
  subject: subject,
  obs: new ObservationsHolder(state.dataEntry.enrolmentReducer.programEnrolment.observations),
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
  )(FormWizard)
);

export default ProgramEnrolmentForm;
