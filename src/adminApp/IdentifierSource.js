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
  ReferenceInput,
  REDUX_FORM_NAME
} from "react-admin";
import React, { Fragment } from "react";
import Chip from "@material-ui/core/Chip";
import { FormLabel, Paper } from "@material-ui/core";
import { change } from "redux-form";
import { CatchmentSelectInput } from "./components/CatchmentSelectInput";
import Typography from "@material-ui/core/Typography";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import { AvniSelectInput } from "./components/AvniSelectInput";
import { AvniFormDataConsumer } from "./components/AvniFormDataConsumer";

const sourceType = {
  userBasedIdentifierGenerator: {
    id: "userBasedIdentifierGenerator",
    name: "User based identifier generator"
  },
  userPoolBasedIdentifierGenerator: {
    id: "userPoolBasedIdentifierGenerator",
    name: "User pool based identifier generator"
  }
};

const operatingScopes = Object.freeze({
  NONE: "None",
  FACILITY: "ByFacility",
  CATCHMENT: "ByCatchment"
});
const Title = ({ record }) => {
  return (
    record && (
      <span>
        Identifier Source: <b>{record.name}</b>
      </span>
    )
  );
};

const ShowSourceType = props => {
  return (
    <>
      {" "}
      {props.showSourceTypeLabel && (
        <>
          <FormLabel style={{ fontSize: "12px" }}>Type</FormLabel> <br />
        </>
      )}
      <Chip label={sourceType[props.record.type].name} />
    </>
  );
};

export const IdentifierSourceList = props => (
  <List {...props} bulkActions={false} title={"Identifier Source"}>
    <Datagrid rowClick="show">
      <TextField source="name" />
      <ShowSourceType source="type" showSourceTypeLabel={false} />
      <TextField source="batchGenerationSize" />
      <TextField source="minLength" />
      <TextField source="maxLength" />
      <ReferenceField source="catchmentId" reference="catchment" allowEmpty>
        <TextField source="name" />
      </ReferenceField>
    </Datagrid>
  </List>
);

export const IdentifierSourceDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <TextField source="name" />
        <ShowSourceType source="type" showSourceTypeLabel={true} />
        <TextField source="batchGenerationSize" />
        <TextField source="minLength" />
        <TextField source="maxLength" />
        <ReferenceField source="catchmentId" reference="catchment" allowEmpty>
          <TextField source="name" />
        </ReferenceField>
        <TextField source="options.prefix" label="Prefix" />
      </SimpleShowLayout>
    </Show>
  );
};

const IdentifierSourceForm = props => (
  <SimpleForm {...props} redirect="show">
    <AvniTextInput source="name" required toolTipKey={"ADMIN_ID_SOURCE_NAME"} />
    <AvniSelectInput
      source="type"
      choices={Object.values(sourceType)}
      required
      toolTipKey={"ADMIN_ID_SOURCE_TYPE"}
    />
    <AvniFormDataConsumer toolTipKey={"ADMIN_ID_SOURCE_CATCHMENT"} {...props}>
      {({ formData, dispatch, ...rest }) =>
        !formData.orgAdmin && (
          <Fragment>
            <ReferenceInput
              source="catchmentId"
              reference="catchment"
              label="Which catchment?"
              onChange={(e, newVal) => {
                dispatch(
                  change(
                    REDUX_FORM_NAME,
                    "operatingIndividualScope",
                    isFinite(newVal) ? operatingScopes.CATCHMENT : operatingScopes.NONE
                  )
                );
              }}
              {...rest}
            >
              <CatchmentSelectInput source="name" resettable />
            </ReferenceInput>
          </Fragment>
        )
      }
    </AvniFormDataConsumer>
    <AvniTextInput
      source="batchGenerationSize"
      required
      toolTipKey={"ADMIN_ID_SOURCE_BATCH_SIZE"}
    />
    <AvniTextInput source="minimumBalance" required toolTipKey={"ADMIN_ID_SOURCE_MIN_BALANCE"} />
    <AvniTextInput source="minLength" required toolTipKey={"ADMIN_ID_SOURCE_MIN_LENGTH"} />
    <AvniTextInput source="maxLength" required toolTipKey={"ADMIN_ID_SOURCE_MAX_LENGTH"} />
    <Fragment>
      <Typography variant="title" component="h3">
        Options
      </Typography>
      <AvniTextInput source="options.prefix" label="Prefix" toolTipKey={"ADMIN_ID_SOURCE_PREFIX"} />
    </Fragment>
  </SimpleForm>
);

export const IdentifierSourceEdit = props => {
  return (
    <Edit undoable={false} title="Edit Identifier Source" {...props}>
      <IdentifierSourceForm />
    </Edit>
  );
};

export const IdentifierSourceCreate = props => {
  return (
    <Paper>
      <DocumentationContainer filename={"IdentifierSource.md"}>
        <Create title="Add New Identifier Source" {...props}>
          <IdentifierSourceForm />
        </Create>
      </DocumentationContainer>
    </Paper>
  );
};
