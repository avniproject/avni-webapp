import React, { Fragment } from "react";
import { Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Box, TextField } from "@material-ui/core";
import { ObservationsHolder } from "avni-models";
import {
  getRegistrationForm,
  onLoad,
  saveSubject,
  updateObs,
  updateSubject
} from "../../reducers/registrationReducer";
import Typography from '@material-ui/core/Typography';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { getGenders } from "../../reducers/metadataReducer";
import { get, sortBy } from "lodash";
import { LineBreak, RelativeLink, withParams } from "../../../common/components/utils";
import Form from "../../components/Form";
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
    padding: theme.spacing(3, 3)
  },
  villagelable: {
    color: "rgba(0, 0, 0, 0.54)",
    padding: 0,
    'font-size': "1rem",
    'font-family': "Roboto, Helvetica, Arial, sans-serif",
    'font-weight': 400,
    'line-height': 1,
    'letter-spacing': "0.00938em",
    marginBottom: 20
  },
  caption: {
    color: "rgba(0, 0, 0, 0.54)"
  },
  topnav: {
    float: "right"
  },
  topprevnav: {
    color: "rgba(0, 0, 0, 0.54)",
    marginRight: 10,
    'font-size': "12px"
  },
  toppagenum: {
    color: "rgba(0, 0, 0, 0.54)",
    marginRight: 10,
    'font-size': "12px"
  },
  topnextnav: {
    color: "orange",
    marginLeft: 10,
    marginRight: 10,
    'font-size': "12px",
    cursor: "pointer"
  },
  prevbuttonspace: {
    marginRight: 20,
    width: 100
  }
}));

const DefaultPage = props => {
  const classes = useStyles();
  console.log(props)

  React.useEffect(() => {
    if (!props.subject)
      props.onLoad(props.match.queryParams.type);
  }, []);



  return (
    <div>
      <Typography className={classes.caption} variant="caption" gutterBottom> No Details  </Typography>
      <LineBreak num={2} />
      <div >
        {props.subject && (
          <div>
            <Box display="flex" flexDirection={"row"} flexWrap="wrap" justifyContent="space-between">
              <Typography variant="subtitle1" gutterBottom> 1. Basic Details</Typography>
              <Box>
                <RelativeLink
                  to="form"
                  params={{
                    type: props.subject.subjectType.name,
                    from: props.location.pathname + props.location.search
                  }}
                  noUnderline
                >
                  <div> <label className={classes.topprevnav} disabled={true}>PREV</label>
                    {props.form && <label className={classes.toppagenum}> 1/{props.form.getLastFormElementElementGroup().displayOrder + 1}</label>}
                    <label className={classes.topnextnav}>NEXT</label></div>
                </RelativeLink>
              </Box>
            </Box>

            <Paper>
              <Box className={classes.form} display="flex" flexDirection="column">
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
                      value={props.subject.firstName}
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
                      value={props.subject.lastName}
                      onChange={e => {
                        props.updateSubject("lastName", e.target.value);
                      }}
                    />
                    <LineBreak num={1} />
                    <DateOfBirth
                      dateOfBirth={props.subject.dateOfBirth}
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
                    <label className={classes.villagelable}>Village</label>
                    <LocationAutosuggest selectedVillage={props.subject.lowestAddressLevel.title}
                      onSelect={location => props.updateSubject("lowestAddressLevel", location)}
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
                <LineBreak num={4} />
                <Box display="flex" flexDirection={"row"} flexWrap="wrap" justifyContent="flex-start">
                  <Box>
                    <RelativeLink
                      to="form"
                      params={{
                        type: props.subject.subjectType.name,
                        from: props.location.pathname + props.location.search
                      }}
                      noUnderline
                    >
                      <div> <PagenatorButton className={classes.prevbuttonspace}>Previous</PagenatorButton><PagenatorButton>Next</PagenatorButton></div>

                    </RelativeLink>
                  </Box>
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
  loaded: state.dataEntry.registration.loaded
});

const mapDispatchToProps = {
  getRegistrationForm,
  updateSubject,
  getGenders,
  saveSubject,
  onLoad
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
