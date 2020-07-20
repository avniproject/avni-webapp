import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import moment from "moment";
import { ObservationsHolder } from "avni-models";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import { saveEncounter, setValidationResults } from "dataEntryApp/reducers/encounterReducer";

const mapFormStateToProps = state => ({
  form: state.dataEntry.encounterReducer.encounterForm,
  subject: state.dataEntry.subjectProfile.subjectProfile,
  observations: [],
  obsHolder: new ObservationsHolder([])
});

const mapFormDispatchToProps = {
  onSave: saveEncounter,
  setValidationResults
};

const CancelEncounterForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default CancelEncounterForm;
