import React from "react";
import { Create, Datagrid, Edit, List, Show, SimpleForm, SimpleShowLayout, TextField, TextInput, Toolbar, SaveButton } from "react-admin";
import { Title } from "./components/Title";

//To remove delete button from the toolbar
const CustomToolbar = props => (
  <Toolbar {...props}>
    <SaveButton />
  </Toolbar>
);

export const AccountList = props => (
  <List {...props} bulkActions={false} filter={{ searchURI: "findAll" }}>
    <Datagrid rowClick="show">
      <TextField label="Name" source="name" />
      <TextField label="Region" source="region" />
    </Datagrid>
  </List>
);

export const AccountDetails = props => (
  <Show title={<Title title={"Account"} />} {...props}>
    <SimpleShowLayout>
      <TextField source="name" label="Name" />
      <TextField source="region" label="Region" />
    </SimpleShowLayout>
  </Show>
);

export const AccountCreate = props => (
  <Create title="Add a new Account" {...props}>
    <SimpleForm redirect="list">
      <TextInput source="name" />
      <TextInput source="region" />
    </SimpleForm>
  </Create>
);

export const AccountEdit = props => (
  <Edit undoable={false} title={<Title title={"Edit account"} />} {...props}>
    <SimpleForm toolbar={<CustomToolbar />} redirect="list">
      <TextInput source="name" />
      <TextInput source="region" />
    </SimpleForm>
  </Edit>
);
