import _, { filter, get, isEmpty, isFinite, isNil, map, some, startCase, sortBy } from "lodash";
import React, { cloneElement, Fragment, useContext, useEffect, useState } from "react";
import {
  ArrayField,
  ArrayInput,
  Create,
  ChipField,
  Datagrid,
  DisabledInput,
  Edit,
  EditButton,
  FormDataConsumer,
  FunctionField,
  List,
  REDUX_FORM_NAME,
  ReferenceArrayInput,
  ReferenceField,
  ReferenceInput,
  required,
  SelectArrayInput,
  SelectInput,
  Show,
  SimpleForm,
  SimpleFormIterator,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  TextInput
} from "react-admin";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import { change } from "redux-form";
import { CatchmentSelectInput } from "./components/CatchmentSelectInput";
import { LineBreak } from "../common/components/utils";
import { datePickerModes, localeChoices, timePickerModes } from "../common/constants";
import EnableDisableButton from "./components/EnableDisableButton";
import http, { httpClient } from "common/utils/httpClient";
import {
  CustomToolbar,
  isRequired,
  mobileNumberFormatter,
  mobileNumberParser,
  UserFilter,
  UserTitle,
  validateEmail,
  validatePassword,
  validatePasswords,
  validatePhone
} from "./UserHelper";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { ToolTipContainer } from "../common/components/ToolTipContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import { AvniBooleanInput } from "./components/AvniBooleanInput";
import { AvniRadioButtonGroupInput } from "../common/components/AvniRadioButtonGroupInput";
import { Paper } from "@material-ui/core";
import { createdAudit, modifiedAudit } from "./components/AuditUtil";
import ResetPasswordButton from "./components/ResetPasswordButton";
import { AvniPasswordInput } from "./components/AvniPasswordInput";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import ConceptService from "../common/service/ConceptService";
import Select from "react-select";
import ReactSelectHelper from "../common/utils/ReactSelectHelper";
import IdpDetails from "../rootApp/security/IdpDetails";
import OrgManagerContext from "./OrgManagerContext";

export const UserCreate = ({ user, organisation, userInfo, ...props }) => (
  <Paper>
    <DocumentationContainer filename={"User.md"}>
      <Create {...props}>
        <UserForm user={user} nameSuffix={userInfo.usernameSuffix} />
      </Create>
    </DocumentationContainer>
  </Paper>
);

export const UserEdit = ({ ...props }) => (
  <Edit {...props} title={<UserTitle titlePrefix="Edit" />} undoable={false}>
    <UserForm edit />
  </Edit>
);

const UserGroupsDisplay = ({ record, style }) => (
  <div style={style}>
    {_.isArrayLike(record.userGroups) &&
      record.userGroups
        .filter(ug => ug && !ug.voided)
        .map(userGroup => (
          <Chip style={{ margin: "0.2em" }} label={userGroup.groupName} key={userGroup.groupName} />
        ))}
  </div>
);

export const StringToLabelObject = ({ record, children, ...rest }) =>
  cloneElement(children, {
    record: { label: record },
    ...rest
  });

export const UserList = ({ ...props }) => {
  const { organisation } = useContext(OrgManagerContext);
  return (
    <List
      {...props}
      bulkActions={false}
      filter={{ organisationId: organisation.id }}
      filters={<UserFilter />}
      title={`${organisation.name} Users`}
    >
      <Datagrid rowClick="show">
        <TextField label="Login ID" source="username" />
        <TextField source="name" label="Name of the Person" />
        <ReferenceField
          label="Catchment"
          source="catchmentId"
          reference="catchment"
          linkType="show"
          allowEmpty
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField source="email" label="Email Address" />
        <TextField source="phoneNumber" label="Phone Number" />
        <UserGroupsDisplay style={{ maxWidth: "40em" }} label="User Groups" />
        <FunctionField
          label="Status"
          render={user =>
            user.voided === true
              ? "Deleted"
              : user.disabledInCognito === true
              ? "Disabled"
              : "Active"
          }
        />
      </Datagrid>
    </List>
  );
};

