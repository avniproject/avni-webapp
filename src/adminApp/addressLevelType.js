import React from "react";
import {
  Create,
  Datagrid,
  DeleteButton,
  Edit,
  FunctionField,
  List,
  number,
  ReferenceField,
  required,
  SaveButton,
  SelectInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  Toolbar
} from "react-admin";
import { None } from "../common/components/utils";
import { isNil } from "lodash";
import { Title } from "./components/Title";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { AvniTextInput } from "./components/AvniTextInput";
import { Box, Paper } from "@mui/material";
import { AvniReferenceInput } from "./components/AvniReferenceInput";
import { createdAudit, modifiedAudit } from "./components/AuditUtil";
import { ToolTipContainer } from "../common/components/ToolTipContainer";

export const LocationTypeList = props => (
  <List {...props} bulkActions={false} title="Location Types" sort={{ field: "level", order: "DESC" }}>
    <Datagrid rowClick="show">
      <TextField label="Location Type" source="name" />
      <TextField label="Level" source="level" />
      <ReferenceField label="Parent" source="parentId" reference="addressLevelType" linkType="show" allowEmpty>
        <TextField source="name" />
      </ReferenceField>
    </Datagrid>
  </List>
);

const ParentReferenceField = ({ showToolTip, ...props }) => {
  const Container = showToolTip ? ToolTipContainer : Box;
  return isNil(props.record.parentId) ? (
    <None />
  ) : (
    <Container toolTipKey={"ADMIN_LOCATION_TYPE_PARENT"} styles={{ paddingTop: 10, marginRight: "10px" }}>
      <ReferenceField {...props} source="parentId" linkType="show" reference="addressLevelType" allowEmpty>
        <FunctionField render={record => record.name} />
      </ReferenceField>
    </Container>
  );
};

ParentReferenceField.defaultProps = {
  addLabel: true
};

export const LocationTypeDetail = props => (
  <Show {...props} title={<Title title={"Location Type"} />}>
    <SimpleShowLayout>
      <TextField label="Location Type" source="name" />
      <TextField label="Level" source="level" />
      <ParentReferenceField label="Parent Type" showToolTip={false} />
      <FunctionField label="Created" render={audit => createdAudit(audit)} />
      <FunctionField label="Modified" render={audit => modifiedAudit(audit)} />
      <TextField source="uuid" label="UUID" />
    </SimpleShowLayout>
  </Show>
);

const CreateEditToolbar = ({ edit, ...props }) => (
  <Toolbar {...props}>
    <SaveButton />
    {edit && <DeleteButton undoable={false} style={{ marginLeft: "auto" }} />}
  </Toolbar>
);

const LocationTypeForm = ({ edit, ...props }) => {
  return (
    <SimpleForm toolbar={<CreateEditToolbar edit={edit} />} {...props} redirect="show">
      <AvniTextInput source="name" label="Name" validate={required()} toolTipKey={"ADMIN_LOCATION_TYPE_NAME"} />
      <AvniTextInput source="level" label="Level" validate={[required(), number()]} toolTipKey={"ADMIN_LOCATION_TYPE_LEVEL"} />
      {edit ? (
        <ParentReferenceField label="Parent Type" showToolTip={true} />
      ) : (
        <AvniReferenceInput source="parentId" reference="addressLevelType" label="Parent" toolTipKey={"ADMIN_LOCATION_TYPE_PARENT"}>
          <SelectInput optionText="name" resettable />
        </AvniReferenceInput>
      )}
    </SimpleForm>
  );
};

export const LocationTypeCreate = props => (
  <Paper>
    <DocumentationContainer filename={"LocationType.md"}>
      <Create {...props} title="Add New Location Type">
        <LocationTypeForm />
      </Create>
    </DocumentationContainer>
  </Paper>
);

export const LocationTypeEdit = props => (
  <Edit {...props} title="Edit Location Type" undoable={false}>
    <LocationTypeForm edit />
  </Edit>
);
