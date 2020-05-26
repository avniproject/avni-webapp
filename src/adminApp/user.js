import { filter, isEmpty, isFinite, isNil } from "lodash";
import React, { Fragment, useEffect, useState } from "react";
import {
  BooleanInput,
  Create,
  Datagrid,
  DisabledInput,
  Edit,
  EditButton,
  FormDataConsumer,
  FunctionField,
  List,
  RadioButtonGroupInput,
  REDUX_FORM_NAME,
  ReferenceField,
  ReferenceInput,
  required,
  SelectInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput
} from "react-admin";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import { change } from "redux-form";
import { CatchmentSelectInput } from "./components/CatchmentSelectInput";
import { LineBreak } from "../common/components/utils";
import { datePickerModes, localeChoices } from "../common/constants";
import EnableDisableButton from "./components/EnableDisableButton";
import http from "common/utils/httpClient";
import {
  CustomToolbar,
  formatRoles,
  isRequired,
  mobileNumberFormatter,
  mobileNumberParser,
  PasswordTextField,
  UserFilter,
  UserTitle,
  validateEmail,
  validatePhone
} from "./UserHelper";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { ToolTipContainer } from "../common/components/ToolTipContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import { AvniBooleanInput } from "./components/AvniBooleanInput";
import { AvniRadioButtonGroupInput } from "../common/components/AvniRadioButtonGroupInput";
import { Paper } from "@material-ui/core";
import { createdAudit, modifiedAudit } from "./components/AuditUtil";

export const UserCreate = ({ user, organisation, ...props }) => (
  <Paper>
    <DocumentationContainer filename={"User.md"}>
      <Create {...props}>
        <UserForm user={user} nameSuffix={organisation.usernameSuffix} />
      </Create>
    </DocumentationContainer>
  </Paper>
);

export const UserEdit = ({ user, ...props }) => (
  <Edit {...props} title={<UserTitle titlePrefix="Edit" />} undoable={false}>
    <UserForm edit user={user} />
  </Edit>
);

export const UserList = ({ organisation, ...props }) => (
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
      <FunctionField label="Role" render={user => formatRoles(user.roles)} />
      <TextField source="email" label="Email Address" />
      <TextField source="phoneNumber" label="Phone Number" />
      <FunctionField
        label="Status"
        render={user =>
          user.voided === true ? "Deleted" : user.disabledInCognito === true ? "Disabled" : "Active"
        }
      />
    </Datagrid>
  </List>
);

const isAdminAndLoggedIn = (loggedInUser, selectedUser) =>
  loggedInUser && loggedInUser.orgAdmin && loggedInUser.username === selectedUser.username;