const CustomShowActions = ({ hasEditUserPrivilege, basePath, data, resource }) => {
  return (
    (data && (
      <CardActions style={{ zIndex: 2, display: "flex", float: "right", flexDirection: "row" }}>
        {hasEditUserPrivilege && (
          <Fragment>
            <EditButton label="Edit User" basePath={basePath} record={data} />
            <ResetPasswordButton basePath={basePath} record={data} resource={resource} />
            <EnableDisableButton
              disabled={data.disabledInCognito}
              basePath={basePath}
              record={data}
              resource={resource}
            />
          </Fragment>
        )}
      </CardActions>
    )) ||
    null
  );
};

const formatOperatingScope = opScope => opScope && opScope.replace(/^By/, "");

const formatLang = lang =>
  localeChoices
    .filter(local => local.id === lang)
    .map(lang => lang.name)
    .join("");

const SubjectTypeSyncAttributeShow = ({ subjectType, syncConceptValueMap, ...props }) => (
  <div style={{ marginTop: 8, padding: 10, border: "3px solid rgba(0, 0, 0, 0.05)" }}>
    <Typography gutterBottom variant={"subtitle1"}>{`Sync settings for Subject Type: ${
      subjectType.name
    }`}</Typography>
    {subjectType.syncAttribute1 && (
      <ConceptSyncAttributeShow
        subjectType={subjectType}
        syncAttributeName={"syncAttribute1"}
        syncConceptValueMap={syncConceptValueMap}
        {...props}
      />
    )}
    {subjectType.syncAttribute2 && (
      <ConceptSyncAttributeShow
        subjectType={subjectType}
        syncAttributeName={"syncAttribute2"}
        syncConceptValueMap={syncConceptValueMap}
        {...props}
      />
    )}
  </div>
);

const ConceptSyncAttributeShow = ({
  subjectType,
  syncConceptValueMap,
  syncAttributeName,
  ...props
}) => {
  const syncSettings = get(props.record, ["syncSettings", subjectType.name], {});
  const conceptUUID = get(syncSettings, [syncAttributeName]);
  if (isEmpty(conceptUUID)) return null;

  return (
    <div>
      <span style={{ color: "rgba(0, 0, 0, 0.54)", fontSize: "12px", marginRight: 10 }}>
        {startCase(syncAttributeName)}
      </span>
      {map(get(syncSettings, `${syncAttributeName}Values`, []), value => (
        <Chip
          style={{ margin: "0.2em" }}
          label={syncConceptValueMap.get(value) || value}
          key={value}
        />
      ))}
    </div>
  );
};

export const UserDetail = ({ user, hasEditUserPrivilege, ...props }) => {
  const [syncAttributesData, setSyncAttributesData] = useState(initialSyncAttributes);
  fetchSyncAttributeData(setSyncAttributesData);

  return (
    <Show
      title={<UserTitle />}
      actions={<CustomShowActions hasEditUserPrivilege={hasEditUserPrivilege} user={user} />}
      {...props}
    >
      <SimpleShowLayout>
        <TextField source="username" label="Login ID (username)" />
        <TextField source="name" label="Name of the Person" />
        <TextField source="email" label="Email Address" />
        <TextField source="phoneNumber" label="Phone Number" />
        <ReferenceField
          label="Catchment"
          source="catchmentId"
          reference="catchment"
          linkType="show"
          allowEmpty
        >
          <TextField source="name" />
        </ReferenceField>
        <ArrayField style={{ maxWidth: "20em" }} label="User Groups" source="userGroupNames">
          <SingleFieldList linkType={false}>
            <StringToLabelObject>
              <ChipField source="label" />
            </StringToLabelObject>
          </SingleFieldList>
        </ArrayField>
        <FunctionField
          label="Operating Scope"
          render={user => formatOperatingScope(user.operatingIndividualScope)}
        />
        <LineBreak />
        {map(syncAttributesData.subjectTypes, st => (
          <SubjectTypeSyncAttributeShow
            subjectType={st}
            key={get(st, "name")}
            syncConceptValueMap={syncAttributesData.syncConceptValueMap}
          />
        ))}
        <FunctionField
          label="Preferred Language"
          render={user => (!isNil(user.settings) ? formatLang(user.settings.locale) : "")}
        />
        <FunctionField
          label="Date Picker Mode"
          render={user => (!isNil(user.settings) ? user.settings.datePickerMode : "Calendar")}
        />
        <FunctionField
          label="Time Picker Mode"
          render={user => (!isNil(user.settings) ? user.settings.timePickerMode : "Clock")}
        />
        <FunctionField
          label="Track Location"
          render={user =>
            !isNil(user.settings) ? (user.settings.trackLocation ? "True" : "False") : ""
          }
        />
        <FunctionField
          label="Beneficiary Mode"
          render={user =>
            !isNil(user.settings) ? (user.settings.showBeneficiaryMode ? "True" : "False") : ""
          }
        />
        <FunctionField
          label="Disable dashboard auto refresh"
          render={user =>
            !isNil(user.settings) ? (user.settings.disableAutoRefresh ? "True" : "False") : ""
          }
        />
        <FunctionField
          label="Disable auto sync"
          render={user =>
            !isNil(user.settings) ? (user.settings.disableAutoSync ? "True" : "False") : ""
          }
        />
        <FunctionField
          label="Register + Enrol"
          render={user =>
            !isNil(user.settings) ? (user.settings.registerEnrol ? "True" : "False") : ""
          }
        />
        <FunctionField
          label="Enable Call Masking"
          render={user =>
            !isNil(user.settings) ? (user.settings.enableCallMasking ? "True" : "False") : ""
          }
        />
        <TextField label="Identifier prefix" source="settings.idPrefix" />
        <FunctionField label="Created" render={audit => createdAudit(audit)} />
        <FunctionField label="Modified" render={audit => modifiedAudit(audit)} />
      </SimpleShowLayout>
    </Show>
  );
};

