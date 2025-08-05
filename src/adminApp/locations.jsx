import { useEffect, useState } from "react";
import {
  AutocompleteInput,
  Datagrid,
  FilterLiveSearch,
  List,
  TextField,
  TextInput,
  ReferenceManyField,
  ReferenceField,
  FunctionField,
  Create,
  Edit,
  SimpleForm,
  useRecordContext,
  Toolbar,
  SaveButton,
  required,
  DeleteButton,
  TopToolbar,
  CreateButton,
  ExportButton,
  useListContext,
  FormDataConsumer,
  useDataProvider,
  useNotify,
  useRedirect
} from "react-admin";
import { isEmpty, find, isNil } from "lodash";
import { None } from "../common/components/utils";
import { AvniReferenceInput } from "./components/AvniReferenceInput";
import LocationSaveButton from "./components/LocationSaveButton";
import { Title } from "./components/Title";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import { Paper } from "@mui/material";
import { createdAudit, modifiedAudit } from "./components/AuditUtil";
import {
  StyledBox,
  datagridStyles,
  StyledSelectInput,
  StyledSimpleShowLayout,
  StyledShow
} from "./Util/Styles";
import { PrettyPagination } from "./Util/PrettyPagination.tsx";

const CustomListActions = () => {
  const { total, resource } = useListContext();

  return (
    <TopToolbar>
      <CreateButton />
      <ExportButton disabled={total === 0} resource={resource} />
    </TopToolbar>
  );
};

const LocationFilter = props => {
  const { ...filteredProps } = props;
  return (
    <FilterLiveSearch
      {...filteredProps}
      source="title"
      label="Search location"
      resettable={false}
      sx={{
        "& .MuiInputBase-input": {
          backgroundColor: "white"
        },
        "& .RaResettableTextField-clearButton": {
          backgroundColor: "white"
        },
        "& .MuiInputAdornment-root": {
          display: "none"
        },
        "& .MuiInputBase-root": {
          paddingRight: 0
        }
      }}
    />
  );
};

export const LocationList = props => (
  <StyledBox>
    <List
      {...props}
      sort={{ field: "title", order: "ASC" }}
      filters={<LocationFilter />}
      actions={<CustomListActions />}
      pagination={<PrettyPagination />}
    >
      <Datagrid rowClick="show" bulkActionButtons={false} sx={datagridStyles}>
        <TextField label="Name" source="title" />
        <TextField label="Type" source="typeString" />
        <TextField label="Full Address" source="titleLineage" />
      </Datagrid>
    </List>
  </StyledBox>
);

const SubLocationsGrid = props => {
  const listContext = useListContext();
  const data = listContext?.data || props.data || [];

  return isEmpty(data) ? (
    <None />
  ) : (
    <Datagrid rowClick="show" {...props} bulkActionButtons={false}>
      <TextField source="title" label="Name" />
      <TextField label="Type" source="typeString" />
    </Datagrid>
  );
};

const ParentLocationReferenceField = ({ addLabel = true, label, ...props }) => {
  const record = useRecordContext();
  return isNil(record?.parentId) ? (
    <None />
  ) : (
    <ReferenceField
      {...props}
      label={addLabel ? label || "Parent location" : false}
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

export const LocationDetail = props => (
  <StyledShow {...props} title={<Title title={"Location"} />}>
    <StyledSimpleShowLayout>
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
    </StyledSimpleShowLayout>
  </StyledShow>
);

const LocationCreateEditToolbar = ({ edit, ...props }) => (
  <Toolbar {...props}>
    {edit ? <SaveButton {...props} /> : <LocationSaveButton />}
    {edit && (
      <DeleteButton undoable={false} redirect="list" sx={{ ml: "auto" }} />
    )}
  </Toolbar>
);

const isRequired = required("This field is required");

let addressLevelTypes = [];

const LocationTypeSelectInput = props => {
  const [choices, setChoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dataProvider = useDataProvider();

  useEffect(() => {
    if (choices.length === 0 && !isLoading) {
      setIsLoading(true);

      dataProvider
        .getList("addressLevelType", {
          pagination: { page: 1, perPage: 25 },
          sort: { field: "id", order: "DESC" },
          filter: {}
        })
        .then(({ data }) => {
          console.log(
            "LocationTypeSelectInput: fetched addressLevelTypes",
            data
          );
          const mappedChoices = Array.isArray(data)
            ? data
            : data._embedded
            ? data._embedded.addressLevelType.map(item => ({
                id: item.id,
                name: item.name,
                parentId: item.parentId
              }))
            : [];

          setChoices(mappedChoices);
          addressLevelTypes = mappedChoices;
        })
        .catch(error => {
          console.error(
            "LocationTypeSelectInput: error fetching addressLevelTypes",
            error
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [dataProvider, choices.length, isLoading]);

  return (
    <StyledSelectInput
      source="typeId"
      {...props}
      choices={choices}
      loading={isLoading}
    />
  );
};

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

const LocationFormInner = ({ edit }) => {
  return (
    <>
      <AvniTextInput
        label="Name of new location"
        source="title"
        validate={isRequired}
        fullWidth
        toolTipKey={"ADMIN_LOCATION_NAME"}
      />
      <FormDataConsumer toolTipKey={"ADMIN_LOCATION_TYPE"}>
        {({ ...rest }) => (
          <LocationTypeSelectInput
            label="Type"
            source="typeId"
            optionText="name"
            disabled={edit}
            validate={isRequired}
            {...rest}
          />
        )}
      </FormDataConsumer>
      <FormDataConsumer>
        {({ formData, ...rest }) =>
          !isNil(getParentIdOfLocationType(formData.typeId)) && (
            <AvniReferenceInput
              label="Part of (location)"
              helperText="Which larger location is this location a part of?"
              source="parentId"
              reference="locations"
              filter={{
                searchURI: "findAsList",
                typeId: getParentIdOfLocationType(formData.typeId)
              }}
              {...rest}
            >
              <AutocompleteInput
                validate={isRequired}
                optionText={record =>
                  record ? `${record.titleLineage} (${record.typeString})` : ""
                }
                source="parentId"
                filterToQuery={searchText => ({ title: searchText })}
                debounce={500}
                shouldRenderSuggestions={value => value && value.length >= 2}
                noOptionsText="Type at least 2 characters to search locations"
                loadingText="Searching locations..."
                sx={{ width: "30rem" }}
              />
            </AvniReferenceInput>
          )
        }
      </FormDataConsumer>
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
  const notify = useNotify();
  const redirect = useRedirect();

  return (
    <SimpleForm
      toolbar={<LocationCreateEditToolbar edit={props.edit} />}
      redirect="show"
      mutationOptions={{
        onSuccess: () => {
          notify("Location created", { type: "info" });
          redirect("list", "locations");
        },
        onError: error => {
          notify(`Error: ${error.message}`, { type: "error" });
        }
      }}
      {...props}
    >
      <LocationFormInner {...props} />
    </SimpleForm>
  );
};

export const LocationCreate = props => (
  <Paper>
    <DocumentationContainer filename={"Location.md"}>
      <Create {...props} redirect="show" title="Add New Location">
        <LocationForm />
      </Create>
    </DocumentationContainer>
  </Paper>
);

export const LocationEdit = props => (
  <Edit title="Edit Location" redirect="show" {...props} undoable={false}>
    <LocationForm edit />
  </Edit>
);
