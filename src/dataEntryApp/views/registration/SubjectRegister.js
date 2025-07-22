import { useEffect, Fragment } from "react";
import { styled } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
import { Paper, Typography } from "@mui/material";
import { AddressLevel, Individual } from "avni-models";
import {
  fetchRegistrationRulesResponse,
  onLoad,
  onLoadEdit,
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
  setRemoveProfilePicture
} from "dataEntryApp/reducers/registrationReducer";
import _, { find, get, isEmpty, sortBy } from "lodash";
import { LineBreak } from "../../../common/components/utils";
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

const SubjectRegister = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const orgConfig = useSelector(selectOrganisationConfig);
  const registrationState = useSelector(selectRegistrationState);
  const user = useSelector(state => state.app.authSession);
  const genders = useSelector(state => state.dataEntry.metadata.genders);
  const addressLevelTypes = useSelector(state => state.dataEntry.metadata.operationalModules.addressLevelTypes);
  const customRegistrationLocations = useSelector(state => state.dataEntry.metadata.operationalModules.customRegistrationLocations);

  const { subject, loaded, saved, selectedAddressLevelType, validationResults } = registrationState;

  const isEdit = location.pathname === "/app/editSubject";
  const subjectTypeParam = searchParams.get("type");
  const subjectUuid = searchParams.get("uuid");

  useEffect(() => {
    if (isEdit) {
      dispatch(onLoadEdit(subjectUuid));
    } else {
      dispatch(onLoad(subjectTypeParam));
    }
  }, [dispatch, isEdit, subjectUuid, subjectTypeParam]);

  const dobError = commonFormUtil.getValidationResult(validationResults, Individual.validationKeys.DOB);
  const genderError = commonFormUtil.getValidationResult(validationResults, Individual.validationKeys.GENDER);

  function renderAddress() {
    const { uuid } = subject?.subjectType || {};
    const customRegistrationLocation =
      !isEmpty(customRegistrationLocations) && find(customRegistrationLocations, ({ subjectTypeUUID }) => subjectTypeUUID === uuid);
    const addressLevelTypesToRender =
      isEmpty(customRegistrationLocation) || isEmpty(customRegistrationLocation.addressLevels)
        ? addressLevelTypes
        : customRegistrationLocation.addressLevels;

    const error = commonFormUtil.getValidationResult(validationResults, Individual.validationKeys.LOWEST_ADDRESS_LEVEL);
    const showRequired = subject.subjectType.allowEmptyLocation ? "" : "*";
    return (
      <>
        <LineBreak num={1} />
        <RadioButtonsGroup
          label={`${t("Address")}${showRequired}`}
          items={addressLevelTypesToRender.map(a => ({ id: a.id, name: a.name, level: a.level }))}
          value={selectedAddressLevelType.id}
          onChange={item => dispatch(selectAddressLevelType(item))}
        />
        {selectedAddressLevelType && selectedAddressLevelType.id !== -1 && (
          <>
            <LineBreak num={1} />
            {orgConfig.organisationConfig &&
            orgConfig.organisationConfig.settings &&
            orgConfig.organisationConfig.settings.showHierarchicalLocation ? (
              <HierarchicalLocationSelect
                selectedAddressLevelType={selectedAddressLevelType}
                onSelect={location =>
                  dispatch(
                    setAddress(
                      AddressLevel.create({
                        name: location.title,
                        uuid: location.uuid,
                        title: location.title,
                        level: location.level,
                        typeString: location.typeString,
                        titleLineage: location.titleLineage
                      })
                    )
                  )
                }
                selectedLocation={subject.lowestAddressLevel}
                minLevelTypeId={selectedAddressLevelType.id}
              />
            ) : (
              <LocationSelect
                selectedAddressLevelType={selectedAddressLevelType}
                onSelect={location =>
                  dispatch(
                    setAddress(
                      AddressLevel.create({
                        name: location.title,
                        uuid: location.uuid,
                        title: location.title,
                        level: location.level,
                        typeString: location.typeString,
                        titleLineage: location.titleLineage
                      })
                    )
                  )
                }
                selectedLocation={subject.lowestAddressLevel}
                placeholder={selectedAddressLevelType.name}
                typeId={selectedAddressLevelType.id}
              />
            )}
            {error && <StyledErrorSpan>{t(error.messageKey)}</StyledErrorSpan>}
          </>
        )}
      </>
    );
  }

  function renderProfilePicture() {
    return (
      subject.subjectType.allowProfilePicture && (
        <Fragment>
          <AvniImageUpload
            onSelect={file => dispatch(setProfilePictureFile(file))}
            label={t("profilePicture")}
            toolTipKey={"APP_DESIGNER_PROFILE_PICTURE_ICON"}
            width={75}
            height={75}
            oldImgUrl={subject.profilePicture}
            onDelete={() => dispatch(setRemoveProfilePicture(true))}
            displayDelete={true}
          />
          <LineBreak num={2} />
        </Fragment>
      )
    );
  }

  return loaded ? (
    <Fragment>
      <Breadcrumbs path={location.pathname} />
      <StyledPaper>
        <StyledTypography variant="h5">{isEdit ? t("editSubject") : t("newSubject")}</StyledTypography>
        <RegistrationForm fetchRulesResponse={fetchRegistrationRulesResponse}>
          <DateFormElement
            uuid={Individual.validationKeys.REGISTRATION_DATE}
            formElement={new StaticFormElement(t("registrationDate"), true, true)}
            value={subject.registrationDate}
            validationResults={validationResults}
            update={date => dispatch(setRegistrationDate(date))}
          />
          <LineBreak num={1} />
          {subject.subjectType.isPerson() && (
            <>
              <TextFormElement
                uuid={Individual.validationKeys.FIRST_NAME}
                formElement={new StaticFormElement(t("firstName"), true, true)}
                value={subject.firstName}
                validationResults={validationResults}
                update={event => dispatch(setFirstName(event.target.value))}
                helpText={get(subject, "subjectType.nameHelpText")}
              />
              <LineBreak num={1} />
              <TextFormElement
                uuid={Individual.validationKeys.MIDDLE_NAME}
                formElement={new StaticFormElement(t("middleName"), false, true)}
                value={subject.middleName}
                validationResults={validationResults}
                update={event => dispatch(setMiddleName(event.target.value))}
              />
              <LineBreak num={1} />
              <TextFormElement
                uuid={Individual.validationKeys.LAST_NAME}
                formElement={new StaticFormElement(t("lastName"), true, true)}
                value={subject.lastName}
                validationResults={validationResults}
                update={event => dispatch(setLastName(event.target.value))}
              />
              <LineBreak num={1} />
              {renderProfilePicture()}
              <DateOfBirth
                dateOfBirth={subject.dateOfBirth || null}
                dobErrorMsg={dobError ? dobError.messageKey : ""}
                onChange={date => {
                  const dateOfBirth = _.isNil(date) ? undefined : new Date(date);
                  dispatch(setDateOfBirth(dateOfBirth));
                }}
              />
              {dobError && <StyledErrorSpan>{t(dobError.messageKey, dobError.extra)}</StyledErrorSpan>}
              <LineBreak num={1} />
              <CodedFormElement
                groupName="Gender"
                items={sortBy(genders, "name")}
                isChecked={item => item.name === subject.gender}
                onChange={value => dispatch(setGender(value))}
                validationResult={genderError}
                mandatory={true}
              />
              {genderError && <StyledErrorSpan>{t(genderError.messageKey, genderError.extra)}</StyledErrorSpan>}
              <LineBreak num={2} />
              {renderAddress()}
            </>
          )}
          {!subject.subjectType.isPerson() && (
            <>
              <TextFormElement
                uuid={Individual.validationKeys.FIRST_NAME}
                formElement={new StaticFormElement("name", true, true)}
                value={subject.firstName}
                validationResults={validationResults}
                update={event => dispatch(setFirstName(event.target.value))}
                helpText={get(subject, "subjectType.nameHelpText")}
              />
              <LineBreak num={1} />
              {renderProfilePicture()}
              {renderAddress()}
            </>
          )}
          {subject.subjectType.isPerson() && renderProfilePicture()}
        </RegistrationForm>
      </StyledPaper>
    </Fragment>
  ) : (
    <CustomizedBackdrop load={false} />
  );
};

export default SubjectRegister;
