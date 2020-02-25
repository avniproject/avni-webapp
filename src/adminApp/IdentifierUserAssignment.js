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
  TextInput,
  ReferenceField,
  SelectInput
} from "react-admin";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";

const Title = ({ record }) => {
  return (
    record && (
      <span>
        Identifier user assignment: <b>{record.name}</b>
      </span>
    )
  );
};

export const IdentifierUserAssignmentList = props => (
  <List {...props} bulkActions={false}>
    <Datagrid rowClick="show">
      <TextField source="identifierSource.name" name="Source name" />
      <TextField source="identifierStart" />
      <TextField source="identifierEnd" />
    </Datagrid>
  </List>
);

export const IdentifierUserAssignmentDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <TextField source="identifierSource.name" name="Source name" />
        <TextField source="identifierStart" />
        <TextField source="identifierEnd" />
      </SimpleShowLayout>
    </Show>
  );
};

export const IdentifierUserAssignmentEdit = props => {
  return (
    <Edit undoable={false} title="Edit identifier user assignment" {...props}>
      <SimpleForm redirect="show">
        <ReferenceField
          label="Identifier Source"
          reference="identifierSource"
          source="identifierSource.id"
          allowEmpty={true}
        >
          <SelectInput source="name" />
        </ReferenceField>
        <TextInput source="identifierStart" />
        <TextInput source="identifierEnd" />
      </SimpleForm>
    </Edit>
  );
};

export const IdentifierUserAssignmentCreate = props => {
  return (
    <Create title="Add a new identifier user assignment" {...props}>
      <SimpleForm redirect="show">
        <TextInput source="identifierSource.name" name="Source name" />
        <TextInput source="identifierStart" />
        <TextInput source="identifierEnd" />
      </SimpleForm>
    </Create>
  );
};
