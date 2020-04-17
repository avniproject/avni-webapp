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
import { getSubjectProfile } from "../../reducers/subjectDashboardReducer";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { getGenders } from "../../reducers/metadataReducer";
import { get, sortBy } from "lodash";
import { LineBreak, RelativeLink, withParams } from "../../../common/components/utils";
import { DateOfBirth } from "../../components/DateOfBirth";
import { CodedFormElement } from "../../components/CodedFormElement";
import PagenatorButton from "../../components/PagenatorButton";
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
  const [firstnameerrormsg, setFirstnamemsg] = React.useState("");
  const [lastnameerrormsg, setLastnamemsg] = React.useState("");
  // console.log(props);

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
                {/* <Typography
                  className={classes.caption}
                  variant="caption"
                  display="block"
                  gutterBottom
                >
                  {" "}
                  {t("date")} of {t("registration")}{" "}
                </Typography> */}
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    style={{ width: "30%" }}
                    margin="normal"
                    id="date-picker-dialog"
                    format="MM/dd/yyyy"
                    name="registrationDate"
                    label={t("Date of registration")}
                    value={new Date(props.subject.registrationDate)}
                    onChange={date => {
                      props.updateSubject("registrationDate", new Date(date));
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
                      style={{ width: "30%" }}
                      label={t("firstName")}
                      type="text"
                      autoComplete="off"
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
                      label={t("lastName")}
                      type="text"
                      autoComplete="off"
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
                      markVerified={verified =>
                        props.updateSubject("dateOfBirthVerified", verified)
                      }
                    />
                    <LineBreak num={1} />
                    <CodedFormElement
                      groupName={t("gender")}
                      items={sortBy(props.genders, "name")}
                      isChecked={item => item && get(props, "subject.gender.uuid") === item.uuid}
                      onChange={selected => props.updateSubject("gender", selected)}
                    />
                    <LineBreak num={1} />
                    <label className={classes.villagelabel}>{t("Village")}</label>
                    <LocationAutosuggest
                      selectedVillage={props.subject.lowestAddressLevel.name}
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
