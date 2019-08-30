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

export const SubjectTypeList = props => (
  <List {...props} bulkActions={false}>
    <Datagrid rowClick="show">
      <TextField label="Name" source="name" />
    </Datagrid>
  </List>
);

export const SubjectTypeDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <TextField source="name" label="Name" />
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
    <Edit title="Edit Subject" {...props}>
      <SimpleForm>
        <TextInput source="name" />
      </SimpleForm>
    </Edit>
  );
};
