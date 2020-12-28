import React, { Fragment } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { TextField, Typography, Paper } from "@material-ui/core";
import { AddressLevel } from "avni-models";
import {
  getRegistrationForm,
  onLoad,
  saveSubject,
  updateSubject,
  setSubject,
  saveCompleteFalse,
  setValidationResults,
  selectAddressLevelType,
  onLoadEdit
} from "../../reducers/registrationReducer";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { getGenders } from "../../reducers/metadataReducer";
import _, { get, sortBy, isEmpty, find } from "lodash";
import { LineBreak, withParams } from "../../../common/components/utils";
import { DateOfBirth } from "../../components/DateOfBirth";
import { CodedFormElement } from "../../components/CodedFormElement";
import LocationSelect from "dataEntryApp/components/LocationSelect";
import { makeStyles } from "@material-ui/core/styles";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { useTranslation } from "react-i18next";
import RadioButtonsGroup from "dataEntryApp/components/RadioButtonsGroup";
import {
  fetchRegistrationRulesResponse,
  selectRegistrationState
} from "dataEntryApp/reducers/registrationReducer";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";
import { dateFormat } from "dataEntryApp/constants";
import RegistrationForm from "./RegistrationForm";

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
    color: "#f44336",
    "font-family": "Roboto",
    "font-weight": 400,
    "font-size": "0.75rem"
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
  },
  noUnderline: {
    "&:hover, &:focus": {
      textDecoration: "none"
    }
  },
  lableStyle: {
    width: "50%",
    marginBottom: 10,
    color: "rgba(0, 0, 0, 0.54)"
  }
}));

