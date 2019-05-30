import React from "react";
import {
    Datagrid, List, TextField,
    Show, SimpleShowLayout, ReferenceManyField,
    ReferenceField, FunctionField,
} from 'react-admin';
import { isEmpty } from 'lodash';
import { None } from "../common/components";

export const LocationList = props => (
    <List {...props} sort={{ field: 'id', order: 'ASC'}} filter={{ searchURI: "findByParent"}}>
        <Datagrid rowClick="show">
            <TextField source="title"/>
            {/*
                <TextField source="level"/>
                < TextField source="lineage" />
            */}
            <TextField label="Type" source="typeString" />
        </Datagrid>
    </List>
);

const SubLocationsGrid = props =>
    isEmpty(props.data) ?
        <None />
        :
        <Datagrid rowClick="show" {...props}>
            <TextField source="title"/>
            <TextField label="Type" source="typeString"/>
        </Datagrid>;

export const LocationDetail = props =>{
    return (
        <Show {...props}>
            <SimpleShowLayout>
                <TextField source="title" label="Name" />
                <TextField source="typeString" label="Type" />
                <ReferenceField label="Parent location"
                                source="parentId"
                                reference="locations" allowEmpty>
                    <FunctionField render={record=> record && `${record.title} (${record.typeString})`}/>
                </ReferenceField>
                <ReferenceManyField label="Contains locations"
                                    reference="locations"
                                    target="parentId">
                    <SubLocationsGrid/>
                </ReferenceManyField>
            </SimpleShowLayout>
        </Show>
)};