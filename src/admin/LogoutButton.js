import React from 'react';
import {connect} from 'react-redux';
import {userLogout} from 'react-admin';
import MenuItem from '@material-ui/core/MenuItem';
import ExitIcon from '@material-ui/icons/PowerSettingsNew';
import UserIcon from '@material-ui/icons/AccountCircle';

const styles = {
    userIcon: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: 13,
        marginRight: 8
    }
};

const LogoutButton = ({logout, user, ...rest}) => {
    return (
        <div>
            <span style={styles.userIcon}>
                <UserIcon color={'primary'}/>
                {user.username}
            </span>
            <MenuItem onClick={logout} {...rest}>
                <ExitIcon/> Logout
            </MenuItem>
        </div>

    );
};

const redirectTo = '/';
const customUserLogout = () => userLogout(redirectTo);

export default connect(null, {logout: customUserLogout})(LogoutButton);
