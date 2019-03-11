
export const isDevEnv = process.env.NODE_ENV === "development";
export const authInDev = isDevEnv && process.env.REACT_APP_AUTH_IN_DEV === 'true';

export const AWS_REGION = process.env.REACT_APP_AWS_REGION || 'ap-south-1';
