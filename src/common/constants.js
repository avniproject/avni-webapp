
export const isDevEnv = process.env.NODE_ENV === "development";
export const cognitoInDev = isDevEnv && process.env.REACT_APP_COGNITO_IN_DEV === 'true';
export const isProdEnv = process.env.NODE_ENV === "production";

export const AWS_REGION = process.env.REACT_APP_AWS_REGION || 'ap-south-1';