const operatingScopes = Object.freeze({
  NONE: "None",
  FACILITY: "ByFacility",
  CATCHMENT: "ByCatchment"
});

const catchmentChangeMessage = `Please ensure that the user has already synced all
data for their previous sync attributes. Changing sync attributes will ask the users to reset their sync.
This might take time depending on the data.`;

const SubjectTypeSyncAttributes = ({ subjectType, ...props }) => (
  <div style={{ marginTop: 8, padding: 10, border: "3px solid rgba(0, 0, 0, 0.05)" }}>
    <Typography gutterBottom variant={"h6"}>{`Sync settings for Subject Type: ${
      subjectType.name
    }`}</Typography>
    {subjectType.syncAttribute1 && (
      <ConceptSyncAttribute
        subjectType={subjectType}
        syncAttributeName={"syncAttribute1"}
        {...props}
      />
    )}
    {subjectType.syncAttribute2 && (
      <ConceptSyncAttribute
        subjectType={subjectType}
        syncAttributeName={"syncAttribute2"}
        {...props}
      />
    )}
  </div>
);

const ConceptSyncAttribute = ({ subjectType, syncAttributeName, edit, ...props }) => {
  return (
    <FormDataConsumer>
      {({ formData, dispatch }) => {
        const syncAttributeConceptUUID = get(
          formData,
          `syncSettings.${[subjectType.name]}.${syncAttributeName}`
        );
        const syncAttributeConcept = subjectType[syncAttributeName];
        const selectedValue = get(
          formData,
          `syncSettings.${[subjectType.name]}.${syncAttributeName}`
        );
        const defaultValue = selectedValue ? { defaultValue: selectedValue } : {};

        const [answerConcepts, setAnswerConcepts] = useState([]);
        const syncAttributeValuesFieldName = `syncSettings.${[
          subjectType.name
        ]}.${syncAttributeName}Values`;

        const selectedSyncAttributeValueIds = get(formData, syncAttributeValuesFieldName);
        const selectedAnswerConcepts = filter(answerConcepts, x =>
          some(selectedSyncAttributeValueIds, y => x.id === y)
        );

        useEffect(() => {
          if (isEmpty(syncAttributeConceptUUID)) setAnswerConcepts([]);
          else ConceptService.getAnswerConcepts(syncAttributeConceptUUID).then(setAnswerConcepts);
        }, [syncAttributeConceptUUID]);

        //TODO : workaround for the bug https://github.com/marmelab/react-admin/issues/3249
        //TODO : this should be removed after react-admin upgrade
        return (
          <Fragment>
            <Grid container alignItems={"center"}>
              <Grid item xs={3}>
                <SelectInput
                  resettable
                  source={`syncSettings.${[subjectType.name]}.${syncAttributeName}`}
                  label={startCase(syncAttributeName)}
                  choices={[subjectType[syncAttributeName]]}
                  onChange={(e, newVal) => {
                    if (newVal !== syncAttributeConceptUUID) {
                      alert(catchmentChangeMessage);
                      dispatch(change(REDUX_FORM_NAME, syncAttributeValuesFieldName, null));
                    }
                  }}
                  {...defaultValue}
                />
              </Grid>
              <Grid item xs={9}>
                {!isEmpty(syncAttributeConceptUUID) ? (
                  get(syncAttributeConcept, "dataType") === "Coded" ? (
                    <Select
                      isClearable
                      isSearchable
                      isMulti
                      value={selectedAnswerConcepts.map(ReactSelectHelper.toReactSelectItem)}
                      options={answerConcepts.map(ReactSelectHelper.toReactSelectItem)}
                      style={{ width: "auto" }}
                      onChange={event => {
                        const selectedValues = ReactSelectHelper.getCurrentValues(event).map(
                          x => x.id
                        );
                        dispatch(
                          change(REDUX_FORM_NAME, syncAttributeValuesFieldName, selectedValues)
                        );
                      }}
                    />
                  ) : (
                    <Fragment>
                      <div
                        style={{ color: "rgba(0, 0, 0, 0.54)", fontSize: "12px", marginTop: "5px" }}
                      >
                        {"Values to sync"}
                      </div>
                      <ArrayInput
                        source={`syncSettings.${[subjectType.name]}.${syncAttributeName}Values`}
                        label={""}
                        resettable
                      >
                        <SimpleFormIterator>
                          <TextInput
                            label={`${startCase(syncAttributeName)} Value`}
                            validate={isRequired}
                          />
                        </SimpleFormIterator>
                      </ArrayInput>
                    </Fragment>
                  )
                ) : null}
              </Grid>
            </Grid>
          </Fragment>
        );
      }}
    </FormDataConsumer>
  );
};

