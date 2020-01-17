import React from "react";
import {
  Create,
  Datagrid,
  Edit,
  List,
  ReferenceField,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  required,
  Toolbar,
  SaveButton
} from "react-admin";

export const OrganisationList = props => (
  <List {...props} bulkActions={false} filter={{ searchURI: "findAll" }}>
    <Datagrid rowClick="show">
      <TextField source="name" label="Name" />
      <ReferenceField
        label="Parent organisation"
        source="parentOrganisationId"
        reference="organisation"
        linkType="show"
        allowEmpty
      >
        <TextField source="name" />
      </ReferenceField>
      <TextField source="dbUser" label="DB User" />
      <TextField source="mediaDirectory" label="Media Directory" />
      <TextField source="usernameSuffix" label="Username Suffix" />
    </Datagrid>
  </List>
);

export const OrganisationDetails = props => {
  return (
    <Show title="Organisation Details" {...props}>
      <SimpleShowLayout>
        <TextField source="name" label="Name" />
        <TextField source="dbUser" label="DB User" />
        <TextField source="mediaDirectory" label="Media Directory" />
        <TextField source="usernameSuffix" label="Username Suffix" />
        <ReferenceField
          label="Parent organisation"
          source="parentOrganisationId"
          reference="organisation"
          linkType="show"
          allowEmpty
        >
          <TextField source="name" />
        </ReferenceField>
      </SimpleShowLayout>
    </Show>
  );
};

const isRequired = required("This field is required");

export const OrganisationEdit = props => {
  return (
    <Edit undoable={false} title="Edit Organisation Details" {...props}>
      <SimpleForm toolbar={<CustomToolbar />} redirect="show">
        <TextInput source="name" validate={isRequired} />
        <TextInput source="dbUser" validate={isRequired} />
        <TextInput source="mediaDirectory" />
        <TextInput source="usernameSuffix" validate={isRequired} />
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
      <SimpleForm redirect="show">
        <TextInput source="name" validate={isRequired} />
        <TextInput source="dbUser" validate={isRequired} />
        <TextInput source="mediaDirectory" />
        <TextInput source="usernameSuffix" validate={isRequired} />
      </SimpleForm>
    </Create>
  );
};
