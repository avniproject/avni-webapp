import React, { Fragment } from "react";
import { Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Box, TextField, Chip } from "@material-ui/core";
import { ObservationsHolder, Individual } from "avni-models";
import {
  getRegistrationForm,
  onLoad,
  saveSubject,
  updateObs,
  updateSubject,
  setSubject,
  saveCompleteFalse
} from "../../reducers/registrationReducer";
import Typography from '@material-ui/core/Typography';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { getGenders } from "../../reducers/metadataReducer";
import { get, sortBy } from "lodash";
import { LineBreak, RelativeLink, withParams } from "../../../common/components/utils";
import { DateOfBirth } from "../../components/DateOfBirth";
import { CodedFormElement } from "../../components/CodedFormElement";
import PagenatorButton from "../../components/PagenatorButton";
import LocationAutosuggest from "dataEntryApp/components/LocationAutosuggest";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Stepper from "dataEntryApp/views/registration/Stepper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import SubjectRegistrationForm from "./SubjectRegistrationForm";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(4),
    flexGrow: 1
  },
  form: {   
    border: "1px solid #f1ebeb"
  },
  villagelabel: {
    color: "rgba(0, 0, 0, 0.54)",
    padding: 0,
    fontSize: "1rem",
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    fontWeight: 400,
    lineHeight: 1,
    letterSpacing: "0.00938em",
    marginBottom: 20
  },
  topcaption: {
    color: "rgba(0, 0, 0, 0.54)",
    backgroundColor: "#f8f4f4",
    height: 40,
    width: "100%",
    padding: 8
  },
  caption: {
    color: "rgba(0, 0, 0, 0.54)"   
  },
  topprevnav: {
    color: "#cecdcd",
    marginRight: 10,
    fontSize: "12px"
  },
  toppagenum: {
    color: "rgba(0, 0, 0, 0.54)",
    marginRight: 10,
    fontSize: "12px"
  },
  topnextnav: {
    color: "orange",
    marginLeft: 10,
    marginRight: 10,
    fontSize: "12px",
    cursor: "pointer"
  },
  prevbuttonspace: {
    color: "#cecdcd",
    marginRight: 27,
    width: 100
  },
  iconcolor: {
    color: "blue"
  },
  topboxstyle:{
    padding: theme.spacing(3, 3),
  },
  buttomboxstyle:{
    backgroundColor: "#f8f4f4",
    height: 80,
    width: '100%',
    padding: 25
  }
}));

