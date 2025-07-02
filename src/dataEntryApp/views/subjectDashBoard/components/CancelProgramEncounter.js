import React, { Fragment, useEffect } from "react";
import { styled } from '@mui/material/styles';
import { Grid, Paper } from "@mui/material";
import { isEqual } from "lodash";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  updateProgramEncounter,
  resetState,
  createCancelProgramEncounter,
  editCancelProgramEncounter,
  fetchProgramEncounterRulesResponse
} from "../../../reducers/programEncounterReducer";
import CancelProgramEncounterForm from "./CancelProgramEncounterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { AbstractEncounter } from "openchs-models";
import StaticFormElement from "dataEntryApp/views/viewmodel/StaticFormElement";
import { DateFormElement } from "dataEntryApp/components/DateFormElement";
import { LineBreak } from "../../../../common/components/utils";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1,
}));

const CancelProgramEncounter = ({ match, programEncounter, ...props }) => {
  const editCancelProgramEncounter = isEqual(match.path, "/app/subject/editCancelProgramEncounter");
  const encounterUuid = match.queryParams.uuid;

  useEffect(() => {
    props.resetState();
    if (editCancelProgramEncounter) {
      props.editCancelProgramEncounter(encounterUuid);
    } else {
      props.createCancelProgramEncounter(encounterUuid);
    }
  }, []);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <StyledPaper>
        <Grid
          container
          spacing={3}
          sx={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Grid size={12}>
            {props.cancelProgramEncounterForm && programEncounter && props.subjectProfile ? (
              <CancelProgramEncounterForm fetchRulesResponse={fetchProgramEncounterRulesResponse}>
                <DateFormElement
                  uuid={AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME}
                  formElement={new StaticFormElement("Cancel Date", true, false)}
                  value={programEncounter.cancelDateTime}
                />
                <LineBreak num={3} />
              </CancelProgramEncounterForm>
            ) : (
              <CustomizedBackdrop load={false} />
            )}
          </Grid>
        </Grid>
      </StyledPaper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  cancelProgramEncounterForm: state.dataEntry.programEncounterReducer.programEncounterForm,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  programEncounter: state.dataEntry.programEncounterReducer.programEncounter,
});

const mapDispatchToProps = {
  updateProgramEncounter,
  createCancelProgramEncounter,
  editCancelProgramEncounter,
  resetState,
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CancelProgramEncounter)
  )
);