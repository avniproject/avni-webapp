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

export const ProgramList = props => (
  <List {...props} bulkActions={false}>
    <Datagrid rowClick="show">
      <TextField source="name" label="Name" />
      <TextField source="colour" label="Colour" />
      <TextField source="programSubjectLabel" label="Program Subject Label" />
    </Datagrid>
  </List>
);

export const ProgramDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <TextField source="name" label="Name" />
        <TextField source="colour" label="Colour" />
        <TextField source="programSubjectLabel" label="Program Subject Label" />
      </SimpleShowLayout>
    </Show>
  );
};

export const ProgramCreate = props => {
  return (
    <Create title="Add a new Program" {...props}>
      <SimpleForm>
        <TextInput source="name" />
        <TextInput source="colour" />
        <TextInput source="programSubjectLabel" />
      </SimpleForm>
    </Create>
  );
};

export const ProgramEdit = props => {
  return (
    <Edit title="Edit Program" {...props}>
      <SimpleForm>
        <TextInput source="name" />
        <TextInput source="colour" />
        <TextInput source="programSubjectLabel" />
      </SimpleForm>
    </Edit>
  );
};
