import React from "react";
import { Admin, Resource, ListGuesser } from "react-admin";
import { authProvider, dataProvider } from "../rootSaga";


export const OrgManager = () => (
    <Admin
        authProvider={authProvider}
        dataProvider={dataProvider}
        title="Manage Organisation"
    >
        <Resource name="users" list={ListGuesser} />
    </Admin>
);
