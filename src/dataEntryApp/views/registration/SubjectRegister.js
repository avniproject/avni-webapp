import React, { Fragment, createRef } from "react";
import { Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Box, TextField, Chip, Typography, Paper, Button } from "@material-ui/core";
import { ObservationsHolder, AddressLevel } from "avni-models";
import {
  getRegistrationForm,
  onLoad,
  saveSubject,
  updateObs,
  updateSubject,
  setSubject,
  saveCompleteFalse
} from "../../reducers/registrationReducer";
import { getSubjectProfile } from "../../reducers/subjectDashboardReducer";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import moment from "moment/moment";
import { getGenders } from "../../reducers/metadataReducer";
import _, { get, sortBy } from "lodash";
import { LineBreak, RelativeLink, withParams } from "../../../common/components/utils";
import { DateOfBirth } from "../../components/DateOfBirth";
import { CodedFormElement } from "../../components/CodedFormElement";
import LocationAutosuggest from "dataEntryApp/components/LocationAutosuggest";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "dataEntryApp/views/registration/Stepper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import FormWizard from "./FormWizard";
import { useTranslation } from "react-i18next";
import BrowserStore from "../../api/browserStore";
import { disableSession } from "common/constants";

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
    fontSize: "13px",
    border: "none",
    background: "white"
  },
  toppagenum: {
    backgroundColor: "silver",
    color: "black",
    fontSize: 12,
    padding: 3
  },
  topnextnav: {
    color: "orange",
    fontSize: "13px",
    cursor: "pointer",
    border: "none",
    background: "white",

    "&:hover": {
      background: "none",
      border: "none"
    },

    "&:active": {
      border: "none",
      outlineColor: "white"
    }
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
  },
  nextBtn: {
    color: "white",
    width: 110,
    cursor: "pointer",
    height: 30,
    padding: "4px 25px",
    fontSize: 12,
    borderRadius: 50,
    backgroundColor: "orange"
  }
}));

