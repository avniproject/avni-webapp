import {isEmpty} from 'lodash';
import React from 'react';
import {
    ReferenceField, Datagrid, List, Create, Edit,
    TextField, FunctionField, Show, SimpleShowLayout,
    SimpleForm, TextInput, ReferenceInput, SelectInput,
    BooleanInput, DisabledInput, Toolbar, FormDataConsumer,
    SaveButton,DeleteButton, EditButton

} from 'react-admin';
import {withStyles} from '@material-ui/core/styles';
import EnableDisableButton from './EnableDisableButton';
import CardActions from '@material-ui/core/CardActions';

export const UserList = props => (
    <List {...props} filter={{organisationId: props.organisation.id}}>
        <Datagrid rowClick="show">
            <TextField label="Username" source="username"/>
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

export const UserDetail = props => (
    <Show title={<UserTitle/>} actions={<CustomShowActions/>} {...props}>
        <SimpleShowLayout>
            <TextField source="username" label="Username" />
            <TextField source="email" />
            <TextField source="phoneNumber" />
            <ReferenceField label="Catchment" source="catchmentId" reference="catchment"
                            linkType="show" allowEmpty>
                <TextField source="name" />
            </ReferenceField>
            <FunctionField label="Role" render={user => formatRoles(user.roles)} />
            <FunctionField label="Operating Scope"
                           render={user => formatOpScope(user.operatingIndividualScope)}/>
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

const UserForm = withStyles(formStyle)(({classes, edit, ...props}) => (
    <SimpleForm {...props} redirect="show" toolbar={<CustomToolbar/>}>
        {edit ?
            <DisabledInput source="username" label="Username" />
                : <TextInput source="username" label="Username" />}
        {edit && <PasswordTextField/> }
        <TextInput source="email" />
        <TextInput source="phoneNumber" />
        <SelectInput source="operatingIndividualScope"
                     label="Operating Scope"
                     choices={operatingScopeChoices}/>
        <FormDataConsumer>
            {({ formData, ...rest }) =>
                formData.operatingIndividualScope === 'ByCatchment' &&
                <ReferenceInput source="catchmentId" reference="catchment" {...rest}
                                onChange={() => edit && alert(catchmentChangeMessage)}>
                    <CatchmentSelectInput source="name" />
                </ReferenceInput>
            }
        </FormDataConsumer>
        <BooleanInput source="orgAdmin" formClassName={classes.verticalMargin}
                      label="Admin privileges (User will be able to make organisation wide changes)"/>
    </SimpleForm>
));

const UserTitle = ({record, titlePrefix}) => {
    return record && <span>{titlePrefix} user: <b>{record.username}</b></span>;
};

const cardActionStyle = {
    zIndex: 2,
    display: 'inline-block',
    float: 'right',
};

const CustomShowActions = ({basePath, data, resource}) => {
    return (data &&
        <CardActions style={cardActionStyle}>
            <EnableDisableButton disabled={data.disabledInCognito}
                                 basePath={basePath} record={data}
                                 resource={resource}/>
            <DeleteButton basePath={basePath} record={data}
                          label="Delete User" undoable={false}
                          redirect={basePath} resource={resource}/>
            <EditButton basePath={basePath} record={data} />
        </CardActions>)
        || null
    };

//To remove delete button from the toolbar
const CustomToolbar = props =>
    <Toolbar {...props}>
        <SaveButton/>
    </Toolbar>;


const CatchmentSelectInput = props => {
    const choices = props.choices.filter(choice => !choice.name.endsWith('Master Catchment'));
    return <SelectInput {...props} choices={choices}/>
};


const PasswordTextField = props =>
    <sub>
        <br/>Default temporary password is "password". User will
        <br/>be prompted to set their own password on first login
    </sub>;


const operatingScopeChoices = [
    { id: "None", name: "None" },
    { id: "ByFacility", name: "Facility" },
    { id: "ByCatchment", name: "Catchment" },
];


const formatRoles = roles =>
    !isEmpty(roles) &&  // check required thanks to optimistic rendering shenanigans
    roles.map(role =>
        role.split('_').map(word =>
            word.replace(word[0], word[0].toUpperCase())).join(' ')
    ).join(', ');


const formatOpScope = opScope =>
    opScope && opScope.replace(/^By/, '');


const catchmentChangeMessage = `Please ensure that the user has already synced all 
data for their previous catchment, and has deleted all local data from their app`;
