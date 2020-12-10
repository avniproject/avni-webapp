import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import moment from "moment";
import { ObservationsHolder } from "avni-models";
import FormWizard from "dataEntryApp/views/registration/FormWizard";
import {
  updateCancelObs,
  saveEncounter,
  setValidationResults,
  onNext,
  onPrevious
} from "dataEntryApp/reducers/encounterReducer";

const mapFormStateToProps = state => {
  const encounter = state.dataEntry.encounterReducer.encounter;
  return {
    form: state.dataEntry.encounterReducer.encounterForm,
    subject: state.dataEntry.subjectProfile.subjectProfile,
    observations: encounter.cancelObservations,
    obsHolder: new ObservationsHolder(encounter.cancelObservations),
    saved: state.dataEntry.encounterReducer.saved,
    onSaveGoto: "/app/subject?uuid=" + state.dataEntry.subjectProfile.subjectProfile.uuid,
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
    filteredFormElements: state.dataEntry.encounterReducer.filteredFormElements,
    entity: encounter,
    formElementGroup: state.dataEntry.encounterReducer.formElementGroup,
    onSummaryPage: state.dataEntry.encounterReducer.onSummaryPage,
    wizard: state.dataEntry.encounterReducer.wizard
  };
};

const mapFormDispatchToProps = {
  updateObs: updateCancelObs,
  onSave: () => saveEncounter(true),
  setValidationResults,
  onNext,
  onPrevious
};

const CancelEncounterForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

export default CancelEncounterForm;
