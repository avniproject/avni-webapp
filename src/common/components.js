import React from "react";
import { Admin, Resource, ListGuesser } from 'react-admin';
import { Link } from "react-router-dom";

import { authProvider, dataProvider } from "../rootSaga";

export const Main = () => (
    <Admin
        authProvider={authProvider}
        dataProvider={dataProvider}
        title="Admin"
    >
        <Resource name="users" list={ListGuesser} />
    </Admin>
);

export const Home = () => (
    <div>
      <ul>
        <li><Link to="/adm/">Manage Users</Link></li>
      </ul>
    </div>
);
