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

export const ProgramList = props => (
  <List {...props} bulkActions={false}>
    <Datagrid rowClick="show">
      <TextField label="Name" source="name" />
      <TextField label="Colour" source="colour" />
    </Datagrid>
  </List>
);

export const ProgramDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <TextField source="name" label="Name" />
        <TextField source="colour" label="Colour" />
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
        {/* <RichTextInput source="body" />
        <DateInput label="Publication date" source="published_at" defaultValue={new Date()} /> */}
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
        {/* <RichTextInput source="body" />
        <DateInput label="Publication date" source="published_at" defaultValue={new Date()} /> */}
      </SimpleForm>
    </Edit>
  );
};
