import * as t from './actionTypes';
import { AWS_REGION } from "./constants";

export const setAwsConfig = config => ({
    type: t.SET_AWS_CONFIG,
    payload: {
        region: config.region || AWS_REGION,
        poolId: config.poolId,
        clientId: config.clientId
    }
});

export const setCognitoUser = (authState, authData) => ({
    type: t.SET_COGNITO_USER,
    payload: {
        authState,
        authData
    }
});

export const setUserInfo = (userInfo) => ({
    type: t.SET_USER_INFO,
    payload: { orgName: userInfo.organisationName }
});
