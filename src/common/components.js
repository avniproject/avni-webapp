import React from "react";
import { Link } from "react-router-dom";


export const Home = () => (
    <div>
      <ul>
        <li><Link to="/org/">Manage Users</Link></li>
      </ul>
    </div>
);
