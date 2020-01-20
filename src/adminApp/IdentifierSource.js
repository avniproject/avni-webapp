import React, { useState } from "react";
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
  REDUX_FORM_NAME,
  FormDataConsumer
} from "react-admin";
import { ColorField } from "react-admin-color-input";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import { change } from "redux-form";
import FormLabel from "@material-ui/core/FormLabel";
import Box from "@material-ui/core/Box";

const Title = ({ record }) => {
  return (
    record && (
      <span>
        Identifier Source: <b>{record.name}</b>
      </span>
    )
  );
};

export const IdentifierSourceList = props => (
  <List {...props} bulkActions={false}>
    <Datagrid rowClick="show">
      <TextField source="name" />
      <TextField source="type" />
      <TextField source="batchGenerationSize" />
      <TextField source="minLength" />
      <TextField source="maxLength" />
    </Datagrid>
  </List>
);

export const IdentifierSourceDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <TextField source="name" />
        <TextField source="type" />
        <TextField source="batchGenerationSize" />
        <TextField source="minLength" />
        <TextField source="maxLength" />
      </SimpleShowLayout>
    </Show>
  );
};

export const IdentifierSourceEdit = props => {
  return (
    <Edit undoable={false} title="Edit identifier source" {...props}>
      <SimpleForm redirect="show">
        <TextInput source="name" />
        <TextInput source="type" />
        <TextInput source="catchment" />
        <TextInput source="facility" />
        <TextInput source="batchGenerationSize" />
        <TextInput source="minimumBalance" />
        <TextInput source="options" />
        <TextInput source="minLength" />
        <TextInput source="maxLength" />
      </SimpleForm>
    </Edit>
  );
};

export const IdentifierSourceCreate = props => {
  return (
    <Create title="Add a new Identifier Source" {...props}>
      <SimpleForm redirect="show">
        <TextInput source="name" />
        <TextInput source="type" />
        <TextInput source="catchment" />
        <TextInput source="facility" />
        <TextInput source="batchGenerationSize" />
        <TextInput source="minimumBalance" />
        <TextInput source="options" />
        <TextInput source="minLength" />
        <TextInput source="maxLength" />
      </SimpleForm>
    </Create>
  );
};
