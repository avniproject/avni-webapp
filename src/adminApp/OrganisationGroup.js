import React from "react";
import {
  AutocompleteArrayInput,
  Create,
  Datagrid,
  List,
  ReferenceArrayField,
  ReferenceArrayInput,
  ReferenceField,
  ReferenceInput,
  required,
  Show,
  SimpleForm,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  TextInput,
  Edit,
  DisabledInput,
  BooleanInput,
  BooleanField
} from "react-admin";
import { CustomSelectInput } from "./components/CustomSelectInput";
import { TitleChip } from "./components/TitleChip";
import { Title } from "./components/Title";
import ToggleAnalyticsButton from "./ToggleAnalyticsButton";

const normalizeInput = value => {
  return value ? value.trim().replace(/\s+/g, " ") : value;
};

export const OrganisationGroupList = props => (
  <List {...props} bulkActions={false}>
    <Datagrid rowClick="show">
      <TextField label="Name" source="name" />
      <TextField label="DB User" source="dbUser" />
      <TextField source="schemaName" label="Schema name" />
      <BooleanField source="analyticsDataSyncActive" label="Active analytics data sync" />
      <ReferenceField resource="account" source="accountId" reference="account" label="Account Name" allowEmpty>
        <TextField source="name" />
      </ReferenceField>
      <ReferenceArrayField label="Organisations" reference="organisation" source="organisationIds">
        <SingleFieldList>
          <TitleChip source="name" />
        </SingleFieldList>
      </ReferenceArrayField>
    </Datagrid>
  </List>
);

export const OrganisationGroupShow = props => (
  <Show title={<Title title={"Organisation group"} />} {...props}>
    <SimpleShowLayout>
      <TextField source="name" label="Name" />
      <TextField source="dbUser" label="DB User" />
      <TextField source="schemaName" label="Schema name" />
      <BooleanField source="analyticsDataSyncActive" label="Active analytics data sync" />
      <ReferenceField resource="account" source="accountId" reference="account" label="Account Name" allowEmpty>
        <TextField source="name" />
      </ReferenceField>
      <ReferenceArrayField label="Organisations" reference="organisation" source="organisationIds">
        <SingleFieldList>
          <TitleChip source="name" />
        </SingleFieldList>
      </ReferenceArrayField>
    </SimpleShowLayout>
  </Show>
);

export const organisationGroupCreate = props => (
  <Create title="Add a new Account" {...props}>
    <SimpleForm redirect="list">
      <TextInput source="name" validate={required("Name cannot be empty")} parse={normalizeInput} />
      <TextInput source="dbUser" validate={required("DB user cannot be empty")} parse={normalizeInput} />
      <TextInput source="schemaName" validate={required("Schema name cannot be empty")} parse={normalizeInput} />
      <BooleanInput source="analyticsDataSyncActive" />
      <ReferenceInput
        resource="account"
        source="accountId"
        reference="account"
        label="Account Name"
        validate={required("Please select an account")}
      >
        <CustomSelectInput source="name" resettable />
      </ReferenceInput>
      <ReferenceArrayInput
        reference="organisation"
        source="organisationIds"
        perPage={1000}
        label="Organisations"
        filterToQuery={searchText => ({ name: searchText })}
        validate={required("Please choose organisations")}
      >
        <AutocompleteArrayInput {...props} />
      </ReferenceArrayInput>
    </SimpleForm>
  </Create>
);

export const organisationGroupEdit = props => (
  <Edit undoable={false} title={<Title title={"Edit account"} />} {...props}>
    <SimpleForm redirect="list">
      <TextInput source="name" validate={required("Name cannot be empty")} parse={normalizeInput} />
      <DisabledInput source="dbUser" />
      <TextInput source="schemaName" validate={required("Schema name cannot be empty")} parse={normalizeInput} />
      <BooleanField source="analyticsDataSyncActive" />
      <ToggleAnalyticsButton />
      <br />
      <ReferenceInput
        resource="account"
        source="accountId"
        reference="account"
        label="Account Name"
        validate={required("Please select an account")}
      >
        <CustomSelectInput source="name" resettable />
      </ReferenceInput>
      <ReferenceArrayInput
        reference="organisation"
        source="organisationIds"
        perPage={1000}
        label="Organisations"
        filterToQuery={searchText => ({ name: searchText })}
        validate={required("Please choose organisations")}
      >
        <AutocompleteArrayInput {...props} />
      </ReferenceArrayInput>
    </SimpleForm>
  </Edit>
);
