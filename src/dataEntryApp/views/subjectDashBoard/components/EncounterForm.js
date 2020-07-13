import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import moment from "moment";
import { ObservationsHolder } from "avni-models";
import FormWizard from "dataEntryApp/views/registration/FormWizard";

const mapFormStateToProps = state => ({
  form: state.dataEntry.encounterReducer.encounterForm,
  subject: state.dataEntry.subjectProfile.subjectProfile,
  observations: [],
  obsHolder: new ObservationsHolder([])
});

const mapFormDispatchToProps = {};

const EncounterForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default EncounterForm;
