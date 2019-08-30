import React from "react";
import {
  Datagrid,
  List,
  TextField,
  Show,
  SimpleShowLayout,
  ReferenceManyField,
  ReferenceField,
  FunctionField,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  DisabledInput,
  FormDataConsumer,
  ReferenceInput,
  SelectInput,
  REDUX_FORM_NAME,
  Toolbar,
  SaveButton,
  required,
  DeleteButton
} from "react-admin";
import { isEmpty, find, isNil } from "lodash";
import { change } from "redux-form";
import { None } from "../common/components/utils";
import { ColorField, ColorInput } from "react-admin-color-input";

import { store } from "../common/store";

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
    </Datagrid>
  </List>
);

export const EncounterTypeDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <TextField source="name" label="Name" />
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
    <Edit title="Edit Encounter" {...props}>
      <SimpleForm>
        <TextInput source="name" />
      </SimpleForm>
    </Edit>
  );
};
