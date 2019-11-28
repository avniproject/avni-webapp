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
        Program: <b>{record.name}</b>
      </span>
    )
  );
};

export const RuleEditor = props => {
  const [ruleCode, setRuleCode] = useState(
    props.record.enrolmentSummaryRule ? props.record.enrolmentSummaryRule : ""
  );
  return (
    <FormDataConsumer>
      {({ formData, dispatch, ...rest }) => (
        <Box mt={3}>
          <FormLabel component="legend">Enrolment Summary Rule</FormLabel>
          <Editor
            value={ruleCode}
            onValueChange={value => {
              dispatch(change(REDUX_FORM_NAME, "enrolmentSummaryRule", value));
              setRuleCode(value);
            }}
            highlight={code => highlight(code, languages.js)}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 15,
              height: "auto",
              borderStyle: "solid",
              borderWidth: "1px"
            }}
          />
        </Box>
      )}
    </FormDataConsumer>
  );
};

export const RuleDisplay = props => {
  return (
    <Box mt={3}>
      <FormLabel component="legend">Enrolment Summary Rule</FormLabel>
      <Editor
        value={props.record.enrolmentSummaryRule ? props.record.enrolmentSummaryRule : ""}
        readOnly={true}
        highlight={code => highlight(code, languages.js)}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 15,
          height: "auto",
          borderStyle: "solid",
          borderWidth: "1px"
        }}
      />
    </Box>
  );
};

export const ProgramList = props => (
  <List {...props} bulkActions={false}>
    <Datagrid rowClick="show">
      <TextField source="name" label="Name" />
      <ColorField source="colour" label="Colour" />
      <TextField source="programSubjectLabel" label="Program Subject Label" />
      <TextField label="Organisation Id" source="programOrganisationId" />
    </Datagrid>
  </List>
);

export const ProgramDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <TextField source="name" label="Name" />
        <ColorField source="colour" label="Colour" />
        <TextField source="programSubjectLabel" label="Program Subject Label" />
        <TextField label="Organisation Id" source="programOrganisationId" />
        <RuleDisplay {...props} />
      </SimpleShowLayout>
    </Show>
  );
};

export const ProgramCreate = props => {
  return (
    <Create title="Add a new Program" {...props}>
      <SimpleForm redirect="show">
        <TextInput source="name" />
        <TextInput source="colour" />
        <TextInput source="programSubjectLabel" />
        <TextInput source="enrolmentSummaryRule" hidden={true} />
        <RuleEditor {...props} />
      </SimpleForm>
    </Create>
  );
};

export const ProgramEdit = props => {
  return (
    <Edit undoable={false} title="Edit Program" {...props}>
      <SimpleForm redirect="show">
        <TextInput source="name" />
        <TextInput source="colour" />
        <TextInput source="programSubjectLabel" />
        <TextInput source="enrolmentSummaryRule" hidden={true} />
        <RuleEditor {...props} />
      </SimpleForm>
    </Edit>
  );
};
