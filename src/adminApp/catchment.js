import React, { Fragment } from "react";
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
  FormDataConsumer,
  REDUX_FORM_NAME,
  DisabledInput
} from "react-admin";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import { LineBreak } from "../common/components/utils";
import _ from "lodash";
import { Title } from "./components/Title";
import Chip from "@material-ui/core/Chip";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import { ToolTipContainer } from "../common/components/ToolTipContainer";
import { Paper } from "@material-ui/core";
import { createdAudit, modifiedAudit } from "./components/AuditUtil";
import { change } from "redux-form";

const CatchmentFilter = props => (
  <Filter {...props}>
    <TextInput label="Search catchment" source="name" resettable alwaysOn />
  </Filter>
);

const TitleChip = props => {
  return <Chip label={`${props.record.title} (${props.record.typeString})`} />;
};

const catchmentChangeMessage = `Please note that changing locations in the catchment will 
delete the fast sync setup for this catchment`;

export const CatchmentCreate = props => (
  <Paper>
    <DocumentationContainer filename={"Catchment.md"}>
      <Create {...props}>
        <CatchmentForm />
      </Create>
    </DocumentationContainer>
  </Paper>
);

export const CatchmentEdit = props => {
  const [displayWarning, setDisplayWarning] = React.useState(true);
  return (
    <Edit {...props} title="Edit Catchment" undoable={false}>
      <CatchmentForm edit displayWarning={displayWarning} setDisplayWarning={setDisplayWarning} />
    </Edit>
  );
};

export const CatchmentDetail = props => {
  return (
    <Show
      title={<Title title={"Catchment"} />}
      actions={<CustomShowActions hasEditPrivilege={props.hasEditPrivilege} />}
      {...props}
    >
      <SimpleShowLayout>
        <TextField label="Catchment" source="name" />
        <ReferenceArrayField label="Locations" reference="locations" source="locationIds">
          <SingleFieldList>
            <TitleChip source="title" />
          </SingleFieldList>
        </ReferenceArrayField>
        <FunctionField label="Created" render={audit => createdAudit(audit)} />
        <FunctionField label="Modified" render={audit => modifiedAudit(audit)} />
        <TextField source="uuid" label="UUID" />
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

const CustomShowActions = ({ basePath, data, hasEditPrivilege }) => {
  return (
    (data && hasEditPrivilege && (
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
  if (!values.name || !values.name.trim()) {
    errors.name = ["Catchment name should contain at least one non-whitespace character"];
  }
  return errors;
};

let LOCATIONS;

const LocationAutocomplete = props => {
  LOCATIONS = props.choices;
  return <AutocompleteArrayInput {...props} />;
};

const CatchmentForm = ({ edit, displayWarning, setDisplayWarning, ...props }) => {
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
          <FormDataConsumer>
            {({ formData, dispatch, ...rest }) => {
              return (
                <Fragment>
                  <ReferenceArrayInput
                    reference="locations"
                    source="locationIds"
                    perPage={1000}
                    label="Locations"
                    filterToQuery={searchText => ({ title: searchText })}
                    onChange={() => {
                      if (edit && props.record.fastSyncExists && displayWarning) {
                        setDisplayWarning(false);
                        dispatch(change(REDUX_FORM_NAME, "deleteFastSync", true));
                        alert(catchmentChangeMessage);
                      }
                    }}
                    {...rest}
                  >
                    <LocationAutocomplete optionText={optionRenderer} />
                  </ReferenceArrayInput>
                  <DisabledInput
                    source="deleteFastSync"
                    defaultValue={false}
                    style={{ display: "none" }}
                  />
                </Fragment>
              );
            }}
          </FormDataConsumer>
        </div>
      </ToolTipContainer>

      <LineBreak num={1} />
    </SimpleForm>
  );
};
