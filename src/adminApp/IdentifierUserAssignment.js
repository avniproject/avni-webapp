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
  ReferenceField,
  SelectInput,
  ReferenceInput,
  required
} from "react-admin";
import { change } from "redux-form";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import { AvniFormDataConsumer } from "./components/AvniFormDataConsumer";
import { Paper } from "@material-ui/core";

const Title = ({ record }) => {
  return (
    record && (
      <span>
        Identifier User Assignment: <b>{record.name}</b>
      </span>
    )
  );
};

export const IdentifierUserAssignmentList = props => (
  <List {...props} bulkActions={false} title={"Identifier User Assignment"}>
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

const IdentifierUserAssignmentForm = props => (
  <SimpleForm {...props} redirect="show">
    <AvniFormDataConsumer toolTipKey={"ADMIN_IDENTIFIER_ASSIGNMENT_USER_NAME"} {...props}>
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
    </AvniFormDataConsumer>
    <AvniFormDataConsumer toolTipKey={"ADMIN_IDENTIFIER_ASSIGNMENT_SOURCE"} {...props}>
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
    </AvniFormDataConsumer>
    <AvniTextInput
      source="identifierStart"
      required
      toolTipKey={"ADMIN_IDENTIFIER_ASSIGNMENT_START"}
    />
    <AvniTextInput source="identifierEnd" required toolTipKey={"ADMIN_IDENTIFIER_ASSIGNMENT_END"} />
  </SimpleForm>
);

export const IdentifierUserAssignmentEdit = props => {
  return (
    <Edit undoable={false} title="Edit Identifier User Assignment" {...props}>
      <IdentifierUserAssignmentForm />
    </Edit>
  );
};

export const IdentifierUserAssignmentCreate = props => {
  return (
    <Paper>
      <DocumentationContainer filename={"IdentifierUserAssignment.md"}>
        <Create title="Add New Identifier User Assignment" {...props}>
          <IdentifierUserAssignmentForm />
        </Create>
      </DocumentationContainer>
    </Paper>
  );
};
