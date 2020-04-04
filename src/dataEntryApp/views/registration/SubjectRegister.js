import React, { Fragment } from "react";
import { Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Box, TextField, Chip, Typography, Paper } from "@material-ui/core";
import { ObservationsHolder } from "avni-models";
import {
  getRegistrationForm,
  onLoad,
  saveSubject,
  updateObs,
  updateSubject,
  setSubject,
  saveCompleteFalse
} from "../../reducers/registrationReducer";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import moment from "moment/moment";
import { getGenders } from "../../reducers/metadataReducer";
import _, { get, sortBy } from "lodash";
import { LineBreak, RelativeLink, withParams } from "../../../common/components/utils";
import { DateOfBirth } from "../../components/DateOfBirth";
import { CodedFormElement } from "../../components/CodedFormElement";
import PagenatorButton from "../../components/PagenatorButton";
import LocationAutosuggest from "dataEntryApp/components/LocationAutosuggest";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "dataEntryApp/views/registration/Stepper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import SubjectRegistrationForm from "./SubjectRegistrationForm";
import { useTranslation } from "react-i18next";
import BrowserStore from "../../api/browserStore";

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
    marginRight: 8,
    fontSize: "12px"
  },
  toppagenum: {
    backgroundColor: "silver",
    color: "black",
    fontSize: 12,
    padding: 3
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
  topboxstyle: {
    padding: theme.spacing(3, 3)
  },
  buttomboxstyle: {
    backgroundColor: "#f8f4f4",
    height: 80,
    width: "100%",
    padding: 25
  },
  errmsg: {
    color: "red"
  }
}));

