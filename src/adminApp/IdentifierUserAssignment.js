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
      <TextField source="name" />
    </Datagrid>
  </List>
);

//export const IdentifierSourceDetail = props => {
//  return (
//    <Show title={<Title />} {...props}>
//      <SimpleShowLayout>
//        <TextField source="name" />
//        <TextField source="type" />
//        <TextField source="batchGenerationSize" />
//        <TextField source="minLength" />
//        <TextField source="maxLength" />
//      </SimpleShowLayout>
//    </Show>
//  );
//};
//
//export const IdentifierSourceEdit = props => {
//  return (
//    <Edit undoable={false} title="Edit identifier source" {...props}>
//      <SimpleForm redirect="show">
//        <TextInput source="name" />
//        <TextInput source="type" />
//        <TextInput source="catchment" />
//        <TextInput source="facility" />
//        <TextInput source="batchGenerationSize" />
//        <TextInput source="minimumBalance" />
//        <TextInput source="options" />
//        <TextInput source="minLength" />
//        <TextInput source="maxLength" />
//      </SimpleForm>
//    </Edit>
//  );
//};
//
//export const IdentifierSourceCreate = props => {
//  return (
//    <Create title="Add a new Identifier Source" {...props}>
//      <SimpleForm redirect="show">
//        <TextInput source="name" />
//        <TextInput source="type" />
//        <TextInput source="catchment" />
//        <TextInput source="facility" />
//        <TextInput source="batchGenerationSize" />
//        <TextInput source="minimumBalance" />
//        <TextInput source="options" />
//        <TextInput source="minLength" />
//        <TextInput source="maxLength" />
//      </SimpleForm>
//    </Create>
//  );
//};
