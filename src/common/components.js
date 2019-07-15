import React from "react";
import _ from 'lodash';
import {Link as RouterLink} from "react-router-dom";
import Link from '@material-ui/core/Link';
import SvgIcon from '@material-ui/core/SvgIcon';

export const AddIcon = (props) =>
    <SvgIcon {...props}>
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </SvgIcon>;

export const InternalLink = ({children, ...props}) =>
    <Link
        component={React.forwardRef((props, ref) => (<RouterLink innerRef={ref} {...props} />))}
        {...props}>
        {children}
    </Link>;

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