const SubjectRegister = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const match = props.match;
  const edit = match.path === "/app/editSubject";

  React.useEffect(() => {
    if (edit) {
      const subjectUuid = props.match.queryParams.uuid;
      props.onLoadEdit(subjectUuid);
    } else {
      props.onLoad(props.match.queryParams.type);
    }
  }, [match.queryParams.type]);

  const loaded = props.loaded;
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

  function renderAddress() {
    const {
      customRegistrationLocations = {},
      addressLevelTypes,
      subject: { subjectType: { uuid } = null } = {}
    } = props;
    const customRegistrationLocation =
      !isEmpty(customRegistrationLocations) &&
      find(customRegistrationLocations, ({ subjectTypeUUID }) => subjectTypeUUID === uuid);
    const addressLevelTypesToRender =
      isEmpty(customRegistrationLocation) || isEmpty(customRegistrationLocation.addressLevels)
        ? addressLevelTypes
        : customRegistrationLocation.addressLevels;
    return (
      <>
        <LineBreak num={1} />
        <RadioButtonsGroup
          label={`${t("Address")}*`}
          items={addressLevelTypesToRender.map(a => ({ id: a.id, name: a.name }))}
          value={props.selectedAddressLevelType.id}
          onChange={item => props.selectAddressLevelType(item)}
        />
        <div>
          {props.selectedAddressLevelType.id === -1 ? null : (
            <div>
              <LocationSelect
                selectedLocation={props.subject.lowestAddressLevel.name || ""}
                errorMsg={subjectRegErrors.LOWEST_ADDRESS_LEVEL}
                onSelect={location => {
                  props.updateSubject(
                    "lowestAddressLevel",
                    AddressLevel.create({
                      uuid: location.uuid,
                      title: location.name,
                      level: location.level,
                      typeString: location.type
                    })
                  );
                  props.subject.lowestAddressLevel = AddressLevel.create({
                    uuid: location.uuid,
                    title: location.name,
                    level: location.level,
                    typeString: location.type
                  });
                }}
                subjectProps={props}
                placeholder={props.selectedAddressLevelType.name}
                typeId={props.selectedAddressLevelType.id}
              />
            </div>
          )}
          {subjectRegErrors.LOWEST_ADDRESS_LEVEL && (
            <span className={classes.errmsg}>{t(subjectRegErrors.LOWEST_ADDRESS_LEVEL)}</span>
          )}
        </div>
      </>
    );
  }

  return loaded ? (
    <Fragment>
      <Breadcrumbs path={props.match.path} />
      <Paper className={classes.root}>
        <div>
          <Typography variant="h6" gutterBottom>
            {t("register")} {t(props.subject.subjectType.name)}
          </Typography>
          <LineBreak num={1} />
          <div>
            {props.subject && (
              <RegistrationForm fetchRulesResponse={fetchRegistrationRulesResponse}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                    {t("registrationDate")}
                    {"*"}
                  </Typography>
                  <KeyboardDatePicker
                    autoComplete="off"
                    required
                    name="registrationDate"
                    value={
                      _.isNil(props.subject.registrationDate) ? "" : props.subject.registrationDate
                    }
                    error={!_.isEmpty(subjectRegErrors.REGISTRATION_DATE)}
                    helperText={t(subjectRegErrors.REGISTRATION_DATE)}
                    style={{ width: "30%" }}
                    margin="normal"
                    id="Date-of-registration"
                    format={dateFormat}
                    placeholder={dateFormat}
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
                {props.subject.subjectType.isPerson() && (
                  <>
                    <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                      {t("firstName")}
                      {"*"}
                    </Typography>
                    <TextField
                      id={"firstName"}
                      type="text"
                      autoComplete="off"
                      required
                      name="firstName"
                      value={props.subject.firstName || ""}
                      error={!_.isEmpty(subjectRegErrors.FIRST_NAME)}
                      helperText={t(subjectRegErrors.FIRST_NAME)}
                      style={{ width: "30%" }}
                      onChange={e => {
                        props.updateSubject("firstName", e.target.value);
                        props.subject.setFirstName(e.target.value);
                        setValidationResultToError(props.subject.validateFirstName());
                      }}
                    />
                    <LineBreak num={1} />
                    <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                      {t("lastName")}
                      {"*"}
                    </Typography>
                    <TextField
                      id={"lastName"}
                      type="text"
                      autoComplete="off"
                      required
                      name="lastName"
                      value={props.subject.lastName || ""}
                      error={!_.isEmpty(subjectRegErrors.LAST_NAME)}
                      helperText={t(subjectRegErrors.LAST_NAME)}
                      style={{ width: "30%" }}
                      onChange={e => {
                        props.updateSubject("lastName", e.target.value);
                        props.subject.setLastName(e.target.value);
                        setValidationResultToError(props.subject.validateLastName());
                      }}
                    />
                    <LineBreak num={1} />
                    <DateOfBirth
                      dateOfBirth={props.subject.dateOfBirth || null}
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
                      name={t("gender")}
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
                    {renderAddress()}
                  </>
                )}

                {!props.subject.subjectType.isPerson() && (
                  <>
                    <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                      {t("name")}
                    </Typography>
                    <TextField
                      type="text"
                      autoComplete="off"
                      required
                      error={!_.isEmpty(subjectRegErrors.FIRST_NAME)}
                      helperText={t(subjectRegErrors.FIRST_NAME)}
                      name="firstName"
                      value={props.subject.firstName}
                      style={{ width: "30%" }}
                      onChange={e => {
                        props.updateSubject("firstName", e.target.value);
                        props.subject.setFirstName(e.target.value);
                        setValidationResultToError(props.subject.validateFirstName());
                      }}
                    />
                    {renderAddress()}
                  </>
                )}
                <LineBreak num={1} />
              </RegistrationForm>
            )}
          </div>
        </div>
      </Paper>
    </Fragment>
  ) : (
    <CustomizedBackdrop load={false} />
  );
};

const mapStateToProps = state => {
  const registrationState = selectRegistrationState(state);
  return {
    user: state.app.user,
    genders: state.dataEntry.metadata.genders,
    addressLevelTypes: state.dataEntry.metadata.operationalModules.addressLevelTypes,
    customRegistrationLocations:
      state.dataEntry.metadata.operationalModules.customRegistrationLocations,
    subject: registrationState.subject,
    loaded: registrationState.loaded,
    saved: registrationState.saved,
    selectedAddressLevelType: registrationState.selectedAddressLevelType
  };
};

const mapDispatchToProps = {
  getRegistrationForm,
  updateSubject,
  getGenders,
  saveSubject,
  onLoad,
  setSubject,
  saveCompleteFalse,
  setValidationResults,
  selectAddressLevelType,
  onLoadEdit
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(SubjectRegister)
  )
);
