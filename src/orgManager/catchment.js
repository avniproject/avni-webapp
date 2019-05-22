import React from "react";
import {
     Datagrid, List,TextField, Show, SimpleShowLayout,
     Filter, TextInput, Create, Edit, SimpleForm, Toolbar,
     SaveButton, EditButton
} from 'react-admin';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import { LineBreak } from "../common/components";

export const CatchmentCreate = props => (
    <Create {...props}>
        <CatchmentForm />
    </Create>
);

export const CatchmentEdit = props => (
    <Edit {...props} title={<UserTitle titlePrefix="Edit"/>} undoable={false}>
        <CatchmentForm edit />
    </Edit>
);

const UserTitle = ({record, titlePrefix}) => {
    return record && <span>{titlePrefix} user <b>{record.username}</b></span>;
};

export const CatchmentDetail = props => (
    <Show  actions={<CustomShowActions/>} {...props}>
        <SimpleShowLayout>
        <TextField label="Catchment" source="name"/>        
        <TextField label="Type" source="type"/>
        <TextField label="Location" source="address_level.title"/>
        {/* <ReferenceArrayField label="Location" reference="name" source="address_level">
                <SingleFieldList>
                    <ChipField source="address_level.title" />
                </SingleFieldList>
            </ReferenceArrayField> */}
        </SimpleShowLayout>
    </Show>
);

const CatchmentFilter = props => (
    <Filter {...props} style={{marginBottom: '2em'}}>
         <TextInput label="Catchment" source="name" resettable alwaysOn />
        <TextInput label="Type" source="type" resettable alwaysOn />
    </Filter>
);

export const CatchmentList = props => (
    <List {...props}
    filters={<CatchmentFilter/>}>
        <Datagrid rowClick="show">
        <TextField label="Catchment" source="name"/>
        <TextField label="Type" source="type"/>
        <TextField label="Location" source="address_level.title"/>
        {/* <ReferenceArrayField label="Location" reference="name" source="address_level">
                <SingleFieldList>
                    <ChipField source="address_level.title" />
                </SingleFieldList>
            </ReferenceArrayField> */}
        </Datagrid>
    </List>
);

const CustomShowActions = ({basePath, data, resource}) => {
    return (data &&
        <CardActions style={{ zIndex: 2, display: 'inline-block', float: 'right' }}>
            <EditButton label="Edit Catchment" basePath={basePath} record={data} />
        </CardActions>)
        || null
};

const CatchmentForm = ({edit, ...props}) => {
    const sanitizeProps = ({ record, resource, save }) => ({ record, resource, save });
    return (
        <SimpleForm toolbar={<CustomToolbar/>} {...sanitizeProps(props)} redirect="show">
                <Typography variant="title" component="h3">Catchment</Typography>
                <TextInput source="catchment" label="Name" />
                <TextInput source="type" label="Type"/>
                <TextInput source="address_level.title" label="Location"/>
                <LineBreak/>      
        </SimpleForm>
    );
};

const CustomToolbar = props =>
    <Toolbar {...props}>
        <SaveButton/>
    </Toolbar>;