const initialSyncAttributes = { subjectTypes: [] };

const getSyncConceptValueMap = async sortedSubjectTypes => {
  const syncConceptValueMap = new Map();
  const codedConceptUUIDSet = new Set();
  sortedSubjectTypes.forEach(subject => {
    const syncAttribute1UUID =
      subject.syncAttribute1 &&
      subject.syncAttribute1.dataType === "Coded" &&
      subject.syncAttribute1.id;
    const syncAttribute2UUID =
      subject.syncAttribute2 &&
      subject.syncAttribute2.dataType === "Coded" &&
      subject.syncAttribute2.id;
    syncAttribute1UUID && codedConceptUUIDSet.add(syncAttribute1UUID);
    syncAttribute2UUID && codedConceptUUIDSet.add(syncAttribute2UUID);
  });

  for (const conceptUUID of codedConceptUUIDSet) {
    const content = await ConceptService.getAnswerConcepts(conceptUUID);
    content.forEach(val => {
      syncConceptValueMap.set(val.id, val.name);
    });
  }
  return syncConceptValueMap;
};

function fetchSyncAttributeData(setSyncAttributesData) {
  useEffect(() => {
    let isMounted = true;
    http.get("/subjectType/syncAttributesData").then(res => {
      const {
        subjectTypes,
        anySubjectTypeDirectlyAssignable,
        anySubjectTypeSyncByLocation
      } = res.data;
      const sortedSubjectTypes = sortBy(subjectTypes, "id");

      getSyncConceptValueMap(sortedSubjectTypes).then(syncConceptValueMap => {
        if (isMounted) {
          setSyncAttributesData({
            subjectTypes: sortedSubjectTypes,
            anySubjectTypeDirectlyAssignable,
            anySubjectTypeSyncByLocation,
            syncConceptValueMap
          });
        }
      });
    });
    return () => {
      isMounted = false;
    };
  }, []);
}

