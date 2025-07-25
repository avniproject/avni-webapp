import { useEffect, useRef } from "react";
import {
  Datagrid,
  FilterLiveSearch,
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
  useRecordContext,
  Toolbar,
  SaveButton,
  SelectInput,
  ReferenceInput,
  required,
  DeleteButton
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { isEmpty, find, isNil } from "lodash";
import { None } from "../common/components/utils";
import LocationSaveButton from "./components/LocationSaveButton";
import { Title } from "./components/Title";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import { Paper } from "@mui/material";
import { createdAudit, modifiedAudit } from "./components/AuditUtil";

const LocationFilter = props => {
  const { showFilter, displayedFilters, ...filteredProps } = props;
  return (
    <FilterLiveSearch
      {...filteredProps}
      source="title"
      label="Search location"
    />
  );
};

export const LocationList = props => (
  <List
    {...props}
    sort={{ field: "title", order: "ASC" }}
    filters={<LocationFilter />}
    exporter={false}
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
  const record = useRecordContext();
  return isNil(record?.parentId) ? (
    <None />
  ) : (
    <ReferenceField
      {...props}
      label="Parent location"
      source="parentId"
      link="show"
      reference="locations"
    >
      <FunctionField
        render={record => `${record.title} (${record.typeString})`}
      />
    </ReferenceField>
  );
};

ParentLocationReferenceField.defaultProps = {
  addLabel: true
};

export const LocationDetail = props => (
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

const LocationCreateEditToolbar = ({ edit, ...props }) => (
  <Toolbar {...props}>
    {edit ? (
      <SaveButton {...props} />
    ) : (
      <LocationSaveButton submitOnEnter={false} redirect="show" />
    )}
    {edit && (
      <DeleteButton undoable={false} redirect="list" sx={{ ml: "auto" }} />
    )}
  </Toolbar>
);

const isRequired = required("This field is required");

let cachedAddressLevelTypes = [];

const LocationTypeSelectInput = props => {
  cachedAddressLevelTypes = props.choices ?? cachedAddressLevelTypes;
  return <SelectInput {...props} />;
};

const getParentIdOfLocationType = typeId => {
  if (isNil(typeId)) return null;
  let type = find(cachedAddressLevelTypes, { id: typeId });
  return isNil(type) ? null : type.parentId;
};

const getNameOfLocationType = typeId => {
  if (isNil(typeId)) return null;
  let type = find(cachedAddressLevelTypes, { id: typeId });
  return isNil(type) ? null : type.name;
};

const LocationFormInner = ({ edit }) => {
  const { setValue } = useFormContext();
  const typeId = useWatch({ name: "typeId" });
  const changedRef = useRef(false);
  const parentTypeId = getParentIdOfLocationType(typeId);

  useEffect(() => {
    if (changedRef.current) {
      setValue("parentId", "");
      changedRef.current = false;
    }
  }, [typeId]);

  return (
    <>
      <AvniTextInput
        label="Name of new location"
        source="title"
        validate={isRequired}
        fullWidth
        toolTipKey={"ADMIN_LOCATION_NAME"}
      />
      <ReferenceInput
        label="Type"
        source="typeId"
        reference="addressLevelType"
        validate={isRequired}
        disabled={edit}
        onChange={() => {
          changedRef.current = true;
        }}
      >
        <LocationTypeSelectInput optionText="name" resettable />
      </ReferenceInput>
      <TextInput
        source="type"
        defaultValue={getNameOfLocationType(typeId)}
        style={{ display: "none" }}
      />
      {!isNil(parentTypeId) && (
        <ReferenceInput
          label="Part of (location)"
          helperText="Which larger location is this location a part of?"
          source="parentId"
          reference="locations"
          filter={{
            searchURI: "findAsList",
            typeId: parentTypeId,
            title: ""
          }}
          filterToQuery={searchText => ({ title: searchText })}
          validate={isRequired}
        >
          <SelectInput
            optionText={record =>
              record ? `${record.titleLineage} (${record.typeString})` : ""
            }
          />
        </ReferenceInput>
      )}
      <TextInput
        disabled
        source="level"
        defaultValue={1}
        style={{ display: "none" }}
      />
    </>
  );
};

export const LocationForm = props => {
  return (
    <SimpleForm
      toolbar={<LocationCreateEditToolbar edit={props.edit} />}
      redirect="show"
      {...props}
    >
      <LocationFormInner {...props} />
    </SimpleForm>
  );
};

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
