import React from 'react';
import { ReferenceField, Datagrid, List, TextField, FunctionField } from 'react-admin';


const formatRoles = roles =>
    roles.map(role =>
            role.split('_').map(word =>
                word.replace(word[0], word[0].toUpperCase())).join(' ')
    ).join(', ');


export const UserList = props => (
    <List {...props} filter={{ organisationId: props.organisation.id }}>
        <Datagrid rowClick="edit">
            <TextField label="Username" source="name" />
            <ReferenceField label="Catchment" source="catchmentId" reference="catchment" allowEmpty>
                <TextField source="name" />
            </ReferenceField>
            <FunctionField label="Role" render={user => formatRoles(user.roles)} />
            <FunctionField label="Active" render={user => user.voided === false ? 'Yes' : 'No'} />
        </Datagrid>
    </List>
);
