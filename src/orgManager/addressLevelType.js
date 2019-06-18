import React from "react";
import {
    Create,
    Datagrid,
    Edit,
    FormDataConsumer,
    FunctionField,
    List,
    REDUX_FORM_NAME,
    ReferenceField,
    ReferenceInput,
    SelectInput,
    Show,
    SimpleForm,
    SimpleShowLayout,
    TextField,
    TextInput,
} from 'react-admin';
import {None} from "../common/components";
import {isNil} from 'lodash';

export const LocationTypeList = props => (
    <List {...props}
          title="Location Types"
          sort={{field: 'level', order: 'DESC'}}>
        <Datagrid rowClick="show">
            <TextField label="Location Type" source="name"/>
            <TextField label="Level" source="level"/>
            <ReferenceField label="Parent" source="parentId" reference="addressLevelType"
                            linkType="show" allowEmpty>
                <TextField source="name"/>
            </ReferenceField>
        </Datagrid>
    </List>
);


const ParentReferenceField = props => {
    return isNil(props.record.parentId) ?
        <None/>
        :
        <ReferenceField {...props}
                        source="parentId"
                        linkType="show"
                        reference="addressLevelType"
                        allowEmpty>
            <FunctionField render={record => record.name}/>
        </ReferenceField>
};

ParentReferenceField.defaultProps = {
    addLabel: true,
};

const Title = ({record}) => {
    return record && <span>Location Type: <b>{record.name}</b></span>;
};

export const LocationTypeDetail = props => (
    <Show {...props} title={<Title/>}>
        <SimpleShowLayout>
            <TextField label="Location Type" source="name"/>
            <TextField label="Level" source="level"/>
            <ParentReferenceField label="Parent Type"/>
        </SimpleShowLayout>
    </Show>
);

const LocationTypeForm = props => {
    return (
        <SimpleForm {...props} redirect="show">
            <TextInput source="name" label="Name"/>
            <TextInput source="level" label="Level"/>
            <ReferenceInput source="parentId" reference="addressLevelType" label="Parent">
                <SelectInput optionText="name" resettable/>
            </ReferenceInput>
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
        <LocationTypeForm edit/>
    </Edit>
);
