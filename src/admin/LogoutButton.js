import React from 'react';
import { connect } from 'react-redux';
import { userLogout } from 'react-admin';
import MenuItem from '@material-ui/core/MenuItem';
import ExitIcon from '@material-ui/icons/PowerSettingsNew';

const LogoutButton = ({ logout, ...rest }) => {
    return (
        <MenuItem onClick={logout} {...rest}>
            <ExitIcon/> Logout
        </MenuItem>
    );
};

const redirectTo = '/';
const customUserLogout = () => userLogout(redirectTo);

export default connect(null, { logout: customUserLogout })(LogoutButton);