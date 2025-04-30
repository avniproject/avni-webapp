import React, { Fragment } from "react";
import { withRouter } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import { Paper, Typography } from "@material-ui/core";
import { AddressLevel, Individual } from "avni-models";
import {
  fetchRegistrationRulesResponse,
  getRegistrationForm,
  onLoad,
  onLoadEdit,
  saveCompleteFalse,
  saveSubject,
  selectAddressLevelType,
  selectRegistrationState,
  setAddress,
  setDateOfBirth,
  setFirstName,
  setGender,
  setLastName,
  setMiddleName,
  setProfilePictureFile,
  setRegistrationDate,
  setRemoveProfilePicture,
  setSubject,
  setValidationResults,
  updateSubject
} from "dataEntryApp/reducers/registrationReducer";
import { getGenders } from "../../reducers/metadataReducer";
import _, { find, get, isEmpty, sortBy } from "lodash";
import { LineBreak, withParams } from "../../../common/components/utils";
import { DateOfBirth } from "../../components/DateOfBirth";
import { CodedFormElement } from "../../components/CodedFormElement";
import { makeStyles } from "@material-ui/core/styles";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { useTranslation } from "react-i18next";
import RadioButtonsGroup from "dataEntryApp/components/RadioButtonsGroup";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";
import RegistrationForm from "./RegistrationForm";
import { DateFormElement } from "dataEntryApp/components/DateFormElement";
import TextFormElement from "dataEntryApp/components/TextFormElement";
import StaticFormElement from "dataEntryApp/views/viewmodel/StaticFormElement";
import commonFormUtil from "dataEntryApp/reducers/commonFormUtil";
import { AvniImageUpload } from "../../../common/components/AvniImageUpload";
import HierarchicalLocationSelect from "../../components/HierarchicalLocationSelect";
import LocationSelect from "../../components/LocationSelect";
import { selectOrganisationConfig } from "../../sagas/selectors";

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
  const orgConfig = useSelector(selectOrganisationConfig);

  React.useEffect(() => {
    if (edit) {
      const subjectUuid = props.match.queryParams.uuid;
      props.onLoadEdit(subjectUuid);
    } else {
      props.onLoad(props.match.queryParams.type);
    }
  }, [match.queryParams.type]);

  const loaded = props.loaded;

  const dobError = commonFormUtil.getValidationResult(props.validationResults, Individual.validationKeys.DOB);

  const genderError = commonFormUtil.getValidationResult(props.validationResults, Individual.validationKeys.GENDER);

  function renderAddress() {
    const { customRegistrationLocations = {}, addressLevelTypes, subject: { subjectType: { uuid } = null } = {} } = props;
    const customRegistrationLocation =
      !isEmpty(customRegistrationLocations) && find(customRegistrationLocations, ({ subjectTypeUUID }) => subjectTypeUUID === uuid);
    const addressLevelTypesToRender =
      isEmpty(customRegistrationLocation) || isEmpty(customRegistrationLocation.addressLevels)
        ? addressLevelTypes
        : customRegistrationLocation.addressLevels;

    const error = commonFormUtil.getValidationResult(props.validationResults, Individual.validationKeys.LOWEST_ADDRESS_LEVEL);
    const showRequired = props.subject.subjectType.allowEmptyLocation ? "" : "*";
    return (
      <>
        <LineBreak num={1} />
        <RadioButtonsGroup
          label={`${t("Address")}${showRequired}`}
          items={addressLevelTypesToRender.map(a => ({ id: a.id, name: a.name, level: a.level }))}
          value={props.selectedAddressLevelType.id}
          onChange={item => props.selectAddressLevelType(item)}
        />
        <div>
          {props.selectedAddressLevelType.id === -1 ? null : (
            <div>
              {orgConfig.settings.showHierarchicalLocation ? (
                <HierarchicalLocationSelect
                  selectedLocation={props.subject.lowestAddressLevel}
                  onSelect={location => {
                    props.setAddress(
                      AddressLevel.create({
                        name: location.title,
                        uuid: location.uuid,
                        title: location.title,
                        level: location.level,
                        typeString: location.typeString,
                        titleLineage: location.titleLineage
                      })
                    );
                  }}
                  minLevelTypeId={props.selectedAddressLevelType.id}
                />
              ) : (
                <LocationSelect
                  selectedLocation={props.subject.lowestAddressLevel}
                  onSelect={location => {
                    props.setAddress(
                      AddressLevel.create({
                        name: location.title,
                        uuid: location.uuid,
                        title: location.title,
                        level: location.level,
                        typeString: location.typeString,
                        titleLineage: location.titleLineage
                      })
                    );
                  }}
                  placeholder={props.selectedAddressLevelType.name}
                  typeId={props.selectedAddressLevelType.id}
                />
              )}
            </div>
          )}
          {error && <span className={classes.errmsg}>{t(error.messageKey)}</span>}
        </div>
      </>
    );
  }

  function renderProfilePicture() {
    return (
      props.subject.subjectType.allowProfilePicture && (
        <Fragment>
          <AvniImageUpload
            onSelect={props.setProfilePictureFile}
            label={t("profilePicture")}
            toolTipKey={"APP_DESIGNER_PROFILE_PICTURE_ICON"}
            width={75}
            height={75}
            oldImgUrl={props.subject.profilePicture}
            onDelete={() => props.setRemoveProfilePicture(true)}
            displayDelete={true}
          />
          <LineBreak num={2} />
        </Fragment>
      )
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
          <LineBreak num={2} />
          <div>
            {props.subject && (
              <RegistrationForm fetchRulesResponse={fetchRegistrationRulesResponse}>
                <DateFormElement
                  uuid={Individual.validationKeys.REGISTRATION_DATE}
                  formElement={new StaticFormElement("registrationDate", true, true)}
                  value={props.subject.registrationDate || ""}
                  validationResults={props.validationResults}
                  update={props.setRegistrationDate}
                />

                <LineBreak num={3} />
                {props.subject.subjectType.isPerson() && (
                  <>
                    <TextFormElement
                      uuid={Individual.validationKeys.FIRST_NAME}
                      formElement={new StaticFormElement("firstName", true, true)}
                      value={props.subject.firstName}
                      validationResults={props.validationResults}
                      update={props.setFirstName}
                      helpText={get(props.subject, "subjectType.nameHelpText")}
                    />
                    <LineBreak num={2} />
                    {props.subject.subjectType.allowMiddleName && (
                      <>
                        <TextFormElement
                          uuid={Individual.validationKeys.MIDDLE_NAME}
                          formElement={new StaticFormElement("middleName", false, true)}
                          value={props.subject.middleName}
                          validationResults={props.validationResults}
                          update={props.setMiddleName}
                        />
                        <LineBreak num={2} />
                      </>
                    )}
                    <TextFormElement
                      uuid={Individual.validationKeys.LAST_NAME}
                      formElement={new StaticFormElement("lastName", !props.subject.subjectType.lastNameOptional, true)}
                      value={props.subject.lastName}
                      validationResults={props.validationResults}
                      update={props.setLastName}
                    />
                    <LineBreak num={2} />
                    {renderProfilePicture()}
                    <DateOfBirth
                      dateOfBirth={props.subject.dateOfBirth || null}
                      dobErrorMsg={dobError ? dobError.messageKey : ""}
                      onChange={date => {
                        const dateOfBirth = _.isNil(date) ? undefined : new Date(date);
                        props.setDateOfBirth(dateOfBirth);
                      }}
                    />
                    <LineBreak num={2} />
                    <CodedFormElement
                      name={t("gender")}
                      items={sortBy(props.genders, "name")}
                      isChecked={item => item && get(props, "subject.gender.uuid") === item.uuid}
                      mandatory={true}
                      errorMsg={genderError ? genderError.messageKey : ""}
                      onChange={selected => {
                        props.setGender(selected);
                      }}
                    />
                    <LineBreak num={2} />
                    {renderAddress()}
                  </>
                )}
                {!props.subject.subjectType.isPerson() && (
                  <>
                    <TextFormElement
                      uuid={Individual.validationKeys.FIRST_NAME}
                      formElement={new StaticFormElement("name", true, true)}
                      value={props.subject.firstName}
                      validationResults={props.validationResults}
                      update={props.setFirstName}
                      helpText={get(props.subject, "subjectType.nameHelpText")}
                    />
                    <LineBreak num={1} />
                    {renderProfilePicture()}
                    {renderAddress()}
                  </>
                )}
                <LineBreak num={2} />
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
    user: state.app.authSession,
    genders: state.dataEntry.metadata.genders,
    addressLevelTypes: state.dataEntry.metadata.operationalModules.addressLevelTypes,
    customRegistrationLocations: state.dataEntry.metadata.operationalModules.customRegistrationLocations,
    subject: registrationState.subject,
    loaded: registrationState.loaded,
    saved: registrationState.saved,
    selectedAddressLevelType: registrationState.selectedAddressLevelType,
    validationResults: registrationState.validationResults
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
  onLoadEdit,
  setRegistrationDate,
  setFirstName,
  setMiddleName,
  setLastName,
  setProfilePictureFile,
  setRemoveProfilePicture,
  setDateOfBirth,
  setGender,
  setAddress
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(SubjectRegister)
  )
);
