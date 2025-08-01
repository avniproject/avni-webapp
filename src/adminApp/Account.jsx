import {
  Create,
  Datagrid,
  Edit,
  List,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  Toolbar,
  SaveButton
} from "react-admin";
import { Title } from "./components/Title";
import {
  StyledBox,
  StyledTextInput,
  datagridStyles,
  StyledShow,
  StyledSimpleShowLayout
} from "./Util/Styles";
import { PrettyPagination } from "./Util/PrettyPagination.tsx";

//To remove delete button from the toolbar
const CustomToolbar = props => (
  <Toolbar {...props}>
    <SaveButton />
  </Toolbar>
);

export const AccountList = props => (
  <StyledBox>
    <List
      {...props}
      bulkActionButtons={false}
      filter={{ searchURI: "findAll" }}
      sort={{ field: "id", order: "DESC" }}
      pagination={<PrettyPagination />}
    >
      <Datagrid rowClick="show" bulkActionButtons={false} sx={datagridStyles}>
        <TextField label="Name" source="name" />
        <TextField label="Region" source="region" />
      </Datagrid>
    </List>
  </StyledBox>
);

export const AccountDetails = props => (
  <StyledShow title={<Title title={"Account"} />} {...props}>
    <StyledSimpleShowLayout>
      <TextField source="name" label="Name" />
      <TextField source="region" label="Region" />
    </StyledSimpleShowLayout>
  </StyledShow>
);

export const AccountCreate = props => (
  <Create title="Add a new Account" {...props}>
    <SimpleForm redirect="list">
      <StyledTextInput source="name" />
      <StyledTextInput source="region" />
    </SimpleForm>
  </Create>
);

export const AccountEdit = props => (
  <Edit undoable={false} title={<Title title={"Edit account"} />} {...props}>
    <SimpleForm toolbar={<CustomToolbar />} redirect="list">
      <StyledTextInput source="name" />
      <StyledTextInput source="region" />
    </SimpleForm>
  </Edit>
);
