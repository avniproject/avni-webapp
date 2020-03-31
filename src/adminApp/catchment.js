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
  ReferenceArrayField
} from "react-admin";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import { LineBreak } from "../common/components/utils";
import LocationUtils from "./LocationUtils";
import _ from "lodash";
import { Title } from "./components/Title";
import Chip from "@material-ui/core/Chip";

const TitleChip = props => {
  return <Chip label={`${props.record.title} (${props.record.typeString})`} />;
};

export const CatchmentCreate = props => (
  <Create {...props}>
    <CatchmentForm />
  </Create>
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
        <TextField label="Type" source="type" />
        <ReferenceArrayField label="Locations" reference="locations" source="locationIds">
          <SingleFieldList>
            <TitleChip source="title" />
          </SingleFieldList>
        </ReferenceArrayField>
        <TextField label="Created by" source="createdBy" />
        <TextField label="Last modified by" source="lastModifiedBy" />
        <TextField label="Created On(datetime)" source="createdDateTime" />
        <TextField label="Last modified On(datetime)" source="modifiedDateTime" />
      </SimpleShowLayout>
    </Show>
  );
};

export const CatchmentList = props => (
  <List {...props} bulkActions={false}>
    <Datagrid rowClick="show">
      <TextField label="Catchment" source="name" />
      <TextField label="Type" source="type" />
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
      <TextInput source="name" label="Name" />
      <TextInput source="type" label="Type" />

      <ReferenceArrayInput
        reference="locations"
        source="locationIds"
        perPage={1000}
        label="Locations"
        filterToQuery={searchText => ({ title: searchText })}
      >
        <LocationAutocomplete optionText={optionRenderer} />
      </ReferenceArrayInput>

      <LineBreak num={1} />
    </SimpleForm>
  );
};
