import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import moment from "moment";
import { ObservationsHolder } from "avni-models";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import { updateObs, setValidationResults } from "dataEntryApp/reducers/encounterReducer";

const mapFormStateToProps = state => ({
  form: state.dataEntry.encounterReducer.encounterForm,
  subject: state.dataEntry.subjectProfile.subjectProfile,
  observations: state.dataEntry.encounterReducer.encounter.observations,
  obsHolder: new ObservationsHolder(state.dataEntry.encounterReducer.encounter.observations),
  staticValidationResults: state.dataEntry.encounterReducer.enconterDateValidation,
  validationResults: state.dataEntry.encounterReducer.validationResults,
  additionalRows: [
    {
      label: "Visit Date",
      value: moment(state.dataEntry.encounterReducer.encounter.encounterDateTime).format(
        "DD-MMM-YYYY"
      )
    }
  ]
});

const mapFormDispatchToProps = {
  updateObs,
  setValidationResults
};

const EncounterForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default EncounterForm;
