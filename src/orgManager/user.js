import {isEmpty} from 'lodash';
import React from 'react';
import {
    ReferenceField, Datagrid, List, Create, Edit,
    TextField, FunctionField, Show, SimpleShowLayout,
    SimpleForm, TextInput, ReferenceInput, SelectInput,
    BooleanInput, DisabledInput, Toolbar,
    SaveButton,
} from 'react-admin';
import {withStyles} from '@material-ui/core/styles';
import UserActionButton from './UserActionButton';

const formatRoles = roles =>
    !isEmpty(roles) &&  // check required thanks to optimistic rendering shenanigans
    roles.map(role =>
        role.split('_').map(word =>
            word.replace(word[0], word[0].toUpperCase())).join(' ')
    ).join(', ');


export const UserList = props => (
    <List {...props} filter={{organisationId: props.organisation.id}}>
        <Datagrid rowClick="show">
            <TextField label="Username" source="name"/>
            <ReferenceField label="Catchment" source="catchmentId" reference="catchment"
                            linkType="show" allowEmpty>
                <TextField source="name"/>
            </ReferenceField>
            <FunctionField label="Role" render={user => formatRoles(user.roles)}/>
            <TextField source="email"/>
            <TextField source="phoneNumber"/>
            <FunctionField label="Status"
                           render={user => user.voided === false ? (user.disabledInCognito === true ? 'Disabled' : 'Active') : 'Deleted'}/>
        </Datagrid>
    </List>
);

const formatOpScope = opScope =>
    opScope && opScope.replace(/^By/, '');

const UserTitle = ({ record, titlePrefix }) => {
    return record && <span>{titlePrefix} user: <b>{record.name}</b></span>;
};

export const UserDetail = props => (
    <Show title={<UserTitle/>} {...props}>
        <SimpleShowLayout>
            <TextField source="name" label="Username" />
            <TextField source="email" />
            <TextField source="phoneNumber" />
            <ReferenceField label="Catchment" source="catchmentId" reference="catchment"
                            linkType="show" allowEmpty>
                <TextField source="name" />
            </ReferenceField>
            <FunctionField label="Role" render={user => formatRoles(user.roles)} />
            <FunctionField label="Operating Scope"
                           render={user => formatOpScope(user.operatingIndividualScope)} />
        </SimpleShowLayout>
    </Show>
);

export const UserCreate = props => (
    <Create {...props}>
        <UserForm />
    </Create>
);

export const UserEdit = props => (
    <Edit {...props} title={<UserTitle titlePrefix="Edit"/>} undoable={false}>
        <UserForm edit />
    </Edit>
);

const formStyle = {
    verticalMargin: { marginTop: '3em', marginBottom: '1em' },
};

const toolbarStyles = {
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
    }
};

const CustomToolbar = withStyles(toolbarStyles)(props => (
    <Toolbar {...props}>
        <SaveButton/>
        <div >
            <UserActionButton {...props} label="Disable User" disable={true}/>
            <UserActionButton {...props} label="Delete User" disable={false}/>
        </div>
    </Toolbar>
));


const UserForm = withStyles(formStyle)(({classes, ...props}) => (
    <SimpleForm {...props} redirect="show" toolbar={<CustomToolbar/>}>
        {props.edit && <DisabledInput source="id"/>}
        {props.edit ?
            <DisabledInput source="name" label="Username" />
            : <TextInput source="name" label="Username" />}
        <TextInput source="email" />
        <TextInput source="phoneNumber" />
        <ReferenceInput source="catchmentId" reference="catchment">
            <CatchmentSelectInput source="name"/>
        </ReferenceInput>
        <BooleanInput source="orgAdmin" formClassName={classes.verticalMargin}
                      label="Admin privileges (User will be able to make organisation wide changes)"/>
        <SelectInput source="operatingIndividualScope"
                     label="Operating Scope"
                     choices={operatingScopeChoices}/>
    </SimpleForm>
));

const CatchmentSelectInput = props => {
    const choices = props.choices.filter(choice => !choice.name.endsWith('Master Catchment'));
    return <SelectInput {...props} choices={choices}/>
};

const operatingScopeChoices = [
    { id: "None", name: "None" },
    { id: "ByFacility", name: "Facility" },
    { id: "ByCatchment", name: "Catchment" },
];
