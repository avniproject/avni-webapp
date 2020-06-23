import React from "react";
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
  FunctionField
} from "react-admin";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import { LineBreak } from "../common/components/utils";
import LocationUtils from "./LocationUtils";
import _ from "lodash";
import { Title } from "./components/Title";
import Chip from "@material-ui/core/Chip";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import { ToolTipContainer } from "../common/components/ToolTipContainer";
import { Paper } from "@material-ui/core";
import { createdAudit, modifiedAudit } from "./components/AuditUtil";

const CatchmentFilter = props => (
  <Filter {...props}>
    <TextInput label="Search catchment" source="name" resettable alwaysOn />
  </Filter>
);

const TitleChip = props => {
  return <Chip label={`${props.record.title} (${props.record.typeString})`} />;
};

export const CatchmentCreate = props => (
  <Paper>
    <DocumentationContainer filename={"Catchment.md"}>
      <Create {...props}>
        <CatchmentForm />
      </Create>
    </DocumentationContainer>
  </Paper>
);

export const CatchmentEdit = props => (
  <Edit {...props} title="Edit Catchment" undoable={false}>
    <CatchmentForm edit />
  </Edit>
);

export const CatchmentDetail = props => {
  return (
    <Show title={<Title title={"Catchment"} />} actions={<CustomShowActions />} {...props}>
      <SimpleShowLayout>
        <TextField label="Catchment" source="name" />
        <ReferenceArrayField label="Locations" reference="locations" source="locationIds">
          <SingleFieldList>
            <TitleChip source="title" />
          </SingleFieldList>
        </ReferenceArrayField>
        <FunctionField label="Created" render={audit => createdAudit(audit)} />
        <FunctionField label="Modified" render={audit => modifiedAudit(audit)} />
      </SimpleShowLayout>
    </Show>
  );
};

export const CatchmentList = props => (
  <List {...props} bulkActions={false} filters={<CatchmentFilter />}>
    <Datagrid rowClick="show">
      <TextField label="Catchment" source="name" />
    </Datagrid>
  </List>
);

const CustomShowActions = ({ basePath, data, resource }) => {
  return (
    (data && (
      <CardActions style={{ zIndex: 2, display: "inline-block", float: "right" }}>
        <EditButton label="Edit Catchment" basePath={basePath} record={data} />
      </CardActions>
    )) ||
    null
  );
};

const validateCatchment = (values, allLocations) => {
  const errors = {};
  if (!allLocations) return errors;
  if (_.isEmpty(values.locationIds)) errors.locationIds = ["It can not be empty"];
  if (!LocationUtils.areAtTheSameLevel(values.locationIds, allLocations))
    errors.locationIds = ["All locations must be of same level"];
  return errors;
};

let LOCATIONS;

const LocationAutocomplete = props => {
  LOCATIONS = props.choices;
  return <AutocompleteArrayInput {...props} />;
};

const CatchmentForm = ({ edit, ...props }) => {
  const optionRenderer = choice => {
    let retVal = `${choice.title} (${choice.typeString})`;
    let lineageParts = choice.titleLineage.split(", ");
    if (lineageParts.length > 1)
      retVal += ` in ${lineageParts.slice(0, lineageParts.length - 1).join(" > ")}`;
    return retVal;
  };

  return (
    <SimpleForm
      validate={values => validateCatchment(values, LOCATIONS)}
      {...props}
      redirect="show"
    >
      <Typography variant="title" component="h3">
        Catchment
      </Typography>
      <AvniTextInput source="name" label="Name" toolTipKey={"ADMIN_CATCHMENT_NAME"} />

      <ToolTipContainer toolTipKey={"ADMIN_CATCHMENT_LOCATIONS"}>
        <div style={{ maxWidth: 400 }}>
          <ReferenceArrayInput
            reference="locations"
            source="locationIds"
            perPage={1000}
            label="Locations"
            filterToQuery={searchText => ({ title: searchText })}
          >
            <LocationAutocomplete optionText={optionRenderer} />
          </ReferenceArrayInput>
        </div>
      </ToolTipContainer>

      <LineBreak num={1} />
    </SimpleForm>
  );
};
