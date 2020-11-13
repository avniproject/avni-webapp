import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { LineBreak } from "common/components/utils";
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
import moment from "moment/moment";
import { noop, isNil, isEmpty } from "lodash";
import IconButton from "@material-ui/core/IconButton";
import CancelIcon from "@material-ui/icons/Cancel";

const useStyles = makeStyles(theme => ({
  filterButtonStyle: {
    height: "28px",
    zIndex: 1,
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
  form: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    width: "fit-content"
  },
  resetButton: {
    fontSize: "13px",
    color: "#212529",
    "&:hover": {
      backgroundColor: "#fff"
    },
    "&:focus": {
      outline: "0"
    }
  },
  cancelIcon: {
    fontSize: "14px"
  }
}));

const FilterResult = ({ encounterTypes, setFilterParams }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selectedScheduleDate, setSelectedScheduleDate] = React.useState(null);
  const [selectedCompletedDate, setSelectedCompletedDate] = React.useState(null);
  const [filterDateErrors, setFilterDateErrors] = React.useState({
    SCHEDULED_DATE: "",
    COMPLETED_DATE: ""
  });

  const [selectedVisitTypes, setVisitTypes] = React.useState(null);

  const visitTypesChange = event => {
    if (event.target.checked) {
      setVisitTypes({ ...selectedVisitTypes, [event.target.name]: event.target.checked });
    } else {
      setVisitTypes({ ...selectedVisitTypes, [event.target.name]: event.target.checked });
    }
  };

  const close = () => {
    if (!moment(selectedScheduleDate).isValid()) setSelectedScheduleDate(null);
    if (!moment(selectedCompletedDate).isValid()) setSelectedCompletedDate(null);
    filterDateErrors["COMPLETED_DATE"] = "";
    filterDateErrors["SCHEDULED_DATE"] = "";
    setFilterDateErrors({ ...filterDateErrors });
  };

  const scheduleDateChange = scheduledDate => {
    setSelectedScheduleDate(scheduledDate);
    filterDateErrors["SCHEDULED_DATE"] = "";
    if (!isNil(scheduledDate) && !moment(scheduledDate).isValid()) {
      filterDateErrors["SCHEDULED_DATE"] = "invalidDateFormat";
    }
    setFilterDateErrors({ ...filterDateErrors });
  };

  const completedDateChange = completedDate => {
    setSelectedCompletedDate(completedDate);
    filterDateErrors["COMPLETED_DATE"] = "";
    if (!isNil(completedDate) && !moment(completedDate).isValid()) {
      filterDateErrors["COMPLETED_DATE"] = "invalidDateFormat";
    }
    setFilterDateErrors({ ...filterDateErrors });
  };

  const applyClick = () => {
    let filterParams = {};
    if (selectedScheduleDate != null) {
      let dateformat = moment(selectedScheduleDate).format("YYYY-MM-DD");
      let earliestVisitDateTime = moment(dateformat).format("YYYY-MM-DDT00:00:00.000") + "Z";
      filterParams.earliestVisitDateTime = earliestVisitDateTime;
    }
    if (selectedCompletedDate != null) {
      let dateformat = moment(selectedCompletedDate).format("YYYY-MM-DD");
      let encounterDateTime = moment(dateformat).format("YYYY-MM-DDT00:00:00.000") + "Z";
      filterParams.encounterDateTime = encounterDateTime;
    }

    const SelectedvisitTypesListSort =
      selectedVisitTypes != null
        ? Object.keys(selectedVisitTypes)
            .filter(selectedId => selectedVisitTypes[selectedId])
            .map(String)
        : [];

    if (SelectedvisitTypesListSort.length > 0) {
      const SelectedvisitTypesList = [...new Set(SelectedvisitTypesListSort.map(item => item))];
      filterParams.encounterTypeUuids = SelectedvisitTypesList.join();
    }
    setFilterParams(filterParams);
  };

  const resetClick = () => {
    setSelectedScheduleDate(null);
    setSelectedCompletedDate(null);
    setVisitTypes(null);
  };

  const content = (
    <DialogContent>
      <Grid container direction="row" justify="flex-end" alignItems="flex-start">
        <IconButton
          color="secondary"
          className={classes.resetButton}
          onClick={resetClick}
          aria-label="add an alarm"
        >
          <CancelIcon className={classes.cancelIcon} /> {t("resetAll")}
        </IconButton>
      </Grid>
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
                  allowKeyboardControl
                  margin="normal"
                  id="date-picker-dialog"
                  label={t("visitscheduledate")}
                  format="dd/MM/yyyy"
                  autoComplete="off"
                  value={selectedScheduleDate}
                  onChange={scheduleDateChange}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                    color: "primary"
                  }}
                  error={!isEmpty(filterDateErrors["SCHEDULED_DATE"])}
                  helperText={
                    !isEmpty(filterDateErrors["SCHEDULED_DATE"]) &&
                    t(filterDateErrors["SCHEDULED_DATE"])
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <KeyboardDatePicker
                  allowKeyboardControl
                  margin="normal"
                  id="date-picker-dialog"
                  label={t("visitcompleteddate")}
                  format="dd/MM/yyyy"
                  autoComplete="off"
                  value={selectedCompletedDate}
                  onChange={completedDateChange}
                  error={!isEmpty(filterDateErrors["COMPLETED_DATE"])}
                  helperText={
                    !isEmpty(filterDateErrors["COMPLETED_DATE"]) &&
                    t(filterDateErrors["COMPLETED_DATE"])
                  }
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
          {encounterTypes.map(visitType => (
            <FormControlLabel
              key={visitType.uuid}
              control={
                <Checkbox
                  checked={selectedVisitTypes != null ? selectedVisitTypes[visitType.uuid] : false}
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
          label: t("filterResults"),
          classes: classes.filterButtonStyle
        },
        {
          buttonType: "applyButton",
          label: t("apply"),
          classes: classes.btnCustom,
          redirectTo: `/app/completeVisit`,
          click: applyClick,
          disabled:
            !isEmpty(filterDateErrors["COMPLETED_DATE"]) ||
            !isEmpty(filterDateErrors["SCHEDULED_DATE"])
        },
        {
          buttonType: "cancelButton",
          label: t("cancel"),
          classes: classes.cancelBtnCustom
        }
      ]}
      title={t("filterResults")}
      btnHandleClose={close}
    />
  );
};

export default FilterResult;
