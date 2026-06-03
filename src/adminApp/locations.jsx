import { useEffect, useMemo, useRef, useState } from "react";
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
  useRedirect,
} from "react-admin";
import { debounce, isEmpty, find, isNil } from "lodash";
import { None } from "../common/components/utils";
import { AvniReferenceInput } from "./components/AvniReferenceInput";
import LocationSaveButton from "./components/LocationSaveButton";
import { Title } from "./components/Title";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import CascadingAncestorFilter from "./components/CascadingAncestorFilter";
import {
  Box,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import { createdAudit, modifiedAudit } from "./components/AuditUtil";
import {
  StyledBox,
  datagridStyles,
  StyledSelectInput,
  StyledSimpleShowLayout,
  StyledShow,
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

const FILTER_DEBOUNCE_MS = 500;

const TypeFilter = ({ onChangeFilter }) => {
  const { filterValues } = useListContext();
  const [choices, setChoices] = useState([]);
  const dataProvider = useDataProvider();

  useEffect(() => {
    dataProvider
      .getList("addressLevelType", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "level", order: "DESC" },
        filter: {},
      })
      .then(({ data }) => {
        const raw = Array.isArray(data)
          ? data
          : data?._embedded?.addressLevelType || [];
        setChoices(raw.map((t) => ({ id: t.id, name: t.name })));
      })
      .catch(() => setChoices([]));
  }, [dataProvider]);

  const [localValue, setLocalValue] = useState(() =>
    filterValues.typeId == null || filterValues.typeId === ""
      ? ""
      : Number(filterValues.typeId),
  );

  useEffect(() => {
    const fromContext =
      filterValues.typeId == null || filterValues.typeId === ""
        ? ""
        : Number(filterValues.typeId);
    setLocalValue(fromContext);
  }, [filterValues.typeId]);

  const onChange = (event) => {
    const value = event.target.value;
    setLocalValue(value);
    onChangeFilter(
      "typeId",
      value === "" || value == null ? null : Number(value),
    );
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        Type
      </Typography>
      <FormControl fullWidth size="small">
        <Select
          value={localValue}
          onChange={onChange}
          displayEmpty
          sx={{ backgroundColor: "white" }}
        >
          <MenuItem value="">
            <em>All types</em>
          </MenuItem>
          {choices.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

const LocationFilter = () => {
  const { filterValues, setFilters, displayedFilters } = useListContext();

  // Keep the latest filterValues in a ref so the debounced flush merges against
  // values that may have changed (e.g. FilterLiveSearch's title update) during
  // the debounce window, rather than the snapshot taken at call time.
  const filterValuesRef = useRef(filterValues);
  useEffect(() => {
    filterValuesRef.current = filterValues;
  }, [filterValues]);

  const displayedFiltersRef = useRef(displayedFilters);
  useEffect(() => {
    displayedFiltersRef.current = displayedFilters;
  }, [displayedFilters]);

  // Accumulate every key changed within the debounce window into a single patch.
  // lodash.debounce keeps only the last call's arguments, so passing a per-key
  // mutate function dropped all but the most recent change — clearing one filter
  // while another changed (or clearing several at once) left stale filters behind.
  const pendingPatchRef = useRef({});

  const debouncedFlush = useMemo(
    () =>
      debounce(() => {
        const patch = pendingPatchRef.current;
        pendingPatchRef.current = {};
        const next = { ...filterValuesRef.current };
        Object.entries(patch).forEach(([key, value]) => {
          if (value == null || value === "") {
            delete next[key];
          } else {
            next[key] = value;
          }
        });
        setFilters(next, displayedFiltersRef.current);
      }, FILTER_DEBOUNCE_MS),
    [setFilters],
  );

  useEffect(() => () => debouncedFlush.cancel(), [debouncedFlush]);

  const updateFilter = (key, value) => {
    pendingPatchRef.current[key] = value == null || value === "" ? null : value;
    debouncedFlush();
  };

  const onAncestorChange = (location) => {
    updateFilter("ancestorId", location?.id ?? null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 1,
        width: 320,
      }}
    >
      <FilterLiveSearch
        source="title"
        label="Search location"
        resettable={false}
        sx={{
          "& .MuiInputBase-input": {
            backgroundColor: "white",
          },
          "& .RaResettableTextField-clearButton": {
            backgroundColor: "white",
          },
          "& .MuiInputAdornment-root": {
            display: "none",
          },
          "& .MuiInputBase-root": {
            paddingRight: 0,
          },
        }}
      />
      <Box>
        <Typography variant="caption" color="text.secondary">
          Under location
        </Typography>
        <CascadingAncestorFilter onChange={onAncestorChange} />
      </Box>
      <TypeFilter onChangeFilter={updateFilter} />
    </Box>
  );
};

export const LocationList = (props) => (
  <StyledBox>
    <List
      {...props}
      sort={{ field: "title", order: "ASC" }}
      filters={<LocationFilter />}
      filter={{ searchURI: "find" }}
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

const SubLocationsGrid = (props) => {
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
        render={(record) => `${record.title} (${record.typeString})`}
      />
    </ReferenceField>
  );
};

export const LocationDetail = (props) => (
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
      <FunctionField label="Created" render={(audit) => createdAudit(audit)} />
      <FunctionField
        label="Modified"
        render={(audit) => modifiedAudit(audit)}
      />
      <TextField source="uuid" label="UUID" />
    </StyledSimpleShowLayout>
  </StyledShow>
);

const LocationCreateEditToolbar = ({ edit, ...props }) => (
  <Toolbar {...props}>
    {edit ? <SaveButton {...props} /> : <LocationSaveButton />}
    {edit && (
      <DeleteButton
        mutationMode="pessimistic"
        redirect="list"
        sx={{ ml: "auto" }}
      />
    )}
  </Toolbar>
);

const isRequired = required("This field is required");

let addressLevelTypes = [];

const LocationTypeSelectInput = (props) => {
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
          filter: {},
        })
        .then(({ data }) => {
          console.log(
            "LocationTypeSelectInput: fetched addressLevelTypes",
            data,
          );
          const mappedChoices = Array.isArray(data)
            ? data
            : data._embedded
              ? data._embedded.addressLevelType.map((item) => ({
                  id: item.id,
                  name: item.name,
                  parentId: item.parentId,
                }))
              : [];

          setChoices(mappedChoices);
          addressLevelTypes = mappedChoices;
        })
        .catch((error) => {
          console.error(
            "LocationTypeSelectInput: error fetching addressLevelTypes",
            error,
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

const getParentIdOfLocationType = (typeId) => {
  if (isNil(typeId)) return null;
  let type = find(addressLevelTypes, { id: typeId });
  return isNil(type) ? null : type.parentId;
};

const getNameOfLocationType = (typeId) => {
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
                typeId: getParentIdOfLocationType(formData.typeId),
              }}
              {...rest}
            >
              <AutocompleteInput
                validate={isRequired}
                optionText={(record) =>
                  record ? `${record.titleLineage} (${record.typeString})` : ""
                }
                source="parentId"
                filterToQuery={(searchText) => ({ title: searchText })}
                debounce={500}
                shouldRenderSuggestions={(value) => value && value.length >= 2}
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

export const LocationForm = (props) => {
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
        onError: (error) => {
          notify(`Error: ${error.message}`, { type: "error" });
        },
      }}
      {...props}
    >
      <LocationFormInner {...props} />
    </SimpleForm>
  );
};

export const LocationCreate = (props) => (
  <Paper>
    <DocumentationContainer filename={"Location.md"}>
      <Create
        {...props}
        redirect="show"
        title="Add New Location"
        mutationMode="pessimistic"
      >
        <LocationForm />
      </Create>
    </DocumentationContainer>
  </Paper>
);

export const LocationEdit = (props) => (
  <Edit
    title="Edit Location"
    redirect="show"
    {...props}
    mutationMode="pessimistic"
  >
    <LocationForm edit />
  </Edit>
);
