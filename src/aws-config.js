const config = {
    cognito: {
        REGION: process.env.REACT_APP_AWS_REGION,
        USER_POOL_ID: process.env.REACT_APP_COGNITO_USER_POOL_ID,
        APP_CLIENT_ID: process.env.REACT_APP_COGNITO_APP_CLIENT_ID,
    }
};

export default config;
