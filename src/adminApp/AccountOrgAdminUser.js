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
  isRequired,
  mobileNumberFormatter,
  mobileNumberParser,
  PasswordTextField,
  UserFilter,
  UserTitle,
  validateEmail,
  validatePhone
} from "./UserHelper";
import { TitleChip } from "./components/TitleChip";
import OrganisationService from "../common/service/OrganisationService";

export const AccountOrgAdminUserCreate = ({ user, ...props }) => (
  <Create {...props}>
    <UserForm user={user} />
  </Create>
);

export const AccountOrgAdminUserEdit = ({ user, ...props }) => (
  <Edit {...props} title={<UserTitle titlePrefix="Edit" />} undoable={false} filter={{ searchURI: "orgAdmin" }}>
    <UserForm edit user={user} />
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

const UserForm = ({ edit, user, ...props }) => {
  const [nameSuffix, setNameSuffix] = useState("");
  const getOrgData = id => id && OrganisationService.getOrganisation(id).then(data => setNameSuffix(data.usernameSuffix));

  const sanitizeProps = ({ record, resource, save }) => ({
    record,
    resource,
    save
  });
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
                    source="ignored"
                    validate={isRequired}
                    label={"Login ID (username)"}
                    onChange={(e, newVal) =>
                      !isEmpty(newVal) && dispatch(change(REDUX_FORM_NAME, "username", newVal + getSuffixIfApplicable))
                    }
                    {...rest}
                  />
                  <span>{getSuffixIfApplicable}</span>
                </Fragment>
              );
            }}
          </FormDataConsumer>
        </Fragment>
      )}
      {!edit && <PasswordTextField />}
      <TextInput source="name" label="Name of the Person" validate={isRequired} autoComplete="off" />
      <TextInput source="email" label="Email Address" validate={validateEmail} autoComplete="off" />
      <TextInput
        source="phoneNumber"
        label="10 digit mobile number"
        validate={validatePhone}
        format={mobileNumberFormatter}
        parse={mobileNumberParser}
        autoComplete="off"
      />
    </SimpleForm>
  );
};
