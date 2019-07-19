import Auth from "@aws-amplify/auth";
import { AWS_REGION } from "../common/constants";

export const configureAuth = config => {
  Auth.configure({
    mandatorySignIn: true,
    region: config.region || AWS_REGION,
    userPoolId: config.poolId,
    userPoolWebClientId: config.clientId
  });
};

export const customAmplifyErrorMsgs = msg => {
  if (
    /null failed with error Generate ch?allenges lambda cannot be called/i.test(
      msg
    )
  )
    return "Password cannot be empty";

  if (/Cannot read property 'username' of undefined/.test(msg))
    return "Username cannot be empty";

  return msg;
};
