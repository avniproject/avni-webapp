import { Fragment } from "react";
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
  required,
  AutocompleteInput
} from "react-admin";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import { AvniFormDataConsumer } from "./components/AvniFormDataConsumer";
import { Paper } from "@mui/material";

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
  <List {...props} title={"Identifier User Assignment"}>
    <Datagrid rowClick="show">
      <TextField source="name" label="Source name" />
      <TextField source="userName" label="User name" />
      <TextField source="identifierStart" />
      <TextField source="identifierEnd" />
    </Datagrid>
  </List>
);

export const IdentifierUserAssignmentDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <ReferenceField
          source="identifierSourceId"
          reference="identifierSource"
        >
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

const IdentifierUserAssignmentForm = props => (
  <SimpleForm {...props} redirect="show">
    <AvniFormDataConsumer toolTipKey={"ADMIN_IDENTIFIER_ASSIGNMENT_USER_NAME"}>
      {({ formData, ...rest }) => {
        console.log("User ReferenceInput formData:", formData, "rest:", rest);
        return (
          <Fragment>
            <ReferenceInput
              perPage={10}
              source="userId"
              reference="user"
              label="Which user?"
              filterToQuery={searchText => {
                console.log("User filterToQuery searchText:", searchText);
                return { name: searchText };
              }}
              {...rest}
            >
              <AutocompleteInput
                optionText="name"
                optionValue="id"
                validate={[required()]}
                filterToQuery={searchText => ({ name: searchText })}
              />
            </ReferenceInput>
          </Fragment>
        );
      }}
    </AvniFormDataConsumer>
    <AvniFormDataConsumer toolTipKey={"ADMIN_IDENTIFIER_ASSIGNMENT_SOURCE"}>
      {({ formData, ...rest }) => (
        <Fragment>
          <ReferenceInput
            source="identifierSourceId"
            reference="identifierSource"
            label="Which IdentifierSource?"
            {...rest}
          >
            <SelectInput source="name" validate={[required()]} />
          </ReferenceInput>
        </Fragment>
      )}
    </AvniFormDataConsumer>
    <AvniTextInput
      source="identifierStart"
      required
      toolTipKey={"ADMIN_IDENTIFIER_ASSIGNMENT_START"}
    />
    <AvniTextInput
      source="identifierEnd"
      required
      toolTipKey={"ADMIN_IDENTIFIER_ASSIGNMENT_END"}
    />
  </SimpleForm>
);

export const IdentifierUserAssignmentEdit = props => {
  return (
    <Edit
      title="Edit Identifier User Assignment"
      mutationMode="pessimistic"
      {...props}
    >
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
