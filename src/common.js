import React from "react";
import {Link} from "react-router-dom";

export const ManageUsers = () => (
    <div>
        <h1>Manage Users</h1>
    </div>
);


export const Home = () => (
    <div>
        <ul>
            <li><Link to="/manage/users">Manage Users</Link></li>
        </ul>
    </div>
);
