import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams, LineBreak } from "common/components/utils";
import Grid from "@material-ui/core/Grid";
import { useTranslation } from "react-i18next";
import Modal from "../components/CommonModal";
import DialogContent from "@material-ui/core/DialogContent";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import FormLabel from "@material-ui/core/FormLabel";
import { FormControl, FormGroup } from "@material-ui/core";
import { getCompletedVisit } from "../../../reducers/completedVisitsReducer";
import moment from "moment/moment";
import { noop } from "lodash";

const useStyles = makeStyles(theme => ({
  filterButtonStyle: {
    height: "28px",
    zIndex: 1,
    // marginLeft: theme.spacing(64),
    marginTop: "1px",
    boxShadow: "none",
    backgroundColor: "#0e6eff"
  },
  btnCustom: {
    float: "left",
    backgroundColor: "#f27510",
    height: "30px",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#f27510"
    }
  },
  cancelBtnCustom: {
    float: "left",
    backgroundColor: "#F8F9F9",
    color: "#fc9153",
    border: "1px solid #fc9153",
    height: "30px",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#F8F9F9"
    }
  },
  formControl: {
    marginTop: theme.spacing(2)
  },
  formControlLabel: {
    marginTop: theme.spacing(1)
  },
  form: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    width: "fit-content",
    // minWidth: "600px",
    minHeight: "300px"
  }
}));

const FilterResult = ({ getCompletedVisit, completedVisitList, enrolments }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selectedScheduleDate, setSelectedScheduleDate] = React.useState(null);
  const [selectedCompletedDate, setSelectedCompletedDate] = React.useState(null);
  const scheduleDateChange = scheduledDate => {
    setSelectedScheduleDate(scheduledDate);
  };
  const completedDateChange = completedDate => {
    setSelectedCompletedDate(completedDate);
  };

  const visitTypesList = [
    ...new Map(
      enrolments.programEncounters.map(item => [item.encounterType["uuid"], item.encounterType])
    ).values()
  ];
  const [selectedVisitTypes, setVisitTypes] = React.useState({});

  const visitTypesChange = event => {
    if (event.target.checked) {
      setVisitTypes({ ...selectedVisitTypes, [event.target.name]: event.target.checked });
    } else {
      setVisitTypes({ ...selectedVisitTypes, [event.target.name]: event.target.checked });
    }
  };

  const applyClick = () => {
    let filterParams = {};
    if (selectedScheduleDate != null) {
      filterParams.earliestVisitDateTime = moment(selectedScheduleDate)
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }
    if (selectedCompletedDate != null) {
      filterParams.encounterDateTime = moment(selectedCompletedDate)
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }

    const SelectedvisitTypesListSort = Object.keys(selectedVisitTypes)
      .filter(selectedId => selectedVisitTypes[selectedId])
      .map(String);

    if (SelectedvisitTypesListSort.length > 0) {
      const SelectedvisitTypesList = [...new Set(SelectedvisitTypesListSort.map(item => item))];
      filterParams.encounterTypeUuids = SelectedvisitTypesList.join();
    }
    const SearchParamsFilter = new URLSearchParams(filterParams);
    const otherPathString = SearchParamsFilter.toString();
    const completedVisitUrl = `/web/programEnrolment/${
      enrolments.uuid
    }/completed?${otherPathString}`;
    getCompletedVisit(completedVisitUrl);
  };

  const content = (
    <DialogContent>
      <form className={classes.form} noValidate>
        <FormControl className={classes.formControl}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid
              container
              direction="row"
              spacing={3}
              justify="flex-start"
              alignItems="flex-start"
            >
              <Grid item xs={6}>
                <KeyboardDatePicker
                  margin="normal"
                  id="date-picker-dialog"
                  label={t("visitscheduledate")}
                  format="dd/MM/yyyy"
                  value={selectedScheduleDate}
                  onChange={scheduleDateChange}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                    color: "primary"
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <KeyboardDatePicker
                  margin="normal"
                  id="date-picker-dialog"
                  label={t("visitcompleteddate")}
                  format="dd/MM/yyyy"
                  value={selectedCompletedDate}
                  onChange={completedDateChange}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                    color: "primary"
                  }}
                />
              </Grid>
            </Grid>
          </MuiPickersUtilsProvider>
        </FormControl>
        <LineBreak num={1} />
        <FormLabel component="legend">{t("visitType")}</FormLabel>
        <FormGroup row>
          {visitTypesList.map(visitType => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedVisitTypes[visitType.uuid]}
                  onChange={visitTypesChange}
                  name={visitType.uuid}
                  color="primary"
                />
              }
              label={visitType.name}
            />
          ))}
        </FormGroup>
      </form>
    </DialogContent>
  );

  return (
    <Modal
      content={content}
      handleError={noop}
      buttonsSet={[
        {
          buttonType: "openButton",
          label: t("filterResult"),
          classes: classes.filterButtonStyle
        },
        {
          buttonType: "applyButton",
          label: t("apply"),
          classes: classes.btnCustom,
          redirectTo: `/app/completeVisit`,
          click: applyClick
        },
        {
          buttonType: "cancelButton",
          label: t("cancel"),
          classes: classes.cancelBtnCustom
        }
      ]}
      title={t("filterResult")}
    />
  );
};

const mapStateToProps = state => ({
  completedVisitList: state.dataEntry.completedVisitsReducer.completedVisitList
});

const mapDispatchToProps = {
  getCompletedVisit
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(FilterResult)
  )
);
