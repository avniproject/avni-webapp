import {
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  Edit,
  List,
  ReferenceArrayField,
  ReferenceArrayInput,
  ReferenceField,
  ReferenceInput,
  required,
  Show,
  SimpleForm,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  TextInput,
} from "react-admin";
import { TitleChip } from "./components/TitleChip";
import { Title } from "./components/Title";
import ToggleAnalyticsButton from "./ToggleAnalyticsButton";
import {
  StyledBox,
  StyledTextInput,
  datagridStyles,
  StyledAutocompleteArrayInput,
  StyledSelectInput,
  StyledShow,
  StyledSimpleShowLayout,
} from "./Util/Styles";
import { PrettyPagination } from "./Util/PrettyPagination.tsx";

const normalizeInput = (value) => {
  return value ? value.trim().replace(/\s+/g, " ") : value;
};

const normalizeInputAfterExcludingSpaces = (value) => {
  return value ? value.trim().replace(/\s+/g, "") : value;
};

export const OrganisationGroupList = (props) => (
  <StyledBox>
    <List
      {...props}
      sort={{ field: "id", order: "DESC" }}
      pagination={<PrettyPagination />}
    >
      <Datagrid rowClick="show" bulkActionButtons={false} sx={datagridStyles}>
        <TextField label="Name" source="name" />
        <TextField label="DB User" source="dbUser" />
        <TextField source="schemaName" label="Schema name" />
        <BooleanField
          source="analyticsDataSyncActive"
          label="Active analytics data sync"
        />
        <ReferenceField
          resource="account"
          source="accountId"
          reference="account"
          label="Account Name"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceArrayField
          label="Organisations"
          reference="organisation"
          source="organisationIds"
          sort={{ field: "name", order: "ASC" }}
          sx={{
            "& .RaReferenceArrayField-chip": {
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
              "&:hover": {
                backgroundColor: "#bbdefb",
              },
            },
            "& .RaReferenceArrayField-list": {
              gap: "4px",
            },
          }}
        >
          <SingleFieldList sx={{ py: 0.5 }}>
            <TitleChip
              sx={{
                backgroundColor: "#e3f2fd",
                color: "#1976d2",
                "&:hover": {
                  backgroundColor: "#bbdefb",
                },
              }}
            />
          </SingleFieldList>
        </ReferenceArrayField>
      </Datagrid>
    </List>
  </StyledBox>
);

export const OrganisationGroupShow = (props) => (
  <StyledShow title={<Title title={"Organisation group"} />} {...props}>
    <StyledSimpleShowLayout>
      <TextField source="name" label="Name" />
      <TextField source="dbUser" label="DB User" />
      <TextField source="schemaName" label="Schema name" />
      <BooleanField
        source="analyticsDataSyncActive"
        label="Active analytics data sync"
      />
      <ReferenceField
        resource="account"
        source="accountId"
        reference="account"
        label="Account Name"
      >
        <TextField source="name" />
      </ReferenceField>
      <ReferenceArrayField
        label="Organisations"
        reference="organisation"
        source="organisationIds"
        sort={{ field: "name", order: "ASC" }}
        sx={{
          "& .RaReferenceArrayField-chip": {
            backgroundColor: "#e3f2fd",
            color: "#1976d2",
            "&:hover": {
              backgroundColor: "#bbdefb",
            },
          },
          "& .RaReferenceArrayField-list": {
            gap: "4px",
          },
        }}
      >
        <SingleFieldList sx={{ py: 0.5 }}>
          <TitleChip
            sx={{
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
              "&:hover": {
                backgroundColor: "#bbdefb",
              },
            }}
          />
        </SingleFieldList>
      </ReferenceArrayField>
    </StyledSimpleShowLayout>
  </StyledShow>
);

export const organisationGroupCreate = (props) => (
  <Create title="Add a new Organisation Group" {...props}>
    <SimpleForm redirect="list">
      <StyledTextInput
        source="name"
        label="Name"
        validate={required("Name cannot be empty")}
        parse={normalizeInput}
      />
      <StyledTextInput
        source="dbUser"
        label="DB User"
        validate={required("DB user cannot be empty")}
        parse={normalizeInputAfterExcludingSpaces}
      />
      <StyledTextInput
        source="schemaName"
        label="Schema name"
        validate={required("Schema name cannot be empty")}
        parse={normalizeInputAfterExcludingSpaces}
      />
      <BooleanInput source="analyticsDataSyncActive" />
      <ReferenceInput
        resource="account"
        source="accountId"
        reference="account"
        label="Account Name"
      >
        <StyledSelectInput
          source="name"
          resettable
          validate={required("Please select an account")}
        />
      </ReferenceInput>
      <ReferenceArrayInput
        reference="organisation"
        source="organisationIds"
        perPage={1000}
        label="Organisations"
        filterToQuery={(searchText) => ({ name: searchText })}
      >
        <StyledAutocompleteArrayInput
          validate={required("Please choose organisations")}
        />
      </ReferenceArrayInput>
    </SimpleForm>
  </Create>
);

export const organisationGroupEdit = (props) => (
  <Edit
    mutationMode="pessimistic"
    title={<Title title={"Edit organisation group"} />}
    {...props}
  >
    <SimpleForm redirect="list">
      <StyledTextInput
        source="name"
        label="Name"
        validate={required("Name cannot be empty")}
        parse={normalizeInput}
      />
      <StyledTextInput disabled source="dbUser" label="DB User" />
      <StyledTextInput disabled source="schemaName" label="Schema name" />
      {/* Hidden inputs to preserve critical fields in form submission */}
      <TextInput source="dbUser" style={{ display: "none" }} />
      <TextInput source="schemaName" style={{ display: "none" }} />
      <BooleanField source="analyticsDataSyncActive" />
      <ToggleAnalyticsButton />
      <br />
      <ReferenceInput
        resource="account"
        source="accountId"
        reference="account"
        label="Account Name"
      >
        <StyledSelectInput
          source="name"
          resettable
          validate={required("Please select an account")}
        />
      </ReferenceInput>
      <ReferenceArrayInput
        reference="organisation"
        source="organisationIds"
        perPage={1000}
        label="Organisations"
        filterToQuery={(searchText) => ({ name: searchText })}
      >
        <StyledAutocompleteArrayInput
          validate={required("Please choose organisations")}
        />
      </ReferenceArrayInput>
    </SimpleForm>
  </Edit>
);
