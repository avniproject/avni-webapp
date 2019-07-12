
export const isDevEnv = process.env.NODE_ENV === "development";
export const cognitoInDev = isDevEnv && process.env.REACT_APP_COGNITO_IN_DEV === 'true';
export const isProdEnv = process.env.NODE_ENV === "production";

export const AWS_REGION = process.env.REACT_APP_AWS_REGION || 'ap-south-1';

export const cognitoConfig = {
    region: AWS_REGION,
    poolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    clientId: process.env.REACT_APP_COGNITO_APP_CLIENT_ID,
};

export const ROLES = Object.freeze({
    ADMIN: 'admin',
    ORG_ADMIN: 'organisation_admin',
    USER: 'user'
});

export const LOCALES = Object.freeze({
    ENGLISH: 'en',
    HINDI: 'hi_IN',
    MARATHI: 'mr_IN',
    GUJARATI: 'gu_IN'
});

export const phoneCountryPrefix = process.env.REACT_APP_PHONE_COUNTRY_PREFIX || '+91';

export const withoutDataEntry = true;