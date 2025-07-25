import { useEffect, useState } from "react";
import {
  Datagrid,
  List,
  TextField,
  Show,
  SimpleShowLayout,
  TextInput,
  Create,
  Edit,
  SimpleForm,
  EditButton,
  ReferenceArrayInput,
  SingleFieldList,
  AutocompleteArrayInput,
  ReferenceArrayField,
  Filter,
  FunctionField,
  useRecordContext
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { Typography, CardActions, Chip, Paper } from "@mui/material";
import { LineBreak } from "../common/components/utils";
import _ from "lodash";
import { Title } from "./components/Title";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import { ToolTipContainer } from "../common/components/ToolTipContainer";
import { createdAudit, modifiedAudit } from "./components/AuditUtil";

const catchmentChangeMessage = `Please note that changing locations in the catchment will 
delete the fast sync setup for this catchment`;

const CatchmentFilter = props => (
  <Filter {...props}>
    <TextInput label="Search catchment" source="name" resettable alwaysOn />
  </Filter>
);

const TitleChip = ({ record }) => {
  if (!record) return null;
  return <Chip label={`${record.title} (${record.typeString})`} />;
};

export const CatchmentCreate = props => (
  <Paper>
    <DocumentationContainer filename="Catchment.md">
      <Create {...props}>
        <CatchmentForm />
      </Create>
    </DocumentationContainer>
  </Paper>
);

export const CatchmentEdit = props => {
  const [displayWarning, setDisplayWarning] = useState(true);
  return (
    <Edit {...props} title="Edit Catchment" undoable={false}>
      <CatchmentForm
        edit
        displayWarning={displayWarning}
        setDisplayWarning={setDisplayWarning}
      />
    </Edit>
  );
};

const CustomCatchmentShowActions = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <CardActions style={{ zIndex: 2, display: "inline-block", float: "right" }}>
      <EditButton label="Edit Catchment" />
    </CardActions>
  );
};

export const CatchmentDetail = props => (
  <Show
    title={<Title title="Catchment" />}
    actions={<CustomCatchmentShowActions />}
    {...props}
  >
    <SimpleShowLayout>
      <TextField label="Catchment" source="name" />
      <ReferenceArrayField
        label="Locations"
        reference="locations"
        source="locationIds"
      >
        <SingleFieldList>
          <TitleChip />
        </SingleFieldList>
      </ReferenceArrayField>
      <FunctionField label="Created" render={audit => createdAudit(audit)} />
      <FunctionField label="Modified" render={audit => modifiedAudit(audit)} />
      <TextField source="uuid" label="UUID" />
    </SimpleShowLayout>
  </Show>
);

export const CatchmentList = props => (
  <List {...props} bulkActionButtons={false} filters={<CatchmentFilter />}>
    <Datagrid rowClick="show">
      <TextField label="Catchment" source="name" />
    </Datagrid>
  </List>
);

const useCatchmentLocationChange = ({
  edit,
  record,
  displayWarning,
  setDisplayWarning
}) => {
  const { setValue } = useFormContext();
  const locationIds = useWatch({ name: "locationIds" });

  useEffect(() => {
    if (edit && record?.fastSyncExists && displayWarning) {
      setDisplayWarning(false);
      setValue("deleteFastSync", true);
      alert(catchmentChangeMessage);
    }
  }, [locationIds]);
};

const CatchmentForm = ({
  edit = false,
  displayWarning,
  setDisplayWarning,
  ...props
}) => {
  const record = useRecordContext();
  useCatchmentLocationChange({
    edit,
    record,
    displayWarning,
    setDisplayWarning
  });

  const optionRenderer = choice => {
    let retVal = `${choice.title} (${choice.typeString})`;
    let lineageParts = choice.titleLineage.split(", ");
    if (lineageParts.length > 1)
      retVal += ` in ${lineageParts.slice(0, -1).join(" > ")}`;
    return retVal;
  };

  const validateCatchment = values => {
    const errors = {};
    if (_.isEmpty(values.locationIds))
      errors.locationIds = ["It cannot be empty"];
    if (!values.name || !values.name.trim()) {
      errors.name = [
        "Catchment name should contain at least one non-whitespace character"
      ];
    }
    return errors;
  };

  return (
    <SimpleForm validate={validateCatchment} {...props} redirect="show">
      <Typography variant="h6">Catchment</Typography>

      <AvniTextInput
        source="name"
        label="Name"
        toolTipKey="ADMIN_CATCHMENT_NAME"
      />

      <ToolTipContainer toolTipKey="ADMIN_CATCHMENT_LOCATIONS">
        <div style={{ maxWidth: 400 }}>
          <ReferenceArrayInput
            reference="locations"
            source="locationIds"
            perPage={1000}
            label="Locations"
            filterToQuery={searchText => ({ title: searchText })}
          >
            <AutocompleteArrayInput optionText={optionRenderer} />
          </ReferenceArrayInput>
        </div>
      </ToolTipContainer>

      <TextInput
        source="deleteFastSync"
        defaultValue={false}
        style={{ display: "none" }}
        readOnly
      />

      <LineBreak num={1} />
    </SimpleForm>
  );
};
