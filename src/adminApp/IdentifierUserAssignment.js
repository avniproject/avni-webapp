import React, { Fragment } from "react";
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
  SelectInput,
  FormDataConsumer,
  ReferenceInput,
  required
} from "react-admin";
import { change } from "redux-form";

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
  <List {...props} bulkActions={false} title={"Identifier user assignment"}>
    <Datagrid rowClick="show">
      <TextField source="identifierSource.name" label="Source name" />
      <TextField source="identifierStart" />
      <TextField source="identifierEnd" />
    </Datagrid>
  </List>
);

export const IdentifierUserAssignmentDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <ReferenceField source="identifierSourceId" reference="identifierSource">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="userId" reference="user">
          <TextField source="name" />
        </ReferenceField>
        <TextField source="identifierStart" />
        <TextField source="identifierEnd" />
      </SimpleShowLayout>
    </Show>
  );
};

export const UserSelectInput = props => {
  const choices = props.choices.filter(choice => choice.name != null);
  return <SelectInput {...props} choices={choices} />;
};

export const IdentifierUserAssignmentEdit = props => {
  return (
    <Edit undoable={false} title="Edit identifier user assignment" {...props}>
      <SimpleForm redirect="show">
        <FormDataConsumer>
          {({ formData, dispatch, ...rest }) =>
            !formData.orgAdmin && (
              <Fragment>
                <ReferenceInput
                  source="userId"
                  reference="user"
                  label="Which user?"
                  validate={[required()]}
                  onChange={(e, newVal) => {
                    dispatch(change(newVal));
                  }}
                  {...rest}
                >
                  <UserSelectInput source="name" />
                </ReferenceInput>
              </Fragment>
            )
          }
        </FormDataConsumer>
        <FormDataConsumer>
          {({ formData, dispatch, ...rest }) =>
            !formData.orgAdmin && (
              <Fragment>
                <ReferenceInput
                  source="identifierSourceId"
                  reference="identifierSource"
                  label="Which IdentifierSource?"
                  validate={[required()]}
                  onChange={(e, newVal) => {
                    dispatch(change(newVal));
                  }}
                  {...rest}
                >
                  <SelectInput source="name" />
                </ReferenceInput>
              </Fragment>
            )
          }
        </FormDataConsumer>
        <TextInput source="identifierStart" required />
        <TextInput source="identifierEnd" required />
      </SimpleForm>
    </Edit>
  );
};

export const IdentifierUserAssignmentCreate = props => {
  return (
    <Create title="Add a new identifier user assignment" {...props}>
      <SimpleForm redirect="show">
        <FormDataConsumer>
          {({ formData, dispatch, ...rest }) =>
            !formData.orgAdmin && (
              <Fragment>
                <ReferenceInput
                  source="userId"
                  reference="user"
                  label="Which user?"
                  validate={[required()]}
                  onChange={(e, newVal) => {
                    dispatch(change(newVal));
                  }}
                  {...rest}
                >
                  <UserSelectInput source="name" />
                </ReferenceInput>
              </Fragment>
            )
          }
        </FormDataConsumer>
        <FormDataConsumer>
          {({ formData, dispatch, ...rest }) =>
            !formData.orgAdmin && (
              <Fragment>
                <ReferenceInput
                  source="identifierSourceId"
                  reference="identifierSource"
                  label="Which IdentifierSource?"
                  validate={[required()]}
                  onChange={(e, newVal) => {
                    dispatch(change(newVal));
                  }}
                  {...rest}
                >
                  <SelectInput source="name" />
                </ReferenceInput>
              </Fragment>
            )
          }
        </FormDataConsumer>
        <TextInput source="identifierStart" required />
        <TextInput source="identifierEnd" required />
      </SimpleForm>
    </Create>
  );
};
