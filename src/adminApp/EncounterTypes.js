import React from "react";
import {
  Datagrid,
  List,
  TextField,
  Show,
  SimpleShowLayout,
  Create,
  Edit,
  SimpleForm,
  TextInput
} from "react-admin";

const Title = ({ record }) => {
  return (
    record && (
      <span>
        Program: <b>{record.name}</b>
      </span>
    )
  );
};

export const EncounterTypeList = props => (
  <List {...props} bulkActions={false}>
    <Datagrid rowClick="show">
      <TextField label="Name" source="name" />
      <TextField label="Organisation Id" source="encounterTypeOrganisationId" />
    </Datagrid>
  </List>
);

export const EncounterTypeDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <TextField source="name" label="Name" />
        <TextField label="Organisation Id" source="encounterTypeOrganisationId" />
      </SimpleShowLayout>
    </Show>
  );
};

export const EncounterTypeCreate = props => {
  return (
    <Create title="Add a new Encounter" {...props}>
      <SimpleForm>
        <TextInput source="name" />
      </SimpleForm>
    </Create>
  );
};

export const EncounterTypeEdit = props => {
  return (
    <Edit undoable={false} title="Edit Encounter" {...props}>
      <SimpleForm>
        <TextInput source="name" />
      </SimpleForm>
    </Edit>
  );
};
