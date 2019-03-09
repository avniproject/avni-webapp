import {AWS_REGION} from "./constants";

const SET_AWS_CONFIG = 'app/SET_AWS_CONFIG';
const SET_COGNITO_USER = 'app/SET_COGNITO_USER';
const SET_USER_INFO = 'app/SET_USER_INFO';

export const setAwsConfig = config => ({
    type: SET_AWS_CONFIG,
    payload: {
        region: config.region || AWS_REGION,
        poolId: config.poolId,
        clientId: config.clientId
    }
});

export const setCognitoUser = (authState, authData) => ({
    type: SET_COGNITO_USER,
    payload: {
        authState,
        authData
    }
});

export const setUserInfo = (userInfo) => ({
    type: SET_USER_INFO,
    payload: { orgName: userInfo.organisationName }
});

const initialState = {
    awsConfig: {},
    user: {
        authState: undefined,
        cognito: undefined
    }
};

export default function(state=initialState, action) {
    switch(action.type) {
        case SET_AWS_CONFIG: {
            return {
                ...state,
                awsConfig: action.payload
            }
        }
        case SET_COGNITO_USER: {
            return {
                ...state,
                user: {
                    authState: action.payload.authState,
                    cognito: action.payload.authData,
                    userName: action.payload.authData.username
                }
            }
        }
        case SET_USER_INFO: {
            return {
                ...state,
                user: {
                    ...state.user,
                    orgName: action.payload
                }
            }
        }
        default:
            return state;
    }
}
