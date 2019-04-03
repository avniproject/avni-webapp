import { Auth } from 'aws-amplify';
import { AUTH_LOGOUT } from 'react-admin';

export const authProvider = (type, params) => {
    if (type === AUTH_LOGOUT) {
        Auth.signOut().then(() => window.location.reload());
    }
    return Promise.resolve();
};
