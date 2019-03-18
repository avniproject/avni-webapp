
export const types = {
    INIT_COGNITO: 'app/INIT_COGNITO',
    SET_COGNITO_USER: 'app/SET_COGNITO_USER',
    GET_USER_INFO: 'app/GET_USER_INFO',
    SET_USER_INFO: 'app/SET_USER_INFO'
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


const initialState = {
    user: {
        authState: undefined,
        cognito: undefined
    }
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
                }
            }
        }
        case types.SET_USER_INFO: {
            return {
                ...state,
                user: {
                    ...state.user,
                    username: state.user.cognito ? state.user.cognito.username : action.payload.username,
                    orgName: action.payload.organisationName
                }
            }
        }
        default:
            return state;
    }
}
