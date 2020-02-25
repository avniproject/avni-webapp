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
  SelectField,
  SelectInput,
  ChipField,
  FormDataConsumer,
  ReferenceInput,
  required,
  REDUX_FORM_NAME
} from "react-admin";
import React, { Fragment, useEffect, useState } from "react";
import { change } from "redux-form";
import { CatchmentSelectInput } from "./components/CatchmentSelectInput";
import { LineBreak } from "../common/components/utils";
import Typography from "@material-ui/core/Typography";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";

const sourceType = [
  { id: "userBasedIdentifierGenerator", name: "userBasedIdentifierGenerator" },
  { id: "userPoolBasedIdentifierGenerator", name: "userPoolBasedIdentifierGenerator" }
];
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

export const IdentifierSourceList = props => (
  <List {...props} bulkActions={false}>
    <Datagrid rowClick="show">
      <TextField source="name" />
      <ChipField source="type" />
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
        <ChipField source="type" />
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
        <SelectInput source="type" choices={sourceType} />
        <FormDataConsumer>
          {({ formData, dispatch, ...rest }) =>
            !formData.orgAdmin && (
              <Fragment>
                <ReferenceInput
                  source="catchmentId"
                  reference="catchment"
                  label="Which catchment?"
                  validate={required("Please select a catchment")}
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
        </FormDataConsumer>
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
        <SelectInput source="type" choices={sourceType} />
        <FormDataConsumer>
          {({ formData, dispatch, ...rest }) =>
            !formData.orgAdmin && (
              <Fragment>
                <ReferenceInput
                  source="catchmentId"
                  reference="catchment"
                  label="Which catchment?"
                  validate={required("Please select a catchment")}
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
        </FormDataConsumer>
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
