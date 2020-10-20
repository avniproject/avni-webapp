import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import moment from "moment";
import { ObservationsHolder } from "avni-models";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import {
  updateObs,
  saveEncounter,
  setValidationResults
} from "dataEntryApp/reducers/encounterReducer";
import { setFilteredFormElements } from "../../../reducers/RulesReducer";

const mapFormStateToProps = state => ({
  form: state.dataEntry.encounterReducer.encounterForm,
  subject: state.dataEntry.subjectProfile.subjectProfile,
  observations: state.dataEntry.encounterReducer.encounter.observations,
  obsHolder: new ObservationsHolder(state.dataEntry.encounterReducer.encounter.observations),
  saved: state.dataEntry.encounterReducer.saved,
  onSaveGoto: "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid,
  staticValidationResults: state.dataEntry.encounterReducer.enconterDateValidation,
  validationResults: state.dataEntry.encounterReducer.validationResults,
  message: state.dataEntry.encounterReducer.encounter.name
    ? `${state.dataEntry.encounterReducer.encounter.name} Encounter Saved`
    : state.dataEntry.encounterReducer.encounter.encounterType.name
    ? `${state.dataEntry.encounterReducer.encounter.encounterType.name} Encounter Saved`
    : `Encounter Saved`,
  additionalRows: [
    {
      label: "Visit Date",
      value: moment(state.dataEntry.encounterReducer.encounter.encounterDateTime).format(
        "DD-MMM-YYYY"
      )
    }
  ],
  filteredFormElements: state.dataEntry.rulesReducer.filteredFormElements,
  entity: state.dataEntry.encounterReducer.encounter
});

const mapFormDispatchToProps = {
  updateObs,
  onSave: () => saveEncounter(false),
  setValidationResults,
  setFilteredFormElements
};

const EncounterForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default EncounterForm;