const CustomShowActions = ({ user, basePath, data, resource }) => {
  return (
    (data && (
      <CardActions style={{ zIndex: 2, display: "inline-block", float: "right" }}>
        <EditButton label="Edit User" basePath={basePath} record={data} />
        {isAdminAndLoggedIn(data, user) ? null : (
          <EnableDisableButton
            disabled={data.disabledInCognito}
            basePath={basePath}
            record={data}
            resource={resource}
          />
        )}
        {/*Commenting out delete user functionality as it is not required as of now
            <DeleteButton basePath={basePath} record={data}
                          label="Delete User" undoable={false}
                          redirect={basePath} resource={resource}/>*/}
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

export const UserDetail = ({ user, ...props }) => (
  <Show title={<UserTitle />} actions={<CustomShowActions user={user} />} {...props}>
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
      <FunctionField label="Role" render={user => formatRoles(user.roles)} />
      <FunctionField
        label="Operating Scope"
        render={user => formatOperatingScope(user.operatingIndividualScope)}
      />
      <FunctionField
        label="Preferred Language"
        render={user => (!isNil(user.settings) ? formatLang(user.settings.locale) : "")}
      />
      <FunctionField
        label="Date Picker Mode"
        render={user => (!isNil(user.settings) ? user.settings.datePickerMode : "Calendar")}
      />
      <FunctionField
        label="Track Location"
        render={user =>
          !isNil(user.settings) ? (user.settings.trackLocation ? "True" : "False") : ""
        }
      />
      <FunctionField
        label="Hide Exit"
        render={user => (!isNil(user.settings) ? (user.settings.hideExit ? "True" : "False") : "")}
      />
      <FunctionField
        label="Hide Enrol"
        render={user => (!isNil(user.settings) ? (user.settings.hideEnrol ? "True" : "False") : "")}
      />
      <FunctionField
        label="Hide Register"
        render={user =>
          !isNil(user.settings) ? (user.settings.hideRegister ? "True" : "False") : ""
        }
      />
      <FunctionField
        label="Hide Unplanned"
        render={user =>
          !isNil(user.settings) ? (user.settings.hideUnplanned ? "True" : "False") : ""
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
        label="Register + Enrol"
        render={user =>
          !isNil(user.settings) ? (user.settings.registerEnrol ? "True" : "False") : ""
        }
      />
      <TextField label="Identifier prefix" source="settings.idPrefix" />
      <FunctionField label="Created" render={audit => createdAudit(audit)} />
      <FunctionField label="Modified" render={audit => modifiedAudit(audit)} />
    </SimpleShowLayout>
  </Show>
);

const operatingScopes = Object.freeze({
  NONE: "None",
  FACILITY: "ByFacility",
  CATCHMENT: "ByCatchment"
});

const catchmentChangeMessage = `Please ensure that the user has already synced all 
data for their previous catchment, and has deleted all local data from their app`;

const UserForm = ({ edit, user, nameSuffix, ...props }) => {
  const [languages, setLanguages] = useState([]);
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
  const sanitizeProps = ({ record, resource, save }) => ({
    record,
    resource,
    save
  });
  return (
    <SimpleForm toolbar={<CustomToolbar />} {...sanitizeProps(props)} redirect="show">
      {edit ? (
        <DisabledInput source="username" label="Login ID (username)" />
      ) : (
        <FormDataConsumer>
          {({ formData, dispatch, ...rest }) => (
            <Fragment>
              <AvniTextInput
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
            </Fragment>
          )}
        </FormDataConsumer>
      )}
      {!edit && <PasswordTextField />}
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
      <FormDataConsumer>
        {({ formData, dispatch, ...rest }) =>
          isAdminAndLoggedIn(props.record, user) ? null : (
            <AvniBooleanInput
              source="orgAdmin"
              style={{ marginTop: "3em", marginBottom: "2em" }}
              label="Make this user an administrator (user will be able to make organisation wide changes)"
              onChange={(e, newVal) => {
                if (newVal) {
                  dispatch(change(REDUX_FORM_NAME, "catchmentId", null));
                  dispatch(
                    change(REDUX_FORM_NAME, "operatingIndividualScope", operatingScopes.NONE)
                  );
                }
              }}
              {...rest}
              toolTipKey={"ADMIN_USER_ORG_ADMIN"}
            />
          )
        }
      </FormDataConsumer>
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
              validate={!formData.orgAdmin && required("Please select a catchment")}
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
            <LineBreak num={3} />
          </Fragment>
        )}
      </FormDataConsumer>
      <DisabledInput
        source="operatingIndividualScope"
        defaultValue={operatingScopes.NONE}
        style={{ display: "none" }}
      />
      <Fragment>
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
          source="settings.hideExit"
          label="Hide exit"
          toolTipKey={"ADMIN_USER_SETTINGS_HIDE_EXIT"}
        />
        <AvniBooleanInput
          source="settings.hideEnrol"
          label="Hide enrol"
          toolTipKey={"ADMIN_USER_SETTINGS_HIDE_ENROL"}
        />
        <AvniBooleanInput
          source="settings.hideRegister"
          label="Hide register"
          toolTipKey={"ADMIN_USER_SETTINGS_HIDE_REGISTER"}
        />
        <AvniBooleanInput
          source="settings.hideUnplanned"
          label="Hide unplanned"
          toolTipKey={"ADMIN_USER_SETTINGS_HIDE_UNPLANNED"}
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
          source="settings.registerEnrol"
          label="Register + Enrol"
          toolTipKey={"ADMIN_USER_SETTINGS_REGISTER_ENROL"}
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
      </Fragment>
    </SimpleForm>
  );
};
