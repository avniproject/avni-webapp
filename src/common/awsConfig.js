
export const cognitoConfig = {
    region: process.env.REACT_APP_AWS_REGION,
    poolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    clientId: process.env.REACT_APP_COGNITO_APP_CLIENT_ID,
};
