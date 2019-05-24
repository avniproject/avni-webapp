import React from "react";
import {
    Datagrid, List,TextField,
    Show, SimpleShowLayout, Create,
    SimpleForm, TextInput, Edit,
} from 'react-admin';


export const LocationTypeList = props => (
    <List {...props}
          title="Location Types"
          sort={{ field: 'level', order: 'DESC'}}>
        <Datagrid rowClick="show">
            <TextField label="Location Type" source="name"/>
            <TextField label="Level" source="level" />
        </Datagrid>
    </List>
);


const Title = ({record}) => {
    return record && <span>Location Type: <b>{record.name}</b></span>;
};

export const LocationTypeDetail = props => (
    <Show {...props} title={<Title/>}>
        <SimpleShowLayout>
            <TextField label="Location Type" source="name"/>
            <TextField label="Level" source="level"/>
        </SimpleShowLayout>
    </Show>
);


const LocationTypeForm = props => {
    return (
        <SimpleForm {...props} redirect="show">
            <TextInput source="name" label="Name" />
            <TextInput source="level" label="Level"/>
        </SimpleForm>
    );
};


export const LocationTypeCreate = props => (
    <Create {...props} title="Add new Location Type">
        <LocationTypeForm/>
    </Create>
);

export const LocationTypeEdit = props => (
    <Edit {...props} title="Modify Location Type" undoable={false}>
        <LocationTypeForm/>
    </Edit>
);
