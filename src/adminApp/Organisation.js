import React from "react";
import {
  Create,
  Datagrid,
  DisabledInput,
  Edit,
  Filter,
  List,
  ReferenceField,
  ReferenceInput,
  required,
  SaveButton,
  Show,
  ShowButton,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  Toolbar,
  BooleanField,
  SelectInput
} from "react-admin";
import { CustomSelectInput } from "./components/CustomSelectInput";
import { Title } from "./components/Title";
import OpenOrganisation from "./components/OpenOrganisation";
import ToggleAnalyticsButton from "./ToggleAnalyticsButton";
import OrganisationCategory from "./domain/OrganisationCategory";

export const OrganisationFilter = props => (
  <Filter {...props} style={{ marginBottom: "2em" }}>
    <TextInput label="Organisation Name" source="name" resettable alwaysOn />
  </Filter>
);

const OrganisationCategoryInput = () => {
  return (
    <SelectInput
      source="category"
      validate={isRequired}
      choices={[
        { id: OrganisationCategory.Production, name: OrganisationCategory.Production },
        { id: OrganisationCategory.UAT, name: OrganisationCategory.UAT },
        { id: OrganisationCategory.Prototype, name: OrganisationCategory.Prototype },
        { id: OrganisationCategory.Temporary, name: OrganisationCategory.Temporary }
      ]}
    />
  );
};

export const OrganisationList = ({ history, ...props }) => {
  return (
    <List {...props} bulkActions={false} filter={{ searchURI: "find" }} filters={<OrganisationFilter />}>
      <Datagrid>
        <TextField source="name" label="Name" />
        <TextField source="category" label="Category" />
        <ReferenceField label="Parent organisation" source="parentOrganisationId" reference="organisation" linkType="show" allowEmpty>
          <TextField source="name" />
        </ReferenceField>
        <TextField source="dbUser" label="DB User" />
        <TextField source="schemaName" label="Schema Name" />
        <TextField source="mediaDirectory" label="Media Directory" />
        <TextField source="usernameSuffix" label="Username Suffix" />
        <BooleanField source="analyticsDataSyncActive" label="Active analytics data sync" sortable={false} />
        <ShowButton />
        <OpenOrganisation porps={props} />
      </Datagrid>
    </List>
  );
};

export const OrganisationDetails = props => {
  return (
    <Show title={<Title title={"Organisation"} />} {...props}>
      <SimpleShowLayout>
        <TextField source="name" label="Name" />
        <TextField source="dbUser" label="DB User" />
        <TextField source="schemaName" label="Schema Name" />
        <TextField source="mediaDirectory" label="Media Directory" />
        <TextField source="usernameSuffix" label="Username Suffix" />
        <TextField source="category" label="Category" />
        <ReferenceField resource="account" source="accountId" reference="account" label="Account Name" linkType="show" allowEmpty>
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField label="Parent organisation" source="parentOrganisationId" reference="organisation" linkType="show" allowEmpty>
          <TextField source="name" />
        </ReferenceField>
        <BooleanField source="analyticsDataSyncActive" label="Active analytics data sync" />
      </SimpleShowLayout>
    </Show>
  );
};

const isRequired = required("This field is required");

export const OrganisationEdit = props => {
  return (
    <Edit undoable={false} title={<Title title={"Edit Organisation"} />} {...props}>
      <SimpleForm toolbar={<CustomToolbar />} redirect="list">
        {props && props.id === "1" ? (
          <DisabledInput source="name" validate={isRequired} />
        ) : (
          <TextInput source="name" validate={isRequired} autoComplete="off" />
        )}
        <DisabledInput source="dbUser" validate={isRequired} />
        <DisabledInput source="schemaName" validate={isRequired} />
        <DisabledInput source="mediaDirectory" />
        <TextInput source="usernameSuffix" validate={isRequired} />
        <OrganisationCategoryInput />
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
      </SimpleForm>
    </Edit>
  );
};

//To remove delete button from the toolbar
const CustomToolbar = props => (
  <Toolbar {...props}>
    <SaveButton />
  </Toolbar>
);

export const OrganisationCreate = props => {
  return (
    <Create title="Create New Organisation" {...props}>
      <SimpleForm redirect="list">
        <TextInput source="name" validate={isRequired} />
        <TextInput source="dbUser" validate={isRequired} />
        <TextInput source="schemaName" validate={isRequired} />
        <TextInput source="mediaDirectory" validate={isRequired} />
        <TextInput source="usernameSuffix" validate={isRequired} />
        <OrganisationCategoryInput />
        <ReferenceInput
          resource="account"
          source="accountId"
          reference="account"
          label="Account Name"
          validate={required("Please select an account")}
        >
          <CustomSelectInput source="name" resettable />
        </ReferenceInput>
      </SimpleForm>
    </Create>
  );
};
