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
    props.record.encounterEligibilityCheckRule ? props.record.encounterEligibilityCheckRule : ""
  );


  return (
    <FormDataConsumer>
      {({ formData, dispatch, ...rest }) => (
        <>
          <Box mt={3}>
            <FormLabel component="legend">Encounter Eligibility Check Rule</FormLabel>
            <Editor
              value={ruleCode}
              onValueChange={value => {
                dispatch(change(REDUX_FORM_NAME, "encounterEligibilityCheckRule", value));
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
        </>
      )}
    </FormDataConsumer>
  );
};

export const RuleDisplay = props => {
  return (
    <>
      <Box mt={3}>
        <FormLabel component="legend">Encounter Eligibility Check Rule</FormLabel>
        <Editor
          value={props.record.encounterEligibilityCheckRule ? props.record.encounterEligibilityCheckRule : ""}
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
    </>
  );
};


export const EncounterTypeList = props => (
  <List {...props} bulkActions={false}>
    <Datagrid rowClick="show">
      <TextField label="Name" source="name" />
      <TextField label="Organisation Id" source="encounterTypeOrganisationId" />
    </Datagrid>
  </List>
);

export const EncounterTypeDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <TextField source="name" label="Name" />
        <TextField label="Organisation Id" source="encounterTypeOrganisationId" />
        <RuleDisplay {...props} />
      </SimpleShowLayout>
    </Show>
  );
};

export const EncounterTypeCreate = props => {
  return (
    <Create title="Add a new Encounter" {...props}>
      <SimpleForm>
        <TextInput source="name" />
        <TextInput source="enrolmentEligibilityCheckRule" hidden={true} />
        <RuleEditor {...props} />
      </SimpleForm>
    </Create>
  );
};

export const EncounterTypeEdit = props => {
  return (
    <Edit undoable={false} title="Edit Encounter" {...props}>
      <SimpleForm>
        <TextInput source="name" />
        <TextInput source="enrolmentEligibilityCheckRule" hidden={true} />
        <RuleEditor {...props} />
      </SimpleForm>
    </Edit>
  );
};
