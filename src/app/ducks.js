
export const types = {
    INIT_COGNITO: 'app/INIT_COGNITO',
    SET_COGNITO_USER: 'app/SET_COGNITO_USER',
    GET_USER_INFO: 'app/GET_USER_INFO',
    SET_USER_INFO: 'app/SET_USER_INFO',
    INIT_COMPLETE: 'app/INIT_COMPLETE'
};

export const initCognito = () => ({
    type: types.INIT_COGNITO
});

export const setCognitoUser = (authState, authData) => ({
    type: types.SET_COGNITO_USER,
    payload: {
        authState,
        authData
    }
});

export const getUserInfo = () => ({
    type: types.GET_USER_INFO
});

export const setUserInfo = userInfo => ({
    type: types.SET_USER_INFO,
    payload: userInfo
});

export const sendInitComplete = () => ({
    type: types.INIT_COMPLETE
});

const initialState = {
    user: {
        authState: undefined,
        cognito: undefined,
        username: undefined
    },
    organisation: {
        id: undefined,
        name: undefined
    },
    appInitialised: false
};

// reducer
export default function(state=initialState, action) {
    switch(action.type) {
        case types.SET_COGNITO_USER: {
            return {
                ...state,
                user: {
                    authState: action.payload.authState,
                    cognito: action.payload.authData,
                    username: action.payload.authData.username
                }
            }
        }
        case types.SET_USER_INFO: {
            return {
                ...state,
                user: {
                    ...state.user,
                    username: state.user.username || action.payload.username
                },
                organisation: {
                    id: action.payload.organisationId,
                    name: action.payload.organisationName
                }
            }
        }
        case types.INIT_COMPLETE: {
            return {
                ...state,
                appInitialised: true
            }
        }
        default:
            return state;
    }
}
