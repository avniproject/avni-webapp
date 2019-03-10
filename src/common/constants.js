
export const isDevEnv = process.env.NODE_ENV === "development";
export const isFauxProd = process.env.REACT_APP_FAUX_PROD === 'true' && isDevEnv;

export const AWS_REGION = process.env.REACT_APP_AWS_REGION || 'ap-south-1';
