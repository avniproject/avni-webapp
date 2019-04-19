import {isEmpty, isFinite} from 'lodash';
import React, { Fragment } from 'react';
import {
    ReferenceField, Datagrid, List, Create, Edit,
    TextField, FunctionField, Show, SimpleShowLayout,
    SimpleForm, TextInput, ReferenceInput, BooleanInput,
    DisabledInput, Toolbar, FormDataConsumer, SaveButton,
    DeleteButton, EditButton, required, email, regex,
    REDUX_FORM_NAME, Filter, RadioButtonGroupInput
} from 'react-admin';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import { change } from 'redux-form';
import { CatchmentSelectInput } from "../common/adminComponents";
import { LineBreak } from "../common/components";
import { phoneCountryPrefix, LOCALES } from "../common/constants";
import EnableDisableButton from './EnableDisableButton';


export const UserCreate = props => (
    <Create {...props}>
        <UserForm />
    </Create>
);

const UserTitle = ({record, titlePrefix}) => {
    return record && <span>{titlePrefix} user <b>{record.username}</b></span>;
};


export const UserEdit = props => (
    <Edit {...props} title={<UserTitle titlePrefix="Edit"/>} undoable={false}>
        <UserForm edit />
    </Edit>
);


const formatRoles = roles =>
    !isEmpty(roles) &&  // check required thanks to optimistic rendering shenanigans
    roles.map(role =>
        role.split('_').map(word =>
            word.replace(word[0], word[0].toUpperCase())).join(' ')
    ).join(', ');


/*const UserFilter = props => (
    <Filter {...props} style={{marginBottom: '2em'}}>
        <TextInput label="Login ID" source="username" resettable alwaysOn />
        <TextInput label="Name" source="name" resettable alwaysOn />
        <TextInput label="Email Address" source="email" resettable alwaysOn />
        <TextInput label="Phone Number" source="phoneNumber" resettable alwaysOn />
    </Filter>
);*/

export const UserList = ({ organisation, ...props }) => (
    <List {...props}
          filter={{organisationId: organisation.id}}
          //Commenting the filters as it does not work properly right now
          /*filters={<UserFilter/>}*/
          title={`${organisation.name} Users`}>
        <Datagrid rowClick="show">
            <TextField label="Login ID" source="username"/>
            <TextField source="name" label="Name of the Person" />
            <ReferenceField label="Catchment" source="catchmentId" reference="catchment"
                            linkType="show" allowEmpty>
                <TextField source="name"/>
            </ReferenceField>
            <FunctionField label="Role" render={user => formatRoles(user.roles)}/>
            <TextField source="email" label="Email Address"/>
            <TextField source="phoneNumber" label="Phone Number"/>
            <FunctionField label="Status"
                           render={user => user.voided === true ?
                                            'Deleted'
                                            : (user.disabledInCognito === true ? 'Disabled' : 'Active')}/>
        </Datagrid>
    </List>
);


const CustomShowActions = ({basePath, data, resource}) => {
    return (data &&
        <CardActions style={{ zIndex: 2, display: 'inline-block', float: 'right' }}>
            <EditButton label="Edit User" basePath={basePath} record={data} />
            <EnableDisableButton disabled={data.disabledInCognito}
                                 basePath={basePath} record={data}
                                 resource={resource}/>
            <DeleteButton basePath={basePath} record={data}
                          label="Delete User" undoable={false}
                          redirect={basePath} resource={resource}/>
        </CardActions>)
        || null
};

const formatOperatingScope = opScope =>
    opScope && opScope.replace(/^By/, '');


export const UserDetail = props => (
    <Show title={<UserTitle/>} actions={<CustomShowActions/>} {...props}>
        <SimpleShowLayout>
            <TextField source="username" label="Login ID (username)" />
            <TextField source="name" label="Name of the Person" />
            <TextField source="email" label="Email Address" />
            <TextField source="phoneNumber" label="Phone Number" />
            <ReferenceField label="Catchment" source="catchmentId" reference="catchment"
                            linkType="show" allowEmpty>
                <TextField source="name" />
            </ReferenceField>
            <FunctionField label="Role" render={user => formatRoles(user.roles)} />
            <FunctionField label="Operating Scope"
                           render={user => formatOperatingScope(user.operatingIndividualScope)}/>
        </SimpleShowLayout>
    </Show>
);


