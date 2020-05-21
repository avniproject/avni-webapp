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
import {
  getCompletedVisit,
  addVisitTypeFilters,
  types
} from "../../../reducers/completedVisitsReducer";
import moment from "moment/moment";
import { noop } from "lodash";
// import { store } from "../../../../common/store/createStore";

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

const FilterResult = ({
  getCompletedVisit,
  addVisitTypeFilters,
  selectedVisitTypesFilter,
  completedVisitList,
  visitTypes,
  visitTypeData
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  console.log("store data" + selectedVisitTypesFilter);

  //const visitTypesList = [...new Set(visitTypes.programEncounters.map(item => item.encounterType))];
  const key = "id";
  const visitTypesList = [
    ...new Map(
      visitTypes.programEncounters.map(item => [item.encounterType[key], item.encounterType])
    ).values()
  ];

  const [selectedScheduleDate, setSelectedScheduleDate] = React.useState(null);
  const [selectedCompletedDate, setSelectedCompletedDate] = React.useState(null);
  // const [selectedVisitType, setVisitType] = React.useState("");
  const [checked, setChecked] = React.useState(false);

  // let localSavedVisitType;
  // let checks = false;
  const scheduleDateChange = scheduledDate => {
    setSelectedScheduleDate(scheduledDate);
  };

  const completedDateChange = completedDate => {
    setSelectedCompletedDate(completedDate);
  };

  // checkbox
  let selectedVisitTypes = [];
  const visitTypeChange = event => {
    selectedVisitTypesFilter = [];
    if (event.target.checked) {
      selectedVisitTypes.push(event.target.name);
    } else {
      const index = selectedVisitTypes.indexOf(event.target.name);
      if (index > -1) {
        selectedVisitTypes.splice(index, 1);
      }
      // addVisitTypeFilters(SelectedvisitTypesList);

      // setVisitType(selectedVisit);
    }
  };

  const filterClick = () => {
    console.log("store data" + selectedVisitTypesFilter);

    // selectedVisitTypes
    // setSelectedScheduleDate(null);
    // setSelectedCompletedDate(null);
  };

  const applyClick = () => {
    // console.log("apply visit" + selectedCompletedDate, selectedScheduleDate, selectedVisitTypesFilter);
    let otherUrl;

    if (selectedScheduleDate !== null) {
      otherUrl =
        "earliestVisitDateTime=" +
        moment(selectedScheduleDate)
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }
    if (selectedCompletedDate !== null) {
      otherUrl =
        "encounterDateTime=" +
        moment(selectedCompletedDate)
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }

    // checkbox
    if (selectedVisitTypes.length > 0) {
      //setVisitType(selectedVisits);
      // sessionStorage.setItem("visitType", JSON.stringify(selectedVisits));
      const SelectedvisitTypesList = [...new Set(selectedVisitTypes.map(item => item))];
      addVisitTypeFilters(SelectedvisitTypesList);
      // store.dispatch({ type: types.ADD_VISITTYPE, value: selectedVisits });
      otherUrl = "encounterTypeIds=" + SelectedvisitTypesList.join();
    }
    const searchParams = new URLSearchParams(otherUrl);
    const otherPathString = searchParams.toString();
    const completedVisitUrl = `/web/programEnrolment/${visitTypes.id}/completed?${otherPathString}`;
    getCompletedVisit(completedVisitUrl);
  };

  let checkbox = visitTypesList.map(visitType => (
    <FormControlLabel
      control={
        <Checkbox
          checked={
            selectedVisitTypesFilter &&
            selectedVisitTypesFilter.find(element => element == visitType.id) == visitType.id
          }
          onChange={visitTypeChange}
          name={visitType.id}
          color="primary"
        />
      }
      label={visitType.name}
    />
  ));
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
        <FormGroup row>{checkbox}</FormGroup>
      </form>
    </DialogContent>
  );

  return (
    <Modal
      content={content}
      handleError={noop}
      buttonsSet={[
        {
          buttonType: "filterButton",
          label: t("filterResult"),
          classes: classes.filterButtonStyle,
          click: filterClick
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
  completedVisitList: state.dataEntry.completedVisitsReducer.completedVisitList,
  selectedVisitTypesFilter: state.dataEntry.completedVisitsReducer.selectedVisitTypesFilter
});

const mapDispatchToProps = {
  getCompletedVisit,
  addVisitTypeFilters
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(FilterResult)
  )
);
