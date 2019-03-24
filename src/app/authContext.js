import _ from 'lodash';

export const authContext  = (function() {
    const obj = {};
    return {
        init: (userInfo) => {
            if (!_.isEmpty(obj)) {
                console.warn('authContext already initialised. Ignoring...');
                return;
            }
            obj['username'] = userInfo.username;
            if (userInfo.idToken) {
                obj['token'] = userInfo.idToken;
            }
        },
        get: () => {
            return obj;
        }
    }
})();
