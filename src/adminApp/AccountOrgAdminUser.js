import { isEmpty } from "lodash";
import React, { Fragment, useState } from "react";
import {
  AutocompleteArrayInput,
  Create,
  Datagrid,
  DisabledInput,
  Edit,
  EditButton,
  FormDataConsumer,
  FunctionField,
  List,
  REDUX_FORM_NAME,
  ReferenceArrayField,
  ReferenceArrayInput,
  ReferenceField,
  required,
  Show,
  SimpleForm,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  TextInput
} from "react-admin";
import CardActions from "@material-ui/core/CardActions";
import { change } from "redux-form";
import EnableDisableButton from "./components/EnableDisableButton";
import {
  CustomToolbar,
  formatRoles,
  getPhoneValidator,
  isRequired,
  PasswordTextField,
  UserFilter,
  UserTitle,
  validateEmail,
  validateUserName
} from "./UserHelper";
import { TitleChip } from "./components/TitleChip";
import OrganisationService from "../common/service/OrganisationService";
import ApplicationContext from "../ApplicationContext";

export const AccountOrgAdminUserCreate = ({ user, region, ...props }) => (
  <Create {...props}>
    <UserForm user={user} region={region} />
  </Create>
);

export const AccountOrgAdminUserEdit = ({ user, region, ...props }) => (
  <Edit {...props} title={<UserTitle titlePrefix="Edit" />} undoable={false} filter={{ searchURI: "orgAdmin" }}>
    <UserForm edit user={user} region={region} />
  </Edit>
);

export const AccountOrgAdminUserList = ({ ...props }) => (
  <List {...props} bulkActions={false} filter={{ searchURI: "find" }} filters={<UserFilter />} title={`Admin Users`}>
    <Datagrid rowClick="show">
      <TextField label="Login ID" source="username" />
      <TextField source="name" label="Name of the Person" />
      <TextField source="email" label="Email Address" />
      <TextField source="phoneNumber" label="Phone Number" />
      <FunctionField
        label="Status"
        render={user => (user.voided === true ? "Deleted" : user.disabledInCognito === true ? "Disabled" : "Active")}
      />
    </Datagrid>
  </List>
);

const CustomShowActions = ({ basePath, data, resource }) => {
  return (
    (data && (
      <CardActions style={{ zIndex: 2, display: "inline-block", float: "right" }}>
        <EditButton label="Edit User" basePath={basePath} record={data} />
        <EnableDisableButton disabled={data.disabledInCognito} basePath={basePath} record={data} resource={resource} />
      </CardActions>
    )) ||
    null
  );
};

export const AccountOrgAdminUserDetail = ({ user, ...props }) => (
  <Show title={<UserTitle />} actions={<CustomShowActions user={user} />} {...props}>
    <SimpleShowLayout>
      <TextField source="username" label="Login ID (username)" />
      <TextField source="name" label="Name of the Person" />
      <TextField source="email" label="Email Address" />
      <TextField source="phoneNumber" label="Phone Number" />
      <FunctionField label="Role" render={user => formatRoles(user.roles)} />
      <ReferenceField label="Organisation" source="organisationId" reference="organisation" linkType="show" allowEmpty>
        <TextField source="name" />
      </ReferenceField>
      <ReferenceArrayField label="Accounts" reference="account" source="accountIds">
        <SingleFieldList>
          <TitleChip source="name" />
        </SingleFieldList>
      </ReferenceArrayField>
    </SimpleShowLayout>
  </Show>
);

const UserForm = ({ edit, user, region, ...props }) => {
  const [nameSuffix, setNameSuffix] = useState("");
  const getOrgData = id => id && OrganisationService.getOrganisation(id).then(data => setNameSuffix(data.usernameSuffix));

  const sanitizeProps = ({ record, resource, save }) => ({
    record,
    resource,
    save
  });
  const autoComplete = ApplicationContext.isDevEnv() ? "on" : "off";

  return (
    <SimpleForm toolbar={<CustomToolbar />} {...sanitizeProps(props)} redirect="list">
      <FormDataConsumer>
        {({ formData, dispatch, ...rest }) => {
          return (
            <ReferenceArrayInput
              reference="account"
              source="accountIds"
              perPage={1000}
              label="Accounts"
              validate={required("Please select one or more accounts")}
              filterToQuery={searchText => ({ name: searchText })}
            >
              <AutocompleteArrayInput {...props} />
            </ReferenceArrayInput>
          );
        }}
      </FormDataConsumer>
      {edit ? (
        <DisabledInput source="username" label="Login ID (admin username)" />
      ) : (
        <Fragment>
          <FormDataConsumer>
            {({ formData, dispatch, ...rest }) => {
              formData && getOrgData(formData.organisationId);
              const getSuffixIfApplicable = formData && formData.organisationId ? `@${nameSuffix}` : "";
              return (
                <Fragment>
                  <TextInput
                    source="username"
                    validate={validateUserName}
                    label={"Login ID (username)"}
                    format={value => (value ? value.replace(/\s+/g, "") : "")}
                    parse={value => (value ? value.replace(/\s+/g, "") + getSuffixIfApplicable : "")}
                  />
                  <span>{getSuffixIfApplicable}</span>
                </Fragment>
              );
            }}
          </FormDataConsumer>
        </Fragment>
      )}
      {!edit && <PasswordTextField />}
      <TextInput source="name" label="Name of the Person" validate={isRequired} autoComplete={autoComplete} />
      <TextInput source="email" label="Email Address" validate={validateEmail} autoComplete={autoComplete} />
      <TextInput source="phoneNumber" validate={getPhoneValidator(region)} autoComplete={autoComplete} />
    </SimpleForm>
  );
};
