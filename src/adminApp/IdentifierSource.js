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
  REDUX_FORM_NAME
} from "react-admin";
import React, { Fragment } from "react";
import Chip from "@material-ui/core/Chip";
import { FormLabel } from "@material-ui/core";
import { change } from "redux-form";
import { CatchmentSelectInput } from "./components/CatchmentSelectInput";
import Typography from "@material-ui/core/Typography";

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
      <ReferenceField source="catchmentId" reference="catchment">
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
        <ReferenceField source="catchmentId" reference="catchment">
          <TextField source="name" />
        </ReferenceField>
      </SimpleShowLayout>
    </Show>
  );
};

export const IdentifierSourceEdit = props => {
  return (
    <Edit undoable={false} title="Edit identifier source" {...props}>
      <SimpleForm redirect="show">
        <TextInput source="name" required />
        <SelectInput source="type" choices={Object.values(sourceType)} required />
        <FormDataConsumer>
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
        </FormDataConsumer>
        <TextInput source="batchGenerationSize" required />
        <TextInput source="minimumBalance" required />
        <TextInput source="minLength" required />
        <TextInput source="maxLength" required />
        <Fragment>
          <Typography variant="title" component="h3">
            Options
          </Typography>
          <TextInput source="options.prefix" label="Prefix" />
        </Fragment>
      </SimpleForm>
    </Edit>
  );
};

export const IdentifierSourceCreate = props => {
  return (
    <Create title="Add a new Identifier Source" {...props}>
      <SimpleForm redirect="show">
        <TextInput source="name" required />
        <SelectInput source="type" choices={Object.values(sourceType)} required />
        <FormDataConsumer>
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
        </FormDataConsumer>
        <TextInput source="batchGenerationSize" required />
        <TextInput source="minimumBalance" required />
        <TextInput source="minLength" required />
        <TextInput source="maxLength" required />
        <Fragment>
          <Typography variant="title" component="h3">
            Options
          </Typography>
          <TextInput source="options.prefix" label="Prefix" />
        </Fragment>
      </SimpleForm>
    </Create>
  );
};