const UserForm = ({ edit, nameSuffix, ...props }) => {
  const [languages, setLanguages] = useState([]);
  const [syncAttributesData, setSyncAttributesData] = useState(initialSyncAttributes);
  const isSyncSettingsRequired =
    syncAttributesData.subjectTypes.length > 0 ||
    syncAttributesData.isAnySubjectTypeDirectlyAssignable;

  useEffect(() => {
    http.get("/organisationConfig").then(res => {
      const organisationLocales = isEmpty(res.data._embedded.organisationConfig)
        ? [localeChoices[0]]
        : filter(localeChoices, l =>
            res.data._embedded.organisationConfig[0].settings.languages.includes(l.id)
          );
      setLanguages(organisationLocales);
    });
  }, []);

  fetchSyncAttributeData(setSyncAttributesData);

  const sanitizeProps = ({ record, resource, save }) => ({
    record,
    resource,
    save
  });
  return (
    <SimpleForm
      toolbar={<CustomToolbar />}
      {...sanitizeProps(props)}
      redirect="show"
      validate={validatePasswords}
    >
      {edit ? (
        <DisabledInput source="username" label="Login ID (username)" />
      ) : (
        <FormDataConsumer>
          {({ formData, dispatch, ...rest }) => {
            return (
              <Fragment>
                <AvniTextInput
                  resettable
                  source="ignored"
                  validate={isRequired}
                  label={"Login ID (username)"}
                  onChange={(e, newVal) =>
                    !isEmpty(newVal) &&
                    dispatch(change(REDUX_FORM_NAME, "username", newVal + "@" + nameSuffix))
                  }
                  {...rest}
                  toolTipKey={"ADMIN_USER_USER_NAME"}
                >
                  <span>@{nameSuffix}</span>
                </AvniTextInput>
                {httpClient.idp.idpType === IdpDetails.cognito && formData.username && (
                  <AvniBooleanInput
                    source={"customPassword"}
                    style={{ marginTop: "1em" }}
                    label="Set a custom password. If custom password is not set, temporary password will be first 4 characters of username and last 4 characters of phone number."
                    onChange={(e, newVal) => {
                      if (!isNil(newVal)) {
                        dispatch(change(REDUX_FORM_NAME, "customPassword", newVal));
                        dispatch(change(REDUX_FORM_NAME, "password", null));
                        dispatch(change(REDUX_FORM_NAME, "confirmPassword", null));
                      }
                    }}
                    {...rest}
                    toolTipKey={"ADMIN_USER_SET_PASSWORD"}
                  />
                )}
                {(httpClient.idp.idpType === IdpDetails.keycloak || formData.customPassword) && (
                  <Fragment>
                    <AvniPasswordInput
                      resettable
                      source="password"
                      label="Custom password"
                      validate={validatePassword}
                      toolTipKey={"ADMIN_USER_CUSTOM_PASSWORD"}
                    />
                    <AvniPasswordInput
                      resettable
                      source="confirmPassword"
                      label="Verify password"
                      validate={isRequired}
                      toolTipKey={"ADMIN_USER_CUSTOM_PASSWORD"}
                    />
                  </Fragment>
                )}
              </Fragment>
            );
          }}
        </FormDataConsumer>
      )}
      <AvniTextInput
        source="name"
        label="Name of the Person"
        validate={isRequired}
        toolTipKey={"ADMIN_USER_NAME"}
      />
      <AvniTextInput
        source="email"
        label="Email Address"
        validate={validateEmail}
        toolTipKey={"ADMIN_USER_EMAIL"}
        multiline
      />

      <AvniTextInput
        source="phoneNumber"
        label="10 digit mobile number"
        validate={validatePhone}
        format={mobileNumberFormatter}
        parse={mobileNumberParser}
        toolTipKey={"ADMIN_USER_PHONE_NUMBER"}
      />
      <LineBreak />
      <FormDataConsumer>
        {({ formData, dispatch, ...rest }) => (
          <Fragment>
            <ToolTipContainer toolTipKey={"ADMIN_USER_CATCHMENT"} alignItems={"center"}>
              <Typography variant="title" component="h3">
                Catchment
              </Typography>
            </ToolTipContainer>
            <ReferenceInput
              source="catchmentId"
              reference="catchment"
              label="Which catchment?"
              filterToQuery={searchText => ({ name: searchText })}
              validate={
                syncAttributesData.isAnySubjectTypeSyncByLocation &&
                required("Please select a catchment")
              }
              onChange={(e, newVal) => {
                if (edit) alert(catchmentChangeMessage);
                dispatch(
                  change(
                    REDUX_FORM_NAME,
                    "operatingIndividualScope",
                    isFinite(newVal) ? operatingScopes.CATCHMENT : operatingScopes.NONE
                  )
                );
              }}
              {...rest}
            >
              <CatchmentSelectInput source="name" resettable />
            </ReferenceInput>
            <LineBreak num={1} />
          </Fragment>
        )}
      </FormDataConsumer>
      <Fragment>
        <ToolTipContainer toolTipKey={"ADMIN_USER_GROUP"} alignItems={"center"}>
          <Typography variant="title" component="h3">
            User Groups
          </Typography>
        </ToolTipContainer>
        <ReferenceArrayInput
          resource="group"
          reference="group"
          source="groupIds"
          filter={{ isNotEveryoneGroup: true }}
        >
          <SelectArrayInput
            style={{ minWidth: "16em" }}
            label="Associated User Groups"
            options={{ fullWidth: true }}
            optionText="name"
          />
        </ReferenceArrayInput>
        <LineBreak num={1} />
      </Fragment>
      <DisabledInput
        source="operatingIndividualScope"
        defaultValue={operatingScopes.NONE}
        style={{ display: "none" }}
      />
      <Fragment>
        <LineBreak num={1} />
        <ToolTipContainer toolTipKey={"ADMIN_USER_SETTINGS"} alignItems={"center"}>
          <Typography variant="title" component="h3">
            Settings
          </Typography>
        </ToolTipContainer>
        <SelectInput source="settings.locale" label="Preferred Language" choices={languages} />
        <AvniBooleanInput
          source="settings.trackLocation"
          label="Track location"
          toolTipKey={"ADMIN_USER_SETTINGS_TRACK_LOCATION"}
        />
        <AvniBooleanInput
          source="settings.showBeneficiaryMode"
          label="Beneficiary mode"
          toolTipKey={"ADMIN_USER_SETTINGS_BENEFICIARY_MODE"}
        />
        <AvniBooleanInput
          source="settings.disableAutoRefresh"
          label="Disable dashboard auto refresh"
          toolTipKey={"ADMIN_USER_SETTINGS_DISABLE_AUTO_REFRESH"}
        />
        <AvniBooleanInput
          source="settings.disableAutoSync"
          label="Disable auto sync"
          toolTipKey={"ADMIN_USER_SETTINGS_DISABLE_AUTO_SYNC"}
        />
        <AvniBooleanInput
          source="settings.registerEnrol"
          label="Register + Enrol"
          toolTipKey={"ADMIN_USER_SETTINGS_REGISTER_ENROL"}
        />
        <AvniBooleanInput
          source="settings.enableCallMasking"
          label="Enable Call Masking"
          toolTipKey={"ADMIN_USER_SETTINGS_ENABLE_CALL_MASKING"}
        />
        <AvniTextInput
          source="settings.idPrefix"
          label="Identifier prefix"
          toolTipKey={"ADMIN_USER_SETTINGS_IDENTIFIER_PREFIX"}
        />
        <br />
        <AvniRadioButtonGroupInput
          source="settings.datePickerMode"
          label="Date picker mode"
          choices={datePickerModes}
          toolTipKey={"ADMIN_USER_SETTINGS_DATE_PICKER_MODE"}
        />
        <br />
        <AvniRadioButtonGroupInput
          source="settings.timePickerMode"
          label="Time picker mode"
          choices={timePickerModes}
          toolTipKey={"ADMIN_USER_SETTINGS_TIME_PICKER_MODE"}
        />
        {isSyncSettingsRequired && (
          <div>
            <LineBreak />
            <ToolTipContainer toolTipKey={"ADMIN_SYNC_SETTINGS"} alignItems={"center"}>
              <Typography variant="title" component="h3">
                Sync Settings
              </Typography>
            </ToolTipContainer>
            {map(syncAttributesData.subjectTypes, st => (
              <SubjectTypeSyncAttributes subjectType={st} key={get(st, "name")} {...props} />
            ))}
            <LineBreak />
          </div>
        )}
      </Fragment>
    </SimpleForm>
  );
};
