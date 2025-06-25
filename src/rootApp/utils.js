import { Amplify } from "aws-amplify";
import { AWS_REGION } from "../common/constants";
import _ from "lodash";

export const configureAuth = config => {
  Amplify.configure({
    Auth: {
      Cognito: {
        region: "ap-south-1",
        userPoolId: "ap-south-1_DU27AHJvZ",
        userPoolClientId: "1d6rgvitjsfoonlkbm07uivgmg",
        authenticationFlowType: "USER_PASSWORD_AUTH",
        loginWith: { email: true }
      }
    }
  });
};

export const customAmplifyErrorMsgs = msg => {
  if (/null failed with error Generate ch?allenges lambda cannot be called/i.test(msg)) return "Password cannot be empty";
  if (/Cannot read property 'username' of undefined/.test(msg)) return "Username cannot be empty";
  return msg;
};

export function isDisallowedPassword(password) {
  return _.toLower(password) === "password";
}

export const DISALLOWED_PASSWORD_BLOCK_LOGIN_MSG =
  "Password change required. Please change via forgot password flow or use an admin account to reset it.\nDo not change password for customer accounts.";