const DefaultPage = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [disableNext, setDisableNext] = React.useState(true);
  const stringRegex = /^[A-Za-z]+$/;
  const [subjectRegFormErrors, setSubjectRegFormErrors] = React.useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    registrationDate: "",
    gender: ""
  });

  // console.log(props);

  React.useEffect(() => {
    (async function fetchData() {
      await props.onLoad(props.match.queryParams.type);
      props.saveCompleteFalse();
      // let subject = BrowserStore.fetchSubject();
      // if (subject) props.setSubject(subject);
    })();

    // if (!props.saved) {
    //   if (!props.subject) {
    //     props.onLoad(props.match.queryParams.type);
    //   }
    // } else {
    //   let subject = Individual.createEmptyInstance();
    //   subject.subjectType = props.subject.subjectType;
    //   props.setSubject(subject);
    //   props.saveCompleteFalse();
    // }
  }, []);

  const validateRegistrationDate = (regDate, dob) => {
    subjectRegFormErrors.registrationDate = "";
    if (_.isNil(regDate)) {
      subjectRegFormErrors.registrationDate = "There is no value specified!";
    } else if (!(_.isNil(dob) || _.isNil(regDate))) {
      if (moment(dob).isAfter(regDate)) {
        subjectRegFormErrors.registrationDate = "Registration Date cannot be before date of birth";
      }
    } else if (moment(regDate).isAfter(new Date())) {
      subjectRegFormErrors.registrationDate = "Registration date cannot be in future";
    }
    setSubjectRegFormErrors({ ...subjectRegFormErrors });
  };

  const validateFirstName = firstName => {
    subjectRegFormErrors.firstName = "";
    if (_.isEqual(firstName, "")) {
      subjectRegFormErrors.firstName = "There is no value specified!";
    } else if (_.isNil(firstName)) {
      subjectRegFormErrors.firstName = "There is no value specified!";
    }
    setSubjectRegFormErrors({ ...subjectRegFormErrors });
  };

  const validateLastName = lastName => {
    subjectRegFormErrors.lastName = "";
    if (_.isEqual(lastName, "")) {
      subjectRegFormErrors.lastName = "There is no value specified!";
    } else if (_.isNil(lastName)) {
      subjectRegFormErrors.lastName = "There is no value specified!";
    }
    setSubjectRegFormErrors({ ...subjectRegFormErrors });
  };

  const validateDateOfBirth = (date, regDate) => {
    subjectRegFormErrors.dateOfBirth = "";
    setSubjectRegFormErrors({ ...subjectRegFormErrors, dateOfBirth: "" });
    const years = moment().diff(date, "years");
    if (_.isNil(date)) {
      subjectRegFormErrors.dateOfBirth = "There is no value specified";
    } else if (years > 120) {
      subjectRegFormErrors.dateOfBirth = "Age is person is above 120 years";
    } else if (moment(date).isAfter(new Date())) {
      subjectRegFormErrors.dateOfBirth = "Birth date cannot be in future";
    } else if (!(_.isNil(date) || _.isNil(regDate))) {
      if (moment(date).isAfter(regDate)) {
        subjectRegFormErrors.dateOfBirth = "Registration Date cannot be before date of birth";
      }
    }
    setSubjectRegFormErrors({ ...subjectRegFormErrors });
  };

  const validateGender = gender => {
    subjectRegFormErrors.gender = "";
    if (_.isNil(gender)) {
      subjectRegFormErrors.gender = "There is no value specified!";
    } else if (_.isEmpty(gender.name)) {
      subjectRegFormErrors.gender = "There is no value specified!";
    }
    setSubjectRegFormErrors({ ...subjectRegFormErrors });
  };

  const nextHandler = () => {
    console.log("in nextHandler ....");
    validateFirstName(props.subject.firstName);
    validateLastName(props.subject.lastName);
    validateRegistrationDate(props.subject.registrationDate, props.subject.dateOfBirth);
    validateDateOfBirth(props.subject.dateOfBirth, props.subject.registrationDate);
    validateGender(props.subject.gender);
    // To be moved out of nextHandler; once all error messgae are empty
    if (
      _.isEmpty(subjectRegFormErrors.firstName) &&
      _.isEmpty(subjectRegFormErrors.lastName) &&
      _.isEmpty(subjectRegFormErrors.dateOfBirth) &&
      _.isEmpty(subjectRegFormErrors.registrationDate) &&
      _.isEmpty(subjectRegFormErrors.gender)
    ) {
      console.log("setDisableNext ..false");
      setDisableNext(false);
    }
  };

  return (
    <div>
      <div className={classes.topcaption}>
        <Typography variant="caption" gutterBottom>
          {" "}
          {t("no")} {t("details")}{" "}
        </Typography>
      </div>

      <LineBreak num={1} />
      <div>
        {props.subject && (
          <div>
            <Box
              display="flex"
              flexDirection={"row"}
              flexWrap="wrap"
              justifyContent="space-between"
            >
              <Typography variant="subtitle1" gutterBottom>
                {" "}
                1. {t("Basic")} {t("details")}
              </Typography>
              <Box>
                <label className={classes.topprevnav} disabled={true}>
                  {t("previous")}
                </label>
                <RelativeLink
                  to="form"
                  params={{
                    type: props.subject.subjectType.name,
                    from: props.location.pathname + props.location.search
                  }}
                  noUnderline
                >
                  {props.form && (
                    <label className={classes.toppagenum}>
                      {" "}
                      1 / {props.form.getLastFormElementElementGroup().displayOrder + 1}
                    </label>
                  )}
                  <label className={classes.topnextnav}>{t("next")}</label>
                </RelativeLink>
              </Box>
            </Box>

            <Paper className={classes.form}>
              <Box className={classes.topboxstyle} display="flex" flexDirection="column">
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    autoComplete="off"
                    required
                    name="registrationDate"
                    label={t("Date of registration")}
                    value={new Date(props.subject.registrationDate)}
                    error={!_.isEmpty(subjectRegFormErrors.registrationDate)}
                    helperText={subjectRegFormErrors.registrationDate}
                    style={{ width: "30%" }}
                    margin="normal"
                    id="date-picker-dialog"
                    format="MM/dd/yyyy"
                    onChange={date => {
                      props.updateSubject("registrationDate", new Date(date));
                      validateRegistrationDate(date, props.subject.dateOfBirth);
                    }}
                    InputLabelProps={{
                      shrink: true
                    }}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                      color: "primary"
                    }}
                  />
                </MuiPickersUtilsProvider>
                <LineBreak num={1} />
                {get(props, "subject.subjectType.name") === "Individual" && (
                  <React.Fragment>
                    <TextField
                      type="text"
                      autoComplete="off"
                      required
                      name="firstName"
                      value={props.subject.firstName || ""}
                      error={!_.isEmpty(subjectRegFormErrors.firstName)}
                      helperText={subjectRegFormErrors.firstName}
                      style={{ width: "30%" }}
                      label={t("firstName")}
                      onChange={e => {
                        props.updateSubject("firstName", e.target.value);
                        validateFirstName(e.target.value);
                      }}
                    />
                    <LineBreak num={1} />
                    <TextField
                      type="text"
                      autoComplete="off"
                      required
                      name="lastName"
                      value={props.subject.lastName || ""}
                      error={!_.isEmpty(subjectRegFormErrors.lastName)}
                      helperText={subjectRegFormErrors.lastName}
                      style={{ width: "30%" }}
                      label={t("lastName")}
                      onChange={e => {
                        props.updateSubject("lastName", e.target.value);
                        validateLastName(e.target.value);
                      }}
                    />
                    <LineBreak num={1} />
                    <DateOfBirth
                      dateOfBirth={props.subject.dateOfBirth || ""}
                      dateOfBirthVerified={props.subject.dateOfBirthVerified}
                      dobErrorMsg={subjectRegFormErrors.dateOfBirth}
                      onChange={date => {
                        props.updateSubject("dateOfBirth", date);
                        validateDateOfBirth(date, props.subject.registrationDate);
                      }}
                      markVerified={verified =>
                        props.updateSubject("dateOfBirthVerified", verified)
                      }
                    />
                    <LineBreak num={1} />
                    <CodedFormElement
                      groupName={t("gender")}
                      items={sortBy(props.genders, "name")}
                      isChecked={item => item && get(props, "subject.gender.uuid") === item.uuid}
                      mandatory={true}
                      errorMsg={subjectRegFormErrors.gender}
                      onChange={selected => {
                        props.updateSubject("gender", selected);
                        validateGender(selected);
                      }}
                    />
                    <LineBreak num={1} />
                    <label className={classes.villagelabel}>{t("Village")}</label>
                    <LocationAutosuggest
                      selectedVillage={props.subject.lowestAddressLevel.title}
                      onSelect={location => props.updateSubject("lowestAddressLevel", location)}
                      data={props}
                    />
                  </React.Fragment>
                )}

                {get(props, "subject.subjectType.name") !== "Individual" && (
                  <React.Fragment>
                    <TextField
                      label="Name"
                      type="text"
                      autoComplete="off"
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
              <Box
                className={classes.buttomboxstyle}
                display="flex"
                flexDirection={"row"}
                flexWrap="wrap"
                justifyContent="flex-start"
              >
                <Box>
                  <Chip
                    className={classes.prevbuttonspace}
                    label={t("previous")}
                    disabled
                    variant="outlined"
                  />

                  {!disableNext ? (
                    <RelativeLink
                      to="form"
                      params={{
                        type: props.subject.subjectType.name,
                        from: props.location.pathname + props.location.search
                      }}
                      noUnderline
                    >
                      <PagenatorButton formdata={props.subject}>{t("next")}</PagenatorButton>
                    </RelativeLink>
                  ) : (
                    <Chip disabled label={"next"} onClick={nextHandler} />
                  )}
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
  obs:
    state.dataEntry.registration.subject &&
    new ObservationsHolder(state.dataEntry.registration.subject.observations),
  //title: `${state.dataEntry.registration.subject.subjectType.name} Registration`,
  saved: state.dataEntry.registration.saved,
  subject: state.dataEntry.registration.subject,
  onSaveGoto: "/app/search"
});

const mapFormDispatchToProps = {
  updateObs,
  onLoad,
  setSubject,
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