const DefaultPage = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [subjectRegErrors, setSubjectRegErrors] = React.useState({
    REGISTRATION_DATE: "",
    FIRST_NAME: "",
    LAST_NAME: "",
    DOB: "",
    GENDER: "",
    LOWEST_ADDRESS_LEVEL: ""
  });

  const setValidationResultToError = validationResult => {
    subjectRegErrors[validationResult.formIdentifier] = validationResult.messageKey;
    setSubjectRegErrors({ ...subjectRegErrors });
  };

  const handleNext = event => {
    setValidationResultToError(props.subject.validateRegistrationDate());
    setValidationResultToError(props.subject.validateFirstName());
    setValidationResultToError(props.subject.validateLastName());
    setValidationResultToError(props.subject.validateDateOfBirth());
    setValidationResultToError(props.subject.validateGender());
    setValidationResultToError(props.subject.validateAddress());

    //needs to used when village location is set
    //setDisableNext(new ValidationResults(props.subject.validate()).hasValidationError());

    if (props.subject.subjectType.isIndividual()) {
      if (
        !(
          _.isEmpty(subjectRegErrors.FIRST_NAME) &&
          _.isEmpty(subjectRegErrors.LAST_NAME) &&
          _.isEmpty(subjectRegErrors.DOB) &&
          _.isEmpty(subjectRegErrors.REGISTRATION_DATE) &&
          _.isEmpty(subjectRegErrors.GENDER) &&
          _.isEmpty(subjectRegErrors.LOWEST_ADDRESS_LEVEL)
        )
      ) {
        event.preventDefault();
      }
    } else {
      if (
        !(_.isEmpty(subjectRegErrors.FIRST_NAME) && _.isEmpty(subjectRegErrors.REGISTRATION_DATE))
      ) {
        event.preventDefault();
      }
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
                <Button className={classes.topprevnav} type="button" disabled>
                  {t("previous")}
                </Button>
                {props.form && (
                  <label className={classes.toppagenum}>
                    {" "}
                    1 / {props.form.getLastFormElementElementGroup().displayOrder + 1}
                  </label>
                )}
                <RelativeLink
                  to="form"
                  params={{
                    type: props.subject.subjectType.name,
                    from: props.location.pathname + props.location.search
                  }}
                  noUnderline
                >
                  <Button className={classes.topnextnav} type="button" onClick={e => handleNext(e)}>
                    {t("next")}
                  </Button>
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
                    value={
                      _.isNil(props.subject.registrationDate)
                        ? null
                        : new Date(props.subject.registrationDate)
                    }
                    error={!_.isEmpty(subjectRegErrors.REGISTRATION_DATE)}
                    helperText={t(subjectRegErrors.REGISTRATION_DATE)}
                    style={{ width: "30%" }}
                    margin="normal"
                    id="date-picker-dialog"
                    format="MM/dd/yyyy"
                    placeholder="mm/dd/yyyy"
                    onChange={date => {
                      const dateOfReg = _.isNil(date) ? undefined : new Date(date);
                      props.updateSubject("registrationDate", dateOfReg);
                      props.subject.registrationDate = dateOfReg;
                      setValidationResultToError(props.subject.validateRegistrationDate());
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
                      error={!_.isEmpty(subjectRegErrors.FIRST_NAME)}
                      helperText={t(subjectRegErrors.FIRST_NAME)}
                      style={{ width: "30%" }}
                      label={t("firstName")}
                      onChange={e => {
                        props.updateSubject("firstName", e.target.value);
                        props.subject.setFirstName(e.target.value);
                        setValidationResultToError(props.subject.validateFirstName());
                      }}
                    />
                    <LineBreak num={1} />
                    <TextField
                      type="text"
                      autoComplete="off"
                      required
                      name="lastName"
                      value={props.subject.lastName || ""}
                      error={!_.isEmpty(subjectRegErrors.LAST_NAME)}
                      helperText={t(subjectRegErrors.LAST_NAME)}
                      style={{ width: "30%" }}
                      label={t("lastName")}
                      onChange={e => {
                        props.updateSubject("lastName", e.target.value);
                        props.subject.setLastName(e.target.value);
                        setValidationResultToError(props.subject.validateLastName());
                      }}
                    />
                    <LineBreak num={1} />
                    <DateOfBirth
                      dateOfBirth={props.subject.dateOfBirth || ""}
                      dateOfBirthVerified={props.subject.dateOfBirthVerified}
                      dobErrorMsg={subjectRegErrors.DOB}
                      onChange={date => {
                        const dateOfBirth = _.isNil(date) ? undefined : new Date(date);
                        props.updateSubject("dateOfBirth", dateOfBirth);
                        props.subject.setDateOfBirth(dateOfBirth);
                        setValidationResultToError(props.subject.validateDateOfBirth());
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
                      errorMsg={subjectRegErrors.GENDER}
                      onChange={selected => {
                        props.updateSubject("gender", selected);
                        props.subject.gender = selected;
                        setValidationResultToError(props.subject.validateGender());
                      }}
                    />
                    <LineBreak num={1} />
                    <label className={classes.villagelabel}>{t("Village")}</label>
                    <LocationAutosuggest
                      selectedVillage={props.subject.lowestAddressLevel.name}
                      errorMsg={subjectRegErrors.LOWEST_ADDRESS_LEVEL}
                      onSelect={location => {
                        props.updateSubject(
                          "lowestAddressLevel",
                          AddressLevel.create({
                            uuid: location.uuid,
                            title: location.title,
                            level: location.level,
                            typeString: location.typeString
                          })
                        );
                        props.subject.lowestAddressLevel = AddressLevel.create({
                          uuid: location.uuid,
                          title: location.title,
                          level: location.level,
                          typeString: location.typeString
                        });
                        setValidationResultToError(props.subject.validateAddress());
                      }}
                      //   onSelect={location => {props.updateSubject("lowestAddressLevel", location)
                      //   setValidationResultToError(props.subject.validateAddress());
                      // }

                      // }
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
                      error={!_.isEmpty(subjectRegErrors.FIRST_NAME)}
                      helperText={t(subjectRegErrors.FIRST_NAME)}
                      name="firstName"
                      value={props.subject.firstName}
                      onChange={e => {
                        props.updateSubject("firstName", e.target.value);
                        props.subject.setFirstName(e.target.value);
                        setValidationResultToError(props.subject.validateFirstName());
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

                  <RelativeLink
                    to="form"
                    params={{
                      type: props.subject.subjectType.name,
                      from: props.location.pathname + props.location.search
                    }}
                    noUnderline
                  >
                    <Chip
                      className={classes.nextBtn}
                      label={t("next")}
                      onClick={e => handleNext(e)}
                    />
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
  getSubjectProfile,
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
  obsHolder:
    state.dataEntry.registration.subject &&
    new ObservationsHolder(state.dataEntry.registration.subject.observations),
  observations:
    state.dataEntry.registration.subject && state.dataEntry.registration.subject.observations,
  //title: `${state.dataEntry.registration.subject.subjectType.name} Registration`,
  saved: state.dataEntry.registration.saved,
  subject: state.dataEntry.registration.subject,
  onSaveGoto: "/app/search",
  validationResults: state.dataEntry.registration.validationResults
});

const mapFormDispatchToProps = {
  updateObs,
  onSave: saveSubject
};

const RegistrationForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(FormWizard)
);

const SubjectRegister = props => {
  const classes = useStyles();
  const match = props.match;
  const edit = match.path === "/app/editSubject";

  React.useEffect(() => {
    (async function fetchData() {
      if (edit) {
        const subjectUuid = props.match.queryParams.uuid;
        await props.getSubjectProfile(subjectUuid);
      } else {
        await props.onLoad(props.match.queryParams.type);
      }
      props.saveCompleteFalse();
      if (!disableSession) {
        let subject = BrowserStore.fetchSubject();
        if (subject) props.setSubject(subject);
      }
    })();
  }, []);

  return (
    <Fragment>
      <Breadcrumbs path={props.match.path} />
      <Paper className={classes.root}>
        <Stepper />
        <Route exact path={`${match.path}`} component={() => <ConnectedDefaultPage />} />
        <Route path={`${match.path}/form`} component={() => <RegistrationForm />} />
      </Paper>
    </Fragment>
  );
};

const mapRegisterDispatchToProps = {
  onLoad,
  setSubject,
  getSubjectProfile,
  saveCompleteFalse
};

export default withRouter(
  withParams(
    connect(
      null,
      mapRegisterDispatchToProps
    )(SubjectRegister)
  )
);
