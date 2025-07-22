import {
  AutocompleteArrayInput,
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  Edit,
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
  useRecordContext
} from "react-admin";
import { CustomSelectInput } from "./components/CustomSelectInput";
import { TitleChip } from "./components/TitleChip";
import { Title } from "./components/Title";
import ToggleAnalyticsButton from "./ToggleAnalyticsButton";

const normalizeInput = value => {
  return value ? value.trim().replace(/\s+/g, " ") : value;
};

const normalizeInputAfterExcludingSpaces = value => {
  return value ? value.trim().replace(/\s+/g, "") : value;
};

export const OrganisationGroupList = props => (
  <List {...props} bulkActionButtons={false}>
    <Datagrid rowClick="show">
      <TextField label="Name" source="name" />
      <TextField label="DB User" source="dbUser" />
      <TextField source="schemaName" label="Schema name" />
      <BooleanField source="analyticsDataSyncActive" label="Active analytics data sync" />
      <ReferenceField resource="account" source="accountId" reference="account" label="Account Name">
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
      <ReferenceField resource="account" source="accountId" reference="account" label="Account Name">
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
      <TextInput source="name" label="Name" validate={required("Name cannot be empty")} parse={normalizeInput} />
      <TextInput
        source="dbUser"
        label="DB User"
        validate={required("DB user cannot be empty")}
        parse={normalizeInputAfterExcludingSpaces}
      />
      <TextInput
        source="schemaName"
        label="Schema name"
        validate={required("Schema name cannot be empty")}
        parse={normalizeInputAfterExcludingSpaces}
      />
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
        <AutocompleteArrayInput />
      </ReferenceArrayInput>
    </SimpleForm>
  </Create>
);

const EditForm = () => {
  const record = useRecordContext();

  return (
    <SimpleForm redirect="list">
      <TextInput source="name" label="Name" validate={required("Name cannot be empty")} parse={normalizeInput} />
      <TextInput disabled source="dbUser" label="DB User" />
      <TextInput disabled source="schemaName" label="Schema name" />
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
        <AutocompleteArrayInput />
      </ReferenceArrayInput>
    </SimpleForm>
  );
};

export const organisationGroupEdit = props => (
  <Edit mutationMode="pessimistic" title={<Title title={"Edit account"} />} {...props}>
    <EditForm />
  </Edit>
);
