import _, {
  filter,
  get,
  isEmpty,
  isFinite,
  isNil,
  map,
  some,
  sortBy,
  startCase
} from "lodash";
import { cloneElement, Fragment, useContext, useEffect, useState } from "react";
import {
  ArrayField,
  ArrayInput,
  ChipField,
  Create,
  Datagrid,
  Edit,
  EditButton,
  FormDataConsumer,
  FunctionField,
  List,
  ReferenceArrayInput,
  ReferenceField,
  ReferenceInput,
  required,
  SelectArrayInput,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  TextInput,
  useRecordContext,
  Show,
  useResourceContext
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { Paper, Grid, Chip, Typography, CardActions } from "@mui/material";
import { CatchmentSelectInput } from "./components/CatchmentSelectInput";
import { LineBreak } from "../common/components/utils";
import {
  datePickerModes,
  localeChoices,
  timePickerModes
} from "../common/constants";
import EnableDisableButton from "./components/EnableDisableButton";
import { httpClient as http } from "common/utils/httpClient";
import {
  CustomToolbar,
  doesNotStartOrEndWithWhitespaces,
  getPhoneValidator,
  isRequired,
  UserFilter,
  UserTitle,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validatePasswords,
  validateUserName
} from "./UserHelper";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { ToolTipContainer } from "../common/components/ToolTipContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import { AvniBooleanInput } from "./components/AvniBooleanInput";
import { AvniRadioButtonGroupInput } from "../common/components/AvniRadioButtonGroupInput";
import {
  activatedAudit,
  createdAudit,
  modifiedAudit
} from "./components/AuditUtil";
import ResetPasswordButton from "./components/ResetPasswordButton";
import { AvniPasswordInput } from "./components/AvniPasswordInput";
import ConceptService from "../common/service/ConceptService";
import Select from "react-select";
import ReactSelectHelper from "../common/utils/ReactSelectHelper";
import IdpDetails from "../rootApp/security/IdpDetails";
import OrgManagerContext from "./OrgManagerContext";

const StringToLabelObject = ({ children, ...props }) => {
  const record = useRecordContext();
  if (!record) return null;

  const labelRecord = typeof record === "string" ? { label: record } : record;

  return cloneElement(children, { ...props, record: labelRecord });
};

export const UserCreate = ({ user, organisation, userInfo, ...props }) => (
  <Paper>
    <DocumentationContainer filename={"User.md"}>
      <Create {...props}>
        <UserForm
          user={user}
          nameSuffix={userInfo.usernameSuffix}
          organisation={organisation}
        />
      </Create>
    </DocumentationContainer>
  </Paper>
);

export const UserEdit = ({ organisation, ...props }) => (
  <Edit
    {...props}
    title={<UserTitle titlePrefix="Edit" />}
    mutationMode="pessimistic"
  >
    <UserForm edit organisation={organisation} />
  </Edit>
);

export const UserList = ({ ...props }) => {
  const { organisation } = useContext(OrgManagerContext);
  return (
    <List
      {...props}
      hasCreate={false}
      filter={{ organisationId: organisation.id }}
      filters={UserFilter}
      title={`${organisation.name} Users`}
    >
      <Datagrid rowClick="show">
        <TextField label="Login ID" source="username" />
        <TextField source="name" label="Name of the Person" />
        <ReferenceField
          label="Catchment"
          source="catchmentId"
          reference="catchment"
          link="show"
          emptyText=""
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField source="email" label="Email Address" />
        <TextField source="phoneNumber" label="Phone Number" />
        <FunctionField
          label="User Groups"
          render={record => (
            <div style={{ maxWidth: "40em" }}>
              {_.isArrayLike(record.userGroups) &&
                record.userGroups
                  .filter(ug => ug && !ug.voided)
                  .map(userGroup => (
                    <Chip
                      style={{ margin: "0.2em" }}
                      label={userGroup.groupName}
                      key={userGroup.groupName}
                    />
                  ))}
            </div>
          )}
        />
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

const CustomShowActions = ({ hasEditUserPrivilege }) => {
  const record = useRecordContext();
  const resource = useResourceContext();
  if (!record) return null;

  return (
    hasEditUserPrivilege && (
      <CardActions
        style={{
          zIndex: 2,
          display: "flex",
          float: "right",
          flexDirection: "row"
        }}
      >
        <>
          <EditButton label="Edit User" />
          <ResetPasswordButton record={record} resource={resource} />
          <EnableDisableButton
            disabled={record.disabledInCognito}
            record={record}
            resource={resource}
          />
        </>
      </CardActions>
    )
  );
};

const formatOperatingScope = opScope => opScope && opScope.replace(/^By/, "");

const formatLang = lang =>
  localeChoices
    .filter(local => local.id === lang)
    .map(lang => lang.name)
    .join("");

const SubjectTypeSyncAttributeShow = ({
  subjectType,
  syncConceptValueMap,
  ...props
}) => (
  <div
    style={{
      marginTop: 8,
      padding: 10,
      border: "3px solid rgba(0, 0, 0, 0.05)"
    }}
  >
    <Typography
      sx={{ mb: 1 }}
      variant={"subtitle1"}
    >{`Sync settings for Subject Type: ${subjectType.name}`}</Typography>
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
  syncAttributeName
}) => {
  const record = useRecordContext();
  const syncSettings = get(record, ["syncSettings", subjectType.name], {});
  const conceptUUID = get(syncSettings, [syncAttributeName]);
  const syncConceptName = subjectType[syncAttributeName].name;

  if (isEmpty(conceptUUID)) return null;

  return (
    <div>
      <span
        style={{
          color: "rgba(0, 0, 0, 0.54)",
          fontSize: "12px",
          marginRight: 10
        }}
      >
        {startCase(syncConceptName)}
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

const SyncAttributesProvider = ({ children }) => {
  const [syncAttributesData, setSyncAttributesData] = useState({
    subjectTypes: []
  });

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

  return children(syncAttributesData);
};

export const UserDetail = ({ user, hasEditUserPrivilege, ...props }) => {
  return (
    <Show
      {...props}
      actions={
        <CustomShowActions hasEditUserPrivilege={hasEditUserPrivilege} />
      }
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
          link="show"
        >
          <TextField source="name" />
        </ReferenceField>

        <ArrayField label="User Groups" source="userGroupNames">
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
        <h4>Sync Settings</h4>
        <FunctionField
          label="Below Subject type Sync settings are to be ignored in the Data Entry app: "
          render={user => (user.ignoreSyncSettingsInDEA ? "Yes" : "No")}
        />

        <SyncAttributesProvider>
          {syncAttributesData => (
            <>
              {map(syncAttributesData.subjectTypes, st => (
                <SubjectTypeSyncAttributeShow
                  subjectType={st}
                  key={get(st, "name")}
                  syncConceptValueMap={syncAttributesData.syncConceptValueMap}
                />
              ))}
            </>
          )}
        </SyncAttributesProvider>

        <FunctionField
          label="Preferred Language"
          render={user =>
            !isNil(user.settings) ? formatLang(user.settings.locale) : ""
          }
        />
        <FunctionField
          label="Date Picker Mode"
          render={user =>
            !isNil(user.settings) ? user.settings.datePickerMode : "Calendar"
          }
        />
        <FunctionField
          label="Time Picker Mode"
          render={user =>
            !isNil(user.settings) ? user.settings.timePickerMode : "Clock"
          }
        />
        <FunctionField
          label="Track Location"
          render={user =>
            !isNil(user.settings)
              ? user.settings.trackLocation
                ? "True"
                : "False"
              : ""
          }
        />
        <FunctionField
          label="Is Allowed To Invoke Token Generation API"
          render={user =>
            !isNil(user.settings)
              ? user.settings.isAllowedToInvokeTokenGenerationAPI
                ? "True"
                : "False"
              : ""
          }
        />
        <FunctionField
          label="Beneficiary Mode"
          render={user =>
            !isNil(user.settings)
              ? user.settings.showBeneficiaryMode
                ? "True"
                : "False"
              : ""
          }
        />
        <FunctionField
          label="Disable dashboard auto refresh"
          render={user =>
            !isNil(user.settings)
              ? user.settings.disableAutoRefresh
                ? "True"
                : "False"
              : ""
          }
        />
        <FunctionField
          label="Disable auto sync"
          render={user =>
            !isNil(user.settings)
              ? user.settings.disableAutoSync
                ? "True"
                : "False"
              : ""
          }
        />
        <FunctionField
          label="Register + Enrol"
          render={user =>
            !isNil(user.settings)
              ? user.settings.registerEnrol
                ? "True"
                : "False"
              : ""
          }
        />
        <FunctionField
          label="Enable Call Masking"
          render={user =>
            !isNil(user.settings)
              ? user.settings.enableCallMasking
                ? "True"
                : "False"
              : ""
          }
        />
        <TextField label="Identifier prefix" source="settings.idPrefix" />
        <FunctionField label="Created" render={user => createdAudit(user)} />
        <FunctionField
          label="Activated"
          render={user => user?.lastActivatedDateTime && activatedAudit(user)}
        />
        <FunctionField
          label="Modified"
          render={audit => modifiedAudit(audit)}
        />
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
  <div
    style={{
      marginTop: 8,
      padding: 10,
      border: "3px solid rgba(0, 0, 0, 0.05)"
    }}
  >
    <Typography
      sx={{ mb: 1 }}
      variant={"h6"}
    >{`Sync settings for Subject Type: ${subjectType.name}`}</Typography>
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

const ConceptSyncAttribute = ({ subjectType, syncAttributeName }) => {
  const { setValue } = useFormContext();
  const [answerConcepts, setAnswerConcepts] = useState([]);

  return (
    <FormDataConsumer>
      {({ formData }) => {
        const syncAttributeConceptUUID = get(
          formData,
          `syncSettings.${subjectType.name}.${syncAttributeName}`
        );
        const syncAttributeConcept = subjectType[syncAttributeName];

        const syncAttributeValuesFieldName = `syncSettings.${
          subjectType.name
        }.${syncAttributeName}Values`;
        const selectedSyncAttributeValueIds = get(
          formData,
          syncAttributeValuesFieldName
        );
        const selectedAnswerConcepts = filter(answerConcepts, x =>
          some(selectedSyncAttributeValueIds, y => x.id === y)
        );

        useEffect(() => {
          if (isEmpty(syncAttributeConceptUUID)) {
            setAnswerConcepts([]);
          } else {
            ConceptService.getAnswerConcepts(syncAttributeConceptUUID).then(
              setAnswerConcepts
            );
          }
        }, [syncAttributeConceptUUID]);

        return (
          <Fragment>
            <Grid container alignItems="center" spacing={2}>
              <Grid size={{ xs: 3 }}>
                <SelectInput
                  source={`syncSettings.${
                    subjectType.name
                  }.${syncAttributeName}`}
                  label={startCase(syncAttributeName)}
                  choices={[syncAttributeConcept]}
                  onChange={(e, newVal) => {
                    if (newVal !== syncAttributeConceptUUID) {
                      alert(catchmentChangeMessage);
                      setValue(syncAttributeValuesFieldName, null);
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 9 }}>
                {!isEmpty(syncAttributeConceptUUID) &&
                  (get(syncAttributeConcept, "dataType") === "Coded" ? (
                    <Select
                      isClearable
                      isSearchable
                      isMulti
                      value={selectedAnswerConcepts.map(
                        ReactSelectHelper.toReactSelectItem
                      )}
                      options={answerConcepts.map(
                        ReactSelectHelper.toReactSelectItem
                      )}
                      onChange={event => {
                        const selectedValues = ReactSelectHelper.getCurrentValues(
                          event
                        ).map(x => x.id);
                        setValue(syncAttributeValuesFieldName, selectedValues);
                      }}
                    />
                  ) : (
                    <>
                      <div
                        style={{
                          color: "rgba(0, 0, 0, 0.54)",
                          fontSize: 12,
                          marginTop: 5
                        }}
                      >
                        Values to sync
                      </div>
                      <ArrayInput
                        source={syncAttributeValuesFieldName}
                        label=""
                      >
                        <SimpleFormIterator>
                          <TextInput
                            label={`${startCase(syncAttributeName)} Value`}
                            validate={isRequired}
                          />
                        </SimpleFormIterator>
                      </ArrayInput>
                    </>
                  ))}
              </Grid>
            </Grid>
          </Fragment>
        );
      }}
    </FormDataConsumer>
  );
};

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

const UsernameHandler = ({ nameSuffix }) => {
  const { setValue } = useFormContext();
  const usernameIgnored = useWatch({ name: "ignored" });

  useEffect(() => {
    if (usernameIgnored) {
      setValue("username", usernameIgnored + "@" + nameSuffix);
    }
  }, [usernameIgnored, setValue, nameSuffix]);

  return <AvniTextInput source="ignored" style={{ display: "none" }} />;
};

const UserForm = ({ edit, nameSuffix, organisation, ...props }) => {
  const [languages, setLanguages] = useState([]);
  const [syncAttributesData, setSyncAttributesData] = useState({
    subjectTypes: []
  });
  const isSyncSettingsRequired =
    syncAttributesData.subjectTypes.length > 0 ||
    syncAttributesData.isAnySubjectTypeDirectlyAssignable;

  useEffect(() => {
    http.get("/organisationConfig").then(res => {
      const organisationLocales = isEmpty(res.data._embedded.organisationConfig)
        ? [localeChoices[0]]
        : filter(localeChoices, l =>
            res.data._embedded.organisationConfig[0].settings.languages.includes(
              l.id
            )
          );
      setLanguages(organisationLocales);
    });
  }, []);

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
      {!edit && <UsernameHandler nameSuffix={nameSuffix} />}
      {edit ? (
        <TextInput disabled source="username" label="Login ID (username)" />
      ) : (
        <FormDataConsumer>
          {({ formData }) => {
            const currentUsername = formData.username;
            const isCognito = http.idp.idpType === IdpDetails.cognito;
            const isKeycloak = http.idp.idpType === IdpDetails.keycloak;
            const customPassword = formData.customPassword;

            return (
              <Fragment>
                <Grid container alignItems="center" spacing={1}>
                  <Grid>
                    <AvniTextInput
                      source="username"
                      validate={validateUserName}
                      label="Login ID (username)"
                      toolTipKey="ADMIN_USER_USER_NAME"
                    />
                  </Grid>
                  <Grid>
                    <span>@{nameSuffix}</span>
                  </Grid>
                </Grid>
                {isCognito && currentUsername && (
                  <AvniBooleanInput
                    source="customPassword"
                    style={{ marginTop: "1em" }}
                    label="Set a custom password. If custom password is not set, temporary password will be first 4 characters of username and last 4 characters of phone number."
                    onChange={(e, newVal) => {
                      if (!isNil(newVal)) {
                        const { setValue } = useFormContext();
                        setValue("customPassword", newVal);
                        setValue("password", null);
                        setValue("confirmPassword", null);
                      }
                    }}
                    toolTipKey="ADMIN_USER_SET_PASSWORD"
                  />
                )}

                {(isKeycloak || customPassword) && (
                  <Fragment>
                    <AvniPasswordInput
                      source="password"
                      label="Custom password"
                      validate={validatePassword}
                      toolTipKey="ADMIN_USER_CUSTOM_PASSWORD"
                    />
                    <AvniPasswordInput
                      source="confirmPassword"
                      label="Verify password"
                      validate={validatePassword}
                      toolTipKey="ADMIN_USER_CUSTOM_PASSWORD"
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
        validate={validateDisplayName}
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
        validate={getPhoneValidator(organisation.region)}
        toolTipKey={"ADMIN_USER_PHONE_NUMBER"}
      />
      <LineBreak />
      <FormDataConsumer>
        {({ formData }) => {
          const { setValue } = useFormContext();

          return (
            <Fragment>
              <ToolTipContainer
                toolTipKey="ADMIN_USER_CATCHMENT"
                alignItems="center"
              >
                <Typography variant="title" component="h3">
                  Catchment
                </Typography>
              </ToolTipContainer>

              <ReferenceInput
                source="catchmentId"
                reference="catchment"
                label="Which catchment?"
                filterToQuery={searchText => ({ name: searchText })}
                onChange={(e, newVal) => {
                  if (edit) alert(catchmentChangeMessage);
                  setValue(
                    "operatingIndividualScope",
                    isFinite(newVal)
                      ? operatingScopes.CATCHMENT
                      : operatingScopes.NONE
                  );
                }}
              >
                <CatchmentSelectInput
                  validate={
                    syncAttributesData?.anySubjectTypeSyncByLocation &&
                    required("Please select a catchment")
                  }
                  style={{ width: "fit-content", minWidth: "15em" }}
                />
              </ReferenceInput>

              <LineBreak num={1} />
            </Fragment>
          );
        }}
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
            label="Associated User Groups"
            optionText="name"
            style={{ width: "fit-content", minWidth: "15em" }}
          />
        </ReferenceArrayInput>
        <LineBreak num={1} />
      </Fragment>
      <TextInput
        disabled
        source="operatingIndividualScope"
        defaultValue={operatingScopes.NONE}
        style={{ display: "none" }}
      />
      <Fragment>
        <LineBreak num={1} />
        <ToolTipContainer
          toolTipKey={"ADMIN_USER_SETTINGS"}
          alignItems={"center"}
        >
          <Typography variant="title" component="h3">
            Settings
          </Typography>
        </ToolTipContainer>
        <SelectInput
          source="settings.locale"
          label="Preferred Language"
          choices={languages}
          style={{ width: "fit-content", minWidth: "15em" }}
        />
        <AvniBooleanInput
          source="settings.trackLocation"
          label="Track location"
          toolTipKey={"ADMIN_USER_SETTINGS_TRACK_LOCATION"}
        />
        <AvniBooleanInput
          source="settings.isAllowedToInvokeTokenGenerationAPI"
          label="Is Allowed To Invoke Token Generation API"
          toolTipKey={
            "ADMIN_USER_SETTINGS_IS_ALLOWED_TO_INVOKE_TOKEN_GENERATION_API"
          }
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
          validate={doesNotStartOrEndWithWhitespaces}
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
            <ToolTipContainer
              toolTipKey={"ADMIN_SYNC_SETTINGS"}
              alignItems={"center"}
            >
              <Typography variant="title" component="h3">
                Sync Settings
              </Typography>
            </ToolTipContainer>
            <AvniBooleanInput
              style={{ marginLeft: "10px", marginTop: "10px" }}
              source="ignoreSyncSettingsInDEA"
              label="Ignore below listed Sync settings in the Data Entry app"
              toolTipKey={"IGNORE_SYNC_SETTINGS_IN_DEA"}
            />
            {map(syncAttributesData.subjectTypes, st => (
              <SubjectTypeSyncAttributes
                subjectType={st}
                key={get(st, "name")}
                {...props}
              />
            ))}
            <LineBreak />
          </div>
        )}
      </Fragment>
    </SimpleForm>
  );
};
