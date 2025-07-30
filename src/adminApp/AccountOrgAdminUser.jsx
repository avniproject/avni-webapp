import { useEffect, useState } from "react";
import {
  Create,
  Datagrid,
  Edit,
  EditButton,
  FunctionField,
  List,
  ReferenceArrayField,
  ReferenceArrayInput,
  ReferenceField,
  Show,
  SimpleForm,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  required,
  useRecordContext,
  useResourceContext
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import CardActions from "@mui/material/CardActions";
import EnableDisableButton from "./components/EnableDisableButton";
import {
  CustomToolbar,
  formatRoles,
  getPhoneValidator,
  isRequired,
  PasswordTextField,
  UserFilter,
  UserTitle,
  validateEmail
} from "./UserHelper";
import { TitleChip } from "./components/TitleChip";
import OrganisationService from "../common/service/OrganisationService";
import ApplicationContext from "../ApplicationContext";
import {
  StyledBox,
  StyledTextInput,
  datagridStyles,
  StyledAutocompleteArrayInput
} from "./Util/Styles";
import { PrettyPagination } from "./Util/PrettyPagination.tsx";

export const AccountOrgAdminUserCreate = ({ user, region, ...props }) => (
  <Create {...props}>
    <UserForm user={user} region={region} />
  </Create>
);

export const AccountOrgAdminUserEdit = ({ user, region, ...props }) => (
  <Edit
    {...props}
    title={<UserTitle titlePrefix="Edit" />}
    mutationMode="pessimistic"
    filter={{ searchURI: "orgAdmin" }}
  >
    <SimpleForm toolbar={<CustomToolbar />} redirect="list">
      <UserFormFields edit user={user} region={region} />
    </SimpleForm>
  </Edit>
);

export const AccountOrgAdminUserList = props => (
  <StyledBox>
    <List
      {...props}
      bulkActionButtons={false}
      filters={UserFilter}
      filter={{ searchURI: "find" }}
      sort={{ field: "id", order: "DESC" }}
      title="Admin Users"
      pagination={<PrettyPagination />}
    >
      <Datagrid rowClick="show" bulkActionButtons={false} sx={datagridStyles}>
        <TextField label="Login ID" source="username" />
        <TextField source="name" label="Name of the Person" />
        <TextField source="email" label="Email Address" />
        <TextField source="phoneNumber" label="Phone Number" />
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
  </StyledBox>
);

const CustomShowActions = () => {
  const record = useRecordContext();
  const resource = useResourceContext();
  return record ? (
    <CardActions style={{ zIndex: 2, display: "inline-block", float: "right" }}>
      <EditButton label="Edit User" />
      <EnableDisableButton
        disabled={record.disabledInCognito}
        record={record}
        resource={resource}
      />
    </CardActions>
  ) : null;
};

export const AccountOrgAdminUserDetail = ({ user, ...props }) => (
  <Show title={<UserTitle />} actions={<CustomShowActions />} {...props}>
    <SimpleShowLayout>
      <TextField source="username" label="Login ID (username)" />
      <TextField source="name" label="Name of the Person" />
      <TextField source="email" label="Email Address" />
      <TextField source="phoneNumber" label="Phone Number" />
      <FunctionField label="Role" render={user => formatRoles(user.roles)} />
      <ReferenceField
        label="Organisation"
        source="organisationId"
        reference="organisation"
        link="show"
      >
        <TextField source="name" />
      </ReferenceField>
      <ReferenceArrayField
        label="Accounts"
        reference="account"
        source="accountIds"
      >
        <SingleFieldList>
          <TitleChip />
        </SingleFieldList>
      </ReferenceArrayField>
    </SimpleShowLayout>
  </Show>
);

const UserForm = ({ edit = false, region }) => {
  return (
    <SimpleForm toolbar={<CustomToolbar />} redirect="list">
      <UserFormFields edit={edit} region={region} />
    </SimpleForm>
  );
};

const UserFormFields = ({ edit = false, region }) => {
  const [nameSuffix, setNameSuffix] = useState("");

  const formContext = useFormContext();

  const { control, setValue } = formContext;
  const organisationId = useWatch({ control, name: "organisationId" });
  const username = useWatch({ control, name: "username" });

  const autoComplete = ApplicationContext.isDevEnv() ? "on" : "off";

  useEffect(() => {
    if (organisationId) {
      OrganisationService.getOrganisation(organisationId).then(data => {
        setNameSuffix(data?.usernameSuffix || "");
      });
    }
  }, [organisationId]);

  useEffect(() => {
    if (username && nameSuffix && setValue) {
      setValue("username", `${username}@${nameSuffix}`);
    }
  }, [username, nameSuffix, setValue]);

  return (
    <>
      <ReferenceArrayInput
        reference="account"
        source="accountIds"
        perPage={1000}
        label="Accounts"
        validate={required("Please select one or more accounts")}
        filterToQuery={searchText => ({ name: searchText })}
      >
        <StyledAutocompleteArrayInput />
      </ReferenceArrayInput>

      {edit ? (
        <>
          <StyledTextInput
            disabled
            source="username"
            label="Login ID (admin username)"
          />
          {/* Hidden field to ensure username is included in payload */}
          <StyledTextInput source="username" style={{ display: "none" }} />
        </>
      ) : (
        <>
          <StyledTextInput
            source="username"
            validate={isRequired}
            label="Login ID (username)"
          />
          {nameSuffix && <span>@{nameSuffix}</span>}
          <StyledTextInput source="username" style={{ display: "none" }} />
        </>
      )}

      {!edit && <PasswordTextField />}
      <StyledTextInput
        source="name"
        label="Name of the Person"
        validate={isRequired}
        autoComplete={autoComplete}
      />
      <StyledTextInput
        source="email"
        label="Email Address"
        validate={validateEmail}
        autoComplete={autoComplete}
      />
      <StyledTextInput
        source="phoneNumber"
        validate={getPhoneValidator(region)}
        autoComplete={autoComplete}
      />
    </>
  );
};
