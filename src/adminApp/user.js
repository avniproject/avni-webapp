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

export const UserCreate = ({ user, organisation, ...props }) => (
  <Create {...props}>
    <UserForm user={user} nameSuffix={organisation.usernameSuffix} />
  </Create>
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
      <TextField label="Created by" source="createdBy" />
      <TextField label="Last modified by" source="lastModifiedBy" />
      <TextField label="Created On(datetime)" source="createdDateTime" />
      <TextField label="Last modified On(datetime)" source="lastModifiedDateTime" />
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
              <TextInput
                source="ignored"
                validate={isRequired}
                label={"Login ID (username)"}
                onChange={(e, newVal) =>
                  !isEmpty(newVal) &&
                  dispatch(change(REDUX_FORM_NAME, "username", newVal + "@" + nameSuffix))
                }
                {...rest}
              />
              <span>@{nameSuffix}</span>
            </Fragment>
          )}
        </FormDataConsumer>
      )}
      {!edit && <PasswordTextField />}
      <TextInput source="name" label="Name of the Person" validate={isRequired} />
      <TextInput source="email" label="Email Address" validate={validateEmail} />
      <TextInput
        source="phoneNumber"
        label="10 digit mobile number"
        validate={validatePhone}
        format={mobileNumberFormatter}
        parse={mobileNumberParser}
      />
      <FormDataConsumer>
        {({ formData, dispatch, ...rest }) =>
          isAdminAndLoggedIn(props.record, user) ? null : (
            <BooleanInput
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
            />
          )
        }
      </FormDataConsumer>
      <LineBreak />
      <FormDataConsumer>
        {({ formData, dispatch, ...rest }) =>
          !formData.orgAdmin && (
            <Fragment>
              <Typography variant="title" component="h3">
                Catchment
              </Typography>
              <ReferenceInput
                source="catchmentId"
                reference="catchment"
                label="Which catchment?"
                validate={required("Please select a catchment")}
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
          )
        }
      </FormDataConsumer>
      <DisabledInput
        source="operatingIndividualScope"
        defaultValue={operatingScopes.NONE}
        style={{ display: "none" }}
      />
      <Fragment>
        <Typography variant="title" component="h3">
          Settings
        </Typography>
        <SelectInput source="settings.locale" label="Preferred Language" choices={languages} />
        <BooleanInput source="settings.trackLocation" label="Track location" />
        <BooleanInput source="settings.hideExit" label="Hide exit" />
        <BooleanInput source="settings.hideEnrol" label="Hide enrol" />
        <BooleanInput source="settings.hideRegister" label="Hide register" />
        <BooleanInput source="settings.hideUnplanned" label="Hide unplanned" />
        <BooleanInput source="settings.showBeneficiaryMode" label="Beneficiary mode" />
        <RadioButtonGroupInput
          source="settings.datePickerMode"
          label="Date picker mode"
          choices={datePickerModes}
        />
      </Fragment>
    </SimpleForm>
  );
};
