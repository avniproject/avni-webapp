import React, { Fragment, useEffect } from "react";
import { styled } from '@mui/material/styles';
import { Grid, Paper } from "@mui/material";
import { isEqual } from "lodash";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  updateEncounter,
  resetState,
  createEncounter,
  createEncounterForScheduled,
  editEncounter,
  fetchEncounterRulesResponse,
  setEncounterDate,
} from "dataEntryApp/reducers/encounterReducer";
import EncounterForm from "./EncounterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { DateFormElement } from "dataEntryApp/components/DateFormElement";
import StaticFormElement from "dataEntryApp/views/viewmodel/StaticFormElement";
import { AbstractEncounter } from "openchs-models";
import { LineBreak } from "../../../../common/components/utils";
import { useTranslation } from "react-i18next";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1,
}));

const StyledGrid = styled(Grid)(({ theme }) => ({
  justifyContent: "center",
  alignItems: "center",
}));

const Encounter = ({ match, encounter, validationResults, setEncounterDate, ...props }) => {
  const editEncounter = isEqual(match.path, "/app/subject/editEncounter");
  const encounterUuid = match.queryParams.encounterUuid;
  const subjectUuid = match.queryParams.subjectUuid;
  const uuid = match.queryParams.uuid;
  const { t } = useTranslation();

  useEffect(() => {
    props.resetState();
    if (editEncounter) {
      props.editEncounter(uuid);
    } else if (encounterUuid) {
      props.createEncounterForScheduled(encounterUuid);
    } else {
      props.createEncounter(uuid, subjectUuid);
    }
  }, []);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <StyledPaper>
        <StyledGrid container spacing={3}>
          <Grid size={12}>
            {props.encounterForm && encounter && props.subjectProfile ? (
              <EncounterForm fetchRulesResponse={fetchEncounterRulesResponse}>
                <DateFormElement
                  uuid={AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME}
                  formElement={new StaticFormElement(t("visitDate"), true, true)}
                  value={encounter.encounterDateTime}
                  validationResults={validationResults}
                  update={setEncounterDate}
                />
                <LineBreak num={3} />
              </EncounterForm>
            ) : (
              <CustomizedBackdrop load={false} />
            )}
          </Grid>
        </StyledGrid>
      </StyledPaper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  encounterForm: state.dataEntry.encounterReducer.encounterForm,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  encounter: state.dataEntry.encounterReducer.encounter,
  validationResults: state.dataEntry.encounterReducer.validationResults,
});

const mapDispatchToProps = {
  updateEncounter,
  resetState,
  createEncounter,
  createEncounterForScheduled,
  editEncounter,
  setEncounterDate,
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(Encounter)
  )
);