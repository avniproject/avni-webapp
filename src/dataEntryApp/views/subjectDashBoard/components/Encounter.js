import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper } from "@material-ui/core";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import { remove, isNil, isEqual } from "lodash";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { getEncounterForm, onLoad, resetState } from "../../../reducers/encounterReducer";
import EncounterForm from "./EncounterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  }
}));

const Encounter = ({ match, encounter, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const ENCOUNTER_DATE_TIME = "ENCOUNTER_DATE_TIME";
  const subjectUuid = match.queryParams.subjectUuid;
  const uuid = match.queryParams.uuid;

  useEffect(() => {
    props.resetState();
    (async function fetchData() {
      //uuid - encounterTypeUuid
      await props.onLoad(subjectUuid);
      props.getEncounterForm(uuid, subjectUuid);
    })();
  }, []);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <Grid justify="center" alignItems="center" container spacing={3}>
          <Grid item xs={12}>
            {props.encounterForm && props.subjectProfile ? (
              <EncounterForm>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    style={{ width: "30%" }}
                    label="Visit Date"
                    margin="none"
                    size="small"
                    id="date-picker-dialog"
                    format="MM/dd/yyyy"
                    placeholder="mm/dd/yyyy"
                    name="visitDateTime"
                    autoComplete="off"
                    required
                    onChange={date => {
                      const visitDate = isNil(date) ? undefined : new Date(date);
                      encounter.encounterDateTime = visitDate;
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
  encounter: state.dataEntry.encounterReducer.encounter
});

const mapDispatchToProps = {
  getEncounterForm,
  onLoad,
  resetState
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(Encounter)
  )
);
