import React from "react";
import {
  Datagrid,
  List,
  ExportButton,
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
  DeleteButton,
  Filter
} from "react-admin";
import { isEmpty, find, isNil } from "lodash";
import { change } from "redux-form";
import { None } from "../common/components/utils";
import { LocationSaveButton } from "./components/LocationSaveButton";
import { store } from "../common/store";
import { Title } from "./components/Title";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import { AvniFormDataConsumer } from "./components/AvniFormDataConsumer";
import { Paper } from "@material-ui/core";
import { createdAudit, modifiedAudit } from "./components/AuditUtil";

const LocationFilter = props => (
  <Filter {...props}>
    <TextInput label="Search location" source="title" resettable alwaysOn />
  </Filter>
);

export const LocationList = props => (
  <List
    {...props}
    bulkActions={false}
    sort={{ field: "title", order: "ASC" }}
    filters={<LocationFilter />}
    actions={<CustomListActions />}
  >
    <Datagrid rowClick="show">
      <TextField label="Name" source="title" />
      <TextField label="Type" source="typeString" />
      <TextField label="Full Address" source="titleLineage" />
    </Datagrid>
  </List>
);

const CustomListActions = props => (
  <Toolbar {...props}>
    <ExportButton maxResults={5000} {...props} />
  </Toolbar>
);

const SubLocationsGrid = props =>
  isEmpty(props.data) ? (
    <None />
  ) : (
    <Datagrid rowClick="show" {...props}>
      <TextField source="title" label="Name" />
      <TextField label="Type" source="typeString" />
    </Datagrid>
  );

const ParentLocationReferenceField = props => {
  return isNil(props.record.parentId) ? (
    <None />
  ) : (
    <ReferenceField
      {...props}
      label="Parent location"
      source="parentId"
      linkType="show"
      reference="locations"
      allowEmpty
    >
      <FunctionField render={record => `${record.title} (${record.typeString})`} />
    </ReferenceField>
  );
};

ParentLocationReferenceField.defaultProps = {
  addLabel: true
};

export const LocationDetail = props => {
  return (
    <Show {...props} title={<Title title={"Location"} />}>
      <SimpleShowLayout>
        <TextField source="title" label="Name" />
        <TextField source="typeString" label="Type" />
        <ParentLocationReferenceField label="Part of (location)" />
        <ReferenceManyField
          label="Contains locations"
          reference="locations"
          target="parentId"
          sort={{ field: "title", order: "ASC" }}
        >
          <SubLocationsGrid />
        </ReferenceManyField>
        <FunctionField label="Created" render={audit => createdAudit(audit)} />
        <FunctionField label="Modified" render={audit => modifiedAudit(audit)} />
        <TextField source="uuid" label="UUID" />
      </SimpleShowLayout>
    </Show>
  );
};

const LocationCreateEditToolbar = ({ edit, ...props }) => {
  return (
    <Toolbar {...props}>
      {edit ? (
        <SaveButton {...props} />
      ) : (
        <LocationSaveButton submitOnEnter={false} redirect="show" />
      )}
      {edit && <DeleteButton undoable={false} redirect="list" style={{ marginLeft: "auto" }} />}
    </Toolbar>
  );
};

let addressLevelTypes;
const LocationTypeSelectInput = props => {
  addressLevelTypes = props.choices;
  return <SelectInput {...props} />;
};

const isRequired = required("This field is required");

export class LocationForm extends React.Component {
  componentDidUpdate() {
    if (this.changed) {
      store.dispatch(change(REDUX_FORM_NAME, "parentId", ""));
      this.changed = false;
    }
  }

  render() {
    const getParentIdOfLocationType = typeId => {
      if (isNil(typeId)) return null;
      let type = find(addressLevelTypes, { id: typeId });
      return isNil(type) ? null : type.parentId;
    };

    const getNameOfLocationType = typeId => {
      if (isNil(typeId)) return null;
      let type = find(addressLevelTypes, { id: typeId });
      return isNil(type) ? null : type.name;
    };

    const { edit = false, ...restProps } = this.props;

    return (
      <SimpleForm
        toolbar={<LocationCreateEditToolbar edit={edit} />}
        {...restProps}
        redirect="show"
      >
        <div>
          <AvniTextInput
            label="Name of new location"
            source="title"
            validate={isRequired}
            fullWidth
            toolTipKey={"ADMIN_LOCATION_NAME"}
          />
        </div>
        <AvniFormDataConsumer toolTipKey={"ADMIN_LOCATION_TYPE"}>
          {({ formData, dispatch, ...rest }) => (
            <ReferenceInput
              label="Type"
              source="typeId"
              reference="addressLevelType"
              validate={isRequired}
              onChange={() => {
                this.changed = true;
              }}
              disabled={edit}
              {...rest}
            >
              <LocationTypeSelectInput optionText="name" resettable />
            </ReferenceInput>
          )}
        </AvniFormDataConsumer>
        <FormDataConsumer>
          {({ formData, dispatch, ...rest }) => (
            <DisabledInput
              source="type"
              defaultValue={getNameOfLocationType(formData.typeId)}
              style={{ display: "none" }}
              {...rest}
            />
          )}
        </FormDataConsumer>
        <FormDataConsumer>
          {({ formData, dispatch, ...rest }) => {
            return (
              !isNil(getParentIdOfLocationType(formData.typeId)) && (
                <ReferenceInput
                  label="Part of (location)"
                  helperText="Which larger location is this location a part of?"
                  source="parentId"
                  reference="locations"
                  filter={{
                    searchURI: "findAsList",
                    typeId: getParentIdOfLocationType(formData.typeId),
                    title: ""
                  }}
                  filterToQuery={searchText => ({ title: searchText })}
                  validate={isRequired}
                  {...rest}
                >
                  <SelectInput
                    optionText={record => record && `${record.titleLineage} (${record.typeString})`}
                  />
                </ReferenceInput>
              )
            );
          }}
        </FormDataConsumer>

        <DisabledInput source="level" defaultValue={1} style={{ display: "none" }} />
      </SimpleForm>
    );
  }
}

export const LocationCreate = props => (
  <Paper>
    <DocumentationContainer filename={"Location.md"}>
      <Create {...props} title="Add New Location">
        <LocationForm />
      </Create>
    </DocumentationContainer>
  </Paper>
);

export const LocationEdit = props => (
  <Edit title="Edit Location" {...props} undoable={false}>
    <LocationForm edit />
  </Edit>
);
