import {
  Datagrid,
  List,
  TextField,
  Create,
  Edit,
  SimpleForm,
  ReferenceField,
  ReferenceInput,
  useRecordContext,
} from "react-admin";
import Chip from "@mui/material/Chip";
import { Paper } from "@mui/material";
import { CatchmentSelectInput } from "./components/CatchmentSelectInput";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import { AvniSelectInput } from "./components/AvniSelectInput";
import { AvniFormDataConsumer } from "./components/AvniFormDataConsumer";
import {
  StyledBox,
  datagridStyles,
  StyledSimpleShowLayout,
  StyledShow,
} from "./Util/Styles";
import { PrettyPagination } from "./Util/PrettyPagination.tsx";

const sourceType = {
  userBasedIdentifierGenerator: {
    id: "userBasedIdentifierGenerator",
    name: "User based identifier generator",
  },
  userPoolBasedIdentifierGenerator: {
    id: "userPoolBasedIdentifierGenerator",
    name: "User pool based identifier generator",
  },
};

const operatingScopes = Object.freeze({
  NONE: "None",
  FACILITY: "ByFacility",
  CATCHMENT: "ByCatchment",
});

const Title = ({ record }) => {
  return record ? (
    <span>
      Identifier Source: <b>{record.name}</b>
    </span>
  ) : null;
};

const ShowSourceType = (props) => {
  const record = useRecordContext(props);
  return (
    <>
      {record && record.type && <Chip label={sourceType[record.type].name} />}
    </>
  );
};

export const IdentifierSourceList = (props) => (
  <StyledBox>
    <List
      {...props}
      title="Identifier Source"
      sort={{ field: "id", order: "DESC" }}
      pagination={<PrettyPagination />}
    >
      <Datagrid rowClick="show" bulkActionButtons={false} sx={datagridStyles}>
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
  </StyledBox>
);

export const IdentifierSourceDetail = (props) => (
  <StyledShow title={<Title />} {...props}>
    <StyledSimpleShowLayout>
      <TextField source="name" />
      <ShowSourceType source="type" showSourceTypeLabel={false} />
      <TextField source="batchGenerationSize" />
      <TextField source="minLength" />
      <TextField source="maxLength" />
      <TextField source="minimumBalance" />
      <ReferenceField source="catchmentId" reference="catchment">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="options.prefix" label="Prefix" />
    </StyledSimpleShowLayout>
  </StyledShow>
);

const IdentifierSourceForm = () => {
  return (
    <SimpleForm redirect="show">
      <AvniTextInput source="name" required toolTipKey="ADMIN_ID_SOURCE_NAME" />
      <AvniSelectInput
        source="type"
        choices={Object.values(sourceType)}
        required
        toolTipKey="ADMIN_ID_SOURCE_TYPE"
      />
      <AvniFormDataConsumer toolTipKey="ADMIN_ID_SOURCE_CATCHMENT">
        {({ formData, setValue, ...rest }) => (
          <ReferenceInput
            source="catchmentId"
            reference="catchment"
            label="Which catchment?"
            filterToQuery={(searchText) => ({ name: searchText })}
            onChange={(e, newVal) => {
              setValue(
                "operatingIndividualScope",
                isFinite(newVal)
                  ? operatingScopes.CATCHMENT
                  : operatingScopes.NONE,
              );
            }}
            {...rest}
          >
            <CatchmentSelectInput />
          </ReferenceInput>
        )}
      </AvniFormDataConsumer>
      <AvniTextInput
        source="batchGenerationSize"
        required
        toolTipKey="ADMIN_ID_SOURCE_BATCH_SIZE"
      />
      <AvniTextInput
        source="minimumBalance"
        required
        toolTipKey="ADMIN_ID_SOURCE_MIN_BALANCE"
      />
      <AvniTextInput
        source="minLength"
        required
        toolTipKey="ADMIN_ID_SOURCE_MIN_LENGTH"
      />
      <AvniTextInput
        source="maxLength"
        required
        toolTipKey="ADMIN_ID_SOURCE_MAX_LENGTH"
      />
      <AvniFormDataConsumer>
        {({ formData }) =>
          formData?.type === "userPoolBasedIdentifierGenerator" && (
            <AvniTextInput
              source="options.prefix"
              label="Prefix"
              toolTipKey="ADMIN_ID_SOURCE_PREFIX"
            />
          )
        }
      </AvniFormDataConsumer>
    </SimpleForm>
  );
};

export const IdentifierSourceEdit = (props) => (
  <Edit
    mutationMode="pessimistic"
    title="Edit Identifier Source"
    redirect="show"
    {...props}
  >
    <IdentifierSourceForm />
  </Edit>
);

export const IdentifierSourceCreate = (props) => (
  <Paper>
    <DocumentationContainer filename="IdentifierSource.md">
      <Create
        title="Add New Identifier Source"
        redirect="show"
        mutationMode="pessimistic"
        {...props}
      >
        <IdentifierSourceForm />
      </Create>
    </DocumentationContainer>
  </Paper>
);
