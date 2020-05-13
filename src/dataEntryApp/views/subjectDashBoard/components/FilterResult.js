import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
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
import { getCompletedVisit } from "../../../reducers/completedVisitReducer";

const useStyles = makeStyles(theme => ({
  filterButtonStyle: {
    height: "38px",
    zIndex: 1,
    // marginLeft: theme.spacing(64),
    marginTop: "1px",
    boxShadow: "none"
  },
  btnCustom: {
    float: "left",
    backgroundColor: "#fc9153",
    height: "30px"
  },
  cancelBtnCustom: {
    float: "left",
    backgroundColor: "#F8F9F9",
    color: "#fc9153",
    border: "1px solid #fc9153",
    height: "30px"
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

const FilterResult = ({ getCompletedVisit, completedVisitList, visitTypes }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const visitTypesList = [...new Set(visitTypes.programEncounters.map(item => item.encounterType))];

  //   if(completedVisitList){
  //     const visitList = [...new Set(completedVisitList.content.map(item => item.encounterType.name))];
  //     console.log("##########"+ JSON.stringify(visitList));

  //  }
  // useEffect(() => {
  //   getCompletedVisit("10");
  // }, []);

  const [selectedDate, setSelectedDate] = React.useState(new Date("2014-08-18T21:11:54"));
  const handleDateChange = date => {
    setSelectedDate(date);
  };

  const applyClick = () => {
    console.log("apply visit" + selectedDate, state);
    // getCompletedVisit();
  };
  const [state, setState] = React.useState("");

  const handleChange = event => {
    setState({ ...state, [event.target.name]: event.target.checked });
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
                  autoOk
                  margin="normal"
                  id="date-picker-dialog"
                  label="Visit schedule date"
                  format="MM/dd/yyyy"
                  value={selectedDate}
                  onChange={handleDateChange}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                    color: "primary"
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <KeyboardDatePicker
                  autoOk
                  margin="normal"
                  id="date-picker-dialog"
                  label="Visit completed date"
                  format="MM/dd/yyyy"
                  value={selectedDate}
                  onChange={handleDateChange}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                    color: "primary"
                  }}
                />
              </Grid>
            </Grid>
          </MuiPickersUtilsProvider>
        </FormControl>

        <FormLabel component="legend">Visit Type</FormLabel>
        <FormGroup row>
          {visitTypesList.map(visitType => (
            <FormControlLabel
              control={
                <Checkbox
                  // checked={}
                  onChange={handleChange}
                  name={visitType.id}
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
      buttonsSet={[
        {
          buttonType: "openButton",
          label: t("filterResult"),
          classes: classes.filterButtonStyle
        },
        {
          buttonType: "applyButton",
          label: t("Apply"),
          classes: classes.btnCustom,
          redirectTo: `/app/completeVisit`,
          click: applyClick
        },
        {
          buttonType: "cancelButton",
          label: t("Cancel"),
          classes: classes.cancelBtnCustom
        }
      ]}
      title={t("Filter Result")}
    />
  );
};

const mapStateToProps = state => ({
  completedVisitList: state.dataEntry.completedVisitReducer.completedVisitList
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
