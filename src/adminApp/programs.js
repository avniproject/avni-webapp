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
import { ColorField, ColorInput } from "react-admin-color-input";

const Title = ({ record }) => {
  return (
    record && (
      <span>
        Program: <b>{record.name}</b>
      </span>
    )
  );
};

export const ProgramList = props => (
  <List {...props} bulkActions={false}>
    <Datagrid rowClick="show">
      <TextField source="name" label="Name" />
      <ColorField source="colour" label="Colour" />
      <TextField source="programSubjectLabel" label="Program Subject Label" />
      <TextField label="Organisation Id" source="programOrganisationId" />
    </Datagrid>
  </List>
);

export const ProgramDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <TextField source="name" label="Name" />
        <ColorField source="colour" label="Colour" />
        <TextField source="programSubjectLabel" label="Program Subject Label" />
        <TextField label="Organisation Id" source="programOrganisationId" />
      </SimpleShowLayout>
    </Show>
  );
};

export const ProgramCreate = props => {
  return (
    <Create title="Add a new Program" {...props}>
      <SimpleForm redirect="show">
        <TextInput source="name" />
        <ColorInput source="colour" />
        <TextInput source="programSubjectLabel" />
      </SimpleForm>
    </Create>
  );
};

export const ProgramEdit = props => {
  return (
    <Edit undoable={false} title="Edit Program" {...props}>
      <SimpleForm redirect="show">
        <TextInput source="name" />
        <ColorInput source="colour" picker="Sketch" />
        <TextInput source="programSubjectLabel" />
      </SimpleForm>
    </Edit>
  );
};
