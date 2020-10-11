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

const mapFormStateToProps = state => {
  const encounter = state.dataEntry.encounterReducer.encounter;
  return {
    form: state.dataEntry.encounterReducer.encounterForm,
    subject: state.dataEntry.subjectProfile.subjectProfile,
    observations: encounter.cancelObservations,
    obsHolder: new ObservationsHolder(encounter.cancelObservations),
    saved: state.dataEntry.encounterReducer.saved,
    onSaveGoto: "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid,
    staticValidationResults: state.dataEntry.encounterReducer.enconterDateValidation,
    validationResults: state.dataEntry.encounterReducer.validationResults,
    message: encounter.name
      ? `${encounter.name} Encounter Canceled`
      : encounter.encounterType.name
      ? `${encounter.encounterType.name} Encounter Canceled`
      : `Encounter Canceled`,
    additionalRows: [
      {
        label: "Cancel Date",
        value: moment(encounter.cancelDateTime).format("DD-MMM-YYYY")
      }
    ],
    filteredFormElements: state.dataEntry.rulesReducer.filteredFormElements,
    entity: encounter
  };
};

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
