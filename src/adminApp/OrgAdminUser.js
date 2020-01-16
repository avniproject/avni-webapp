import { isEmpty, isFinite, isNil } from "lodash";
import React, { Fragment, useEffect, useState } from "react";
import {
  BooleanInput,
  Create,
  Datagrid,
  DisabledInput,
  Edit,
  EditButton,
  email,
  Filter,
  FormDataConsumer,
  FunctionField,
  List,
  ReferenceField,
  SelectInput,
  RadioButtonGroupInput,
  REDUX_FORM_NAME,
  regex,
  required,
  SaveButton,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  Toolbar
} from "react-admin";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import { change } from "redux-form";
import { LineBreak } from "../common/components/utils";
import { localeChoices, phoneCountryPrefix, datePickerModes } from "../common/constants";
import EnableDisableButton from "./components/EnableDisableButton";
import http from "common/utils/httpClient";
import { filter } from "lodash";
import { CatchmentSelectInput } from "./components/CatchmentSelectInput";

export const OrgAdminUserCreate = ({ user, ...props }) => (
  <Create {...props}>
    <UserForm user={user} />
  </Create>
);

const UserTitle = ({ record, titlePrefix }) => {
  return (
    record && (
      <span>
        {titlePrefix} user <b>{record.username}</b>
      </span>
    )
  );
};

export const OrgAdminUserEdit = ({ user, ...props }) => (
  <Edit {...props} title={<UserTitle titlePrefix="Edit" />} undoable={false}>
    <UserForm edit user={user} />
  </Edit>
);

const formatRoles = roles =>
  !isEmpty(roles) && // check required thanks to optimistic rendering shenanigans
  roles
    .map(role =>
      role
        .split("_")
        .map(word => word.replace(word[0], word[0].toUpperCase()))
        .join(" ")
    )
    .join(", ");

const UserFilter = props => (
  <Filter {...props} style={{ marginBottom: "2em" }}>
    <TextInput label="Login ID" source="username" resettable alwaysOn />
    <TextInput label="Name" source="name" resettable alwaysOn />
    <TextInput label="Email Address" source="email" resettable alwaysOn />
    <TextInput label="Phone Number" source="phoneNumber" resettable alwaysOn />
  </Filter>
);

export const OrgAdminUserList = ({ ...props }) => (
  <List
    {...props}
    bulkActions={false}
    filter={{ searchURI: "findOrgAdmins" }}
    filters={<UserFilter />}
    title={`Organisation Admin Users`}
  >
    <Datagrid rowClick="show">
      <TextField label="Login ID" source="username" />
      <TextField source="name" label="Name of the Person" />
      <FunctionField label="Role" render={user => formatRoles(user.roles)} />
      <ReferenceField
        label="Organisation"
        source="organisationId"
        reference="organisation"
        linkType="show"
        allowEmpty
      >
        <TextField source="name" />
      </ReferenceField>
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
      </CardActions>
    )) ||
    null
  );
};

export const OrgAdminUserDetail = ({ user, ...props }) => (
  <Show title={<UserTitle />} actions={<CustomShowActions user={user} />} {...props}>
    <SimpleShowLayout>
      <TextField source="username" label="Login ID (username)" />
      <TextField source="name" label="Name of the Person" />
      <TextField source="email" label="Email Address" />
      <TextField source="phoneNumber" label="Phone Number" />
      <ReferenceField
        label="Organisation"
        source="organisationId"
        reference="organisation"
        linkType="show"
        allowEmpty
      >
        <TextField source="name" />
      </ReferenceField>
      <FunctionField label="Role" render={user => formatRoles(user.roles)} />
    </SimpleShowLayout>
  </Show>
);

//To remove delete button from the toolbar
const CustomToolbar = props => (
  <Toolbar {...props}>
    <SaveButton />
  </Toolbar>
);

const PasswordTextField = props => (
  <sub>
    <br />
    Default temporary password is "password". User will
    <br />
    be prompted to set their own password on first login
  </sub>
);

const operatingScopes = Object.freeze({
  NONE: "None",
  FACILITY: "ByFacility",
  CATCHMENT: "ByCatchment"
});

const mobileNumberFormatter = (v = "") => (isNil(v) ? v : v.substring(phoneCountryPrefix.length));
const mobileNumberParser = v =>
  v.startsWith(phoneCountryPrefix) ? v : phoneCountryPrefix.concat(v);

const isRequired = required("This field is required");
const validateEmail = [isRequired, email("Please enter a valid email address")];
const validatePhone = [isRequired, regex(/[0-9]{12}/, "Enter a 10 digit number (eg. 9820324567)")];

const UserForm = ({ edit, user, ...props }) => {
  const sanitizeProps = ({ record, resource, save }) => ({
    record,
    resource,
    save
  });
  return (
    <SimpleForm toolbar={<CustomToolbar />} {...sanitizeProps(props)} redirect="show">
      {edit ? (
        <DisabledInput source="username" label="Login ID (admin username)" />
      ) : (
        <FormDataConsumer>
          {({ formData, dispatch, ...rest }) => (
            <Fragment>
              <TextInput
                source="ignored"
                validate={isRequired}
                label={"Login ID (username)"}
                onChange={(e, newVal) =>
                  !isEmpty(newVal) && dispatch(change(REDUX_FORM_NAME, "username", newVal))
                }
                {...rest}
              />
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

      <LineBreak num={3} />

      <DisabledInput source="operatingIndividualScope" defaultValue={operatingScopes.NONE} />
      <DisabledInput source="orgAdmin" defaultValue={true} />
    </SimpleForm>
  );
};