const DefaultPage = props => {
  const classes = useStyles();
  console.log(props)

  React.useEffect(() => {
    if (!props.saved) {
      if (!props.subject) {
        props.onLoad(props.match.queryParams.type);
      }
    } else {
      let subject = Individual.createEmptyInstance();
      subject.subjectType = props.subject.subjectType;
      props.setSubject(subject);
      props.saveCompleteFalse();
    }
  }, []);

  return (
    <div>
      <div className={classes.topcaption}>
      <Typography  variant="caption" gutterBottom> No Details  </Typography>
      </div>
      
      <LineBreak num={1} />
      <div >
        {props.subject && (
          <div>
            <Box display="flex" flexDirection={"row"} flexWrap="wrap" justifyContent="space-between">
              <Typography variant="subtitle1" gutterBottom> 1. Basic Details</Typography>
              <Box>
                <label className={classes.topprevnav} disabled={true}>PREV</label>
                <RelativeLink
                  to="form"
                  params={{
                    type: props.subject.subjectType.name,
                    from: props.location.pathname + props.location.search
                  }}
                  noUnderline
                >

                  {props.form && <label className={classes.toppagenum}> 1 / {props.form.getLastFormElementElementGroup().displayOrder + 1}</label>}
                  <label className={classes.topnextnav}>NEXT</label>
                </RelativeLink>
              </Box>
            </Box>

            <Paper className={classes.form}>
              <Box className={classes.topboxstyle} display="flex" flexDirection="column">
                <Typography className={classes.caption} variant="caption" display="block" gutterBottom> Registration Date </Typography>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    disableToolbar
                    style={{ width: "30%" }}
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    name="registrationDate"
                    value={props.subject.registrationDate.toISOString().substr(0, 10)}
                    onChange={e => {
                      props.updateSubject("registrationDate", new Date(e.target.value));
                    }}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                      color: "primary"
                    }}
                  />
                </MuiPickersUtilsProvider>
                <LineBreak num={1} />
                {get(props, "subject.subjectType.name") === "Individual" && (
                  <React.Fragment>
                    <TextField
                      style={{ width: "30%" }}
                      label="First Name"
                      type="text"
                      required
                      name="firstName"
                      value={props.subject.firstName || ""}
                      onChange={e => {
                        props.updateSubject("firstName", e.target.value);
                      }}
                    />
                    <LineBreak num={1} />
                    <TextField
                      style={{ width: "30%" }}
                      label="Last Name"
                      type="text"
                      required
                      name="lastName"
                      value={props.subject.lastName || ""}
                      onChange={e => {
                        props.updateSubject("lastName", e.target.value);
                      }}
                    />
                    <LineBreak num={1} />
                    <DateOfBirth
                      dateOfBirth={props.subject.dateOfBirth || ""}
                      dateOfBirthVerified={props.subject.dateOfBirthVerified}
                      onChange={date => props.updateSubject("dateOfBirth", date)}
                      markVerified={verified => props.updateSubject("dateOfBirthVerified", verified)}
                    />
                    <LineBreak num={1} />
                    <CodedFormElement
                      groupName="Gender"
                      items={sortBy(props.genders, "name")}
                      isChecked={item => item && get(props, "subject.gender.uuid") === item.uuid}
                      onChange={selected => props.updateSubject("gender", selected)}
                    />
                    <LineBreak num={1} />
                    <label className={classes.villagelabel}>Village</label>
                    <LocationAutosuggest selectedVillage={props.subject.lowestAddressLevel.title}
                      onSelect={location => props.updateSubject("lowestAddressLevel", location)} data={props}
                    />
                  </React.Fragment>
                )}

                {get(props, "subject.subjectType.name") !== "Individual" && (
                  <React.Fragment>
                    <TextField
                      label="Name"
                      type="text"
                      required
                      name="firstName"
                      value={props.subject.firstName}
                      onChange={e => {
                        props.updateSubject("firstName", e.target.value);
                      }}
                    />
                  </React.Fragment>
                )}
                <LineBreak num={1} />                
              </Box>
              <Box className={classes.buttomboxstyle} display="flex" flexDirection={"row"} flexWrap="wrap" justifyContent="flex-start">
                  <Box>
                    <Chip className={classes.prevbuttonspace} label="PREVIOUS" disabled variant="outlined" />
                    <RelativeLink
                      to="form"
                      params={{
                        type: props.subject.subjectType.name,
                        from: props.location.pathname + props.location.search
                      }}
                      noUnderline
                    >
                      <PagenatorButton>NEXT</PagenatorButton>
                    </RelativeLink>
                  </Box>
                </Box>
            </Paper>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  user: state.app.user,
  genders: state.dataEntry.metadata.genders,
  form: state.dataEntry.registration.registrationForm,
  subject: state.dataEntry.registration.subject,
  loaded: state.dataEntry.registration.loaded,
  saved: state.dataEntry.registration.saved
});

const mapDispatchToProps = {
  getRegistrationForm,
  updateSubject,
  getGenders,
  saveSubject,
  onLoad,
  setSubject,
  saveCompleteFalse
};

const ConnectedDefaultPage = withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(DefaultPage)
  )
);

const mapFormStateToProps = state => ({
  form: state.dataEntry.registration.registrationForm,
  obs: new ObservationsHolder(state.dataEntry.registration.subject.observations),
  title: `${state.dataEntry.registration.subject.subjectType.name} Registration`,
  saved: state.dataEntry.registration.saved,
  subject: state.dataEntry.registration.subject,
  onSaveGoto: "/app/search"
});

const mapFormDispatchToProps = {
  updateObs,
  onSave: saveSubject
};

const RegistrationForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(SubjectRegistrationForm)
);

const SubjectRegister = ({ match: { path } }) => {
  const classes = useStyles();

  return (
    <Fragment>
      <Breadcrumbs path={path} />
      <Paper className={classes.root}>
        <Stepper />
        <Route exact path={`${path}`} component={ConnectedDefaultPage} />
        <Route path={`${path}/form`} component={RegistrationForm} />
      </Paper>
    </Fragment>
  );
};

export default withRouter(SubjectRegister);
