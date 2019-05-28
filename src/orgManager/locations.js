import React from "react";
import {
    Datagrid, List, TextField,
    Show, TabbedShowLayout, Tab,
} from 'react-admin';


export const LocationList = props => (
    <List {...props} sort={{ field: 'level', order: 'DESC'}}
          filter={{ childrenOf: ""}}>
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


const SubLocationList = (props) =>
    <List {...props} sort={{ field: 'level', order: 'DESC'}}
          filter={{ childrenOf: props.record.lineage }}>
        <Datagrid rowClick="show">
            <TextField source="title"/>
            <TextField label="Type" source="typeString" />
        </Datagrid>
    </List>;


export const LocationDetail = props =>{
    return (
        <Show {...props}>
            <TabbedShowLayout>
                <Tab label="Details">
                    <TextField source="title" label="Name" />
                    <TextField source="typeString" label="Type" />
                </Tab>
                <Tab label="SubLocations">
                    <SubLocationList {...props}/>
                </Tab>
            </TabbedShowLayout>
        </Show>
)};