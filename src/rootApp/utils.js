import { Amplify } from "aws-amplify";
import { AWS_REGION } from "../common/constants";
import _ from "lodash";

export const configureAuth = config => {
  Amplify.configure({
    Auth: {
      Cognito: {
        region: config.region || AWS_REGION,
        userPoolId: config.poolId,
        userPoolClientId: config.clientId,
        loginWith: { username: true }
      }
    }
  });
};

export function isDisallowedPassword(password) {
  return _.toLower(password) === "password";
}

export const DISALLOWED_PASSWORD_BLOCK_LOGIN_MSG =
  "Password change required. Please change via forgot password flow or use an admin account to reset it.\nDo not change password for customer accounts.";
