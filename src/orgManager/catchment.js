import React from "react";
import { TextField, Show, SimpleShowLayout } from 'react-admin';


export const CatchmentDetail = props => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="name" />
            <TextField source="type" />
        </SimpleShowLayout>
    </Show>
);
