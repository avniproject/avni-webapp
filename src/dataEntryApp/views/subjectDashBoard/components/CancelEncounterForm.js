import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import moment from "moment";
import { ObservationsHolder } from "avni-models";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import {
  updateCancelObs,
  saveEncounter,
  setValidationResults
} from "dataEntryApp/reducers/encounterReducer";
import { setFilteredFormElements } from "../../../reducers/RulesReducer";

const mapFormStateToProps = state => ({
  form: state.dataEntry.encounterReducer.encounterForm,
  subject: state.dataEntry.subjectProfile.subjectProfile,
  observations: state.dataEntry.encounterReducer.encounter.cancelObservations,
  obsHolder: new ObservationsHolder(state.dataEntry.encounterReducer.encounter.cancelObservations),
  saved: state.dataEntry.encounterReducer.saved,
  onSaveGoto: "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid,
  staticValidationResults: state.dataEntry.encounterReducer.enconterDateValidation,
  validationResults: state.dataEntry.encounterReducer.validationResults,
  message: state.dataEntry.encounterReducer.encounter.name
    ? `${state.dataEntry.encounterReducer.encounter.name} Encounter Canceled`
    : state.dataEntry.encounterReducer.encounter.encounterType.name
    ? `${state.dataEntry.encounterReducer.encounter.encounterType.name} Encounter Canceled`
    : `Encounter Canceled`,
  additionalRows: [
    {
      label: "Cancel Date",
      value: moment(state.dataEntry.encounterReducer.encounter.cancelDateTime).format("DD-MMM-YYYY")
    }
  ],
  filteredFormElements: state.dataEntry.rulesReducer.filteredFormElements,
  entity: state.dataEntry.programEncounterReducer.programEncounter
});

const mapFormDispatchToProps = {
  updateObs: updateCancelObs,
  onSave: saveEncounter,
  setValidationResults,
  setFilteredFormElements
};

const CancelEncounterForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default CancelEncounterForm;
