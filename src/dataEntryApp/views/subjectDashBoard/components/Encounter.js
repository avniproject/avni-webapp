import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, Typography } from "@material-ui/core";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import { isNil, isEmpty, first, isEqual } from "lodash";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  updateEncounter,
  setEncounterDateValidation,
  resetState,
  createEncounter,
  createEncounterForScheduled,
  editEncounter,
  fetchEncounterRulesResponse
} from "dataEntryApp/reducers/encounterReducer";
import encounterService from "../../../services/EncounterService";
import EncounterForm from "./EncounterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  }
}));

const Encounter = ({ match, encounter, enconterDateValidation, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const editEncounter = isEqual(match.path, "/app/subject/editEncounter");
  const encounterUuid = match.queryParams.encounterUuid;
  const subjectUuid = match.queryParams.subjectUuid;
  const uuid = match.queryParams.uuid;

  useEffect(() => {
    props.resetState();
    if (editEncounter) {
      props.editEncounter(uuid);
    } else if (encounterUuid) {
      props.createEncounterForScheduled(encounterUuid);
    } else {
      //uuid - encounterTypeUuid
      props.createEncounter(uuid, subjectUuid);
    }
  }, []);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <Grid justify="center" alignItems="center" container spacing={3}>
          <Grid item xs={12}>
            {props.encounterForm && encounter && props.subjectProfile ? (
              <EncounterForm fetchRulesResponse={fetchEncounterRulesResponse}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Typography
                    variant="body1"
                    gutterBottom
                    style={{ width: "50%", marginBottom: 10, color: "rgba(0, 0, 0, 0.54)" }}
                  >
                    Visit Date
                  </Typography>
                  <KeyboardDatePicker
                    style={{ width: "30%" }}
                    margin="none"
                    size="small"
                    id="date-picker-dialog"
                    format="MM/dd/yyyy"
                    placeholder="mm/dd/yyyy"
                    name="visitDateTime"
                    autoComplete="off"
                    required
                    value={new Date(encounter.encounterDateTime)}
                    error={
                      !isEmpty(enconterDateValidation) && !first(enconterDateValidation).success
                    }
                    helperText={
                      !isEmpty(enconterDateValidation) &&
                      t(first(enconterDateValidation).messageKey)
                    }
                    onChange={date => {
                      const visitDate = isNil(date) ? undefined : new Date(date);
                      encounter.encounterDateTime = visitDate;
                      props.updateEncounter("encounterDateTime", visitDate);
                      props.setEncounterDateValidation([
                        encounterService.validateVisitDate(encounter)
                      ]);
                    }}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                      color: "primary"
                    }}
                  />
                </MuiPickersUtilsProvider>
              </EncounterForm>
            ) : (
              <CustomizedBackdrop load={false} />
            )}
          </Grid>
        </Grid>
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  encounterForm: state.dataEntry.encounterReducer.encounterForm,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  encounter: state.dataEntry.encounterReducer.encounter,
  enconterDateValidation: state.dataEntry.encounterReducer.enconterDateValidation
});

const mapDispatchToProps = {
  updateEncounter,
  setEncounterDateValidation,
  resetState,
  createEncounter,
  createEncounterForScheduled,
  editEncounter
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(Encounter)
  )
);
