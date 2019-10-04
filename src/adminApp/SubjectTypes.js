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

export const SubjectTypeList = props => (
  <List {...props} bulkActions={false}>
    <Datagrid rowClick="show">
      <TextField label="Name" source="name" />
      <TextField label="Organisation Id" source="subjectTypeOrganisationId" />
    </Datagrid>
  </List>
);

export const SubjectTypeDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <TextField source="name" label="Name" />
        <TextField label="Organisation Id" source="subjectTypeOrganisationId" />
      </SimpleShowLayout>
    </Show>
  );
};

export const SubjectTypeCreate = props => {
  return (
    <Create title="Add a new Subject" {...props}>
      <SimpleForm>
        <TextInput source="name" />
      </SimpleForm>
    </Create>
  );
};

export const SubjectTypeEdit = props => {
  return (
    <Edit undoable={false} title="Edit Subject" {...props}>
      <SimpleForm>
        <TextInput source="name" />
      </SimpleForm>
    </Edit>
  );
};
