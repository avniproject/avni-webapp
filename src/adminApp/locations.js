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
  DeleteButton,
  Filter
} from "react-admin";
import { isEmpty, find, isNil } from "lodash";
import { change } from "redux-form";
import { None } from "../common/components/utils";
import { LocationSaveButton } from "./components/LocationSaveButton";
import { store } from "../common/store";

const LocationFilter = props => (
  <Filter {...props}>
    <TextInput label="Search location" source="title" resettable alwaysOn />
  </Filter>
);

export const LocationList = props => (
  <List
    {...props}
    bulkActions={false}
    sort={{ field: "id", order: "ASC" }}
    filters={<LocationFilter />}
  >
    <Datagrid rowClick="show">
      <TextField label="Name" source="title" />
      <TextField label="Type" source="typeString" />
      <TextField label="Full Address" source="titleLineage" />
    </Datagrid>
  </List>
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

const Title = ({ record }) => {
  return (
    record && (
      <span>
        Location: <b>{record.title}</b>
      </span>
    )
  );
};

export const LocationDetail = props => {
  return (
    <Show title={<Title />} {...props}>
      <SimpleShowLayout>
        <TextField source="title" label="Name" />
        <TextField source="typeString" label="Type" />
        <ParentLocationReferenceField label="Part of (location)" />
        <ReferenceManyField label="Contains locations" reference="locations" target="parentId">
          <SubLocationsGrid />
        </ReferenceManyField>
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
      {edit && <DeleteButton redirect="list" />}
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
        <TextInput label="Name of new location" source="title" validate={isRequired} />
        {edit ? (
          <TextField label="Type" source="typeString" />
        ) : (
          <FormDataConsumer>
            {({ formData, dispatch, ...rest }) => (
              <ReferenceInput
                label="Type"
                source="name"
                reference="addressLevelType"
                validate={isRequired}
                sort={{ field: "id", order: "ASC" }}
                onChange={() => {
                  this.changed = true;
                }}
                {...rest}
              >
                <LocationTypeSelectInput optionText="name" resettable />
              </ReferenceInput>
            )}
          </FormDataConsumer>
        )}
        {!edit && (
          <FormDataConsumer>
            {({ formData, dispatch, ...rest }) => (
              <DisabledInput
                source="type"
                defaultValue={getNameOfLocationType(formData.name)}
                style={{ display: "none" }}
                {...rest}
              />
            )}
          </FormDataConsumer>
        )}
        {edit ? (
          <ParentLocationReferenceField label="Part of (location)" />
        ) : (
          <FormDataConsumer>
            {({ formData, dispatch, ...rest }) =>
              !isNil(getParentIdOfLocationType(formData.name)) && (
                <ReferenceInput
                  label="Part of (location)"
                  helperText="Which larger location is this location a part of?"
                  source="parentId"
                  reference="locations"
                  filter={{
                    searchURI: "autocompleteLocationsOfType",
                    typeId: getParentIdOfLocationType(formData.name),
                    title: ""
                  }}
                  filterToQuery={searchText => ({ title: searchText })}
                  validate={isRequired}
                  {...rest}
                >
                  <SelectInput
                    optionText={record => record && `${record.title} (${record.typeString})`}
                  />
                </ReferenceInput>
              )
            }
          </FormDataConsumer>
        )}
        <DisabledInput source="level" defaultValue={1} style={{ display: "none" }} />
      </SimpleForm>
    );
  }
}

export const LocationCreate = props => (
  <Create {...props} title="Add a new Location">
    <LocationForm />
  </Create>
);

export const LocationEdit = props => (
  <Edit title="Edit Location" {...props} undoable={false}>
    <LocationForm edit />
  </Edit>
);
