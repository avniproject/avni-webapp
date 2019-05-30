import React from "react";
import _ from 'lodash';
import { Link } from "react-router-dom";


export const Home = () => (
    <div>
      <ul>
        <li><Link to="/org/">Manage Users</Link></li>
      </ul>
    </div>
);

export const AccessDenied = () =>
    <div className="centerContainer"><h2>Access denied</h2></div>;

export const LineBreak = ({ num=1 }) => _(num).times(idx => <br key={idx}/>);

export const None = ({ displayText="None" }) =>
    <div><span>{displayText}</span></div>;

export const NoneWithLabel = ({ noneText="None", labelText }) =>
    <div>
        <label style={{ fontSize: '0.7em', color: '#666' }}>
            {labelText}
        </label>
        <br/>
        <None displayText={noneText} />
    </div>;
