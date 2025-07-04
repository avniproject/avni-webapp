import { useEffect, Fragment } from "react";
import { styled } from "@mui/material/styles";
import { withRouter } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import { Paper, Typography } from "@mui/material";
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(4),
  flexGrow: 1,
  elevation: 2
}));

const StyledTypography = styled(Typography)({
  marginBottom: 8
});

const StyledErrorSpan = styled("span")({
  color: "#f44336",
  fontFamily: "Roboto",
  fontWeight: 400,
  fontSize: "0.75rem"
});

const SubjectRegister = props => {
  const { t } = useTranslation();
  const match = props.match;
  const edit = match.path === "/app/editSubject";
  const orgConfig = useSelector(selectOrganisationConfig);

  useEffect(() => {
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
          {error && <StyledErrorSpan>{t(error.messageKey)}</StyledErrorSpan>}
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
      <StyledPaper>
        <div>
          <StyledTypography variant="h6">
            {t("register")} {t(props.subject.subjectType.name)}
          </StyledTypography>
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
      </StyledPaper>
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
