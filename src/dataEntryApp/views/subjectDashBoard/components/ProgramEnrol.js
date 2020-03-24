import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import SubjectButton from "./Button";
import { getEnrolForm } from "../../../reducers/programEnrolReducer";
import Form from "../../../components/Form";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  },
  mainHeading: {
    fontSize: "20px"
  },
  btnCustom: {
    //float:'left',
    backgroundColor: "#fc9153",
    height: "30px",
    marginRight: "20px"
  }
}));

const ProgramEnrol = ({ match, getEnrolForm }) => {
  const [value, setValue] = React.useState("Yes");

  const handleChange = event => {
    setValue(event.target.value);
  };
  const classes = useStyles();

  console.log(getEnrolForm);

  useEffect(() => {
    getEnrolForm();
  }, []);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <div className={classes.tableView}>
          <Typography component={"span"} className={classes.mainHeading}>
            Enrol Child Program
          </Typography>
          <Grid justify="center" alignItems="center" container spacing={3}>
            <Grid item xs={12}>
              <p
                style={{
                  padding: "9px",
                  backgroundColor: "#F8F9F9",
                  color: "gray",
                  marginTop: "20px",
                  fontSize: "12px"
                }}
              >
                <span>
                  Name: <span style={{ color: "black" }}>Shilpa Ingale</span>{" "}
                  &nbsp;&nbsp;|&nbsp;&nbsp; Age: <span style={{ color: "black" }}>20yrs</span>{" "}
                  &nbsp;&nbsp;|&nbsp;&nbsp; Gender: <span style={{ color: "black" }}>Female</span>{" "}
                  &nbsp;&nbsp;|&nbsp;&nbsp; Village:{" "}
                  <span style={{ color: "black" }}>Bokkapuram</span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; GPS Coordinates:{" "}
                  <span style={{ color: "black" }}>15.3657699, 73.9327478</span>
                  &nbsp;&nbsp;|&nbsp;&nbsp; Enrolment details:{" "}
                  <span style={{ color: "black" }}>29-01-2020</span>
                </span>
              </p>
              <p style={{ padding: "9px", marginTop: "20px" }}>
                <span style={{ float: "left" }}>1. Basic details</span>
                <span style={{ float: "right" }}>Prev 1/2 Next</span>
              </p>
              <Paper style={{ fontSize: "12px", color: "gray", marginTop: "27px" }}>
                <div style={{ padding: "20px" }}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Are you registering child at birth?</FormLabel>
                    <RadioGroup
                      aria-label="position"
                      name="position"
                      value={value}
                      onChange={handleChange}
                      row
                    >
                      <FormControlLabel
                        value="No"
                        control={<Radio color="primary" />}
                        label="No"
                        labelPlacement="No"
                      />
                      <FormControlLabel
                        value="Yes"
                        control={<Radio color="primary" />}
                        label="Yes"
                        labelPlacement="Yes"
                      />
                    </RadioGroup>
                  </FormControl>
                </div>
                <div style={{ backgroundColor: "#F8F9F9", padding: "30px" }}>
                  <SubjectButton btnLabel="Prev" btnClass={classes.btnCustom} />
                  <SubjectButton btnLabel="Next" btnClass={classes.btnCustom} />
                </div>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </Paper>
    </Fragment>
  );
};

// const mapFormStateToProps = state => ({
//   form: state.dataEntry.registration.enrolForm
// });

// const EnrolForm = withRouter(
//   connect(
//     mapFormStateToProps,
//     mapFormDispatchToProps
//   )(Form)
// );

const mapStateToProps = state => ({
  form: state.enrolForm.enrolForm,
  saved: state.enrolForm.saved,
  onSaveGoto: "/app/search"
});

const mapDispatchToProps = {
  getEnrolForm
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProgramEnrol)
  )
);