//To remove delete button from the toolbar
const CustomToolbar = props =>
    <Toolbar {...props}>
        <SaveButton/>
    </Toolbar>;

const PasswordTextField = props =>
    <sub>
        <br/>Default temporary password is "password". User will
        <br/>be prompted to set their own password on first login
    </sub>;

const operatingScopes = Object.freeze({
    NONE: "None",
    FACILITY: "ByFacility",
    CATCHMENT: "ByCatchment"
});

const catchmentChangeMessage = `Please ensure that the user has already synced all 
data for their previous catchment, and has deleted all local data from their app`;

const mobileNumberFormatter = (v='') => v.substring(phoneCountryPrefix.length);
const mobileNumberParser = v => v.startsWith(phoneCountryPrefix) ? v : phoneCountryPrefix.concat(v);

const isRequired = required("This field is required");
const validateEmail = [isRequired, email("Please enter a valid email address")];
const validatePhone = [isRequired, regex(/[0-9]{12}/, "Enter a 10 digit number (eg. 9820324567)")];

const localeChoices = [
    { id: LOCALES.ENGLISH, name: 'English' },
    { id: LOCALES.HINDI, name: 'Hindi' },
    { id: LOCALES.MARATHI, name: 'Marathi' },
    { id: LOCALES.GUJARATI, name: 'Gujarati' }
];

const UserForm = ({edit, ...props}) => {
    const sanitizeProps = ({ record, resource, save }) => ({ record, resource, save });
    return (
        <SimpleForm toolbar={<CustomToolbar/>} {...sanitizeProps(props)} redirect="show">
                {edit ?
                    <DisabledInput source="username" label="Login ID (username)" />
                    :
                    <TextInput source="username" label="Login ID (username)" validate={isRequired} />}
                {!edit && <PasswordTextField/> }
                <TextInput source="name" label="Name of the Person" validate={isRequired} />
                <TextInput source="email" label="Email Address" validate={validateEmail} />
                <TextInput source="phoneNumber" label="10 digit mobile number"
                           validate={validatePhone}
                           format={mobileNumberFormatter}
                           parse={mobileNumberParser} />
                <FormDataConsumer>
                    {({ formData, dispatch, ...rest }) =>
                        <BooleanInput source="orgAdmin" style={{marginTop: '3em', marginBottom: '2em'}}
                                      label="Make this user an administrator (user will be able to make organisation wide changes)"
                                      onChange={(e, newVal) => {
                                          if (newVal) {
                                              dispatch(change(REDUX_FORM_NAME, 'catchmentId', null));
                                              dispatch(change(
                                                  REDUX_FORM_NAME,
                                                  'operatingIndividualScope',
                                                  operatingScopes.NONE
                                              ));
                                          }
                                      }}
                                      {...rest} />
                    }
                </FormDataConsumer>
                <LineBreak />
                <FormDataConsumer>
                    {({ formData, dispatch, ...rest }) =>
                        !formData.orgAdmin &&
                        <Fragment>
                            <Typography variant="title" component="h3">Catchment</Typography>
                            <ReferenceInput source="catchmentId" reference="catchment"
                                            label="Which catchment?"
                                            validate={required("Please select a catchment")}
                                            onChange={(e, newVal) => {
                                                if(edit) alert(catchmentChangeMessage);
                                                dispatch(change(
                                                    REDUX_FORM_NAME, 'operatingIndividualScope',
                                                    isFinite(newVal) ?
                                                        operatingScopes.CATCHMENT
                                                        : operatingScopes.NONE
                                                ))
                                            }}
                                            {...rest}>
                                <CatchmentSelectInput source="name" resettable />
                            </ReferenceInput>
                            <LineBreak num={3} />
                        </Fragment>
                    }
                </FormDataConsumer>
                <DisabledInput source="operatingIndividualScope"
                               defaultValue={operatingScopes.NONE}
                               style={{display: 'none'}} />
            <Fragment>
                <Typography variant="title" component="h3">Settings</Typography>
                <RadioButtonGroupInput source="settings.locale" label="Language" choices={localeChoices} />
                <BooleanInput source="settings.trackLocation" label="Track location" />
            </Fragment>
        </SimpleForm>
    );
};
