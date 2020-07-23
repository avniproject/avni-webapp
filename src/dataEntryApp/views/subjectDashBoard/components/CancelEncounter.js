import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper } from "@material-ui/core";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import { isNil, isEmpty, first, isEqual } from "lodash";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  createCancelEncounter,
  editCancelEncounter,
  updateEncounter,
  setEncounterDateValidation,
  resetState
} from "../../../reducers/encounterReducer";
import encounterService from "../../../services/EncounterService";
import CancelEncounterForm from "./CancelEncounterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  }
}));

const CancelEncounter = ({ match, encounter, enconterDateValidation, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const editCancelEncounter = isEqual(match.path, "/app/subject/editCancelEncounter");
  const encounterUuid = match.queryParams.uuid;

  useEffect(() => {
    props.resetState();
    if (editCancelEncounter) {
      props.editCancelEncounter(encounterUuid);
    } else {
      props.createCancelEncounter(encounterUuid);
    }
  }, []);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <Grid justify="center" alignItems="center" container spacing={3}>
          <Grid item xs={12}>
            {props.cancelEncounterForm && encounter && props.subjectProfile ? (
              <CancelEncounterForm>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    style={{ width: "30%" }}
                    label="Cancel Date"
                    margin="none"
                    size="small"
                    id="date-picker-dialog"
                    format="MM/dd/yyyy"
                    placeholder="mm/dd/yyyy"
                    name="cancelDateTime"
                    autoComplete="off"
                    required
                    value={new Date(encounter.cancelDateTime)}
                    error={
                      !isEmpty(enconterDateValidation) && !first(enconterDateValidation).success
                    }
                    helperText={
                      !isEmpty(enconterDateValidation) &&
                      t(first(enconterDateValidation).messageKey)
                    }
                    onChange={date => {
                      const cancelDate = isNil(date) ? undefined : new Date(date);
                      encounter.cancelDateTime = cancelDate;
                      props.updateEncounter("cancelDateTime", cancelDate);
                      props.setEncounterDateValidation([
                        encounterService.validateCancelDate(encounter)
                      ]);
                    }}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                      color: "primary"
                    }}
                  />
                </MuiPickersUtilsProvider>
              </CancelEncounterForm>
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
  cancelEncounterForm: state.dataEntry.encounterReducer.encounterForm,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  encounter: state.dataEntry.encounterReducer.encounter,
  enconterDateValidation: state.dataEntry.encounterReducer.enconterDateValidation
});

const mapDispatchToProps = {
  createCancelEncounter,
  editCancelEncounter,
  updateEncounter,
  setEncounterDateValidation,
  resetState
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CancelEncounter)
  )
);
